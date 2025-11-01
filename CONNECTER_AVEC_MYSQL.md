# ⚡ CONNECTER AVEC MYSQL - Guide Ultra-Simple

## 🎯 Votre projet utilise maintenant MySQL !

Toutes les traces de PostgreSQL/Supabase ont été supprimées. Voici comment tout connecter en **10 minutes**.

---

## ✅ ÉTAPE 1 : Installer MySQL (5 minutes)

### Option A : XAMPP (Le plus simple - Recommandé pour débutants)

1. **Télécharger XAMPP** : https://www.apachefriends.org/
2. **Installer XAMPP**
3. **Démarrer XAMPP** Control Panel
4. **Cliquer sur "Start"** pour MySQL

**✅ MySQL est maintenant lancé !**

### Option B : MySQL Server seul

**Windows :**
- Télécharger : https://dev.mysql.com/downloads/installer/
- Installer MySQL Community Server
- Définir mot de passe root (notez-le !)

**Mac :**
```bash
brew install mysql
brew services start mysql
```

**Linux :**
```bash
sudo apt install mysql-server
sudo systemctl start mysql
```

---

## ✅ ÉTAPE 2 : Créer backend/.env (1 minute)

Dans le dossier `backend/`, créez un fichier `.env` :

```env
# MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=futuristia
DB_PORT=3306

# JWT
JWT_SECRET=futuristia-secret-jwt-2024
JWT_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=development
```

**⚠️ Important :**

Si vous avez défini un mot de passe MySQL, mettez-le à la place de `DB_PASSWORD=` :
```env
DB_PASSWORD=votre_mot_de_passe_mysql
```

**XAMPP par défaut = PAS de mot de passe, laissez vide !**

---

## ✅ ÉTAPE 3 : Créer .env frontend (30 secondes)

À la **RACINE** du projet, créez `.env` :

```env
VITE_API_URL=http://localhost:4000/api
```

---

## ✅ ÉTAPE 4 : Créer la base de données (2 minutes)

### Méthode A : Avec ligne de commande

```bash
mysql -u root -p < backend/mysql/schema.sql
```

Si demandé, entrez votre mot de passe MySQL (ou appuyez sur Entrée si pas de mot de passe).

### Méthode B : Avec PHPMyAdmin (XAMPP)

1. Ouvrir http://localhost/phpmyadmin
2. Cliquer sur "SQL" dans le menu du haut
3. Copier tout le contenu de `backend/mysql/schema.sql`
4. Coller dans la zone de texte
5. Cliquer sur "Go" / "Exécuter"

**✅ La base de données est créée !**

---

## ✅ ÉTAPE 5 : Insérer les données de test (30 secondes)

### Méthode A : Ligne de commande

```bash
mysql -u root -p futuristia < backend/mysql/seeds.sql
```

### Méthode B : PHPMyAdmin

1. http://localhost/phpmyadmin
2. Sélectionner la base `futuristia` à gauche
3. Onglet "SQL"
4. Copier le contenu de `backend/mysql/seeds.sql`
5. Coller et exécuter

---

## ✅ ÉTAPE 6 : Installer les dépendances (2 minutes)

```bash
# À la racine
npm install

# Backend
cd backend
npm install
cd ..
```

---

## ✅ ÉTAPE 7 : Démarrer le BACKEND (30 secondes)

**Nouveau terminal :**
```bash
cd backend
npm run dev
```

**✅ VOUS DEVEZ VOIR :**
```
✓ Connexion à la base de données MySQL établie
🚀 Serveur backend démarré sur http://localhost:4000
```

**❌ Si erreur "Access denied" :**
- Vérifiez `DB_PASSWORD` dans `backend/.env`
- XAMPP → laissez vide
- MySQL Server → utilisez votre mot de passe

---

## ✅ ÉTAPE 8 : Démarrer le FRONTEND (30 secondes)

**Nouveau terminal (le backend doit rester ouvert) :**
```bash
npm run dev
```

**✅ VOUS DEVEZ VOIR :**
```
➜  Local:   http://localhost:5173/
```

---

## ✅ ÉTAPE 9 : TESTER (2 minutes)

1. **Ouvrir** http://localhost:5173
2. **F12** pour ouvrir la console
3. **Cliquer sur "S'inscrire"**
4. **Entrer :**
   - Numéro : `+22512345678`
   - Mot de passe : `test123`
   - Confirmer : `test123`
