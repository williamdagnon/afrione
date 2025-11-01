# 🚀 Installation Rapide - Futuristia

## Option 1 : Installation automatique (Recommandée)

### Sur Linux/Mac :
```bash
chmod +x setup.sh
./setup.sh
```

### Sur Windows :
```bash
setup.bat
```

Le script va automatiquement :
- ✅ Vérifier les prérequis (Node.js, PostgreSQL)
- ✅ Installer toutes les dépendances
- ✅ Créer les fichiers de configuration (.env)
- ✅ Configurer la base de données (optionnel)

---

## Option 2 : Installation manuelle

### 1. Installation des dépendances

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 2. Configuration

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Éditez `backend/.env` et modifiez :
```env
DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/futuristia
JWT_SECRET=changez-moi-en-production
```

#### Frontend (.env)
Créez `.env` à la racine :
```env
VITE_API_URL=http://localhost:4000/api
```

### 3. Base de données

#### PostgreSQL local
```bash
# Créer la base
psql -U postgres -c "CREATE DATABASE futuristia;"

# Exécuter les migrations
psql -U postgres -d futuristia -f backend/supabase/schema.sql
psql -U postgres -d futuristia -f backend/supabase/seeds.sql
```

#### Supabase (Alternative)
1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Dans SQL Editor :
   - Exécuter `backend/supabase/schema.sql`
   - Exécuter `backend/supabase/seeds.sql`
4. Récupérer l'URL dans Settings > Database
5. Mettre à jour `DATABASE_URL` dans `backend/.env`

---

## Démarrage

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Attendez de voir :
```
🚀 Serveur backend démarré sur http://localhost:4000
📚 Documentation API disponible sur http://localhost:4000/api-docs
```

### Terminal 2 - Frontend
```bash
npm run dev
```

Attendez de voir :
```
➜  Local:   http://localhost:5173/
```

---

## Accès

- **Application :** http://localhost:5173
- **API :** http://localhost:4000
- **Documentation API :** http://localhost:4000/api-docs

---

## Premier test

1. Ouvrir http://localhost:5173
2. Cliquer sur "S'inscrire"
3. Créer un compte (ex: +22513739186)
4. Explorer l'application !

---

## En cas de problème

### Backend ne démarre pas
```bash
# Vérifier PostgreSQL
psql -U postgres -c "SELECT version();"

# Vérifier les dépendances
cd backend
npm install
```

### Frontend ne démarre pas
```bash
# Vérifier les dépendances
npm install

# Vérifier le fichier .env
cat .env
```

### Erreur de connexion à la base de données
- Vérifier que PostgreSQL est démarré
- Vérifier `DATABASE_URL` dans `backend/.env`
- Vérifier que la base `futuristia` existe

---

## Documentation complète

- **README.md** - Documentation technique complète
- **GUIDE_DEMARRAGE.md** - Guide détaillé étape par étape
- **backend/API_DOCUMENTATION.md** - Documentation de l'API
- **IMPLEMENTATION_COMPLETE.md** - Récapitulatif de l'implémentation

---

## Support

Pour toute question :
1. Consulter la documentation
2. Vérifier les logs (backend et frontend)
3. Chercher dans les fichiers de documentation

---

**Temps estimé d'installation : 5-10 minutes**

🎉 **Bon développement avec Futuristia !**

