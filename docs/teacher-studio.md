# Teacher Studio

Sprint 6 connecte la boucle d'authoring Teacher a Supabase.

## Ownership

`public.courses.teacher_id` est la source de verite du proprietaire.

- Le client ne transmet jamais `teacher_id`.
- Les Server Actions appellent `requireRole("teacher")`.
- Le repository applique toujours les mutations avec le `profile.id` issu de la session.
- Les policies RLS exigent a la fois `teacher_id = auth.uid()` et `current_profile_role() = 'teacher'`.

## Tables utilisees

- `domains` : domaines actifs affiches dans les formulaires.
- `courses` : formation, slug global, statut `draft | published`, visibilite et publication.
- `course_modules` : structure de modules, `display_order`, statut.
- `lessons` : lecons, `display_order`, type, statut, objectifs et contenu texte.

La migration `20260811090300_teacher_studio_authoring.sql` ajoute `lessons.content`.

## RLS Teacher

Les policies ajoutees permettent a un Teacher authentifie de :

- lire ses propres formations ;
- creer une formation avec son propre `teacher_id` ;
- modifier ses propres formations ;
- supprimer uniquement ses formations en brouillon ;
- creer, modifier et reordonner les modules/lecons de ses propres formations ;
- supprimer un module uniquement s'il est vide ;
- supprimer une lecon uniquement si elle est en brouillon.

Un Learner ne peut pas creer ni modifier de formation, meme en forgant un payload.

## Workflow

1. Le Teacher cree une formation via `/app/teacher/courses/new`.
2. La formation est creee en `draft`, `visibility = private`, `availability = preview`.
3. Le Teacher edite les informations dans `/app/teacher/courses/[courseId]/edit`.
4. Le Teacher organise les modules/lecons dans `/app/teacher/courses/[courseId]/builder`.
5. La publication valide au minimum :
   - titre present ;
   - description presente ;
   - au moins un module ;
   - au moins une lecon.
6. La publication passe la formation en `published`, `visibility = public`, `availability = complete` et publie les modules/lecons non verrouilles.

## Compatibilite Learner

Le catalogue Learner lit les memes tables Supabase.

Une formation publiee par Teacher devient accessible via :

- `/formations`
- `/formations/[slug]`
- `/learn/[courseSlug]`

Le Learning Engine Sprint 5 peut ensuite utiliser les tables `enrollments` et `lesson_progress` sans modele parallele.

## Restrictions

- La depublication est reportee : elle doit etre cadree avec les enrollments existants.
- Les ressources restent hors perimetre authoring avance pour Sprint 6.
- Pas d'upload Storage, media library, versioning, drag and drop ou editeur riche.
- Les compteurs d'apprenants Teacher ne sont pas exposes tant que les RLS enrollments Teacher ne sont pas definies.

## Validation SQL

Un smoke test transactionnel a ete execute en production :

- Teacher actif : insertion course/module/lesson autorisee sous RLS.
- Learner actif : insertion course refusee sous RLS.
- Donnees de test rollbackees, aucune ligne conservee.
