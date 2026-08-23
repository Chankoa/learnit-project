# Sprint 10.1 — Learner Foundations Audit

## Executive decision

L’expérience Learner ne nécessite pas une réécriture structurelle. Les routes, les états d’inscription, la progression par leçon, la reprise, les notes et les favoris forment déjà un socle fonctionnel. La convergence doit être incrémentale, mais elle doit réordonner fortement la hiérarchie : la prochaine action d’apprentissage doit passer avant les métriques, le catalogue et les surfaces prospectives.

Le modèle mental cible est :

```text
Reprendre → se situer → apprendre → pratiquer → valider → continuer
```

Il ne doit pas reprendre le modèle Creator « structurer / décider / publier ».

## Current learner experience

### Routes et responsabilités réelles

| Route | Surface actuelle | Données / comportement réel |
| --- | --- | --- |
| `/app/learner` | dashboard apprenant | inscriptions, cours actifs, prochaine reprise, progression globale, favoris |
| `/app/learner/courses` | Mes formations | regroupement en cours, terminées, non commencées |
| `/app/learner/progress` | suivi détaillé | progression cours/module/leçon et temps enregistré |
| `/app/learner/resources` | bibliothèque | ressources accessibles, filtres et favoris persistés |
| `/app/learner/certificates` | certificats | données locales/prospectes via `lib/learner`, pas le repository d’apprentissage réel |
| `/learn/[courseSlug]` | vue du parcours | inscription, reprise, progression et programme par module |
| `/learn/[courseSlug]/[lessonSlug]` | leçon | sidebar, contenu, ressources, validation, notes et navigation suivante/précédente |

### Données réellement disponibles

- `enrollments` : état `not-started`, `in-progress`, `completed`, leçon courante, derniers accès et temps agrégé ;
- `lesson_progress` : démarrage, complétion, timestamps et temps par leçon ;
- `notes` : note privée par utilisateur et leçon ;
- `favorites` : favoris de ressources ;
- cours, modules, leçons et ressources publiés via le data source LMS.

Le statut `locked` existe dans le contenu des leçons et est respecté par le service d’apprentissage. Aucun nouveau mécanisme de verrouillage ou de prérequis séquentiel ne doit être inventé.

### Surfaces prospectives à ne pas présenter comme des faits

- le dashboard affiche « Travaux à terminer » alors que `deliverables` est toujours un tableau vide ;
- le bloc Certificats du dashboard annonce une capacité à venir ;
- `/app/learner/certificates` repose sur des données locales et comporte des états fictifs ;
- le suivi des exercices rendus est un empty state prospectif, pas une métrique réelle.

Ces surfaces peuvent rester documentées comme hypothèses, mais elles devraient être retirées de la hiérarchie principale ou explicitement marquées comme démonstration avant la convergence visible.

## Current mapping

| Surface actuelle | Rôle réel | Problème UX | Direction |
| --- | --- | --- | --- |
| Dashboard Learner | agrège toute l’activité | quatre métriques précèdent la reprise | placer « Reprendre » en premier |
| Parcours à reprendre | liste des cours actifs | doublonne partiellement la carte Prochaine leçon | fusionner autour de la prochaine action |
| Prochaine leçon | reprise la plus utile | visuellement secondaire dans une grille | en faire la surface principale |
| Ressources favorites | accès secondaire réel | pertinent mais trop proche du premier écran | conserver sous la reprise |
| Travaux à terminer | placeholder | suggère une capacité non implémentée | reporter / masquer hors démo |
| Certificats dashboard | placeholder | concurrence l’apprentissage courant | reporter / isoler |
| Mes formations | bibliothèque d’inscriptions | vocabulaire LMS, groupes vides répétés | renommer « Mes apprentissages » et compacter |
| Vue parcours | orientation et reprise | hero + trois métriques avant le programme | réduire les métriques, mettre reprise et programme en avant |
| Sidebar leçon | navigation réelle | bonne base, mais longue sur mobile | conserver desktop, drawer contextuel mobile |
| Contenu leçon | lecture et activité | hiérarchie correcte, largeur à préserver | simplifier les surfaces autour du contenu |
| Ressources leçon | supports contextuels | bloc inline potentiellement long | section compacte ou panneau secondaire |
| Validation leçon | mutation réelle de progression | prochaine étape séparée plus bas | rapprocher « terminer » et « continuer » |
| Notes personnelles | persistance réelle | grand bloc dans le flux principal | panneau secondaire ou section repliable |
| Navigation précédente/suivante | continuité réelle | intervient après les notes | la rapprocher de la validation |
| Progression détaillée | reporting réel | dense et parfois plus administratif que pédagogique | garder comme vue secondaire |
| Exercices rendus | placeholder | peut être interprété comme réel | reporter jusqu’à un contrat de livrable |
| Certificats | données locales | mélange potentiel démo/réel | isoler explicitement ou reporter |

