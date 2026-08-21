# Sprint 9.2 - Audit UX Teacher avant modification

## Page d'edition de formation

La page `/app/teacher/courses/[courseId]/edit` empile les informations, la structure, la publication et Forge AI dans une seule colonne. Le statut est affiche deux fois : dans `TeacherCourseForm`, puis dans le bloc Publication. Les actions `Editer le parcours` et Forge sont egalement presentes dans le header puis dans les sections correspondantes.

Le bloc Publication se trouve apres le formulaire long et avant Forge. Il ne donne pas de point de decision persistant, ni de confirmation avant publication. Il affiche les erreurs dans la page, sans guider directement vers le parcours a corriger. La depublication est seulement mentionnee comme une dette et n'a pas d'action serveur.

Les informations qui doivent rester visibles sont le titre, le statut, le nombre de modules, de lecons et d'inscrits, ainsi que les actions de previsualisation et de publication. Les informations generales, le resume du parcours et Forge peuvent devenir contextuels dans des onglets.

## Mes formations

Chaque carte affiche quatre mini-cartes pour les metriques puis deux groupes de boutons. Les chiffres sont utiles, mais les mini-cartes augmentent la densite et les actions secondaires ont un poids visuel proche des actions principales. La preview de brouillon est indisponible depuis cette page.

## Decision Sprint 9.2

Introduire un header de pilotage, des onglets locaux Informations / Parcours / Forge AI, une modal de publication accessible et une action de depublication non destructive. Conserver la validation serveur comme autorite et rendre les actions de structure, Forge, preview et inscrits directement identifiables.