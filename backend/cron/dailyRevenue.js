import pool from '../config/database.js';

/**
 * CRON Job pour verser les revenus quotidiens
 * À exécuter tous les jours à 00:01
 */
export const dailyRevenue = async () => {
  const connection = await pool.getConnection();
  
  try {
    console.log('\n🕐 [CRON] Démarrage du versement des revenus quotidiens...');
    
    await connection.beginTransaction();

    const today = new Date().toISOString().split('T')[0];

    // Récupérer tous les produits actifs qui doivent recevoir un paiement aujourd'hui
    const [activeProducts] = await connection.query(`
      SELECT 
        up.id, up.user_id, up.product_id, up.daily_revenue,
        up.earned_so_far, up.total_revenue, up.days_elapsed,
        up.duration_days, up.end_date,
        p.name as product_name
      FROM user_products up
      INNER JOIN products p ON up.product_id = p.id
      WHERE up.status = 'active'
        AND up.next_payout_date <= ?
        AND up.end_date >= ?
    `, [today, today]);

    console.log(`📦 ${activeProducts.length} produits actifs à traiter`);

    let processed = 0;
    let completed = 0;
    let totalPaid = 0;

    // Traiter chaque produit
    for (const product of activeProducts) {
      const userId = product.user_id;
      const dailyRevenue = parseFloat(product.daily_revenue);
      const newEarned = parseFloat(product.earned_so_far) + dailyRevenue;
      const newDaysElapsed = product.days_elapsed + 1;

      // Vérifier si le produit est terminé
      const isCompleted = newDaysElapsed >= product.duration_days || 
                          newEarned >= parseFloat(product.total_revenue) ||
                          new Date(product.end_date) <= new Date(today);

      // Récupérer le solde actuel
      const [user] = await connection.query(
        'SELECT balance FROM profiles WHERE id = ?',
        [userId]
      );

      if (user.length === 0) continue;

      const balanceBefore = parseFloat(user[0].balance);
      const balanceAfter = balanceBefore + dailyRevenue;

      // Mettre à jour le solde de l'utilisateur
      await connection.query(`
        UPDATE profiles 
        SET balance = ?, total_earnings = total_earnings + ?
        WHERE id = ?
      `, [balanceAfter, dailyRevenue, userId]);

      // Mettre à jour le produit utilisateur
      await connection.query(`
        UPDATE user_products
        SET 
          earned_so_far = ?,
          days_elapsed = ?,
          last_payout_date = ?,
          next_payout_date = DATE_ADD(?, INTERVAL 1 DAY),
          status = ?
        WHERE id = ?
      `, [
        newEarned,
        newDaysElapsed,
        today,
        today,
        isCompleted ? 'completed' : 'active',
        product.id
      ]);

      // Créer la transaction
      await connection.query(`
        INSERT INTO transactions (
          user_id, type, amount, balance_before, balance_after,
          description, reference_id, reference_type, status
        ) VALUES (?, 'daily_revenue', ?, ?, ?, ?, ?, 'user_product', 'completed')
      `, [
        userId,
        dailyRevenue,
        balanceBefore,
        balanceAfter,
        `Revenu quotidien - ${product.product_name} (Jour ${newDaysElapsed})`,
        product.id
      ]);

      // Créer une notification
      await connection.query(`
        INSERT INTO notifications (user_id, title, body, type)
        VALUES (?, ?, ?, 'revenue')
      `, [
        userId,
        'Revenu quotidien reçu !',
        `Vous avez reçu ${dailyRevenue} FCFA de votre investissement ${product.product_name}.`
      ]);

      processed++;
      totalPaid += dailyRevenue;
      
      if (isCompleted) {
        completed++;
        console.log(`✅ Produit #${product.id} terminé pour user ${userId}`);
      }
    }

    await connection.commit();

    console.log(`\n✅ [CRON] Revenus quotidiens terminés:`);
    console.log(`   - ${processed} produits traités`);
    console.log(`   - ${completed} produits terminés`);
    console.log(`   - ${totalPaid.toFixed(2)} FCFA versés au total\n`);

    return {
      success: true,
      processed,
      completed,
      totalPaid
    };

  } catch (error) {
    await connection.rollback();
    console.error('❌ [CRON] Erreur lors du versement des revenus quotidiens:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    connection.release();
  }
};

// Permettre l'exécution manuelle pour tester
if (import.meta.url === `file://${process.argv[1]}`) {
  import('../config/database.js').then(() => {
    dailyRevenue().then(() => {
      console.log('✅ Script terminé');
      process.exit(0);
    });
  });
}

