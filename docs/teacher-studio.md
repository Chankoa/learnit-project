# Teacher Studio

Sprint 6 connecte la boucle d'authoring Teacher à Supabase.
Sprint 6.1 stabilise la terminologie UX, les domaines créés à la volée et les états de publication.

## Terminologie UX

- **Teacher Studio** : nom de la zone produit enseignant.
- **Éditeur de parcours** : interface de structure d'une formation.
- **Structure** : ensemble des modules et leçons.
- **Modifier les infos** : édition des informations générales d'une formation.
- **Éditer le parcours** : gestion des modules et leçons.

## Ownership

`public.courses.teacher_id` est la source de vérité du propriétaire.

- Le client ne transmet jamais `teacher_id`.
- Les Server Actions appellent `requireRole("teacher")`.
- Le repository applique toujours les mutations avec le `profile.id` issu de la session.
- Les policies RLS exigent à la fois `teacher_id = auth.uid()` et `current_profile_role() = 'teacher'`.

## Tables utilisées

- `domains` : domaines actifs affichés dans les formulaires.
- `courses` : formation, slug global, statut `draft | published`, visibilité et publication.
- `course_modules` : structure de modules, `display_order`, statut.
- `lessons` : leçons, `display_order`, type, statut, objectifs et contenu texte.

La migration `20260811090300_teacher_studio_authoring.sql` ajoute `lessons.content`.
La migration `20260811101524_teacher_domain_creation.sql` autorise les Teachers actifs à créer des domaines actifs.

## Création inline de domaines

Dans le formulaire de création ou d'édition d'une formation, le champ Domaine conserve son select existant et ajoute l'action **Créer un domaine**.

Le flux :

1. le Teacher saisit le nom du domaine ;
2. la Server Action vérifie la session et le rôle Teacher ;
3. le repository normalise les espaces ;
4. le slug est généré côté serveur ;
5. un domaine équivalent existant est réutilisé ;
6. sinon, un domaine `active` est créé puis sélectionné immédiatement dans le formulaire.

La déduplication repose sur le slug normalisé. Par exemple `Création web`, `creation web` et ` Création web ` ciblent le même slug `creation-web`.

Politique provisoire : un Teacher peut créer un domaine utilisable immédiatement. Une évolution possible pour Sprint 7+ serait un workflow `Teacher propose -> Admin valide`.

## RLS Teacher

Les policies ajoutées permettent à un Teacher authentifié de :

- lire ses propres formations ;
- créer une formation avec son propre `teacher_id` ;
- modifier ses propres formations ;
- supprimer uniquement ses formations en brouillon ;
- créer, modifier et réordonner les modules/leçons de ses propres formations ;
- supprimer un module uniquement s'il est vide ;
- supprimer une leçon uniquement si elle est en brouillon ;
- créer un domaine `active` depuis le Teacher Studio.

Un Learner ne peut pas créer ni modifier de formation, même en forgeant un payload.

## Workflow

1. Le Teacher crée une formation via `/app/teacher/courses/new`.
2. La formation est créée en `draft`, `visibility = private`, `availability = preview`.
3. Le Teacher édite les informations dans `/app/teacher/courses/[courseId]/edit`.
4. Le Teacher organise les modules/leçons dans `/app/teacher/courses/[courseId]/builder`.
5. La publication valide au minimum :
   - titre présent ;
   - description présente ;
   - au moins un module ;
   - au moins une leçon.
6. La publication passe la formation en `published`, `visibility = public`, `availability = complete` et publie les modules/leçons non verrouillés.

## États de publication

- `draft` : le CTA **Publier la formation** est visible si la page est en édition.
- `published` : la page affiche **Formation publiée dans le catalogue** avec les actions **Voir dans le catalogue** et **Modifier les infos**.

La dépublication n'est pas implémentée dans Sprint 6.1. Elle reste non destructive et doit être cadrée avec les apprenants déjà inscrits.

## Compatibilité Learner

Le catalogue Learner lit les mêmes tables Supabase.

Une formation publiée par Teacher devient accessible via :

- `/formations`
- `/formations/[slug]`
- `/learn/[courseSlug]`

Le Learning Engine Sprint 5 peut ensuite utiliser les tables `enrollments` et `lesson_progress` sans modèle parallèle.

## Restrictions

- La dépublication est reportée : elle doit être cadrée avec les enrollments existants.
- Les ressources restent hors périmètre authoring avancé pour Sprint 6.
- Pas d'upload Storage, media library, versioning, drag and drop ou éditeur riche.
- Les compteurs d'apprenants Teacher ne sont pas exposés tant que les RLS enrollments Teacher ne sont pas définies.

## Validation SQL

Un smoke test transactionnel a été exécuté en production pendant Sprint 6 :

- Teacher actif : insertion course/module/lesson autorisée sous RLS.
- Learner actif : insertion course refusée sous RLS.
- Données de test rollbackées, aucune ligne conservée.

Sprint 6.1 ajoute et applique en production une migration pour la création de domaines par Teacher.
