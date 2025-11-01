# 🔌 CONNEXION RÉELLE Backend ↔ Frontend

## ⚠️ IMPORTANT : Vous avez raison !

Le code backend et frontend est créé, mais **PAS ENCORE CONNECTÉ**. Voici comment les connecter réellement.

---

## 📋 État actuel

✅ Code backend créé (contrôleurs, routes, etc.)  
✅ Code frontend créé (client API, composants)  
❌ Base de données **NON créée**  
❌ Fichiers .env **N'EXISTENT PAS** (dans .gitignore)  
❌ Backend **NON démarré**  
❌ Frontend et Backend **NON connectés**

---

## 🎯 Étapes pour VRAIMENT connecter tout

### Étape 1 : Créer le fichier .env du backend

```bash
cd backend
```

Créez le fichier `.env` avec ce contenu :

```env
# IMPORTANT : Remplacez "postgres" et "votreMotDePasse" par vos vrais identifiants PostgreSQL
DATABASE_URL=postgresql://postgres:votreMotDePasse@localhost:5432/futuristia

JWT_SECRET=futuristia-secret-jwt-2024-changez-moi-en-production
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=development
```

**⚠️ Modifiez `votreMotDePasse` avec votre vrai mot de passe PostgreSQL !**

---

### Étape 2 : Créer la base de données

```bash
# Ouvrir PostgreSQL
psql -U postgres

# Dans psql, tapez :
CREATE DATABASE futuristia;
\q
```

**Alternative avec une seule commande :**
```bash
psql -U postgres -c "CREATE DATABASE futuristia;"
```

---

### Étape 3 : Exécuter les migrations SQL

```bash
# Depuis le dossier racine du projet
psql -U postgres -d futuristia -f backend/supabase/schema.sql
psql -U postgres -d futuristia -f backend/supabase/seeds.sql
```

**Vérification :**
```bash
psql -U postgres -d futuristia -c "\dt"
```

Vous devez voir : `profiles`, `products`, `purchases`, `notifications`

---

### Étape 4 : Vérifier les dépendances backend

```bash
cd backend
npm install
```

Attendez que toutes les dépendances soient installées.

---

### Étape 5 : DÉMARRER le backend

```bash
# Dans le dossier backend
npm run dev
```

**✅ Vous DEVEZ voir :**
```
✓ Connexion à la base de données établie

🚀 Serveur backend démarré sur http://localhost:4000
📚 Documentation API disponible sur http://localhost:4000/api-docs
```

**❌ Si vous voyez une erreur :**
- Vérifiez que PostgreSQL est démarré
- Vérifiez le fichier `.env` (surtout le mot de passe)
- Vérifiez que la base `futuristia` existe

---

### Étape 6 : Tester le backend (IMPORTANT)

**Dans un NOUVEAU terminal**, testez :

```bash
# Tester la route de base
curl http://localhost:4000

# Tester les produits
curl http://localhost:4000/api/products
```

**✅ Vous DEVEZ voir du JSON en réponse**

---

### Étape 7 : Créer le fichier .env du frontend

**À la RACINE du projet** (pas dans backend), créez `.env` :

```env
VITE_API_URL=http://localhost:4000/api
```

---

### Étape 8 : Vérifier les dépendances frontend

```bash
# À la racine du projet
npm install
```

---

### Étape 9 : DÉMARRER le frontend

**Dans un NOUVEAU terminal** (le backend doit toujours tourner) :

```bash
# À la racine du projet
npm run dev
```

**✅ Vous DEVEZ voir :**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

### Étape 10 : VÉRIFIER la connexion

Ouvrez votre navigateur : **http://localhost:5173**

**Ouvrez la Console du navigateur (F12) et :**

1. Cliquez sur "S'inscrire"
2. Entrez un numéro : `+22512345678`
3. Entrez un mot de passe : `test123`
4. Cliquez sur "S'inscrire"

**Dans la console, vous DEVEZ voir :**
- Requête POST vers `http://localhost:4000/api/auth/register`
- Réponse avec un token

**❌ Si vous voyez "ERR_CONNECTION_REFUSED" :**
- Le backend n'est pas démarré
- Vérifiez le fichier `.env` frontend

---

## 🧪 Test complet de connexion

