# OBVX — Own your streets

Boutique en ligne de la marque de streetwear OBVX.

| Dossier | Contenu | Technologies |
|---|---|---|
| [`obvx-street/`](obvx-street) | Site (front) | React 19, Vite, Tailwind CSS 4 |
| [`obvx-backend/`](obvx-backend) | API (back) | Spring Boot 4, Java 17, PostgreSQL, JWT |

## Lancer en local

Prérequis : Java 17+ et Node.js 20+. PostgreSQL n'est pas nécessaire en local grâce au profil `dev` (base H2 en mémoire, vidée à chaque redémarrage).

**1. API** (port 8080)

```bash
cd obvx-backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

> Sous Windows, si Tomcat refuse de démarrer (« Unable to establish loopback connection »), c'est que le chemin du dossier temporaire contient un espace. Ajouter :
> `"-Dspring-boot.run.jvmArguments=-Djdk.net.unixdomain.tmpdir=C:/Temp"`

**2. Site** (port 5173)

```bash
cd obvx-street
npm install
npm run dev
```

En local, Vite redirige `/api` vers `http://localhost:8080` : aucune configuration nécessaire.

## Mise en production

**API** — variables d'environnement :

| Variable | Rôle |
|---|---|
| `DB_URL` | URL JDBC PostgreSQL (ex. `jdbc:postgresql://hôte:5432/obvx`) |
| `DB_username` / `DB_password` | Identifiants de la base |
| `JWT_SECRET` | Clé de signature des sessions, 32 caractères minimum, secrète |
| `CORS_ORIGINS` | Adresses du site autorisées, séparées par des virgules |
| `PORT` | Port d'écoute (8080 par défaut) |

Au démarrage, l'API crée le catalogue s'il est vide et complète les produits existants (tailles, images WebP).

**Site** (Vercel) : définir `VITE_API_URL` avec l'adresse publique de l'API (voir `obvx-street/.env.example`).

## API

| Méthode | Route | Accès |
|---|---|---|
| `POST` | `/api/auth/register`, `/api/auth/login` | public |
| `GET` | `/api/auth/me` | connecté |
| `GET` | `/api/products`, `/api/products/{id}` | public |
| `POST` | `/api/orders` | connecté — prix et tailles vérifiés par le serveur |
| `GET` | `/api/orders/me` | connecté |

## Licence

Logiciel propriétaire. © 2026 OBVX. Tous droits réservés.
