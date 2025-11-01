import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    console.log('\n🔐 Création du compte administrateur...\n');

    const adminPhone = '+225ADMIN';
    const adminPassword = 'admin123';
    const adminName = 'Administrateur AFRIONE';

    // Vérifier si l'admin existe déjà
    const [existing] = await pool.query(
      'SELECT id FROM profiles WHERE phone = ?',
      [adminPhone]
    );

    if (existing.length > 0) {
      console.log('⚠️  Un administrateur existe déjà avec ce numéro.');
      console.log('   Suppression de l\'ancien compte...\n');
      await pool.query('DELETE FROM profiles WHERE phone = ?', [adminPhone]);
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Créer le compte admin
    await pool.query(`
      INSERT INTO profiles (
        phone, display_name, password, balance, role,
        referral_code, is_active, is_verified, signup_bonus_claimed
      ) VALUES (?, ?, ?, 0, 'admin', 'ADMIN1', TRUE, TRUE, TRUE)
    `, [adminPhone, adminName, hashedPassword]);

    console.log('✅ Compte administrateur créé avec succès!\n');
    console.log('📋 INFORMATIONS DE CONNEXION :');
    console.log('   ═══════════════════════════════════');
    console.log('   Téléphone  : +225ADMIN');
    console.log('   Mot de passe : admin123');
    console.log('   Rôle : admin');
    console.log('   ═══════════════════════════════════\n');
    console.log('🔗 Vous pouvez maintenant vous connecter avec ces identifiants.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    process.exit(1);
  }
};

createAdmin();

