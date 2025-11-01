import pool from '../config/database.js';

/**
 * CRON Job pour expirer les récompenses non réclamées
 * À exécuter toutes les heures
 */
export const expireRewards = async () => {
  try {
    console.log('\n🕐 [CRON] Expiration des récompenses non réclamées...');

    // Expirer les récompenses qui ont dépassé leur date d'expiration
    const [result] = await pool.query(`
      UPDATE rewards
      SET status = 'expired'
      WHERE status = 'pending'
        AND expires_at IS NOT NULL
        AND expires_at < NOW()
    `);

    console.log(`✅ [CRON] ${result.affectedRows} récompenses expirées\n`);

    return {
      success: true,
      expired: result.affectedRows
    };

  } catch (error) {
    console.error('❌ [CRON] Erreur lors de l\'expiration des récompenses:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Permettre l'exécution manuelle pour tester
if (import.meta.url === `file://${process.argv[1]}`) {
  import('../config/database.js').then(() => {
    expireRewards().then(() => {
      console.log('✅ Script terminé');
      process.exit(0);
    });
  });
}

