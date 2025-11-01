#!/bin/bash

# Script de vérification de la connexion Backend ↔ Frontend
# Vérifie que tout est correctement configuré et connecté

echo "🔍 VÉRIFICATION DE LA CONNEXION Backend ↔ Frontend"
echo "=================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Fonction pour afficher les résultats
check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        ((ERRORS++))
    fi
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# 1. Vérifier Node.js
echo "1️⃣  Vérification de Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    check 0 "Node.js installé: $NODE_VERSION"
else
    check 1 "Node.js n'est pas installé"
fi
echo ""

# 2. Vérifier PostgreSQL
echo "2️⃣  Vérification de PostgreSQL..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | head -n 1)
    check 0 "PostgreSQL installé: $PSQL_VERSION"
    
    # Tester la connexion
    if psql -U postgres -c "SELECT 1" &> /dev/null; then
        check 0 "Connexion à PostgreSQL réussie"
    else
        check 1 "Impossible de se connecter à PostgreSQL"
        echo "   Conseil: Vérifiez que PostgreSQL est démarré et que vous avez les bons identifiants"
    fi
else
    check 1 "PostgreSQL n'est pas installé"
fi
echo ""

# 3. Vérifier la base de données
echo "3️⃣  Vérification de la base de données..."
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw futuristia 2>/dev/null; then
    check 0 "Base de données 'futuristia' existe"
    
    # Vérifier les tables
    TABLES=$(psql -U postgres -d futuristia -c "\dt" 2>/dev/null | grep -c "profiles\|products\|purchases\|notifications")
    if [ "$TABLES" -ge 4 ]; then
        check 0 "Tables de la base de données créées ($TABLES tables)"
    else
        check 1 "Tables manquantes (trouvé $TABLES/4)"
        echo "   Conseil: Exécutez 'psql -U postgres -d futuristia -f backend/supabase/schema.sql'"
    fi
    
    # Vérifier les données de test
    PRODUCTS=$(psql -U postgres -d futuristia -c "SELECT COUNT(*) FROM products" -t 2>/dev/null | tr -d ' ')
    if [ "$PRODUCTS" -ge 1 ]; then
        check 0 "Données de test insérées ($PRODUCTS produits)"
    else
        warn "Aucune donnée de test"
        echo "   Conseil: Exécutez 'psql -U postgres -d futuristia -f backend/supabase/seeds.sql'"
    fi
else
    check 1 "Base de données 'futuristia' n'existe pas"
    echo "   Conseil: Exécutez 'psql -U postgres -c \"CREATE DATABASE futuristia;\"'"
fi
echo ""

# 4. Vérifier les fichiers .env
echo "4️⃣  Vérification des fichiers .env..."
if [ -f "backend/.env" ]; then
    check 0 "Fichier backend/.env existe"
    
    # Vérifier le contenu
    if grep -q "DATABASE_URL" backend/.env; then
        check 0 "DATABASE_URL configuré"
    else
        check 1 "DATABASE_URL manquant dans backend/.env"
    fi
    
    if grep -q "JWT_SECRET" backend/.env; then
        check 0 "JWT_SECRET configuré"
    else
        check 1 "JWT_SECRET manquant dans backend/.env"
    fi
else
    check 1 "Fichier backend/.env n'existe pas"
    echo "   Conseil: Créez backend/.env à partir de backend/.env.example"
fi

if [ -f ".env" ]; then
    check 0 "Fichier .env (frontend) existe"
    
    if grep -q "VITE_API_URL" .env; then
        check 0 "VITE_API_URL configuré"
    else
        check 1 "VITE_API_URL manquant dans .env"
    fi
else
    warn "Fichier .env (frontend) n'existe pas"
    echo "   Conseil: Créez .env avec 'VITE_API_URL=http://localhost:4000/api'"
fi
echo ""

# 5. Vérifier les dépendances
echo "5️⃣  Vérification des dépendances..."
if [ -d "node_modules" ]; then
    check 0 "Dépendances frontend installées"
else
    check 1 "Dépendances frontend non installées"
    echo "   Conseil: Exécutez 'npm install'"
fi

if [ -d "backend/node_modules" ]; then
    check 0 "Dépendances backend installées"
else
    check 1 "Dépendances backend non installées"
    echo "   Conseil: Exécutez 'cd backend && npm install'"
fi
echo ""

# 6. Vérifier si les serveurs sont démarrés
echo "6️⃣  Vérification des serveurs..."
if curl -s http://localhost:4000 > /dev/null 2>&1; then
    check 0 "Backend accessible sur http://localhost:4000"
    
    # Tester l'API produits
    if curl -s http://localhost:4000/api/products | grep -q "success" 2>/dev/null; then
        check 0 "API Backend fonctionne (/api/products)"
    else
        warn "API Backend ne répond pas correctement"
    fi
else
    check 1 "Backend NON accessible sur http://localhost:4000"
    echo "   Conseil: Démarrez le backend avec 'cd backend && npm run dev'"
fi

if curl -s http://localhost:5173 > /dev/null 2>&1; then
    check 0 "Frontend accessible sur http://localhost:5173"
else
    check 1 "Frontend NON accessible sur http://localhost:5173"
    echo "   Conseil: Démarrez le frontend avec 'npm run dev'"
fi
echo ""

# 7. Vérifier les fichiers backend critiques
echo "7️⃣  Vérification des fichiers backend..."
FILES=(
    "backend/config/database.js"
    "backend/config/jwt.js"
    "backend/middlewares/auth.js"
    "backend/controllers/authController.js"
    "backend/controllers/productController.js"
    "backend/routes/authRoutes.js"
    "backend/routes/productRoutes.js"
)

MISSING=0
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        :
    else
        ((MISSING++))
    fi
done

if [ $MISSING -eq 0 ]; then
    check 0 "Tous les fichiers backend présents (${#FILES[@]}/${#FILES[@]})"
else
    check 1 "$MISSING fichiers backend manquants"
fi
echo ""

# 8. Vérifier le client API frontend
echo "8️⃣  Vérification du frontend..."
if [ -f "src/services/api.ts" ]; then
    check 0 "Client API frontend (src/services/api.ts) existe"
else
    check 1 "Client API frontend manquant"
fi

if grep -q "import api" src/App.tsx 2>/dev/null; then
    check 0 "App.tsx utilise le client API"
else
    warn "App.tsx ne semble pas utiliser le client API"
fi
echo ""

# Résumé final
echo "=================================================="
echo "📊 RÉSUMÉ"
echo "=================================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ TOUT EST PARFAIT !${NC}"
    echo ""
    echo "Votre application est complètement configurée et connectée !"
    echo ""
    echo "Pour démarrer :"
    echo "  1. Backend:  cd backend && npm run dev"
    echo "  2. Frontend: npm run dev"
    echo "  3. Ouvrir:   http://localhost:5173"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS avertissement(s)${NC}"
    echo ""
    echo "L'application devrait fonctionner, mais vérifiez les avertissements ci-dessus."
else
    echo -e "${RED}✗ $ERRORS erreur(s), $WARNINGS avertissement(s)${NC}"
    echo ""
    echo "❌ L'application ne fonctionnera PAS correctement."
    echo ""
    echo "Actions recommandées :"
    echo "  1. Lisez CONNEXION_REELLE.md"
    echo "  2. Corrigez les erreurs ci-dessus"
    echo "  3. Relancez ce script pour vérifier"
fi
echo ""

exit $ERRORS

