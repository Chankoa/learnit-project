# Sprint 9.9 — Cockpit Forge unifié

## 1. Décision UX

Le Course Creator et l’éditeur de cours sont désormais présentés comme deux états d’un même espace de travail : une création Forge. L’objet métier reste `course`, les routes existantes sont conservées et aucun pipeline parallèle n’est introduit.

Le parcours cible est :

```text
Intention → Brief → Proposition → Import en brouillon → Cockpit → Publication
```

La continuité repose sur un header objet commun, une hiérarchie de page partagée, les mêmes surfaces Forge AI et une navigation éditoriale stable. Forge reste une capacité contextuelle : il propose dans le Brief, analyse dans le Parcours et assiste dans une leçon. Il ne devient ni un chat ni une autorité d’écriture.

## 2. Audit avant modification

Les ruptures principales étaient les suivantes :

- le Course Brief affichait presque tous ses champs au même niveau, comme un formulaire administratif ;
- l’intention saisie sur la Home n’était pas suffisamment mise en valeur dans l’étape suivante ;
- la zone de proposition restait largement vide avant génération ;
- les sources partageaient la même densité visuelle que les informations indispensables ;
- le Course Creator, le cockpit et le builder utilisaient des headers et des largeurs différents ;
- le cockpit regroupait les sources dans « Forge » et ne rendait pas la publication visible dans son architecture d’information ;
- le formulaire manuel conservait une présentation intégralement dépliée.

Les fonctionnalités métier étaient en revanche déjà cohérentes : génération structurée, preview, sélection humaine, import en brouillon, Auth/RLS, sources privées, révision de module et publication explicite.

## 3. Architecture de l’information

Le cockpit réutilise la route et le composant existants avec cinq espaces légers :

| Destination | Responsabilité |
| --- | --- |
| Informations | Métadonnées et paramètres éditoriaux du cours |
| Parcours | Modules, leçons et accès au builder |
| Sources | Documents de contexte associés à la création |
| Forge AI | Analyse contextuelle du cours et des modules |
| Publication | État de préparation et problèmes à corriger |

Ce sont des onglets dans la page existante, et non cinq nouvelles routes. Ce choix préserve les URLs, évite une navigation profonde et permet une migration incrémentale. Les flèches gauche/droite déplacent le focus entre les onglets ; les panneaux sont reliés par `aria-controls` et `aria-labelledby`.

La publication reste une action principale dans le header objet. Son onglet explique l’état de préparation et les éventuels blocages, sans dupliquer le CTA.

## 4. Continuité Home → Brief → Proposition → Cockpit

### Home et intention

L’intention transmise par la Home reste visible en tête du Course Brief sous « Votre intention ». Le texte n’est pas traité comme une conversation et n’est jamais perdu lors de la génération.

### Brief

Le brief sépare ce qui est nécessaire pour demander une proposition de ce qui sert à l’affiner. Une synthèse indique immédiatement les champs renseignés et ceux « À préciser ».

### Proposition

Le panneau Forge existe avant, pendant et après la génération :

- avant : il explique ce qui sera produit et rappelle que rien ne sera importé automatiquement ;
- pendant : il annonce « Forge prépare une proposition… » et bloque la double soumission ;
- après : il contient la structure proposée, la sélection et l’import en brouillon ;
- en erreur : il conserve le brief et les sources et fournit une erreur récupérable.

### Import et cockpit

L’import conserve le pipeline existant puis ouvre le cours en brouillon. Le header objet commun affiche le titre, le statut et la structure réelle. Le builder reprend ce même langage visuel afin que l’utilisateur reste dans la même création.

## 5. Course Brief : essentiel et avancé

### Essentiel, visible immédiatement

- sujet ou titre de travail ;
- public cible ;
- objectifs pédagogiques ;
- durée cible.

Le CTA unique est « Générer une proposition ». Il correspond au résultat réel : une proposition structurée à examiner, pas une création automatique.

### Affiner le brief

La section repliable utilise `details/summary` et contient :

- domaine ;
- niveau initial ;
- niveau visé ;
- prérequis ;
- contraintes particulières.

Elle reste disponible au clavier et ne dépend d’aucune animation. Les champs et la validation serveur existants ne changent pas.

### Création manuelle

Le formulaire manuel reprend la même séparation « Informations essentielles / Affiner la création ». Il continue d’utiliser l’action serveur existante et converge vers le même cockpit après enregistrement.

## 6. Sources

Les sources sont une capacité facultative et distincte du brief essentiel. Une primitive partagée gère :

- l’état vide ;
- l’ajout PDF, TXT ou Markdown dans la limite réelle de 10 Mo ;
- la liste compacte des sources ;
- le retrait explicite ;
- le feedback de succès ou d’erreur.

Elle est utilisée dans le Course Creator et dans l’onglet Sources du cockpit. Le stockage, les actions serveur, les permissions et la suppression restent inchangés. L’interface précise qu’aucune citation ni fonctionnalité RAG n’est promise.

## 7. Actions Forge contextuelles

Forge intervient uniquement lorsqu’une tâche est définie :

- Brief : générer une proposition ;
- cours existant : améliorer ou générer dans un périmètre choisi ;
- module : analyser la cohérence puis proposer un avant/après ;
- leçon : utiliser l’assistant existant ;
- sources : fournir du contexte au pipeline actuel.

