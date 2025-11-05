import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { generateToken } from '../config/jwt.js';
import { createReferralChain } from './referralController.js';

/**
 * Générer un code de parrainage unique
 */
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { phone, password, display_name, referral_code } = req.body;

    // Validation des données
    if (!phone || !password) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Le numéro de téléphone et le mot de passe sont requis'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const [existingUser] = await connection.query(
      'SELECT * FROM profiles WHERE phone = ?',
      [phone]
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Ce numéro de téléphone est déjà utilisé'
      });
    }

    // PATCH AI - Limiter aux pays acceptés
    const allowedPrefixes = ['+225', '+228', '+226', '+237', '+229'];
    if (!allowedPrefixes.some(prefix => phone.startsWith(prefix))) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Le pays de ce numéro n\'est pas autorisé.'
      });
    }

    // Correction de la récupération du code de parrainage
    let referrerId = null;
    const referredByCode = referral_code || req.body.referred_by_code;
    if (referredByCode) {
      const [referrer] = await connection.query(
        'SELECT id FROM profiles WHERE referral_code = ?',
        [referredByCode.toUpperCase()]
      );
      if (referrer.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Code de parrainage invalide'
        });
      }
      referrerId = referrer[0].id;
    }

    // Générer un code de parrainage unique pour ce nouvel utilisateur
    let userReferralCode;
    let isUnique = false;
    while (!isUnique) {
      userReferralCode = generateReferralCode();
      const [existing] = await connection.query(
        'SELECT id FROM profiles WHERE referral_code = ?',
        [userReferralCode]
      );
      if (existing.length === 0) {
        isUnique = true;
      }
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Récupérer le bonus d'inscription depuis system_settings
    const [signupBonus] = await connection.query(
      'SELECT setting_value FROM system_settings WHERE setting_key = ?',
      ['signup_bonus']
    );
    const bonusAmount = parseFloat(signupBonus[0]?.setting_value || 300);

    // Créer l'utilisateur
    const [result] = await connection.query(
      `INSERT INTO profiles (
        phone, display_name, password, balance, role,
        referral_code, referred_by, signup_bonus_claimed
      ) VALUES (?, ?, ?, 0, 'user', ?, ?, TRUE)`,
      [phone, display_name || phone, hashedPassword, userReferralCode, referrerId]
    );

    // Récupérer l'ID (UUID) du nouvel utilisateur car la PK est VARCHAR(36) avec UUID()
    let userId = null;
    const [userIdRows] = await connection.query(
      'SELECT id FROM profiles WHERE phone = ? LIMIT 1',
      [phone]
    );
    if (userIdRows.length === 0) {
      await connection.rollback();
      return res.status(500).json({ success:false, message: "Impossible de récupérer l'identifiant utilisateur" });
    }
    userId = userIdRows[0].id;

    // Créditer le bonus d'inscription et créer la transaction
    const SIGNUP_BONUS = Number(process.env.SIGNUP_BONUS || 300);
    
    // Mettre à jour le solde
    await connection.query(
      'UPDATE profiles SET balance = balance + ? WHERE id = ?',
      [SIGNUP_BONUS, userId]
    );

    // Créer la transaction avec balance_before et balance_after
    await connection.query(`
      INSERT INTO transactions (
        user_id, type, amount, balance_before, balance_after,
        description, status
      ) VALUES (?, 'bonus', ?, 0, ?, ?, 'completed')
    `, [userId, SIGNUP_BONUS, SIGNUP_BONUS, 'Bonus d\'inscription']);

    // Créer la notification
    await connection.query(
      `INSERT INTO notifications (user_id, title, body, is_read)
       VALUES (?, ?, ?, 0)`,
      [userId, 'Félicitations !', `Vous avez reçu un bonus d'inscription de ${SIGNUP_BONUS} FCFA`]
    );

    // Créer la récompense
    await connection.query(`
      INSERT INTO rewards (user_id, type, amount, description, status, claimed_at)
      VALUES (?, 'signup', ?, ?, 'claimed', NOW())
    `, [userId, bonusAmount, 'Bonus d\'inscription de bienvenue']);

    // Créer la chaîne de parrainage si un code a été fourni
    if (referrerId) {
      // Récupérer les taux de commission
      const [rates] = await connection.query(`
        SELECT setting_key, setting_value 
        FROM system_settings 
        WHERE setting_key IN ('referral_level1_rate', 'referral_level2_rate', 'referral_level3_rate')
      `);

      const commissionRates = {
        level1: 25,
        level2: 3,
        level3: 2
      };

      rates.forEach(r => {
        if (r.setting_key === 'referral_level1_rate') commissionRates.level1 = parseFloat(r.setting_value);
        if (r.setting_key === 'referral_level2_rate') commissionRates.level2 = parseFloat(r.setting_value);
        if (r.setting_key === 'referral_level3_rate') commissionRates.level3 = parseFloat(r.setting_value);
      });

      // Créer la chaîne de parrainage (3 niveaux)
      let currentReferrerId = referrerId;
      let level = 1;

      while (currentReferrerId && level <= 3) {
        // Déterminer le taux
        let rate = level === 1 ? commissionRates.level1 : level === 2 ? commissionRates.level2 : commissionRates.level3;

        // Créer la relation de parrainage
        await connection.query(`
          INSERT INTO referrals (referrer_id, referred_id, level, commission_rate, status)
          VALUES (?, ?, ?, ?, 'active')
        `, [currentReferrerId, userId, level, rate]);

        // Mettre à jour le compteur de filleuls
        await connection.query(
          'UPDATE profiles SET total_referrals = total_referrals + 1 WHERE id = ?',
          [currentReferrerId]
        );

        // Passer au niveau supérieur
        const [nextReferrer] = await connection.query(
          'SELECT referred_by FROM profiles WHERE id = ?',
          [currentReferrerId]
        );

        currentReferrerId = nextReferrer[0]?.referred_by || null;
        level++;
      }
    }

    await connection.commit();

    // Récupérer l'utilisateur créé avec toutes ses infos
    const [userRows] = await pool.query(
      `SELECT id, phone, display_name, balance, role, referral_code, total_referrals 
       FROM profiles WHERE id = ?`,
      [userId]
    );

    const user = userRows[0];

    // Générer un token JWT
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie ! Vous avez reçu ' + bonusAmount + ' FCFA de bonus.',
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          display_name: user.display_name,
          balance: parseFloat(user.balance),
          role: user.role,
          referral_code: user.referral_code,
          total_referrals: user.total_referrals
        },
        token
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

/**
 * @desc    Connexion d'un utilisateur
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validation
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Téléphone et mot de passe requis'
      });
    }

    // Vérifier si l'utilisateur existe
    const [users] = await pool.query(
      'SELECT * FROM profiles WHERE phone = ?',
      [phone]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }

    const user = users[0];

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }

    // Vérifier si le compte est actif
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    // Mettre à jour last_login_at
    await pool.query(
      'UPDATE profiles SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    // Générer le token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          display_name: user.display_name,
          balance: parseFloat(user.balance),
          role: user.role,
          referral_code: user.referral_code,
          total_referrals: user.total_referrals
        },
        token
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

/**
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      `SELECT 
        id, phone, display_name, email, balance, total_earnings,
        total_invested, total_withdrawn, referral_code, referred_by,
        total_referrals, referral_earnings, signup_bonus_claimed,
        last_checkin_date, consecutive_checkins, total_checkin_bonus,
        role, is_active, created_at
       FROM profiles 
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
