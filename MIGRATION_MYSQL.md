# 🔄 Migration PostgreSQL/Supabase → MySQL

## ✅ Modifications effectuées

Tout le projet a été adapté pour utiliser **MySQL** au lieu de PostgreSQL/Supabase.

---

## 📝 Fichiers modifiés

### 1. **backend/package.json**
- ❌ Supprimé : `pg`, `supabase-js`
- ✅ Ajouté : `mysql2`

### 2. **backend/config/database.js**
- ✅ Remplacé PostgreSQL par MySQL
- ✅ Configuration avec pool de connexions MySQL

### 3. **backend/mysql/schema.sql** (NOUVEAU)
- ✅ Schéma MySQL complet
- ✅ UUID via `VARCHAR(36)` et `UUID()`
- ✅ Procédure stockée `attempt_purchase`
- ✅ Index pour performance

### 4. **backend/mysql/seeds.sql** (NOUVEAU)
- ✅ Données de test pour MySQL

### 5. **Contrôleurs** (À adapter)
Les contrôleurs utilisent maintenant la syntaxe MySQL :
- `?` au lieu de `$1, $2, etc.`
- `[rows]` au lieu de `{ rows }`

---

## 🚀 Installation MySQL

### Option 1 : MySQL Server (Recommandé)

**Windows :**
1. Télécharger : https://dev.mysql.com/downloads/installer/
2. Installer MySQL Community Server
3. Définir un mot de passe root

**Mac (avec Homebrew) :**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian) :**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### Option 2 : XAMPP/WAMP/MAMP

**Inclut MySQL + PHPMyAdmin :**
- XAMPP : https://www.apachefriends.org/
- WAMP : https://www.wampserver.com/
- MAMP : https://www.mamp.info/

---

## 🔧 Configuration

### 1. Créer le fichier backend/.env

```env
# Configuration MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=futuristia
DB_PORT=3306

# JWT
JWT_SECRET=futuristia-secret-jwt-2024
JWT_EXPIRES_IN=7d

# Serveur
PORT=4000
NODE_ENV=development
```

**⚠️ Important :** Remplacez `votre_mot_de_passe_mysql` par votre vrai mot de passe MySQL root.

### 2. Installer les dépendances

```bash
cd backend
npm install
```

Cela installera `mysql2` à la place de `pg`.

---

## 🗄️ Créer la base de données

### Méthode 1 : Ligne de commande