Toutes les opérations conservent le principe « proposition → validation humaine → application explicite ». Il n’existe pas de bouton générique « Demander à Forge » ni de copilote vide permanent.

## 8. État avant et après génération

| État | Présentation | Actions |
| --- | --- | --- |
| idle | Explication de la future proposition et du contrôle humain | Compléter le brief, générer |
| loading | « Forge prépare une proposition… » | Soumission bloquée |
| success | Modules/leçons proposés et sélectionnables | Ajuster la sélection, importer |
| error | Message récupérable, saisie conservée | Corriger ou relancer |
| no-suggestion | Conservé pour les analyses contextuelles | Revenir au travail éditorial |
| stale | Conservé pour les révisions | Relancer l’analyse |
| applied | Confirmation après application explicite | Continuer l’édition |

## 9. Header objet commun

Le Course Creator, le cockpit et le builder partagent une primitive de header qui présente :

- le contexte « Création » ;
- le titre réel ou de travail ;
- le statut réel (`Brief`, `Brouillon`, `Publié`) ;
- les métadonnées réellement disponibles ;
- une action principale contextuelle et, si nécessaire, une action secondaire.

Aucune métrique n’est simulée. Le header ne modifie ni le statut ni les droits ; il compose les actions existantes.

## 10. Responsive

### Desktop

Le Course Creator utilise deux colonnes : le Brief et les Sources à gauche, le panneau Forge à droite. Le panneau peut rester visible pendant le défilement sans affecter la logique métier.

### Tablette

Sous le breakpoint du layout, les colonnes deviennent une seule pile. Le panneau Forge suit les informations du brief.

### Mobile, environ 390 px

L’ordre est : intention, complétude, essentiel, affiner, sources, CTA, panneau Forge ou proposition. Les actions du header se replient verticalement, les cartes de complétude passent à une colonne et aucun panneau latéral n’est maintenu.

## 11. Accessibilité

- ordre de titres cohérent dans chaque surface ;
- labels explicites pour les champs et le fichier ;
- `details/summary` utilisable sans JavaScript pour l’affinage ;
- focus visible sur résumés, onglets et actions ;
- onglets avec rôles, sélection, contrôles associés et navigation par flèches ;
- `role="status"` ou `role="alert"` pour les feedbacks ;
- états désactivés pendant les mutations ;
- icônes décoratives masquées aux technologies d’assistance ;
- état de préparation lisible par texte et symbole, pas uniquement par couleur.

## 12. Backend et source de vérité

Restent inchangés :

- schéma Supabase ;
- Auth, ownership et RLS ;
- repositories et Server Actions ;
- providers `mock`, `openai-compatible` et `ai-sdk` ;
- structured output et validation Forge ;
- table `ai_generations` ;
- génération, sélection et import en brouillon ;
- publication ;
- stockage privé des sources.

Les sorties Forge ne deviennent jamais des commandes de base de données. Les mutations passent toujours par les actions serveur existantes et nécessitent une action humaine explicite.

## 13. Scénario de smoke test Vercel

Sur l’environnement Vercel authentifié avec un compte Teacher :

1. ouvrir la Home Creator ;
2. saisir « Construire un atelier sur la sécurité en canyoning » ;
3. cliquer sur « Préparer le brief » ;
4. confirmer que l’intention reste visible ;
5. compléter le public, les objectifs et la durée ;
6. ouvrir puis refermer « Affiner le brief » au clavier ;
7. ajouter éventuellement une source PDF, TXT ou Markdown ;
8. cliquer une fois sur « Générer une proposition » ;
9. vérifier l’état de chargement et l’absence de double soumission ;
10. vérifier la proposition structurée ;
11. sélectionner les modules et leçons utiles ;
12. importer la sélection en brouillon ;
13. vérifier l’arrivée dans le cockpit avec le même titre et le statut Brouillon ;
14. parcourir Informations, Parcours, Sources, Forge AI et Publication ;
15. ouvrir le builder depuis Parcours puis revenir aux Informations ;
16. analyser un module avec Forge Revision ;
17. confirmer qu’aucune suggestion, révision ou publication n’est appliquée automatiquement ;
18. à environ 390 px, vérifier l’ordre des sections et l’absence de débordement horizontal.

## 14. Dette restante

- valider le workflow authentifié complet sur Vercel avec les données et credentials réels ;
- mesurer l’usage réel des cinq destinations avant d’envisager des routes dédiées ;
- harmoniser progressivement l’assistant de leçon avec le même header objet ;
- améliorer l’expérience Learner sans réutiliser mécaniquement le cockpit Creator ;
- reporter citations, RAG, streaming, agent et AI Elements à des capacités produit réellement disponibles ;
- évaluer plus tard si l’historique des propositions mérite une surface dédiée, sans l’inventer dans cette V1.

## 15. Conclusion

Le Course Creator devient un atelier de préparation et de décision plutôt qu’une grille de paramètres. Home, Brief, proposition et cockpit partagent désormais le même objet, le même vocabulaire et les mêmes surfaces. Cette convergence reste volontairement front-end : le backend existant demeure la source de vérité et le contrôle humain reste explicite avant toute mutation.