Voici un test pour vérifier que TOUT est connecté :

### Test 1 : Backend seul
```bash
curl http://localhost:4000/api/products
```
**Attendu :** JSON avec 3 produits

### Test 2 : Inscription depuis frontend
1. Ouvrir http://localhost:5173
2. S'inscrire avec un nouveau compte
3. Vérifier la redirection vers l'écran d'accueil

### Test 3 : Base de données
```bash
psql -U postgres -d futuristia -c "SELECT * FROM profiles;"
```
**Attendu :** Voir votre utilisateur créé

### Test 4 : Achat de produit
1. Recharger le solde (ex: 10000 FCFA)
2. Aller dans "Produits"
3. Acheter un produit
4. Vérifier la mise à jour du solde

---

## 🔍 Vérification visuelle

### ✅ Backend connecté si :
- Terminal backend montre "Connexion à la base de données établie"
- `curl http://localhost:4000` renvoie du JSON
- `psql -U postgres -d futuristia -c "\dt"` montre les tables

### ✅ Frontend connecté au backend si :
- Pas d'erreur "Connection refused" dans la console
- Les requêtes vers http://localhost:4000 apparaissent dans l'onglet Network (F12)
- L'inscription/connexion fonctionne

---

## 🐛 Problèmes courants

### Erreur : "password authentication failed"
```bash
# Vérifiez votre mot de passe PostgreSQL
psql -U postgres
# Si ça marche, utilisez ce mot de passe dans backend/.env
```

### Erreur : "database futuristia does not exist"
```bash
psql -U postgres -c "CREATE DATABASE futuristia;"
```

### Erreur : "relation profiles does not exist"
```bash
# Les migrations n'ont pas été exécutées
psql -U postgres -d futuristia -f backend/supabase/schema.sql
```

### Erreur : "ERR_CONNECTION_REFUSED" dans le frontend
```bash
# Le backend n'est pas démarré
cd backend
npm run dev
```

### Erreur : "MODULE_NOT_FOUND"
```bash
# Dans backend/
npm install

# À la racine
npm install
```

---

## 📝 Checklist finale

Cochez chaque élément :

**Configuration :**
- [ ] Fichier `backend/.env` créé avec bon mot de passe
- [ ] Fichier `.env` créé à la racine avec `VITE_API_URL`
- [ ] PostgreSQL installé et démarré
- [ ] Base de données `futuristia` créée

**Dépendances :**
- [ ] `npm install` exécuté à la racine
- [ ] `npm install` exécuté dans `backend/`

**Base de données :**
- [ ] `schema.sql` exécuté
- [ ] `seeds.sql` exécuté
- [ ] Tables visibles avec `\dt`

**Serveurs :**
- [ ] Backend démarré (`cd backend && npm run dev`)
- [ ] Frontend démarré (`npm run dev`)
- [ ] Backend accessible sur http://localhost:4000
- [ ] Frontend accessible sur http://localhost:5173

**Tests :**
- [ ] `curl http://localhost:4000` fonctionne
- [ ] `curl http://localhost:4000/api/products` renvoie 3 produits
- [ ] Inscription fonctionne sur le frontend
- [ ] Pas d'erreur dans la console du navigateur

---

## 🎯 Une fois TOUT coché ci-dessus

Votre application sera **VRAIMENT** connectée :
- Frontend ↔ Backend ✅
- Backend ↔ Base de données ✅
- Toutes les fonctionnalités opérationnelles ✅

---

## 🆘 Besoin d'aide ?

Si quelque chose ne fonctionne pas, vérifiez dans cet ordre :

1. **PostgreSQL est-il démarré ?**
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

2. **La base de données existe-t-elle ?**
   ```bash
   psql -U postgres -c "\l" | grep futuristia
   ```

3. **Le fichier .env backend existe-t-il ?**
   ```bash
   cat backend/.env
   ```

4. **Le backend démarre-t-il ?**
   ```bash
   cd backend && npm run dev
   ```

5. **Le frontend appelle-t-il le bon URL ?**
   ```bash
   cat .env
   # Doit contenir : VITE_API_URL=http://localhost:4000/api
   ```

---

**Suivez ce guide étape par étape et votre application sera 100% connectée ! 🚀**

