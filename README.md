# Les Palmes Aquadémiques

Site du club de plongée sous-marine et de nage en eau vive **Les Palmes Aquadémiques** (Toulouse).

- `site/` : le site public, en [Astro](https://astro.build), généré en pages statiques et hébergé sur Vercel
- `studio/` : l’interface d’édition [Sanity](https://www.sanity.io), hébergée gratuitement par Sanity

Le contenu (sorties, articles, pages, photos) vit dans Sanity. À chaque publication, Sanity prévient Vercel, qui reconstruit le site en une à deux minutes. Le site est aussi reconstruit chaque nuit pour que les sorties terminées passent d’elles-mêmes dans « Nos sorties passées ».

Coût : 0 €. Le plan gratuit de Sanity couvre 20 éditeurs, 10 000 documents et 100 Go de photos, et le site reste sur le plan gratuit de Vercel.

## Guide pour les éditeurs

L’interface d’édition est à l’adresse **lespalmesaquademiques.fr/admin**. On s’y connecte avec son compte Google ou son adresse e-mail, après avoir été invité.

| Je veux…                        | Où aller                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Annoncer une sortie             | **Sorties** › bouton ➕ › remplir le lieu, les dates et le statut, puis cliquer sur « Generate » pour l’adresse |
| Ouvrir les inscriptions         | Dans la sortie, coller l’adresse de la billetterie HelloAsso et passer le statut à « Inscriptions ouvertes »    |
| Écrire un article               | **Blog** › bouton ➕                                                                                            |
| Changer un texte de l’accueil   | **Pages** › **Accueil** (onglets « Grande photo », « Présentation du club », « Fin de page »)                   |
| Ajouter des photos à la galerie | **Pages** › **Page Galerie** : glisser-déposer plusieurs photos d’un coup                                       |
| Mettre à jour l’adhésion        | **Pages** › **Page Contact** › onglet « Adhésion » : coller le lien HelloAsso de la nouvelle saison             |

Quelques repères :

- **Rien n’est visible tant qu’on n’a pas cliqué sur « Publier »** (en bas à droite). On peut donc préparer un article tranquillement.
- **Le point d’intérêt des photos** : après avoir ajouté une photo, son outil de recadrage permet de placer le point qui doit toujours rester visible. Sur téléphone, la photo est recadrée autour de ce point.
- **Insérer un formulaire HelloAsso dans un article** : dans le texte, bouton ➕ › « Formulaire HelloAsso ».
- **Une mosaïque de photos** : dans le texte, bouton ➕ › « Mosaïque de photos ».
- **Revenir en arrière** : chaque document garde l’historique de ses versions, on peut en restaurer une ancienne.

Une sortie passe toute seule dans les sorties passées le lendemain de sa date de fin. Son formulaire d’inscription disparaît en même temps, et aussi quand on la passe en « Complet » ou « Annulée ».

## Mise en route (une seule fois)

### 1. Créer le projet Sanity

1. Se connecter sur [sanity.io/manage](https://www.sanity.io/manage) et créer un projet (plan gratuit) avec un jeu de données `production` **public**.
2. Noter l’identifiant du projet (« Project ID »), puis le renseigner dans les deux fichiers d’environnement :

   ```bash
   cp studio/.env.example studio/.env   # SANITY_STUDIO_PROJECT_ID=…
   cp site/.env.example site/.env       # SANITY_PROJECT_ID=…
   ```

3. Autoriser le studio local à parler à Sanity :

   ```bash
   cd studio
   pnpm exec sanity login
   pnpm exec sanity cors add http://localhost:3333 --credentials
   ```

### 2. Importer le contenu existant

Le contenu de `../palmes_test/src/content` (repris de Notion en août 2026) est converti puis importé avec toutes ses photos :

```bash
cd studio
pnpm migrate:palmes-test
pnpm exec sanity datasets import ../migration-output/palmes.ndjson --dataset production
```

Pour repartir du contenu Notion le plus récent, relancer d’abord `pnpm migrate:notion` dans `palmes_test`.

### 3. Mettre en ligne le studio

```bash
pnpm --filter studio deploy
```

Le studio est alors disponible sur `https://palmes-aquademiques.sanity.studio`, et `/admin` sur le site y redirige. Si ce nom est déjà pris, en choisir un autre dans `studio/sanity.cli.ts` et mettre à jour la redirection `/admin` dans `site/vercel.json`.

### 4. Brancher Vercel

1. Dans le projet Vercel, régler **Root Directory** sur `site` et ajouter les variables `SANITY_PROJECT_ID` et `SANITY_DATASET=production`.
2. Dans **Settings › Git › Deploy Hooks**, créer un hook et copier son adresse.
3. Dans Sanity (**API › Webhooks**), créer un webhook vers cette adresse, méthode `POST`, déclenché à la création, la modification et la suppression, avec le filtre :

   ```groq
   _type in ["trip", "post", "homePage", "tripsPage", "activitiesPage", "galleryPage", "contactPage"]
   ```

4. Dans le dépôt GitHub, ajouter le secret `VERCEL_DEPLOY_HOOK` avec cette même adresse : il sert à la reconstruction de chaque nuit.

### 5. Inviter les éditeurs

Dans [sanity.io/manage](https://www.sanity.io/manage) › **Members** › **Invite**. Sur le plan gratuit, les éditeurs ont le rôle « Administrator ».

## Développement

```bash
pnpm install
pnpm dev       # site sur http://localhost:4321
pnpm studio    # studio sur http://localhost:3333
pnpm build     # build de production du site
pnpm test      # vérification des types du site, du schéma et des types du studio
```

Node ≥ 22.23 et pnpm.

| Dossier                              | Contenu                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `studio/schemas`                     | Les types de contenu (sorties, articles, pages) et leurs libellés en français |
| `studio/migrations`                  | La reprise du contenu de `palmes_test`                                        |
| `site/src/lib/queries.ts`            | Les requêtes GROQ et les types de données du site                             |
| `site/src/components/home`           | Les sections de l’accueil                                                     |
| `site/src/scripts/homeAnimations.ts` | La chorégraphie du défilement de l’accueil (GSAP)                             |
| `site/src/pages/og`                  | Les images de partage générées pour chaque page                               |
