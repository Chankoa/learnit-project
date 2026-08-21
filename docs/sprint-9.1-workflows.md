# Sprint 9.1 - Workflows Teacher et Learner

## Navigation Learner

Le menu mobile de `LearningShell` est un drawer lateral unique pour l'espace Learner et le Lesson Reader. Il ajoute un overlay, une fermeture par clic hors panneau, bouton fermer et touche Escape, le focus initial et le blocage du scroll de page. Dans une lecon, il inclut egalement le parcours (modules et lecon active), afin de conserver le contexte au lieu de basculer entre deux navigations differentes.

Les sidebars desktop gardent leurs usages distincts : navigation de l'espace et structure du parcours. Elles partagent toutefois les memes couleurs sombres, etats actifs, rayons, espacements et style de liens dans le drawer mobile.

## Enrollment

La fiche publique applique maintenant des CTA explicites :

- non connecte : `Se connecter pour s'inscrire` ;
- Learner non inscrit : `S'inscrire a la formation` ;
- inscrit non demarre : `Commencer` ;
- en cours : `Continuer` ;
- termine : `Revoir`.

L'inscription appelle toujours `enrollAction`, revalide le dashboard et les formations Learner, puis affiche immediatement la formation dans l'espace apprenant.

## Teacher

- La carte affiche le statut, les modules, les lecons, la date de mise a jour et un compteur d'inscrits reel.
- La migration `202608210002_teacher_enrollment_counts.sql` autorise uniquement un Teacher a lire les enrollments de ses propres formations. L'interface ne charge que le nombre par formation, pas les donnees personnelles des Learners.
- L'editeur expose les conditions de publication completement : titre, description, structure, lecon et contenu de chaque lecon. La validation serveur reste l'autorite avant publication.
- Une formation publiee ouvre `Voir sur le site` dans un nouvel onglet. Le preview de brouillon reste dans l'editeur et ne rend pas de contenu non publie public.
- Forge dans une lecon annonce le contexte, l'action et la portee `cette lecon uniquement`. Une proposition est identifiee comme `Proposition IA a valider`; `Accepter et enregistrer` est volontairement explicite.

## Code et lecture

Les fenced code blocks affichent un langage et un bouton `Copier` avec retour `Copié`. Le bouton est clavier-compatible, utilise Clipboard API avec fallback et les blocs gardent un overflow horizontal sur mobile.

## Dette

- La liste Teacher des inscrits (nom, progression et derniere activite) necessite une vue dediee et une politique RLS precisant les champs exposes.
- La depublication conserve les enrollments mais son action et sa confirmation doivent etre implementees avec ce contrat.
- Le builder a deja structure a gauche et editeur au centre ; le panneau contextuel retractable Forge/ressources/metadonnees est reporte pour ne pas declencher une refonte du studio.
- Les propositions Forge multi-lecons et l'acceptation section par section restent hors de ce sprint : aucune mutation multi-element n'est automatique.
- La refonte transversale du site public, des cartes et du design system reste du ressort de Sprint 9.2.