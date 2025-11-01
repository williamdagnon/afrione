@echo off
REM Script de configuration automatique pour Futuristia (Windows)
REM Ce script configure automatiquement l'environnement de développement

echo.
echo ========================================
echo    Configuration de Futuristia
echo ========================================
echo.

REM 1. Vérifier Node.js
echo 1. Verification de Node.js...
where node >nul 2>&1
if %errorlevel% equ 0 (
    node -v
    echo [OK] Node.js est installe
) else (
    echo [ERREUR] Node.js n'est pas installe
    echo Veuillez l'installer depuis https://nodejs.org
    pause
    exit /b 1
)

REM 2. Vérifier PostgreSQL
echo.
echo 2. Verification de PostgreSQL...
where psql >nul 2>&1
if %errorlevel% equ 0 (
    psql --version
    echo [OK] PostgreSQL est installe
) else (
    echo [ATTENTION] PostgreSQL n'est pas installe ou pas dans le PATH
    echo Vous pouvez utiliser Supabase comme alternative
)

REM 3. Installation des dépendances
echo.
echo 3. Installation des dependances...
echo.
echo Installation des dependances frontend...
call npm install
if %errorlevel% neq 0 (
    echo [ERREUR] Echec de l'installation frontend
    pause
    exit /b 1
)
echo [OK] Dependances frontend installees

echo.
echo Installation des dependances backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERREUR] Echec de l'installation backend
    pause
    exit /b 1
)
echo [OK] Dependances backend installees
cd ..

REM 4. Configuration des variables d'environnement
echo.
echo 4. Configuration des variables d'environnement...

REM Backend .env
if not exist "backend\.env" (
    echo Création du fichier backend\.env...
    (
        echo # Configuration de la base de donnees PostgreSQL/Supabase
        echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/futuristia
        echo.
        echo # Configuration JWT
        echo JWT_SECRET=futuristia-secret-jwt-2024-super-securise-changez-moi-en-production
        echo JWT_EXPIRES_IN=7d
        echo.
        echo # Port du serveur
        echo PORT=4000
        echo.
        echo # Environnement
        echo NODE_ENV=development
    ) > backend\.env
    echo [OK] Fichier backend\.env cree
    echo [ATTENTION] Modifiez backend\.env avec vos identifiants PostgreSQL !
) else (
    echo [ATTENTION] Le fichier backend\.env existe deja
)

REM Frontend .env
if not exist ".env" (
    echo Creation du fichier .env...
    (
        echo # URL de l'API backend
        echo VITE_API_URL=http://localhost:4000/api
    ) > .env
    echo [OK] Fichier .env cree
) else (
    echo [ATTENTION] Le fichier .env existe deja
)

REM 5. Configuration de la base de données
echo.
echo 5. Configuration de la base de donnees...
echo.
echo Options disponibles :
echo 1^) PostgreSQL local
echo 2^) Supabase
echo 3^) Passer cette etape
echo.
set /p db_choice="Votre choix (1/2/3) : "

if "%db_choice%"=="1" (
    echo.
    set /p pg_user="Nom d'utilisateur PostgreSQL (defaut: postgres) : "
    if "%pg_user%"=="" set pg_user=postgres
    
    echo Creation de la base de donnees...
    psql -U %pg_user% -c "CREATE DATABASE futuristia;" 2>nul
    if %errorlevel% equ 0 (
        echo [OK] Base de donnees 'futuristia' creee
    ) else (
        echo [ATTENTION] La base de donnees existe deja ou erreur
    )
    
    echo Execution des migrations...
    psql -U %pg_user% -d futuristia -f backend\supabase\schema.sql
    if %errorlevel% equ 0 (
        echo [OK] Schema cree
    ) else (
        echo [ERREUR] Erreur lors de la creation du schema
    )
    
    echo Insertion des donnees de test...
    psql -U %pg_user% -d futuristia -f backend\supabase\seeds.sql
    if %errorlevel% equ 0 (
        echo [OK] Donnees de test inserees
    ) else (
        echo [ERREUR] Erreur lors de l'insertion des donnees
    )
) else if "%db_choice%"=="2" (
    echo.
    echo [OK] Supabase selectionne
    echo Veuillez :
    echo 1. Creer un projet sur https://supabase.com
    echo 2. Dans SQL Editor, executer backend\supabase\schema.sql
    echo 3. Puis executer backend\supabase\seeds.sql
    echo 4. Recuperer l'URL de connexion dans Settings ^> Database
    echo 5. Mettre a jour DATABASE_URL dans backend\.env
) else (
    echo [ATTENTION] Configuration de la base de donnees ignoree
)

REM 6. Résumé
echo.
echo ========================================
echo    Configuration terminee !
echo ========================================
echo.
echo Prochaines etapes :
echo.
echo 1. Verifiez/modifiez les fichiers de configuration :
echo    - backend\.env (DATABASE_URL, JWT_SECRET)
echo    - .env (VITE_API_URL)
echo.
echo 2. Demarrer le backend :
echo    cd backend
echo    npm run dev
echo.
echo 3. Demarrer le frontend (dans un nouveau terminal) :
echo    npm run dev
echo.
echo 4. Acceder a l'application :
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:4000
echo    API Docs: http://localhost:4000/api-docs
echo.
echo Documentation :
echo    - README.md - Documentation complete
echo    - GUIDE_DEMARRAGE.md - Guide de demarrage rapide
echo    - backend\API_DOCUMENTATION.md - Documentation API
echo    - IMPLEMENTATION_COMPLETE.md - Recapitulatif
echo.
echo Bon developpement !
echo.
pause

