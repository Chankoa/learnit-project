# Modèle futur admin LearnIt

Ce document décrit la cible fonctionnelle du futur back-office LearnIt. Le projet utilise encore des fichiers statiques dans `data/`, mais l'accès applicatif doit passer par `lib/data-source.ts` puis par les helpers métier dans `lib/`.

## Principes

- Les pages et composants ne lisent jamais directement `data/`.
- `lib/data-source.ts` centralise les lectures actuelles : formations, modules, leçons et ressources.
- Les helpers métier (`lib/courses.ts`, `lib/learning.ts`, `lib/progress.ts`) restent l'API interne de l'application.
- Le futur CMS ou la future base remplacera la source statique sans changer les composants.

## Cycle de publication

Chaque formation possède deux notions distinctes :

- `status` : statut admin du contenu.
- `visibility` : règle d'accès public.
- `availability` : état affiché dans le catalogue.

### `status`

- `draft` : contenu en préparation, non publiable publiquement.
- `published` : contenu validé par un admin ou enseignant.
- `archived` : contenu retiré du catalogue et conservé pour historique.

### `visibility`

- `public` : visible dans le catalogue.
- `unlisted` : accessible par lien direct, absent du catalogue.
- `private` : réservé aux admins, enseignants ou cohortes autorisées.

### `availability`

- `complete` : fiche formation complète et page publique dédiée.
- `preview` : curriculum ou extrait consultable sans page commerciale complète.
- `coming-soon` : programme annoncé, leçons verrouillées ou prévisionnelles.

## Création d'une formation

Un admin ou enseignant devra pouvoir renseigner :

- titre, slug, sous-titre et description.
- domaine, niveau, format, durée estimée et tags.
- statut admin, visibilité, disponibilité catalogue.
- audience cible, objectifs, prérequis et méthode pédagogique.
- instructeurs, FAQ, ressources principales et image de couverture.
- auteur initial via `createdBy` et date de dernière mise à jour via `updatedAt`.

Règle cible : une formation ne peut passer en `published` que si son slug est unique, son domaine existe et ses modules sont ordonnés.

## Création des modules

Un module appartient à une formation et devra contenir :

- titre, slug, description et ordre.
- durée estimée.
- statut pédagogique : disponible, aperçu, verrouillé, en cours ou terminé selon le contexte apprenant.
- liste de leçons associées.
- ressources optionnelles du module.

Règle cible : l'ordre des modules doit être stable, sans doublon dans une même formation.

## Création des leçons

Une leçon appartient à un module et devra contenir :

- titre, slug, description et ordre.
- type : vidéo, lecture, exercice, quiz ou projet.
- durée estimée.
- objectifs pédagogiques.
- statut de consultation : disponible, verrouillée ou preview.
- chemin de contenu MDX ou contenu stocké dans le CMS.
- ressources et exercice associés.

Règle cible : le slug d'une leçon doit être unique dans sa formation, pour conserver des routes stables comme `/learn/[courseSlug]/[lessonSlug]`.

## Création des ressources

Une ressource pourra être liée à une formation, un module ou une leçon :

- titre, type, URL ou fichier.
- description, nom de fichier et durée optionnelle.
- niveau d'accès : gratuit, inscrit ou premium.
- tags pour recherche transversale.

Règle cible : les ressources doivent être réutilisables entre plusieurs formations sans duplication de fichier.

## Création des exercices

Les exercices pourront être intégrés dans une leçon ou gérés comme objets séparés :

- titre et consigne.
- étapes attendues.
- livrable demandé.
- critères de validation.
- ressources de support.

Règle cible : un exercice doit pouvoir évoluer vers une soumission apprenant plus tard, sans changer le contenu pédagogique de base.

## Migration CMS prévue

La migration devra remplacer uniquement l'implémentation de `lib/data-source.ts` :

1. conserver les types `Course`, `CourseModule`, `Lesson` et `Resource`.
2. créer un adaptateur CMS ou base de données qui expose `getCourses`, `getCourse`, `getModules`, `getLessons` et `getResources`.
3. normaliser les contenus externes vers les types internes.
4. garder les helpers métier existants pour les pages publiques, le dashboard et le parcours apprenant.

Cette séparation permet de développer le back-office sans réécrire les composants de catalogue, de formation ou de leçon.
