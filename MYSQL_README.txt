================================================================================
  🎉 PROJET MIGRÉ VERS MYSQL 🎉
================================================================================

✅ PostgreSQL/Supabase a été SUPPRIMÉ
✅ MySQL est maintenant le système de base de données

================================================================================
  📁 FICHIERS IMPORTANTS MYSQL
================================================================================

backend/mysql/schema.sql  → Schéma de la base de données MySQL
backend/mysql/seeds.sql   → Données de test

❌ NE PLUS UTILISER :
   backend/supabase/schema.sql (PostgreSQL - OBSOLÈTE)
   backend/supabase/seeds.sql  (PostgreSQL - OBSOLÈTE)

================================================================================
  📖 DOCUMENTATION
================================================================================

LIRE EN PRIORITÉ :

1. MIGRATION_MYSQL.md         → Comprendre la migration (5 min)
2. CONNECTER_AVEC_MYSQL.md    → Connecter tout avec MySQL (10 min)

Autres docs utiles :

- ETAT_ACTUEL.md             → État du projet
- LISEZ_MOI_DABORD.txt       → Point de départ général

================================================================================
  ⚡ DÉMARRAGE RAPIDE MYSQL
================================================================================

1. Installer XAMPP (recommandé) ou MySQL Server
   → https://www.apachefriends.org/

2. Créer backend/.env :
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=                    ← Vide pour XAMPP
   DB_NAME=futuristia
   DB_PORT=3306

3. Créer la base de données :
   mysql -u root -p < backend/mysql/schema.sql
   mysql -u root -p futuristia < backend/mysql/seeds.sql

4. Installer les dépendances :
   npm install
   cd backend && npm install

5. Démarrer :
   Backend:  cd backend && npm run dev
   Frontend: npm run dev

6. Tester : http://localhost:5173

================================================================================
  🔧 CONFIGURATION
================================================================================

Package utilisé : mysql2 (au lieu de pg)
Port : 3306 (au lieu de 5432 pour PostgreSQL)
Syntaxe SQL : MySQL (légèrement différente de PostgreSQL)

================================================================================
  🎯 AVANTAGES MySQL
================================================================================

✅ Plus facile à installer (surtout avec XAMPP)
✅ PHPMyAdmin pour gérer visuellement la base
✅ Très populaire et bien documenté
✅ Compatible Windows/Mac/Linux
✅ Gratuit et open source

================================================================================
  🆘 BESOIN D'AIDE ?
================================================================================

Problème de connexion ?
→ Vérifiez backend/.env (DB_PASSWORD)
→ XAMPP : laissez DB_PASSWORD vide
→ MySQL Server : utilisez votre mot de passe

Tables n'existent pas ?
→ Exécutez backend/mysql/schema.sql

Données manquantes ?
→ Exécutez backend/mysql/seeds.sql

================================================================================
  📊 VÉRIFIER QUE MySQL FONCTIONNE
================================================================================

# Voir la base de données
mysql -u root -p -e "SHOW DATABASES;" | grep futuristia

# Voir les tables
mysql -u root -p futuristia -e "SHOW TABLES;"

# Voir les produits
mysql -u root -p futuristia -e "SELECT * FROM products;"

# Ou utilisez PHPMyAdmin :
http://localhost/phpmyadmin

================================================================================

Pour plus de détails, lisez :
→ CONNECTER_AVEC_MYSQL.md

Bonne chance avec MySQL ! 🚀