## Learning journey

Flux cible :

```text
Mes apprentissages
        ↓
Parcours sélectionné
        ↓
Étape actuelle clairement indiquée
        ↓
Objectif + contenu
        ↓
Mise en pratique éventuelle
        ↓
Terminer l’étape
        ↓
Continuer vers l’étape suivante
```

### Ruptures actuelles

1. Le dashboard demande de lire les métriques avant de voir la prochaine action.
2. « Parcours à reprendre » et « Prochaine leçon » représentent deux entrées concurrentes vers la même intention.
3. La page parcours répète modules, durée et progression avant d’atteindre le programme.
4. Dans une leçon, les notes se placent entre la validation et la navigation suivante.
5. Sur mobile, le drawer global accueille aussi tout le parcours ; les deux niveaux de navigation peuvent devenir très longs.

### Principe de correction

Chaque page doit répondre d’abord à une question :

- Home : « Que dois-je reprendre ? »
- Mes apprentissages : « Quels parcours sont à moi et dans quel état ? »
- Parcours : « Où suis-je et quelle étape vient maintenant ? »
- Leçon : « Que dois-je comprendre ou faire, puis comment continuer ? »
- Progression : « Qu’ai-je déjà validé ? »

## Home

### Hiérarchie cible

1. **Reprendre votre apprentissage** : prochaine leçon issue du dernier cours actif ;
2. **Vos parcours en cours** : deux ou trois reprises secondaires ;
3. **Progression** : résumé compact et réel ;
4. **Ressources favorites / historique** : secondaire ;
5. catalogue seulement en état vide ou comme lien léger.

Les quatre métriques actuelles peuvent devenir une ligne compacte sous la reprise. Les blocs livrables et certificats ne doivent pas occuper la Home tant qu’ils ne reposent pas sur des données produit réelles.

Le nom d’affichage doit utiliser la même règle sobre que Creator : nom fiable, sinon « Bonjour », jamais un rôle ou une valeur fixture concaténée.

## Mes apprentissages

Le libellé visible recommandé est « Mes apprentissages ». Les routes, tables `courses`/`enrollments` et types restent inchangés.

La page doit prioriser :

- en cours, triés par `lastAccessedAt` ;
- non commencés ;
- terminés, repliés ou secondaires.

Une carte doit montrer uniquement : titre, progression réelle, prochaine étape et CTA `Reprendre`, `Commencer` ou `Revoir`. Le temps enregistré peut rester une métadonnée secondaire ; il ne doit pas devenir un objectif ni un classement.

Les sections sans élément ne nécessitent pas chacune une grande empty card. Un message compact suffit lorsque d’autres catégories contiennent des cours.

## Course navigation

La page `/learn/[courseSlug]` constitue déjà une bonne base : programme par modules repliables, statuts de leçon et CTA de reprise.

Direction :

- header compact avec titre, progression et `Continuer` ;
- programme immédiatement après ;
- module courant ouvert ;
- leçon courante, terminée et disponible clairement distinguées ;
- `locked` affiché uniquement lorsqu’il existe réellement dans les données ;
- métriques modules/leçons/durée transformées en métadonnées compactes.

Le retour vers Mes apprentissages doit être stable. Aucun détour par le catalogue n’est nécessaire pour poursuivre un cours inscrit.

## Lesson anatomy

Ordre recommandé :

```text
Contexte parcours + progression
Titre + type + durée
Objectif(s)
Contenu
Activité / mise en pratique
Ressources contextuelles
Terminer et continuer
Notes / outils secondaires
```

### Ce qui peut rester

- `LessonSidebar` et son indication de leçon courante ;
- `LessonHeader` ;
- rendu Markdown/MDX ;
- `CompletionButton` et sa persistance ;
- `LessonNavigation` ;
- notes privées et ressources existantes.

### Ce qui doit évoluer progressivement

- rapprocher le bouton de complétion de la prochaine leçon ;
- ne plus imposer le grand bloc Notes avant l’action suivante ;
- réduire les cards autour du contenu principal ;
- garder une largeur de lecture stable ;
- fournir sur mobile un déclencheur explicite « Parcours » pour le drawer contextuel.

## Progression

Les seules métriques fiables pour V1 sont :

- leçons terminées / accessibles ;
- pourcentage dérivé ;
- état de l’inscription ;
- leçon courante ;
- dernier accès ;
- temps enregistré par le mécanisme actuel.

Le temps enregistré est une approximation d’activité déclenchée par la présence sur la leçon. Il doit rester une information secondaire, pas une preuve d’apprentissage.

À ne pas ajouter : score, classement, série de jours, comparaison sociale ou niveau de maîtrise sans modèle d’évaluation réel.

## Notes / favorites / resources

### Notes

