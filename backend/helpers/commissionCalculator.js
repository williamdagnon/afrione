import pool from '../config/database.js';

/**
 * Calculer et distribuer les commissions de parrainage lors d'un achat
 * @param {number} purchaseId - ID de l'achat
 * @param {string} buyerId - ID de l'acheteur
 * @param {number} amount - Montant de l'achat
 * @returns {Promise<Array>} Liste des commissions distribuées
 */
export const calculateAndDistributeCommissions = async (purchaseId, buyerId, amount) => {
  const connection = await pool.getConnection();
  const commissionsDistributed = [];

  try {
    await connection.beginTransaction();

    // Vérifier si c'est le premier achat de l'utilisateur
    // Compter les achats "completed" de l'utilisateur en excluant l'achat courant
    // (l'achat courant a déjà été inséré avant l'appel à cette fonction)
    const [previousPurchases] = await connection.query(
      'SELECT COUNT(*) as purchase_count FROM purchases WHERE user_id = ? AND status = "completed" AND id <> ?',
      [buyerId, purchaseId]
    );

    // Si ce n'est pas le premier achat, ne pas distribuer de commissions
    if (previousPurchases[0].purchase_count > 0) {
      console.log(`ℹ️ Pas de commission pour l'achat #${purchaseId} : ce n'est pas le premier achat de l'utilisateur`);
      await connection.commit();
      return commissionsDistributed;
    }

    // Récupérer tous les parrains de l'acheteur (jusqu'à 3 niveaux)
    const [referrals] = await connection.query(`
      SELECT 
        referrer_id, 
        level, 
        commission_rate
      FROM referrals
      WHERE referred_id = ? AND status = 'active'
      ORDER BY level ASC
    `, [buyerId]);

    if (referrals.length === 0) {
      await connection.commit();
      return commissionsDistributed;
    }

    console.log(`💰 Distribution de commissions pour achat #${purchaseId} (${amount} FCFA)`);

    // Distribuer les commissions à chaque parrain
    for (const referral of referrals) {
      const commissionRate = parseFloat(referral.commission_rate);
      const commissionAmount = (amount * commissionRate) / 100;

      // Récupérer le solde actuel du parrain
      const [referrer] = await connection.query(
        'SELECT balance FROM profiles WHERE id = ?',
        [referral.referrer_id]
      );

      if (referrer.length === 0) continue;

      const balanceBefore = parseFloat(referrer[0].balance);
      const balanceAfter = balanceBefore + commissionAmount;

      // Créditer le compte du parrain
      await connection.query(`
        UPDATE profiles 
        SET 
          balance = ?,
          referral_earnings = referral_earnings + ?,
          total_earnings = total_earnings + ?
        WHERE id = ?
      `, [balanceAfter, commissionAmount, commissionAmount, referral.referrer_id]);

      // Enregistrer la commission
      await connection.query(`
        INSERT INTO team_commissions (
          referrer_id, referred_id, purchase_id, level,
          commission_rate, purchase_amount, commission_amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'paid')
      `, [
        referral.referrer_id,
        buyerId,
        purchaseId,
        referral.level,
        commissionRate,
        amount,
        commissionAmount
      ]);

      // Mettre à jour le total des commissions dans referrals
      await connection.query(`
        UPDATE referrals
        SET 
          total_commission = total_commission + ?,
          total_purchases = total_purchases + 1
        WHERE referrer_id = ? AND referred_id = ?
      `, [commissionAmount, referral.referrer_id, buyerId]);

      // Créer une transaction
      await connection.query(`
        INSERT INTO transactions (
          user_id, type, amount, balance_before, balance_after,
          description, reference_id, reference_type, status
        ) VALUES (?, 'commission', ?, ?, ?, ?, ?, 'purchase', 'completed')
      `, [
        referral.referrer_id,
        commissionAmount,
        balanceBefore,
        balanceAfter,
        `Commission niveau ${referral.level} (${commissionRate}%) - Achat #${purchaseId}`,
        purchaseId
      ]);

      // Créer une notification
      await connection.query(`
        INSERT INTO notifications (user_id, title, body, type)
        VALUES (?, ?, ?, 'commission')
      `, [
        referral.referrer_id,
        'Nouvelle commission reçue !',
        `Vous avez reçu ${commissionAmount.toFixed(2)} FCFA de commission (niveau ${referral.level}).`
      ]);

      commissionsDistributed.push({
        referrer_id: referral.referrer_id,
        level: referral.level,
        rate: commissionRate,
        amount: commissionAmount
      });

      console.log(`   ✅ Niveau ${referral.level}: ${commissionAmount.toFixed(2)} FCFA (${commissionRate}%) → User ${referral.referrer_id}`);
    }

    await connection.commit();
    console.log(`✅ ${commissionsDistributed.length} commissions distribuées\n`);

    return commissionsDistributed;

  } catch (error) {
    await connection.rollback();
    console.error('❌ Erreur lors de la distribution des commissions:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Récupérer les taux de commission depuis system_settings
 * @returns {Promise<Object>} Taux de commission par niveau
 */
export const getCommissionRates = async () => {
  try {
    const [settings] = await pool.query(`
      SELECT setting_key, setting_value
      FROM system_settings
      WHERE setting_key IN ('referral_level1_rate', 'referral_level2_rate', 'referral_level3_rate')
    `);

    const rates = {
      level1: 25,
      level2: 3,
      level3: 2
    };

    settings.forEach(setting => {
      if (setting.setting_key === 'referral_level1_rate') {
        rates.level1 = parseFloat(setting.setting_value);
      } else if (setting.setting_key === 'referral_level2_rate') {
        rates.level2 = parseFloat(setting.setting_value);
      } else if (setting.setting_key === 'referral_level3_rate') {
        rates.level3 = parseFloat(setting.setting_value);
      }
    });

    return rates;
  } catch (error) {
    console.error('Erreur lors de la récupération des taux:', error);
    // Retourner les valeurs par défaut en cas d'erreur
    return {
      level1: 25,
      level2: 3,
      level3: 2
    };
  }
};

