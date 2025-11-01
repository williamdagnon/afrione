#!/bin/bash

# Script de configuration automatique pour Futuristia
# Ce script configure automatiquement l'environnement de développement

echo "🚀 Configuration de Futuristia"
echo "=============================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Vérifier Node.js
echo "1️⃣  Vérification de Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    success "Node.js installé : $NODE_VERSION"
else
    error "Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org"
    exit 1
fi

# 2. Vérifier PostgreSQL
echo ""
echo "2️⃣  Vérification de PostgreSQL..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    success "PostgreSQL installé : $PSQL_VERSION"
else
    warning "PostgreSQL n'est pas installé ou pas dans le PATH"
    echo "   Vous pouvez utiliser Supabase comme alternative"
fi

# 3. Installation des dépendances
echo ""
echo "3️⃣  Installation des dépendances..."

echo "   📦 Installation des dépendances frontend..."
if npm install; then
    success "Dépendances frontend installées"
else
    error "Échec de l'installation des dépendances frontend"
    exit 1
fi

echo ""
echo "   📦 Installation des dépendances backend..."
cd backend
if npm install; then
    success "Dépendances backend installées"
else
    error "Échec de l'installation des dépendances backend"
    exit 1
fi
cd ..

# 4. Configuration des variables d'environnement
echo ""
echo "4️⃣  Configuration des variables d'environnement..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "   Création du fichier backend/.env..."
    cat > backend/.env << 'EOF'
# Configuration de la base de données PostgreSQL/Supabase
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/futuristia

# Configuration JWT
JWT_SECRET=futuristia-secret-jwt-2024-super-securise-changez-moi-en-production
JWT_EXPIRES_IN=7d

# Port du serveur
PORT=4000

# Environnement
NODE_ENV=development
EOF
    success "Fichier backend/.env créé"
    warning "⚠️  IMPORTANT : Modifiez backend/.env avec vos identifiants PostgreSQL !"
else
    warning "Le fichier backend/.env existe déjà, non modifié"
fi

# Frontend .env (si nécessaire)
if [ ! -f ".env" ]; then
    echo "   Création du fichier .env..."
    cat > .env << 'EOF'
# URL de l'API backend
VITE_API_URL=http://localhost:4000/api
EOF
    success "Fichier .env créé"
else
    warning "Le fichier .env existe déjà, non modifié"
fi

# 5. Configuration de la base de données
echo ""
echo "5️⃣  Configuration de la base de données..."
echo ""
echo "   Options disponibles :"
echo "   1) PostgreSQL local"
echo "   2) Supabase"
echo "   3) Passer cette étape"
echo ""
read -p "   Votre choix (1/2/3) : " db_choice

case $db_choice in
    1)
        echo ""
        read -p "   Nom d'utilisateur PostgreSQL (défaut: postgres) : " pg_user
        pg_user=${pg_user:-postgres}
        
        echo "   Création de la base de données..."
        if psql -U $pg_user -c "CREATE DATABASE futuristia;" 2>/dev/null; then
            success "Base de données 'futuristia' créée"
        else
            warning "La base de données existe déjà ou erreur de création"
        fi
        
        echo "   Exécution des migrations..."
        if psql -U $pg_user -d futuristia -f backend/supabase/schema.sql; then
            success "Schéma créé"
        else
            error "Erreur lors de la création du schéma"
        fi
        
        echo "   Insertion des données de test..."
        if psql -U $pg_user -d futuristia -f backend/supabase/seeds.sql; then
            success "Données de test insérées"
        else
            error "Erreur lors de l'insertion des données"
        fi
        ;;
    2)
        echo ""
        success "Supabase sélectionné"
        echo "   Veuillez :"
        echo "   1. Créer un projet sur https://supabase.com"
        echo "   2. Dans SQL Editor, exécuter backend/supabase/schema.sql"
        echo "   3. Puis exécuter backend/supabase/seeds.sql"
        echo "   4. Récupérer l'URL de connexion dans Settings > Database"
        echo "   5. Mettre à jour DATABASE_URL dans backend/.env"
        ;;
    3)
        warning "Configuration de la base de données ignorée"
        echo "   Vous devrez la configurer manuellement plus tard"
        ;;
    *)
        warning "Choix invalide, configuration de la base de données ignorée"
        ;;
esac

# 6. Résumé
echo ""
echo "=============================="
echo "✅ Configuration terminée !"
echo "=============================="
echo ""
echo "📋 Prochaines étapes :"
echo ""
echo "1. Vérifiez/modifiez les fichiers de configuration :"
echo "   - backend/.env (DATABASE_URL, JWT_SECRET)"
echo "   - .env (VITE_API_URL)"
echo ""
echo "2. Démarrer le backend :"
echo "   cd backend && npm run dev"
echo ""
echo "3. Démarrer le frontend (dans un nouveau terminal) :"
echo "   npm run dev"
echo ""
echo "4. Accéder à l'application :"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:4000"
echo "   API Docs: http://localhost:4000/api-docs"
echo ""
echo "📚 Documentation :"
echo "   - README.md - Documentation complète"
echo "   - GUIDE_DEMARRAGE.md - Guide de démarrage rapide"
echo "   - backend/API_DOCUMENTATION.md - Documentation API"
echo "   - IMPLEMENTATION_COMPLETE.md - Récapitulatif"
echo ""
echo "🎉 Bon développement !"
echo ""

