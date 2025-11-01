# Documentation API - Futuristia

## URL de base
```
http://localhost:4000/api
```

## Format des réponses

Toutes les réponses suivent le format suivant :

### Succès
```json
{
  "success": true,
  "message": "Message de succès optionnel",
  "data": { /* données de la réponse */ }
}
```

### Erreur
```json
{
  "success": false,
  "message": "Message d'erreur",
  "error": "Détails de l'erreur (en développement uniquement)"
}
```

## Authentification

Les endpoints protégés nécessitent un token JWT dans l'en-tête :
```
Authorization: Bearer <votre-token>
```

---

## 🔐 Authentification

### 1. Inscription

**Endpoint :** `POST /api/auth/register`

**Accès :** Public

**Body :**
```json
{
  "phone": "+22513739186",
  "password": "votremotdepasse",
  "display_name": "Nom d'affichage (optionnel)"
}
```

**Réponse (201) :**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+22513739186",
      "display_name": "Nom d'affichage",
      "balance": 0,
      "role": "user"
    },
    "token": "jwt-token"
  }
}
```

**Erreurs :**
- 400 : Numéro de téléphone déjà utilisé
- 400 : Données manquantes

---

### 2. Connexion

**Endpoint :** `POST /api/auth/login`

**Accès :** Public

**Body :**
```json
{
  "phone": "+22513739186",
  "password": "votremotdepasse"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+22513739186",
      "display_name": "Nom d'affichage",
      "balance": 5000,
      "role": "user"
    },
    "token": "jwt-token"
  }
}
```

**Erreurs :**
- 401 : Identifiants invalides
- 400 : Données manquantes

---

### 3. Obtenir le profil

**Endpoint :** `GET /api/auth/profile`

**Accès :** Privé (authentifié)

**Headers :**
```
Authorization: Bearer <token>
```

**Réponse (200) :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "+22513739186",
    "display_name": "Nom d'affichage",
    "balance": 5000,
    "role": "user",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Erreurs :**
- 401 : Token manquant
- 403 : Token invalide
- 404 : Utilisateur non trouvé

---

## 📦 Produits

### 1. Liste des produits

**Endpoint :** `GET /api/products`

**Accès :** Public

**Réponse (200) :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "APUIC CAPITAL 001",
      "price": 2000,
      "duration": "60 jours",
      "daily_revenue": 300,
      "total_revenue": 18000,
      "image": "https://...",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Détails d'un produit

**Endpoint :** `GET /api/products/:id`

**Accès :** Public

**Paramètres :**
- `id` : ID du produit

**Réponse (200) :**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "APUIC CAPITAL 001",
    "price": 2000,
    "duration": "60 jours",
    "daily_revenue": 300,
    "total_revenue": 18000,
    "image": "https://...",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Erreurs :**
- 404 : Produit non trouvé

---

### 3. Créer un produit

**Endpoint :** `POST /api/products`

**Accès :** Privé (admin)

**Headers :**
```
Authorization: Bearer <token>
```

**Body :**
```json
{
  "name": "APUIC CAPITAL 004",
  "price": 30000,
  "duration": "60 jours",
  "daily_revenue": 5000,
  "total_revenue": 300000,
  "image": "https://..."
}
```

**Réponse (201) :**
```json
{
  "success": true,
  "message": "Produit créé avec succès",
  "data": {
    "id": 4,
    "name": "APUIC CAPITAL 004",
    ...
  }
}
```

---

## 🛒 Achats

### 1. Effectuer un achat

**Endpoint :** `POST /api/purchases`

**Accès :** Privé (authentifié)

**Headers :**
```
Authorization: Bearer <token>
```

**Body :**
```json
{
  "product_id": 1
}
```

**Réponse (201) :**
```json
{
  "success": true,
  "message": "Achat effectué avec succès",
  "data": {
    "purchase": {
      "id": 1,
      "user_id": "uuid",
      "product_id": 1,
      "price": 2000,
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "new_balance": 3000
  }
}
```

**Erreurs :**
- 400 : Solde insuffisant
- 404 : Produit non trouvé
- 404 : Profil utilisateur non trouvé

---

### 2. Historique des achats

**Endpoint :** `GET /api/purchases`

**Accès :** Privé (authentifié)

**Headers :**
```
Authorization: Bearer <token>
```

**Réponse (200) :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "uuid",
      "product_id": 1,
      "price": 2000,
      "created_at": "2024-01-01T00:00:00.000Z",
      "product_name": "APUIC CAPITAL 001",
      "product_image": "https://...",
      "duration": "60 jours",
      "daily_revenue": 300,
      "total_revenue": 18000
    }
  ]
}
```

---

## 👤 Profil

### 1. Mettre à jour le profil

**Endpoint :** `PUT /api/profile`

**Accès :** Privé (authentifié)

**Headers :**
```
Authorization: Bearer <token>
```

**Body :**
```json
{
  "display_name": "Nouveau nom",
  "phone": "+22513739187"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": {
    "id": "uuid",
    "phone": "+22513739187",
    "display_name": "Nouveau nom",
    "balance": 5000,
    "role": "user",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 2. Recharger le solde

**Endpoint :** `POST /api/profile/recharge`

**Accès :** Privé (authentifié)

**Headers :**
```
Authorization: Bearer <token>
```

**Body :**
```json
{
  "amount": 5000
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Rechargement effectué avec succès",
  "data": {
    "new_balance": 10000
  }
}
```

**Erreurs :**
- 400 : Montant invalide

---

### 3. Retirer du solde

**Endpoint :** `POST /api/profile/withdraw`

**Accès :** Privé (authentifié)

**Headers :**
```
Authorization: Bearer <token>
```

**Body :**
```json
{
  "amount": 2000
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Retrait effectué avec succès",
  "data": {
    "new_balance": 8000
  }
}
```

**Erreurs :**
- 400 : Montant invalide
- 400 : Solde insuffisant

---

## 🔔 Notifications

### 1. Liste des notifications

**Endpoint :** `GET /api/notifications`

**Accès :** Privé (authentifié)

**Headers :**
```
Authorization: Bearer <token>
```

**Réponse (200) :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "uuid",
      "title": "Achat effectué",
      "body": "Vous avez acheté APUIC CAPITAL 001 pour 2000 FCFA",
      "is_read": false,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Marquer une notification comme lue

**Endpoint :** `PUT /api/notifications/:id/read`

**Accès :** Privé (authentifié)

**Headers :**
```
Authorization: Bearer <token>
```

**Paramètres :**
- `id` : ID de la notification

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Notification marquée comme lue",
  "data": {
    "id": 1,
    "is_read": true,
    ...
  }
}
```

---

### 3. Marquer toutes les notifications comme lues

**Endpoint :** `PUT /api/notifications/read-all`

**Accès :** Privé (authentifié)

**Headers :**
```
Authorization: Bearer <token>
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Toutes les notifications ont été marquées comme lues"
}
```

---

## Codes d'erreur HTTP

| Code | Signification |
|------|---------------|
| 200  | Succès |
| 201  | Créé avec succès |
| 400  | Requête invalide |
| 401  | Non authentifié |
| 403  | Accès interdit |
| 404  | Ressource non trouvée |
| 500  | Erreur serveur |

---

## Exemples avec cURL

### Inscription
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+22513739186",
    "password": "test123",
    "display_name": "Test User"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+22513739186",
    "password": "test123"
  }'
```

### Obtenir les produits
```bash
curl -X GET http://localhost:4000/api/products
```

### Effectuer un achat (authentifié)
```bash
curl -X POST http://localhost:4000/api/purchases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <votre-token>" \
  -d '{
    "product_id": 1
  }'
```

---

## Swagger UI

Une documentation interactive est disponible sur :
```
http://localhost:4000/api-docs
```

Cette interface permet de tester directement les endpoints depuis le navigateur.

