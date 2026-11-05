# Mettre OBVX en ligne

Trois services, dans cet ordre :

| Quoi | Où | Coût indicatif |
|---|---|---|
| Base de données PostgreSQL | [Neon](https://neon.tech) | offre gratuite |
| API (`obvx-backend`) | [Render](https://render.com) | offre *Starter* (quelques $/mois) |
| Site (`obvx-street`) | [Vercel](https://vercel.com) | offre gratuite |

> Pourquoi pas l'offre gratuite de Render pour l'API ? Le serveur s'y endort après quelques minutes sans visite et met près d'une minute à se réveiller : le premier client attend devant une page vide. Vérifie les tarifs actuels sur les sites de chaque service.

Compte environ 30 minutes. Tout se fait dans le navigateur, sans ligne de commande.

---

## 1. Base de données — Neon

1. Crée un compte sur neon.tech (connexion GitHub possible).
2. **Create project** : nom `obvx`, version PostgreSQL la plus récente, région **AWS Europe Central 1 (Frankfurt)**.
3. Sur le tableau de bord, clique **Connect**. Dans la liste des formats, choisis **Java** (ou *JDBC*).
4. Note trois informations :
   - l'URL, de la forme `jdbc:postgresql://ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`
   - l'utilisateur (ex. `neondb_owner`)
   - le mot de passe

> Si Neon n'affiche que le format `postgresql://utilisateur:motdepasse@hôte/base?sslmode=require`, transforme-le : `jdbc:postgresql://hôte/base?sslmode=require`, et garde utilisateur et mot de passe à part.

Les tables et le catalogue sont créés automatiquement au premier démarrage de l'API.

---

## 2. API — Render

1. Crée un compte sur render.com et connecte ton GitHub.
2. **New → Blueprint**, choisis le dépôt **YvanOssey/obvx**. Render lit `render.yaml` et propose le service **obvx-api**.
3. Remplis les variables demandées :

| Variable | Valeur |
|---|---|
| `DB_URL` | l'URL `jdbc:postgresql://…?sslmode=require` de Neon |
| `DB_username` | l'utilisateur Neon |
| `DB_password` | le mot de passe Neon |
| `CORS_ORIGINS` | l'adresse du site, pour l'instant `https://obvx-street.vercel.app` (on la corrigera à l'étape 4 si besoin) |

   `JWT_SECRET` est généré automatiquement par Render : ne le partage jamais.

4. **Apply**. La première compilation prend 5 à 10 minutes.
5. Quand le service est **Live**, note son adresse (ex. `https://obvx-api.onrender.com`) et vérifie :
   - `https://obvx-api.onrender.com/actuator/health` affiche `{"status":"UP"}`
   - `https://obvx-api.onrender.com/api/products` affiche la liste des produits

Chaque push sur `main` redéploie l'API automatiquement.

---

## 3. Site — Vercel

Le projet Vercel actuel (`obvx-street.vercel.app`) est probablement relié à l'ancien dépôt `ChristAmien/obvx-street`. Deux options :

- **Nouveau projet (le plus simple)** : **Add New → Project**, importe **YvanOssey/obvx**.
- **Projet existant** : *Settings → Git* → déconnecte l'ancien dépôt et connecte **YvanOssey/obvx**.

Dans les deux cas, dans les réglages du projet :

1. **Root Directory** : `obvx-street`
2. **Framework Preset** : Vite (détecté automatiquement)
3. **Environment Variables** : `VITE_API_URL` = l'adresse de l'API Render, **sans** `/` final (ex. `https://obvx-api.onrender.com`)
4. **Deploy**.

> `VITE_API_URL` est intégrée au moment de la compilation : si tu la modifies plus tard, relance un déploiement (*Deployments → … → Redeploy*).

---

## 4. Relier les deux

Note l'adresse finale du site (ex. `https://obvx.vercel.app`, ou ton nom de domaine).

Sur Render → **obvx-api → Environment** → `CORS_ORIGINS` : mets cette adresse exacte (sans `/` final). Plusieurs adresses possibles, séparées par des virgules :

```
https://obvx.vercel.app,https://www.obvx.com
```

Enregistre : Render redémarre l'API.

---

## 5. Vérifier

Sur le site en ligne :

- [ ] L'accueil affiche les produits
- [ ] Un lien direct vers un produit (ex. `/shop/obvx-tee-echo`) s'ouvre sans erreur 404, même après rafraîchissement
- [ ] Création de compte, déconnexion, reconnexion
- [ ] Ajout au panier avec une taille, commande validée
- [ ] La commande apparaît dans *Mon compte*

Si les produits ne s'affichent pas : ouvre la console du navigateur (F12). Une erreur **CORS** signifie que `CORS_ORIGINS` sur Render ne correspond pas exactement à l'adresse du site.

---

## Espace admin

Le compte administrateur est séparé des comptes clients : il ne s'inscrit pas sur le site, il est créé par l'API.

1. Sur Render → **obvx-api → Environment**, ajoute :

   | Variable | Valeur |
   |---|---|
   | `ADMIN_EMAIL` | l'email qui servira **uniquement** à l'admin (pas celui de tes achats) |
   | `ADMIN_PASSWORD` | un mot de passe solide, **12 caractères minimum** |

   Supprime `ADMIN_EMAILS` s'il existe (ancienne version). **Save Changes** : l'API redémarre et crée le compte.
2. Connecte-toi sur **`https://<ton-site>/admin/login`**.

**Mot de passe oublié ou à changer** : modifie `ADMIN_PASSWORD` sur Render et enregistre. Au redémarrage, le nouveau mot de passe remplace l'ancien.

> Si un compte client existait déjà avec cet email, il devient le compte admin : son mot de passe est remplacé par `ADMIN_PASSWORD`, et il ne peut plus se connecter côté client ni commander. Les logs Render indiquent « Compte administrateur créé » ou « Mot de passe administrateur mis à jour ».

### Photos produits (optionnel)

Sans configuration, l'admin accepte l'adresse d'une image (ex. `/products/casquette.webp` ou un lien `https://…`). Pour envoyer des photos directement depuis l'admin :

1. Crée un compte gratuit sur [cloudinary.com](https://cloudinary.com).
2. Sur le tableau de bord Cloudinary, copie l'**API environment variable** (`cloudinary://clé:secret@nom`).
3. Sur Render, ajoute `CLOUDINARY_URL` avec cette valeur (sans le préfixe `CLOUDINARY_URL=`).

Les photos sont livrées automatiquement en format optimisé (WebP/AVIF, 1200 px maximum).

---

## Nom de domaine (optionnel)

- Site : Vercel → *Settings → Domains* → ajoute `obvx.com` et `www.obvx.com`, puis suis les instructions DNS.
- API : Render → *Settings → Custom Domains* → par exemple `api.obvx.com`.
- Mets ensuite à jour `VITE_API_URL` (Vercel, puis *Redeploy*) et `CORS_ORIGINS` (Render).
