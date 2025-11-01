@echo off
REM Script de verification de la connexion Backend - Frontend (Windows)

echo.
echo ========================================
echo  VERIFICATION DE LA CONNEXION
echo  Backend - Frontend
echo ========================================
echo.

set ERRORS=0
set WARNINGS=0

REM 1. Verifier Node.js
echo 1. Verification de Node.js...
where node >nul 2>&1
if %errorlevel% equ 0 (
    node -v
    echo [OK] Node.js installe
) else (
    echo [ERREUR] Node.js n'est pas installe
    set /a ERRORS+=1
)
echo.

REM 2. Verifier PostgreSQL
echo 2. Verification de PostgreSQL...
where psql >nul 2>&1
if %errorlevel% equ 0 (
    psql --version
    echo [OK] PostgreSQL installe
) else (
    echo [ERREUR] PostgreSQL n'est pas installe
    set /a ERRORS+=1
)
echo.

REM 3. Verifier les fichiers .env
echo 3. Verification des fichiers .env...
if exist "backend\.env" (
    echo [OK] Fichier backend\.env existe
) else (
    echo [ERREUR] Fichier backend\.env n'existe pas
    echo   Conseil: Creez backend\.env a partir de backend\.env.example
    set /a ERRORS+=1
)

if exist ".env" (
    echo [OK] Fichier .env (frontend) existe
) else (
    echo [ATTENTION] Fichier .env (frontend) n'existe pas
    echo   Conseil: Creez .env avec VITE_API_URL=http://localhost:4000/api
    set /a WARNINGS+=1
)
echo.

REM 4. Verifier les dependances
echo 4. Verification des dependances...
if exist "node_modules" (
    echo [OK] Dependances frontend installees
) else (
    echo [ERREUR] Dependances frontend non installees
    echo   Conseil: Executez 'npm install'
    set /a ERRORS+=1
)

if exist "backend\node_modules" (
    echo [OK] Dependances backend installees
) else (
    echo [ERREUR] Dependances backend non installees
    echo   Conseil: Executez 'cd backend ^&^& npm install'
    set /a ERRORS+=1
)
echo.

REM 5. Verifier si les serveurs sont demarres
echo 5. Verification des serveurs...
curl -s http://localhost:4000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend accessible sur http://localhost:4000
) else (
    echo [ERREUR] Backend NON accessible
    echo   Conseil: Demarrez le backend avec 'cd backend ^&^& npm run dev'
    set /a ERRORS+=1
)

curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend accessible sur http://localhost:5173
) else (
    echo [ERREUR] Frontend NON accessible
    echo   Conseil: Demarrez le frontend avec 'npm run dev'
    set /a ERRORS+=1
)
echo.

REM 6. Verifier les fichiers backend
echo 6. Verification des fichiers backend...
set MISSING=0

if not exist "backend\config\database.js" set /a MISSING+=1
if not exist "backend\config\jwt.js" set /a MISSING+=1
if not exist "backend\middlewares\auth.js" set /a MISSING+=1
if not exist "backend\controllers\authController.js" set /a MISSING+=1
if not exist "backend\controllers\productController.js" set /a MISSING+=1

if %MISSING% equ 0 (
    echo [OK] Tous les fichiers backend presents
) else (
    echo [ERREUR] %MISSING% fichiers backend manquants
    set /a ERRORS+=1
)
echo.

REM 7. Verifier le client API frontend
echo 7. Verification du frontend...
if exist "src\services\api.ts" (
    echo [OK] Client API frontend existe
) else (
    echo [ERREUR] Client API frontend manquant
    set /a ERRORS+=1
)
echo.

REM Resume final
echo ========================================
echo  RESUME
echo ========================================
if %ERRORS% equ 0 (
    if %WARNINGS% equ 0 (
        echo.
        echo [OK] TOUT EST PARFAIT !
        echo.
        echo Votre application est completement configuree !
        echo.
        echo Pour demarrer :
        echo   1. Backend:  cd backend ^&^& npm run dev
        echo   2. Frontend: npm run dev
        echo   3. Ouvrir:   http://localhost:5173
    ) else (
        echo.
        echo [ATTENTION] %WARNINGS% avertissement(s)
        echo L'application devrait fonctionner.
    )
) else (
    echo.
    echo [ERREUR] %ERRORS% erreur(s), %WARNINGS% avertissement(s)
    echo.
    echo L'application ne fonctionnera PAS correctement.
    echo.
    echo Actions recommandees :
    echo   1. Lisez CONNEXION_REELLE.md
    echo   2. Corrigez les erreurs ci-dessus
    echo   3. Relancez ce script
)
echo.
pause

