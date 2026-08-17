# Content CMS

Sprint 7 transforme l'éditeur de parcours en CMS pédagogique léger, sans éditeur riche complexe ni média library globale.

## Format de contenu

`public.lessons.content` est la source de vérité du contenu pédagogique V1.

- Format retenu : Markdown compatible GFM.
- Rendu Learner : `react-markdown` + `remark-gfm`.
- HTML brut non activé : pas de `dangerouslySetInnerHTML`.
- Liens externes : `target="_blank"` avec `rel="noreferrer noopener"`.
- Blocs de code : rendu simple, sans coloration syntaxique dans cette V1.

## Ressources

La table `public.resources` est réutilisée.

Colonnes ajoutées par `20260817071013_content_cms_resources.sql` :

- `storage_bucket`
- `storage_path`
- `mime_type`
- `file_size`
- `metadata`

Une ressource peut être liée à :

- une formation via `course_id` ;
- un module via `module_id` ;
- une leçon via `lesson_id`.

Dans le Teacher Studio, Sprint 7 expose l'ajout de ressources depuis une leçon :

- lien externe ;
- fichier téléversé.

## Storage

Buckets :

- `resources` : privé, taille max 10 Mo, formats PDF, images, texte et ZIP.
- `course-covers` : public, taille max 5 Mo, formats JPG, PNG, WebP et GIF.

Organisation des chemins :

- ressources : `teacherId/courseId/lessonId/filename`
- couvertures : `teacherId/courseId/filename`

Les couvertures sont publiques car elles servent d'assets catalogue. Les ressources pédagogiques restent privées et sont servies côté Learner via URLs signées.

## RLS

`public.resources` :

- `anon` et `authenticated` lisent seulement les ressources `free` de formations publiées publiques ;
- un Learner authentifié lit les ressources `enrolled` uniquement s'il possède un enrollment sur la formation ;
- un Teacher lit, crée, modifie et supprime uniquement les ressources des formations dont `courses.teacher_id = auth.uid()`.

`storage.objects` :

- le bucket `resources` autorise la lecture publique seulement pour les ressources `free` rattachées à une formation publiée ;
- le bucket `resources` autorise la lecture Learner seulement pour les ressources de formations inscrites ;
- le Teacher peut lire/uploader/modifier/supprimer uniquement sous son préfixe `auth.uid()/courseId/...` et si le cours lui appartient ;
- le bucket `course-covers` autorise l'écriture Teacher sous le même principe de préfixe et ownership.

Aucune opération Learner ordinaire n'utilise `service_role`.

## Upload et suppression

Les Server Actions suivent le flux :

UI -> Server Action -> service -> repository -> Supabase DB / Storage.

Actions V1 :

- `createTeacherLessonResourceAction`
- `uploadTeacherLessonResourceAction`
- `deleteTeacherLessonResourceAction`
- `deleteTeacherLibraryResourceAction`

Pour une ressource fichier, l'upload Storage est effectué avant l'insertion DB. Si l'insertion DB échoue, le fichier téléversé est supprimé en compensation.

À la suppression, la ligne DB est supprimée puis le fichier Storage est nettoyé. Si le nettoyage Storage échoue, l'action retourne une erreur explicite indiquant qu'un nettoyage manuel doit être relancé.

## Rendu Learner

La page `/learn/[courseSlug]/[lessonSlug]` affiche :

- titre et métadonnées de leçon ;
- contenu Markdown de `lessons.content` ;
- état vide si aucun contenu n'est présent ;
- ressources liées à la leçon ou au module ;
- bouton de progression existant.

Les fichiers privés sont convertis en URL signée par le repository Supabase lors de la lecture.

## Limites

Reporté à Sprint 7.1 / Sprint 8 :

- édition riche ;
- autosave avancé ;
- versioning ;
- média library globale ;
- remplacement de fichier ;
- archivage de ressources ;
- vidéo hébergée/transcodée ;
- quiz complexes ;
- SCORM / xAPI ;
- génération IA.
