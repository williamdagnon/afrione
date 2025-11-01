# Guide de démarrage rapide - Futuristia

## ⚡ Démarrage ultra-rapide (5 minutes)

### 1. Installation des dépendances (2 min)

```bash
# Installer les dépendances frontend
npm install

# Installer les dépendances backend
cd backend
npm install
cd ..
```

### 2. Configuration de la base de données (2 min)

#### Option A : PostgreSQL local

```bash
# Créer la base de données
psql -U postgres -c "CREATE DATABASE futuristia;"

# Exécuter les migrations
psql -U postgres -d futuristia -f backend/supabase/schema.sql
psql -U postgres -d futuristia -f backend/supabase/seeds.sql
```

#### Option B : Supabase (recommandé pour débutants)

1. Créez un compte gratuit sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Dans l'onglet "SQL Editor", copiez-collez le contenu de :
   - `backend/supabase/schema.sql`
   - `backend/supabase/seeds.sql`
4. Récupérez votre URL de connexion dans Settings > Database

### 3. Configuration des variables d'environnement (1 min)

#### Backend
```bash
# Créer le fichier .env dans le dossier backend
cd backend
cp .env.example .env
```

Éditez `backend/.env` et modifiez la ligne DATABASE_URL :

**PostgreSQL local :**
```env
DATABASE_URL=postgresql://postgres:votre_mot_de_passe@localhost:5432/futuristia
```

**Supabase :**
```env
DATABASE_URL=postgresql://postgres:[VOTRE-MOT-DE-PASSE]@[VOTRE-PROJECT-REF].supabase.co:5432/postgres
```

#### Frontend
Créez `.env` à la racine du projet :
```env
VITE_API_URL=http://localhost:4000/api
```

### 4. Lancement de l'application

#### Terminal 1 : Backend
```bash
cd backend
npm run dev
```

Vous devriez voir :
```
🚀 Serveur backend démarré sur http://localhost:4000
📚 Documentation API disponible sur http://localhost:4000/api-docs
```

#### Terminal 2 : Frontend
```bash
npm run dev
```

Vous devriez voir :
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 5. Accéder à l'application

Ouvrez votre navigateur sur : **http://localhost:5173**

## 🎯 Premier test

### Créer un compte
1. Cliquez sur "S'inscrire"
2. Entrez un numéro de téléphone (ex: +22513739186)
3. Créez un mot de passe
4. Confirmez le mot de passe

### Recharger votre solde
1. Connectez-vous
2. Cliquez sur "Recharger" depuis l'écran d'accueil
3. Sélectionnez un montant (minimum 2 000 FCFA)
4. Confirmez

### Acheter un produit
1. Allez dans l'onglet "Produits"
2. Choisissez un produit
3. Cliquez sur "ACHETER MAINTENANT"
4. Confirmez l'achat

## 🔍 Vérifier que tout fonctionne

### Backend
Visitez : http://localhost:4000

Vous devriez voir :
```json
{
  "success": true,
  "message": "API Futuristia backend opérationnelle.",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "products": "/api/products",
    ...
  }
}
```

### Base de données
Vérifiez que les tables existent :
```bash
psql -U postgres -d futuristia -c "\dt"
```

Vous devriez voir : `profiles`, `products`, `purchases`, `notifications`

### Documentation API
Visitez : http://localhost:4000/api-docs

Vous devriez voir l'interface Swagger avec toutes les routes API.

## 🐛 Problèmes courants

### "Error: connect ECONNREFUSED"
➡️ Le backend n'est pas démarré. Lancez `cd backend && npm run dev`

### "Error: password authentication failed"
➡️ Vérifiez vos identifiants PostgreSQL dans `backend/.env`

### "Cannot find module"
➡️ Lancez `npm install` dans le dossier concerné

### Page blanche dans le navigateur
➡️ Vérifiez que le frontend est bien démarré et accessible sur http://localhost:5173

### "Error: relation "profiles" does not exist"
➡️ Les migrations SQL n'ont pas été exécutées. Exécutez :
```bash
psql -U postgres -d futuristia -f backend/supabase/schema.sql
```

## 📱 Fonctionnalités disponibles

✅ Authentification (inscription, connexion)  
✅ Gestion du profil utilisateur  
✅ Consultation des produits  
✅ Achat de produits  
✅ Rechargement de solde  
✅ Retrait de fonds  
✅ Notifications  
✅ Historique des transactions  

## 🎨 Captures d'écran

L'application comprend :
- Écran de connexion/inscription
- Tableau de bord principal
- Catalogue de produits
- Profil utilisateur
- Gestion du solde
- Et plus encore...

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez le fichier `README.md` pour plus de détails
2. Vérifiez les logs du backend et du frontend
3. Assurez-vous que PostgreSQL est en cours d'exécution

## 🚀 Prochaines étapes

1. Explorez la documentation API : http://localhost:4000/api-docs
2. Testez toutes les fonctionnalités
3. Consultez le code source pour comprendre l'architecture
4. Personnalisez l'application selon vos besoins

---

**Bon développement ! 🎉**