5. **Cliquer "S'inscrire"**

**✅ SI ÇA MARCHE :**
- Redirection vers l'écran d'accueil
- Solde affiché : 0 FCFA
- Pas d'erreur dans la console

**🎉 BRAVO ! Tout fonctionne avec MySQL ! 🎉**

---

## 🧪 Test complet

1. **Recharger** : 10,000 FCFA → Solde passe à 10,000 ✅
2. **Acheter** : Produit à 2,000 FCFA → Solde passe à 8,000 ✅
3. **Retirer** : 3,000 FCFA → Solde passe à 5,000 ✅

**Tout marche = MySQL est parfaitement connecté ! 🎊**

---

## 🔍 Vérifier MySQL

### Voir la base de données

```bash
mysql -u root -p -e "SHOW DATABASES;"
```

Vous devez voir `futuristia` dans la liste.

### Voir les tables

```bash
mysql -u root -p futuristia -e "SHOW TABLES;"
```

Résultat attendu :
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

### Voir les produits

```bash
mysql -u root -p futuristia -e "SELECT * FROM products;"
```

Vous devez voir 3 produits (AFRIONE 001, 002, 003).

---

## 🐛 Problèmes courants

### Backend ne démarre pas

**Erreur "Access denied" ?**

→ Mauvais mot de passe dans `backend/.env`

**XAMPP :**
```env
DB_PASSWORD=
```

**MySQL Server (avec mot de passe) :**
```env
DB_PASSWORD=votre_mot_de_passe
```

---

### MySQL ne se connecte pas

**Vérifier que MySQL est démarré :**

**XAMPP :** Ouvrir XAMPP Control Panel → MySQL doit être en vert

**Mac :**
```bash
brew services list
# mysql doit être "started"
```

**Linux :**
```bash
sudo systemctl status mysql
```

---

### La base n'existe pas

```bash
# Créer manuellement
mysql -u root -p
CREATE DATABASE futuristia;
exit;

# Puis exécuter le schéma
mysql -u root -p futuristia < backend/mysql/schema.sql
```

---

### Frontend ne se connecte pas

**Vérifier que le backend est lancé :**
```bash
curl http://localhost:4000
```

Doit renvoyer du JSON.

**Vérifier le fichier `.env` à la racine :**
```bash
cat .env
# Doit contenir : VITE_API_URL=http://localhost:4000/api
```

---

## 📊 Gérer MySQL visuellement

### Avec PHPMyAdmin (XAMPP)

1. Ouvrir http://localhost/phpmyadmin
2. Cliquer sur `futuristia` à gauche
3. Voir toutes les tables et données

**Très utile pour :**
- Voir les utilisateurs créés
- Voir les achats effectués
- Modifier manuellement des données
- Exécuter des requêtes SQL

### Avec MySQL Workbench (Optionnel)

- Télécharger : https://dev.mysql.com/downloads/workbench/
- Interface graphique professionnelle
- Explorer, modifier, gérer la base

---

## 📋 Checklist finale

- [ ] MySQL installé et démarré
- [ ] Base de données `futuristia` créée
- [ ] Tables créées (4 tables)
- [ ] Données de test insérées (3 produits)
- [ ] Fichier `backend/.env` créé avec bon mot de passe
- [ ] Fichier `.env` (frontend) créé
- [ ] Dépendances installées (npm install x2)
- [ ] Backend lancé et affiche "✓ Connexion à la base de données MySQL établie"
- [ ] Frontend lancé sur http://localhost:5173
- [ ] Inscription fonctionne
- [ ] Rechargement fonctionne
- [ ] Achat fonctionne

**Tout coché = 100% opérationnel ! 🏆**

---

## 🎉 Résumé

```bash
# 1. Installer MySQL (XAMPP recommandé)
# 2. Créer backend/.env
# 3. Créer .env (racine)
# 4. Créer la base : mysql -u root -p < backend/mysql/schema.sql
# 5. Données test : mysql -u root -p futuristia < backend/mysql/seeds.sql
# 6. Installer : npm install && cd backend && npm install
# 7. Backend : cd backend && npm run dev
# 8. Frontend : npm run dev
# 9. Tester : http://localhost:5173
```

---

## 🎊 Félicitations !

Votre projet Futuristia fonctionne maintenant avec **MySQL** !

Plus simple que PostgreSQL, avec PHPMyAdmin en bonus ! 🚀

