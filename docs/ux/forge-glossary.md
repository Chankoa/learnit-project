# Glossaire UX Forge

Ce glossaire sépare le vocabulaire technique persistant du vocabulaire métier et des libellés visibles. Il ne demande aucun renommage de table, type, rôle, route ou contrat API.

## Règles

- Le code et la base conservent leurs noms stables tant qu'une migration métier n'est pas nécessaire.
- L'interface choisit le mot selon l'intention de la personne, pas selon le nom de la table.
- Un même objet `course` peut être présenté comme une création, un parcours ou une formation selon le contexte.
- « Forge » désigne le copilote produit. « IA », provider et modèle restent des notions techniques ou d'observabilité.
- Une génération n'est jamais présentée comme un résultat définitif : c'est une proposition à vérifier.

## Termes

| Technique | Métier | UX Forge | Usage et limites |
| --- | --- | --- | --- |
| `courses` / `course` | Formation ou parcours pédagogique | Création | Navigation et espace Creator. Ne pas renommer le modèle ni les routes en Sprint 9.6. |
| `courses` / `course` | Formation publiable | Formation | Catalogue, publication, administration et inscriptions. |
| `courses` / `course` | Parcours suivi | Parcours | Cockpit, structure pédagogique et expérience Learner. |
| `teacher` | Auteur ou formateur | Créateur | Vocabulaire d'usage dans l'espace de création. Le rôle Auth/DB reste `teacher`. |
| `learner` | Personne inscrite | Apprenant | Terme visible stable. Le rôle reste `learner`. |
| `admin` | Administrateur de plateforme | Administration / Piloter | « Piloter » désigne l'usage ; `admin` reste la permission. |
| `course_modules` / course module | Regroupement pédagogique | Module | Terme stable dans Creator et Learner. |
| `lessons` / lesson | Unité pédagogique | Leçon | Édition de contenu et vocabulaire LMS explicite. |
| `lessons` / lesson | Étape d'un parcours | Étape | Navigation Learner et progression lorsque le format peut dépasser la leçon classique. Ne pas renommer les types. |
| `enrollments` | Relation apprenant–formation | Inscription | Administration, accès et état d'inscription. |
| `enrollments` | Audience d'une création | Apprenants | Vue Creator lorsque l'on parle des personnes inscrites. |
| `lesson_progress` | Avancement pédagogique | Progression | Pourcentage, étapes terminées et reprise. |
| `course_sources` | Documents de référence | Sources | Documents associés à une création ; leur contenu est du contexte, jamais une instruction d'écriture. |
| Storage privé | Fichiers associés | Fichiers source | À afficher avec titre, type et portée lorsque disponibles. |
| AI provider | Infrastructure d'inférence | Ne pas afficher par défaut | Visible seulement en diagnostic ou observabilité Admin. |
| AI model | Modèle d'inférence | Ne pas afficher par défaut | Ne doit pas concurrencer la tâche pédagogique. |
| AI generation | Exécution technique | Analyse Forge | Pendant l'exécution ou lorsque le résultat est une analyse sans mutation. |
| AI generation output | Sortie structurée | Proposition Forge | Résultat vérifiable, modifiable ou ignorable avant application. |
| `course_analysis` | Type de génération | Analyse de la cohérence | Libellé contextualisé au cours ou au module. |
| `ForgeCourseRevisionProposal` | Contrat structuré | Proposition de révision | Présentée avec portée, actuel, proposition, raison et décision. |
| `ForgeLessonContentProposal` | Contrat structuré | Proposition de contenu | Éditable et prévisualisable avant enregistrement. |
| `ForgeCourseProposal` | Contrat structuré | Proposition de parcours | Sélection modules/leçons puis import explicite en brouillon. |
| apply | Mutation validée | Appliquer | Action primaire uniquement après affichage et vérification de la proposition. |
| import | Création depuis proposition | Importer en brouillon | Course Creator uniquement ; aucune publication automatique. |
| draft | État éditorial | Brouillon | État stable et explicite après création/import/application. |
| published | État éditorial | Publié | Résultat d'une action humaine distincte. |
| no result / empty issues | Analyse sans correction | Aucune correction nécessaire | Résultat valide, jamais une erreur ni une invitation à inventer une suggestion. |
| stale proposal | Proposition basée sur un ancien état | Proposition à relancer | L'application est bloquée ; l'utilisateur doit relancer l'analyse. |
| RLS / ownership | Autorisation | Non affiché sauf refus | Les contrôles restent serveur ; le message utilisateur décrit l'action impossible sans exposer la politique. |

## Verbes d'action

| Verbe | Sens UX |
| --- | --- |
| Créer | Démarrer une nouvelle création, manuellement ou avec Forge. |
| Analyser | Examiner sans modifier. |
| Proposer | Produire une alternative soumise à décision humaine. |
| Régénérer | Remplacer une proposition non appliquée par une nouvelle. |
| Ignorer | Fermer la proposition sans mutation. |
| Appliquer | Écrire uniquement les changements montrés et validés. |
| Enregistrer | Persister les modifications humaines courantes. |
| Prévisualiser | Examiner le rendu sans publication. |
| Publier | Rendre la formation accessible selon les règles produit. |

## Formulations à éviter

- « L'IA a corrigé votre cours » avant application.
- « Résultat final » pour une génération.
- « Assistant » sans préciser son contexte ou sa portée.
- « Échec » lorsqu'aucune suggestion n'est nécessaire.
- « Création » dans les contrats techniques ou migrations tant que le modèle reste `courses`.
- « Étape » partout si l'utilisateur édite explicitement une leçon.
- Le nom du provider ou du modèle dans une action produit ordinaire.
