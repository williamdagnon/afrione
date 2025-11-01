import pool from '../config/database.js';

/**
 * CRON Job pour réinitialiser les streaks de check-in
 * À exécuter tous les jours à 00:05
 */
export const resetCheckins = async () => {
  try {
    console.log('\n🕐 [CRON] Réinitialisation des streaks de check-in...');

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

    // Réinitialiser les streaks pour les utilisateurs qui n'ont pas fait de check-in depuis 2 jours
    const [result] = await pool.query(`
      UPDATE profiles
      SET consecutive_checkins = 0
      WHERE last_checkin_date < ? AND consecutive_checkins > 0
    `, [twoDaysAgoStr]);

    console.log(`✅ [CRON] ${result.affectedRows} streaks réinitialisés\n`);

    return {
      success: true,
      reset: result.affectedRows
    };

  } catch (error) {
    console.error('❌ [CRON] Erreur lors de la réinitialisation des streaks:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Permettre l'exécution manuelle pour tester
if (import.meta.url === `file://${process.argv[1]}`) {
  import('../config/database.js').then(() => {
    resetCheckins().then(() => {
      console.log('✅ Script terminé');
      process.exit(0);
    });
  });
}

