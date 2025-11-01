import cron from 'node-cron';
import { dailyRevenue } from './dailyRevenue.js';
import { resetCheckins } from './resetCheckins.js';
import { expireRewards } from './expireRewards.js';

/**
 * Initialiser tous les CRON jobs
 */
export const initCronJobs = () => {
  console.log('\n⏰ Initialisation des CRON jobs...\n');

  // Revenus quotidiens - Tous les jours à 00:01
  cron.schedule('1 0 * * *', async () => {
    console.log('⏰ [CRON] Déclenchement : Revenus quotidiens');
    await dailyRevenue();
  }, {
    scheduled: true,
    timezone: "UTC"
  });
  console.log('✅ CRON job "Revenus quotidiens" programmé (00:01 UTC)');

  // Reset des streaks de check-in - Tous les jours à 00:05
  cron.schedule('5 0 * * *', async () => {
    console.log('⏰ [CRON] Déclenchement : Reset streaks check-in');
    await resetCheckins();
  }, {
    scheduled: true,
    timezone: "UTC"
  });
  console.log('✅ CRON job "Reset streaks" programmé (00:05 UTC)');

  // Expiration des récompenses - Toutes les heures
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ [CRON] Déclenchement : Expiration récompenses');
    await expireRewards();
  }, {
    scheduled: true,
    timezone: "UTC"
  });
  console.log('✅ CRON job "Expiration récompenses" programmé (toutes les heures)');

  console.log('\n✅ Tous les CRON jobs sont actifs\n');
};

// Exporter les fonctions individuelles pour tests manuels
export { dailyRevenue, resetCheckins, expireRewards };

