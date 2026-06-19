# Strategie backend LearnIt

Objectif : remplacer progressivement les mocks par une persistance reelle sans bloquer l'iteration UI.

## Options

### Supabase

Points forts :
- authentification integree
- base PostgreSQL relationnelle
- Row Level Security utile pour apprenants, enseignants et admins
- API et SDK simples pour progression, favoris, notes et certificats

Limites :
- moins confortable qu'un CMS pour l'edition editoriale riche
- demande de bien modeliser les policies RLS des le depart

### Strapi

Points forts :
- CMS complet et auto-hebergeable
- back-office pret pour gerer contenus et medias
- modelisation simple des collections

Limites :
- auth applicative et progression apprenant moins naturelles qu'avec Supabase
- infra Node supplementaire a maintenir

### Sanity

Points forts :
- excellent pour contenu structure, edition collaborative et previews
- schema code-first flexible
- bonne experience pour contenus pedagogiques riches

Limites :
- moins adapte comme source principale pour progression, inscriptions et permissions
- cout et architecture a surveiller si tout passe par le CMS

### Payload CMS

Points forts :
- CMS TypeScript, personnalisable et proche du code
- peut couvrir contenu, medias et back-office metier
- bon candidat si l'on veut garder un controle fort sur l'admin

Limites :
- demande une mise en place backend plus lourde
- peut faire doublon avec l'admin LearnIt deja construite

### Fichiers MDX statiques

Points forts :
- excellent pour demarrer vite avec du contenu versionne dans Git
- parfait pour les lecons longues, exemples, exercices et composants pedagogiques
- aucun back-office a maintenir

Limites :
- edition non technique difficile
- pas ideal pour ressources, publication, droits, progression ou personnalisation

## Recommandation V1

La V1 devrait separer donnees applicatives et contenu pedagogique.

Recommandation :
- Supabase pour auth, utilisateurs, roles, inscriptions, progression, favoris, notes, certificats et permissions.
- MDX statique ou CMS pour contenus pedagogiques.

Approche pragmatique :
1. Garder les lecons MDX dans le repo tant que l'equipe produit peut les maintenir.
2. Migrer d'abord les donnees utilisateur et progression vers Supabase.
3. Introduire un CMS seulement quand l'edition pedagogique non technique devient prioritaire.

## Decoupage technique propose

Couche actuelle :
- les pages consomment des helpers `lib/*`
- les helpers consomment maintenant `lib/repositories/*`
- les repositories lisent encore les mocks `data/*`

Migration cible :
- remplacer l'implementation des repositories par Supabase ou CMS
- conserver les signatures consommees par les pages
- ajouter les appels serveur dans les repositories ou dans des server actions dediees

## Variables d'environnement

Les flags doivent permettre de garder un mode demo pendant la migration :
- `NEXT_PUBLIC_DEMO_MODE=true`
- `NEXT_PUBLIC_ENABLE_AUTH=false`
- `NEXT_PUBLIC_ENABLE_ADMIN=true`

Les secrets Supabase ou CMS ne doivent pas etre exposes avec le prefixe `NEXT_PUBLIC_`.
