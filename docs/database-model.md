# Modele de donnees LearnIt

Ce document decrit le modele conceptuel cible pour migrer LearnIt vers une vraie base de donnees. Les noms sont volontairement proches des mocks actuels pour limiter le cout de migration.

## users

Compte applicatif unique, quel que soit le role.

Champs principaux :
- `id`
- `name`
- `email`
- `role` : `visitor`, `learner`, `teacher`, `admin`
- `status` : `active`, `pending`, `disabled`
- `avatar_url`
- `created_at`
- `last_active_at`

Relations :
- un utilisateur peut avoir un profil apprenant
- un utilisateur peut avoir un profil enseignant
- un utilisateur admin peut superviser la plateforme

## domains

Familles de formation visibles dans le catalogue.

Champs principaux :
- `id`
- `slug`
- `name`
- `description`
- `icon`
- `status`
- `order`
- `created_at`
- `updated_at`

Relations :
- un domaine contient plusieurs formations

## courses

Formation publiee ou en preparation.

Champs principaux :
- `id`
- `slug`
- `title`
- `subtitle`
- `description`
- `domain_id`
- `level`
- `status` : `draft`, `published`, `archived`
- `visibility` : `public`, `private`, `unlisted`
- `availability` : `complete`, `preview`, `coming-soon`
- `cover_image`
- `duration_minutes`
- `format`
- `created_by`
- `published_at`
- `updated_at`

Relations :
- une formation appartient a un domaine
- une formation contient plusieurs modules
- une formation peut avoir plusieurs ressources
- une formation peut avoir plusieurs enseignants via `teacher_courses`
- une formation a plusieurs inscriptions via `enrollments`

## modules

Section ordonnee d'une formation.

Champs principaux :
- `id`
- `course_id`
- `slug`
- `title`
- `description`
- `duration_minutes`
- `order`
- `status`
- `created_at`
- `updated_at`

Relations :
- un module appartient a une formation
- un module contient plusieurs lecons
- un module peut avoir plusieurs ressources

## lessons

Contenu pedagogique consultable par l'apprenant.

Champs principaux :
- `id`
- `module_id`
- `slug`
- `title`
- `description`
- `type` : `video`, `reading`, `exercise`, `quiz`, `project`
- `status`
- `duration_minutes`
- `content_path`
- `video_url`
- `objectives`
- `order`
- `created_at`
- `updated_at`

Relations :
- une lecon appartient a un module
- une lecon peut avoir plusieurs ressources
- une lecon peut avoir des lignes de progression par apprenant

## resources

Support lie au catalogue, a une formation, un module ou une lecon.

Champs principaux :
- `id`
- `title`
- `type`
- `href`
- `description`
- `file_name`
- `access`
- `course_id`
- `module_id`
- `lesson_id`
- `created_by`
- `created_at`
- `updated_at`

Relations :
- une ressource peut etre liee a une formation, un module ou une lecon
- une ressource peut etre marquee favorite par un apprenant

## enrollments

Inscription d'un apprenant a une formation.

Champs principaux :
- `id`
- `user_id`
- `course_id`
- `status` : `in-progress`, `completed`, `not-started`
- `current_lesson_id`
- `learning_time_minutes`
- `started_at`
- `completed_at`
- `last_accessed_at`

Relations :
- une inscription relie un utilisateur apprenant et une formation
- une inscription alimente la progression globale

## progress

Suivi fin par module, lecon et exercice.

Champs principaux :
- `id`
- `user_id`
- `course_id`
- `module_id`
- `lesson_id`
- `completed`
- `submitted_exercise_count`
- `total_exercise_count`
- `learning_time_minutes`
- `notes`
- `completed_at`
- `updated_at`

Relations :
- une ligne de progression appartient a un utilisateur et une formation
- une ligne peut cibler un module ou une lecon
- les notes personnelles peuvent rester dans cette table ou etre separees si elles grossissent

## certificates

Attestation delivree ou prevue.

Champs principaux :
- `id`
- `user_id`
- `course_id`
- `title`
- `description`
- `status` : `obtained`, `eligible`, `in-progress`, `coming-soon`
- `required_progress_percentage`
- `current_progress_percentage`
- `credential_id`
- `issued_at`
- `available_at_label`

Relations :
- un certificat appartient a un utilisateur et a une formation

## teacher_courses

Table de liaison entre enseignants et formations.

Champs principaux :
- `id`
- `teacher_id`
- `course_id`
- `role` : `owner`, `editor`, `reviewer`
- `can_publish`
- `created_at`
- `updated_at`

Relations :
- un enseignant peut intervenir sur plusieurs formations
- une formation peut avoir plusieurs enseignants