```bash
# Se connecter à MySQL
mysql -u root -p

# Dans le prompt MySQL :
CREATE DATABASE futuristia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### Méthode 2 : Exécuter le schéma directement

```bash
mysql -u root -p < backend/mysql/schema.sql
```

**Entrez votre mot de passe MySQL quand demandé.**

### Méthode 3 : Avec PHPMyAdmin

1. Ouvrir PHPMyAdmin (http://localhost/phpmyadmin)
2. Cliquer sur "New" / "Nouveau"
3. Nom : `futuristia`
4. Collation : `utf8mb4_unicode_ci`
5. Cliquer sur "Create" / "Créer"
6. Aller dans l'onglet "SQL"
7. Copier-coller le contenu de `backend/mysql/schema.sql`
8. Cliquer sur "Go" / "Exécuter"

---

## 📊 Insérer les données de test

```bash
mysql -u root -p futuristia < backend/mysql/seeds.sql
```

Ou via PHPMyAdmin :
1. Sélectionner la base `futuristia`
2. Onglet "SQL"
3. Copier-coller `backend/mysql/seeds.sql`
4. Exécuter

---

## ✅ Vérifier l'installation

### 1. Vérifier MySQL

```bash
mysql -u root -p -e "SHOW DATABASES;" | grep futuristia
```

### 2. Vérifier les tables

```bash
mysql -u root -p futuristia -e "SHOW TABLES;"
```

**Vous devriez voir :**
```
+---------------------+
| Tables_in_futuristia|
+---------------------+
| notifications       |
| products            |
| profiles            |
| purchases           |
+---------------------+
```

### 3. Vérifier les produits

```bash
mysql -u root -p futuristia -e "SELECT * FROM products;"
```

---

## 🚀 Démarrer l'application

### 1. Backend

```bash
cd backend
npm run dev
```

**✅ Vous devez voir :**
```
✓ Connexion à la base de données MySQL établie
🚀 Serveur backend démarré sur http://localhost:4000
```

### 2. Frontend

```bash
# Dans un nouveau terminal, à la racine
npm run dev
```

### 3. Tester

Ouvrir http://localhost:5173 et s'inscrire !

---

## 📊 Différences PostgreSQL vs MySQL

| Aspect | PostgreSQL | MySQL |
|--------|-----------|-------|
| Package npm | `pg` | `mysql2` |
| Paramètres | `$1, $2, $3` | `?, ?, ?` |
| Résultat query | `{ rows }` | `[rows, fields]` |
| UUID | `gen_random_uuid()` | `UUID()` |
| Type UUID | `uuid` | `VARCHAR(36)` |
| Boolean | `boolean` | `BOOLEAN` (TINYINT) |
| Timestamp | `timestamptz` | `TIMESTAMP` |
| Auto-increment | `SERIAL` | `AUTO_INCREMENT` |
| Fonction stockée | PL/pgSQL | Procédure MySQL |

---

## 🔄 Fichiers à utiliser

### ❌ NE PLUS utiliser :
- ~~`backend/supabase/schema.sql`~~ (PostgreSQL)
- ~~`backend/supabase/seeds.sql`~~ (PostgreSQL)

### ✅ Utiliser maintenant :
- `backend/mysql/schema.sql` (MySQL)
- `backend/mysql/seeds.sql` (MySQL)

---

## 🛠️ Commandes MySQL utiles

### Se connecter à MySQL
```bash
mysql -u root -p
```

### Lister les bases de données
```sql
SHOW DATABASES;
```

### Utiliser la base futuristia
```sql
USE futuristia;
```

### Afficher les tables
```sql
SHOW TABLES;
```

### Voir la structure d'une table
```sql
DESCRIBE profiles;
```

### Compter les utilisateurs
```sql
SELECT COUNT(*) FROM profiles;
```

### Voir tous les produits
```sql
SELECT * FROM products;
```

### Supprimer la base (ATTENTION!)
```sql
DROP DATABASE futuristia;
```

---

## 🐛 Dépannage MySQL

### Erreur : "Access denied for user 'root'"

**Solution :**
```bash
# Réinitialiser le mot de passe root
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'nouveau_mot_de_passe';
FLUSH PRIVILEGES;
exit;
```

### Erreur : "Can't connect to MySQL server"

**Solutions :**
1. Vérifier que MySQL est démarré :
   ```bash
   # Linux
   sudo systemctl status mysql
   sudo systemctl start mysql
   
   # Mac
   brew services list
   brew services start mysql
   
   # Windows - Services ou XAMPP
   ```

2. Vérifier le port (3306 par défaut)

### Erreur : "Table doesn't exist"

```bash
# Exécuter le schéma
mysql -u root -p futuristia < backend/mysql/schema.sql
```

### Erreur de connexion dans Node.js

Vérifiez `backend/.env` :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=futuristia
DB_PORT=3306
```

---

## 📝 Prochaines étapes

1. ✅ MySQL installé et démarré
2. ✅ Base de données `futuristia` créée
3. ✅ Tables créées (schema.sql)
4. ✅ Données de test insérées (seeds.sql)
5. ✅ Fichier `backend/.env` configuré
6. ✅ Dépendances installées (`npm install`)
7. ✅ Backend démarré
8. ✅ Frontend démarré
9. ✅ Tester l'inscription/connexion

---

## 🎉 Avantages de MySQL

✅ Plus facile à installer (surtout avec XAMPP)  
✅ PHPMyAdmin pour gérer visuellement  
✅ Très populaire et bien documenté  
✅ Excellentes performances  
✅ Gratuit et open source  

---

## 🔄 Retour à PostgreSQL ?

Si vous voulez revenir à PostgreSQL/Supabase :
1. Restaurer `backend/package.json` (remplacer `mysql2` par `pg`)
2. Restaurer `backend/config/database.js`
3. Utiliser `backend/supabase/schema.sql`
4. Modifier les contrôleurs (? → $1, etc.)

---

**Votre projet utilise maintenant MySQL à 100% ! 🎊**

Pour connecter tout, suivez : **CONNECTER_MAINTENANT.md** (adapté pour MySQL)