Les notes sont privées, autosauvegardées et bornées à une leçon. Pattern futur recommandé : panneau secondaire repliable sur desktop et sheet/drawer sur mobile, avec état de sauvegarde explicite. Une vue agrégée des notes n’existe pas encore.

### Favoris

Les favoris concernent les ressources, pas les cours ou leçons. Ils peuvent rester dans la Bibliothèque et apparaître sous forme de raccourci discret dans une leçon. Ne pas employer « Favoris » de façon générique tant que les objets éligibles ne sont pas clarifiés.

### Ressources

Les ressources sont filtrées selon l’accès gratuit ou l’inscription. Dans une leçon, afficher les ressources du contexte courant avant les ressources générales du parcours. La bibliothèque complète reste une destination secondaire.

## Future copilot

Opportunités futures, uniquement lorsque le contexte et les sources seront disponibles :

- expliquer un passage sélectionné ;
- reformuler à un niveau différent ;
- poser une question sur la leçon ;
- proposer une question de vérification ;
- aider à raisonner sans produire directement le livrable.

Le contrat futur doit inclure au minimum : `courseId`, `lessonId`, extrait sélectionné, intention pédagogique et références utilisées. Le copilote ne doit pas être un chat global permanent.

## Pedagogical risks

| Risque | Garde-fou futur |
| --- | --- |
| Donner directement la réponse | mode indice puis explication, jamais solution par défaut |
| Court-circuiter une activité | détecter le contexte exercice et favoriser questions guidées |
| Remplacer la réflexion | demander une tentative ou un raisonnement avant aide complète |
| Affirmer sans source | citations lorsque RAG disponible, signaler clairement l’absence de source |
| Sortir du périmètre du cours | contexte borné à la leçon et refus des demandes non liées |
| Créer une dépendance | copilote facultatif, contenu et navigation toujours autonomes |
| Confondre aide et validation | aucune complétion, note ou score décidé par le modèle |

Le principe reste : l’IA aide à comprendre ; elle ne valide ni la progression ni la maîtrise.

## Responsive

### Desktop

```text
navigation parcours | contenu de lecture | aide contextuelle facultative
```

Le contenu garde la priorité en largeur. La troisième colonne n’est autorisée que si elle peut être fermée et si sa présence ne réduit pas la lisibilité.

### Tablette

Navigation du parcours repliable, contenu dominant. Notes et aide deviennent des panneaux déclenchés explicitement.

### Mobile

Contenu d’abord. Un bouton « Parcours » ouvre le drawer du cours, distinct de la navigation globale. La prochaine action reste visible après la validation ; notes et ressources longues sont repliables. Aucun comportement essentiel ne dépend du hover.

## Visual direction

Le Learner réutilise les fondations Creator 10.0/10.1 : tokens, focus, rythme, boutons, états et transitions sobres. Il les adapte ainsi :

- moins de violet, réservé à l’étape courante et aux actions importantes ;
- moins de cards imbriquées ;
- plus de surface blanche autour du contenu ;
- titres moins lourds et largeur de lecture maîtrisée ;
- CTA rares : reprendre, terminer, continuer ;
- hover discret uniquement sur les éléments réellement interactifs ;
- progression lisible par texte et non uniquement par couleur.

## Recommended rollout

### 10.2 — Navigation Learner + Mes apprentissages

- vocabulaire visible « Mes apprentissages » ;
- hiérarchie navigation stable sans changer les routes ;
- cartes centrées sur reprise/prochaine étape ;
- réduction des empty states répétés ;
- isolation explicite des surfaces fictives.

Ce sprint est recommandé en premier : il fixe l’architecture d’information et le vocabulaire avec un risque limité, avant de déplacer les composants de leçon.

### 10.3 — Home Learner « Reprendre »

- prochaine action dominante ;
- cours actifs secondaires ;
- métriques compactes ;
- retrait des placeholders de la Home réelle.

### 10.4 — Lesson experience

- lecture plus calme ;
- validation + étape suivante réunies ;
- navigation parcours mobile dédiée ;
- notes et ressources reléguées à des surfaces secondaires.

### 10.5 — Progression, notes et ressources

- cohérence des vues secondaires ;
- progression fondée uniquement sur les données réelles ;
- accès structuré aux notes et favoris sans nouvelle métrique fictive.

### 10.6 — Copilot groundwork

- contrat borné cours/leçon ;
- stratégie de sources et citations ;
- garde-fous pédagogiques ;
- aucun chatbot général avant cette fondation.

## Remaining questions

- Les certificats doivent-ils devenir une capacité réelle ou disparaître de la navigation principale ?
- Le statut `locked` est-il éditorial ou doit-il un jour dépendre de prérequis validés ?
- Une vue agrégée des notes apporte-t-elle assez de valeur pour justifier une nouvelle surface ?
- La complétion doit-elle rester réversible après passage à la leçon suivante ?
- Quelle activité constitue une véritable validation pédagogique au-delà de la complétion déclarative ?
