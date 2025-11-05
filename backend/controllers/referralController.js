import pool from '../config/database.js';

/**
 * Récupérer mon équipe (3 niveaux de parrainage)
 */
export const getMyTeam = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const userId = req.user.id;
  // Déterminer le domaine à utiliser pour les liens de parrainage.
  // Priorité : origine de la requête (header `Origin`) -> APP_DOMAIN env -> construction à partir de la requête -> valeur par défaut.
  const requestOrigin = connection ? (req.get('origin') || `${req.protocol}://${req.get('host')}`) : (process.env.APP_DOMAIN || '');
  const appDomain = req.get('origin') || process.env.APP_DOMAIN || `${req.protocol}://${req.get('host')}` || 'https://invigorating-embrace-production.up.railway.app';

    // Récupérer mon code de parrainage pour le lien
    const [myProfile] = await connection.query(
      'SELECT COALESCE(referral_code, "") as referral_code FROM profiles WHERE id = ?',
      [userId]
    );

    if (!myProfile || !myProfile[0]) {
      return res.status(404).json({
        success: false,
        message: 'Profil non trouvé'
      });
    }

    const myReferralLink = `${appDomain}/register?ref=${myProfile[0].referral_code}`;

    // Récupérer les statistiques par niveau
    const [teamStats] = await connection.query(`
      SELECT 
        level,
        COUNT(*) as users,
        COALESCE(SUM(r.total_commission), 0) as rewards,
        COALESCE(r.commission_rate, 0) as commission_rate
      FROM referrals r
      WHERE r.referrer_id = ? AND r.status = 'active'
      GROUP BY level, commission_rate
      ORDER BY level
    `, [userId]);

    // Récupérer les détails des filleuls de niveau 1 avec plus d'informations
    const [level1Users] = await connection.query(`
      SELECT 
        p.id,
        COALESCE(p.display_name, '') as display_name,
        COALESCE(p.phone, '') as phone,
        p.created_at,
        COALESCE((SELECT SUM(price) FROM purchases WHERE user_id = p.id), 0) as total_invested,
        COALESCE(0, 0) as total_withdrawn,
        COALESCE(p.balance, 0) as balance,
        p.created_at as last_activity_at,
        COALESCE(r.total_commission, 0) as total_commission,
        COALESCE(r.total_purchases, 0) as total_purchases,
        COALESCE(p.referral_code, '') as referral_code,
        COALESCE((SELECT COUNT(*) FROM referrals r2 WHERE r2.referrer_id = p.id AND r2.level = 1), 0) as own_referrals
      FROM referrals r
      INNER JOIN profiles p ON r.referred_id = p.id
      WHERE r.referrer_id = ? AND r.level = 1
      ORDER BY r.created_at DESC
      LIMIT 50
    `, [userId]);

    // Calculer les totaux
    const totalUsers = teamStats.reduce((sum, level) => sum + parseInt(level.users), 0);
    const totalRewards = teamStats.reduce((sum, level) => sum + parseFloat(level.rewards || 0), 0);

    res.json({
      success: true,
      data: {
        referralLink: myReferralLink,
        levels: teamStats.map(level => ({
          level: `LV${level.level}`,
          commission: `${level.commission_rate}%`,
          users: level.users,
          rewards: parseFloat(level.rewards || 0)
        })),
        level1Users: level1Users.map(user => ({
          id: user.id,
          display_name: user.display_name,
          phone: user.phone,
          created_at: user.created_at,
          total_invested: parseFloat(user.total_invested || 0),
          total_withdrawn: parseFloat(user.total_withdrawn || 0),
          balance: parseFloat(user.balance || 0),
          last_activity: user.last_activity_at,
          commission: parseFloat(user.total_commission || 0),
          purchases: parseFloat(user.total_purchases || 0),
          referralCode: user.referral_code,
          referralLink: `${appDomain}/register?ref=${user.referral_code}`,
          ownReferrals: user.own_referrals
        })),
        totalUsers,
        totalRewards
      }
    });
  } catch (error) {
    console.error('Erreur détaillée getMyTeam:', {
      error: error.message,
      stack: error.stack,
      sql: error.sql,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      code: error.code
    });
    
    res.status(500).json({
      success: false,
      message: `Erreur lors de la récupération de l'équipe: ${error.message}`,
      errorCode: error.code
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Récupérer les statistiques de parrainage
 */
export const getReferralStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [stats] = await pool.query(`
      SELECT 
        p.referral_code,
        p.total_referrals,
        p.referral_earnings,
        COUNT(DISTINCT r.id) as total_referrals_count,
        SUM(r.total_commission) as total_commissions_earned
      FROM profiles p
      LEFT JOIN referrals r ON p.id = r.referrer_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [userId]);

    res.json({
      success: true,
      data: stats[0] || {
        referral_code: '',
        total_referrals: 0,
        referral_earnings: 0,
        total_referrals_count: 0,
        total_commissions_earned: 0
      }
    });
  } catch (error) {
    console.error('Erreur getReferralStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

/**
 * Valider un code de parrainage
 */
export const validateReferralCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code de parrainage requis'
      });
    }

    const [users] = await pool.query(
      'SELECT id, display_name, phone FROM profiles WHERE referral_code = ? AND is_active = TRUE',
      [code.toUpperCase()]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Code de parrainage invalide'
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        referrer: {
          id: users[0].id,
          name: users[0].display_name
        }
      }
    });
  } catch (error) {
    console.error('Erreur validateReferralCode:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du code'
    });
  }
};

/**
 * Créer les relations de parrainage (3 niveaux)
 * Helper function utilisée lors de l'inscription
 */
export const createReferralChain = async (newUserId, referrerId) => {
  try {
    const referralChain = [];

    // Récupérer la chaîne de parrainage jusqu'à 3 niveaux
    let currentReferrerId = referrerId;
    let level = 1;

    while (currentReferrerId && level <= 3) {
      const [referrer] = await pool.query(
        'SELECT id, referred_by FROM profiles WHERE id = ?',
        [currentReferrerId]
      );

      if (referrer.length > 0) {
        // Déterminer le taux de commission selon le niveau
        let commissionRate;
        switch (level) {
          case 1: commissionRate = 25; break;
          case 2: commissionRate = 3; break;
          case 3: commissionRate = 2; break;
          default: commissionRate = 0;
        }

        referralChain.push({
          referrerId: referrer[0].id,
          level,
          commissionRate
        });

        // Passer au niveau supérieur
        currentReferrerId = referrer[0].referred_by;
        level++;
      } else {
        break;
      }
    }

    // Créer les relations de parrainage
    for (const relation of referralChain) {
      await pool.query(`
        INSERT INTO referrals (referrer_id, referred_id, level, commission_rate, status)
        VALUES (?, ?, ?, ?, 'active')
      `, [relation.referrerId, newUserId, relation.level, relation.commissionRate]);

      // Mettre à jour le compteur de filleuls du parrain
      await pool.query(
        'UPDATE profiles SET total_referrals = total_referrals + 1 WHERE id = ?',
        [relation.referrerId]
      );
    }

    return referralChain;
  } catch (error) {
    console.error('Erreur createReferralChain:', error);
    throw error;
  }
};

