# Teacher Studio

Sprint 6 connecte la boucle d'authoring Teacher à Supabase.
Sprint 6.1 stabilise la terminologie UX, les domaines créés à la volée et les états de publication.
Sprint 7 ajoute le CMS pédagogique léger : contenu Markdown, ressources liées aux leçons et upload Storage.
Sprint 8 ajoute Forge AI comme copilote optionnel, sans publication ni écrasement automatique.
Sprint 8.1 ajoute le Course Brief, les sources documentaires et l'analyse Forge d'une formation existante.
Sprint 8.2 ajoute la génération contextualisée de leçon et améliore les cartes de formations Teacher.

## Terminologie UX

- **Teacher Studio** : nom de la zone produit enseignant.
- **Éditeur de parcours** : interface de structure d'une formation.
- **Structure** : ensemble des modules et leçons.
- **Modifier les infos** : édition des informations générales d'une formation.
- **Éditer le parcours** : gestion des modules et leçons.
- **Modifier avec Forge AI** : ouvrir le workflow contextualisé sur un cours ou une leçon existante.

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
- `resources` : ressources pédagogiques liées aux formations, modules ou leçons.
- `course_sources` : documents de contexte utilisés par Forge AI.
- `ai_generation_sources` : traçabilité entre générations Forge et sources utilisées.
- `storage.objects` : fichiers de ressources et couvertures de formation.

La migration `20260811090300_teacher_studio_authoring.sql` ajoute `lessons.content`.
La migration `20260811101524_teacher_domain_creation.sql` autorise les Teachers actifs à créer des domaines actifs.
La migration `20260817071013_content_cms_resources.sql` ajoute les métadonnées fichiers, les buckets `resources` et `course-covers`, et les policies associées.
La migration `20260817083313_course_sources.sql` ajoute les sources Forge, le bucket privé `course-sources` et la traçabilité `ai_generation_sources`.

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
- créer/supprimer des ressources uniquement sur ses propres formations ;
- uploader des fichiers uniquement sous son préfixe Storage `auth.uid()/courseId/...`.

Un Learner ne peut pas créer ni modifier de formation, même en forgeant un payload.

## Workflow

1. Le Teacher crée une formation via `/app/teacher/courses/new`.
   Il peut aussi créer une proposition via `/app/teacher/courses/forge`, renseigner un Course Brief, associer des sources, puis importer uniquement les modules/leçons validés.
2. La formation est créée en `draft`, `visibility = private`, `availability = preview`.
3. Le Teacher édite les informations dans `/app/teacher/courses/[courseId]/edit`.
4. Le Teacher organise les modules/leçons dans `/app/teacher/courses/[courseId]/builder`.
5. Dans une leçon, le Teacher rédige le contenu Markdown et ajoute des liens ou fichiers.
6. La publication valide au minimum :
   - titre présent ;
   - description présente ;
   - au moins un module ;
   - au moins une leçon.
7. La publication passe la formation en `published`, `visibility = public`, `availability = complete` et publie les modules/leçons non verrouillés.

## Forge AI dans le Studio

Deux boucles existent :

- nouvelle formation : `/app/teacher/courses/forge` ;
- formation existante : `/app/teacher/courses/[courseId]/edit`, section **Travailler avec Forge AI**.

Le Course Brief réutilise le sélecteur de domaine du Teacher Studio. Un Teacher peut donc créer un domaine à la volée depuis Forge, avec le même slug serveur et la même stratégie anti-doublons que le formulaire de formation.

Pour une formation existante, Forge reçoit :

- informations générales ;
- domaine ;
- modules et leçons ;
- brief ajustable ;
- sources associées.

La réponse Forge est affichée en preview/diff. Aucune modification n'est appliquée tant que le Teacher n'a pas cliqué sur **Accepter en brouillon**. Seules les propositions simples de module ou de leçon sont applicables automatiquement en V1 ; les renommages, réorganisations et recommandations restent à traiter dans l'Éditeur de parcours.

Depuis une carte de `/app/teacher/courses`, les actions principales sont :

- **Éditer le parcours** ;
- **Modifier avec Forge AI**.

Les actions secondaires sont :

- **Modifier les infos** ;
- **Voir** si la formation est publiée.

Les cartes évitent désormais la duplication des compteurs modules/leçons.

## Génération contextualisée de leçon

Dans l'Éditeur de parcours, une leçon sélectionnée expose **Modifier avec Forge AI**.

Modes V1 :

- générer ;
- améliorer ;
- simplifier ;
- développer ;
- introduction ;
- synthèse ;
- exemples ;
- exercice ;
- analyse pédagogique.

Forge reçoit le contexte minimal utile : formation, domaine, module parent, leçon cible, contenu courant, durée, leçons voisines et sources du cours via Retrieval V1.5.

La proposition est structurée, éditable en preview et peut être acceptée explicitement. Le mode analyse reste non mutatif.

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

## CMS pédagogique

Le contenu de leçon V1 reste volontairement simple :

- champ `lessons.content` au format Markdown ;
- textarea confortable dans l'Éditeur de parcours ;
- rendu Learner via `react-markdown` sans HTML brut ;
- états vides explicites pour une leçon sans contenu ou sans ressource.

Les ressources sont ajoutées depuis une leçon. Elles peuvent être :

- un lien externe ;
- un fichier téléversé dans le bucket privé `resources`.

Les fichiers de ressources sont accessibles côté Learner par URL signée, sous réserve des RLS `resources` et `storage.objects`.

Les images de couverture peuvent être téléversées dans `course-covers`, bucket public dédié aux assets catalogue.

## Restrictions

- La dépublication est reportée : elle doit être cadrée avec les enrollments existants.
- La ressource V1 ne gère pas encore le remplacement de fichier.
- Pas de media library globale, versioning, drag and drop ou éditeur riche.
- Les compteurs d'apprenants Teacher ne sont pas exposés tant que les RLS enrollments Teacher ne sont pas définies.

## Validation SQL

Un smoke test transactionnel a été exécuté en production pendant Sprint 6 :

- Teacher actif : insertion course/module/lesson autorisée sous RLS.
- Learner actif : insertion course refusée sous RLS.
- Données de test rollbackées, aucune ligne conservée.

Sprint 6.1 ajoute et applique en production une migration pour la création de domaines par Teacher.
