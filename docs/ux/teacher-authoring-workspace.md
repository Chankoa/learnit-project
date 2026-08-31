# Sprint 10.T2 — Teacher Authoring Workspace & Editorial Catalogue

## Audit et décision

Le Teacher Studio possède déjà les contrats nécessaires à un workspace focalisé :

- le builder charge un `TeacherCourse` complet côté serveur ;
- `?module=` et `?lesson=` portent l’objet sélectionné et survivent au refresh ;
- `?from=publication` conserve la provenance de la checklist ;
- les Server Actions existantes couvrent CRUD, ordre, ressources et statuts ;
- `ForgeLessonAssistant` et `ForgeModuleRevision` gardent une proposition distincte de son application ;
- le cockpit concentre la preview, la checklist et la publication.

Le sprint fait donc évoluer la composition de ces éléments sans second builder, nouveau store global, nouvelle route métier ou nouveau pipeline Forge.

## Catalogue Mode

`Mes créations` devient une liste éditoriale verticale. Chaque ligne expose uniquement des données réelles : domaine, titre, description, statut, modules, leçons, inscrits et date de mise à jour.

Les actions sont ordonnées ainsi :

1. `Modifier` ouvre le Focus Mode ;
2. Preview, Forge et apprenants restent des raccourcis compacts et nommés ;
3. `Préparer la publication`, `Publier` ou `Gérer la publication` ouvre le workflow existant.

Une création publiable peut demander l’ouverture directe du dialogue existant via le cockpit. La validation serveur et les règles de publication restent les seules sources de vérité.

## Focus Mode

La route historique `/app/teacher/courses/[courseId]/builder` devient le Focus Mode. Sur cette route, la sidebar Creator et son topbar sont retirés de la composition : la structure pédagogique les remplace.

Le header focalisé conserve :

- un retour à la formation ou à Publication ;
- l’objet sélectionné ;
- Preview ;
- accès à Publication ;
- contrôles Structure et Forge lorsque ces panneaux sont temporaires ou repliés.

## Structure

La structure réutilise les liens et mutations existants. L’objet actif est communiqué par `aria-current`, une bordure et un marqueur visuel. Aucun état de sélection parallèle n’est introduit : l’URL reste canonique.

Les opérations ajouter, supprimer et réordonner restent des formulaires progressifs utilisant les Server Actions actuelles.

## Editor

L’éditeur central reste rendu côté serveur. Il conserve les champs, ressources, confirmations et actions de sauvegarde actuels. Le changement porte sur la largeur, la hiérarchie et la réduction des surfaces imbriquées.

Les onglets locaux Contenu / Forge / Ressources ne sont pas ajoutés en V1 : ils dupliqueraient le panneau Forge et risqueraient de masquer des champs contenant des modifications non enregistrées.

## Forge contextual panel

Forge est déplacé dans un panneau droit rétractable :

- module actif : `ForgeModuleRevision` ;
- leçon active : `ForgeLessonAssistant` ;
- aucun objet : explication de la portée nécessaire.

Le contexte affiché correspond au contexte réellement rechargé côté serveur : formation, module, leçon, leçons voisines et nombre réel de sources associées pour l’assistant de leçon. Le champ actif n’est pas annoncé en V1, car il n’est pas encore un paramètre du contrat backend ; l’afficher serait trompeur.

## Publication → correction

Le deep-link existant reste :

```text
/builder?lesson=<id>&from=publication
```

Le Focus Mode affiche alors `Retour à la publication`. Les navigations entre objets conservent la provenance lorsque nécessaire et la sauvegarde redirige vers la même leçon. Au retour, le cockpit recharge les données et recalcule la checklist.

## Desktop

- écran large : Structure | Éditeur | Forge ;
- Forge fermé : Structure | Éditeur, l’éditeur récupère l’espace ;
- laptop : Structure | Éditeur, Forge devient un panneau temporaire.

La colonne Structure remplace toujours la navigation Creator ; les deux ne coexistent pas.

## Tablette et mobile

Sous le seuil tablette, l’éditeur occupe la largeur disponible. Structure et Forge deviennent des panneaux temporaires ouverts depuis le header focalisé.

À environ 390 px :

- header compact et sticky ;
- boutons Structure et Forge avec libellés explicites ;
- fermeture après navigation par le changement d’URL ;
- aucune interaction dépendante du hover ;
- fond cliquable et touche Échap pour fermer un panneau ;
- cibles tactiles d’au moins 44 px.

## Sidebar Creator

La sidebar globale n’est pas rendue rétractable dans ce sprint. Le gain principal est obtenu sans préférence locale ni état supplémentaire : elle disparaît uniquement dans le Focus Mode et reste stable sur les surfaces de pilotage. Une sidebar compacte hors Focus Mode pourra être évaluée après mesure d’usage, sans être nécessaire au critère de sortie 10.T2.

## Backend et données

Restent inchangés : Supabase, Auth, RLS, repositories, Server Actions, providers Forge, budgets 10.T1.F, parsing, structured output, persistance IA et règles de publication. Aucune migration ni dépendance n’est requise.

## Compromis et dette

- détection du champ actif reportée jusqu’à ce que le contrat Forge accepte explicitement cette portée ;
- pas de focus trap complet de type bibliothèque : les panneaux temporaires utilisent les primitives accessibles du projet, un fond de fermeture, Échap et retour de focus ;
- la préférence de fermeture de Forge n’est pas persistée entre appareils ;
- les ressources restent dans la continuité verticale de l’éditeur afin de préserver les formulaires existants et les saisies non enregistrées.
