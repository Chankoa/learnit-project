# Sprint 9.5 — Forge UX Convergence Audit

Date de l'audit : 23 août 2026
Périmètre : repository Learnit actuel et quatre captures Forge fournies comme références d'architecture UX, non comme maquettes à reproduire.

## 1. Executive summary

Learnit peut évoluer vers Forge sans réécriture globale. Les fondations produit sont déjà plus avancées que la navigation ne le laisse paraître : le Teacher dispose d'un cockpit, d'un éditeur de parcours, de sources, de plusieurs opérations Forge AI et d'une publication contrôlée ; le Learner dispose d'un parcours navigable, de progression, de ressources et de notes ; Auth, ownership et RLS restent des frontières utiles.

L'écart principal n'est donc pas une absence de fonctionnalités. Il est composé de quatre dettes UX :

1. une architecture d'information organisée par rôles et écrans techniques plutôt que par intentions ;
2. des entrées concurrentes pour créer ou modifier une formation ;
3. des patterns Forge AI proches sur le fond mais différents dans leur présentation et leurs actions ;
4. un mélange insuffisamment lisible entre fonctionnalités persistées et surfaces de démonstration, surtout dans l'Admin.

La convergence recommandée est incrémentale : stabiliser d'abord le vocabulaire, la hiérarchie d'actions et les primitives Forge ; faire ensuite évoluer le dashboard Teacher en accueil de création ; consolider progressivement les écrans existants dans un cockpit commun en conservant les URLs ; traiter enfin l'expérience Learner puis le pilotage Admin sur des données réellement disponibles.

Les captures sont cohérentes avec Forge sur trois principes : entrée par intention, copilote contextuel avec validation humaine, et espaces centrés sur Créer / Apprendre / Piloter. Elles ne constituent pas un périmètre fonctionnel : réseau, messages, recommandations communautaires, métriques de qualité et copilote Learner restent des hypothèses ou des chantiers futurs.

## 2. Current Learnit UX

### 2.1 Shell et navigation

Le shell principal repose sur `AppShell`, `AppSidebar`, `AppTopbar` et `lib/navigation.ts`. Il présente une navigation distincte par rôle, un sélecteur de rôle de démonstration et un retour au site public. Les permissions restent correctement orientées rôle, mais la navigation expose les rôles comme modèle mental principal.

| Espace | Navigation actuelle | Observation |
| --- | --- | --- |
| Teacher | Tableau de bord, Mes formations, Créer une formation, Créer avec Forge AI, Leçons, Ressources, Apprenants, Profil | La création manuelle et la création assistée sont deux destinations de premier niveau. « Leçons » renvoie à la même liste de cours que « Mes formations », avec un état actif différent. |
| Learner | Tableau de bord, Mes formations, Progression, Ressources, Certificats, Profil | Couverture fonctionnelle claire, mais vocabulaire centré sur des objets LMS. Une navigation dédiée existe aussi dans `LearningShell`. |
| Admin | Tableau de bord, Utilisateurs, Formations, Domaines, Publications, Paramètres, Profil | L'entrée Publications est une ancre ; aucune surface Qualité IA ou générations IA n'existe. Les données Admin sont des fixtures. |

Les URLs et frontières de rôles ne doivent pas être supprimées. La première convergence peut être obtenue par les libellés, les groupements et les priorités, sans renommer les routes.

### 2.2 Teacher / Creator

| Surface réelle | Route ou composant principal | État observé |
| --- | --- | --- |
| Dashboard | `/app/teacher` | Salutation, indicateurs de cours, activité récente et deux CTA concurrents : création manuelle et Forge AI. |
| Mes formations | `/app/teacher/courses` | Cartes de cours avec plusieurs accès séparés : informations, parcours, Forge AI, preview et apprenants. |
| Création manuelle | `/app/teacher/courses/new` + `TeacherCourseForm` | Formulaire direct et utile ; ne partage pas d'entrée avec le Course Brief. |
| Création assistée | `/app/teacher/courses/forge` + `ForgeCourseCreator` | Course Brief, sources facultatives, structured proposal, sélection modules/leçons, preview puis import en brouillon. |
| Cockpit | `/app/teacher/courses/[courseId]/edit` + `TeacherCourseCockpit` | Informations, résumé du parcours, Forge AI, preview, checklist et publication. C'est déjà le noyau de la direction Forge. |
| Éditeur de parcours | `/app/teacher/courses/[courseId]/builder` + `TeacherCourseBuilder` | Édition modules/leçons, CMS leçon, `ForgeModuleRevision` et `ForgeLessonAssistant`. Il reste séparé du cockpit par une navigation de page. |
| Sources et amélioration | `ForgeCourseContextPanel` | Sources privées, brief contextualisé, analyse/amélioration et application contrôlée. Sources et IA sont regroupées dans le même panneau. |
| Révision module | `ForgeModuleRevision` | Pattern produit le plus abouti : contexte borné, loading, absence de problème, diff avant/après, raison, Ignorer/Appliquer et confirmation. |
| Assistant leçon | `ForgeLessonAssistant` | Choix d'action, proposition éditable, preview Markdown, sources, régénération et application. Plus dense et plus proche d'un mini-éditeur. |
| Ressources Teacher | `/app/teacher/resources` | Bibliothèque présente, mais l'ajout reste simulé localement. À ne pas présenter comme un workflow de production complet. |
| Apprenants | `/app/teacher/students` | Liste explicitement fictive. Ne doit pas devenir une preuve de pilotage réel. |

Le cockpit existe donc déjà, mais l'utilisateur doit encore comprendre la différence entre « modifier les infos », « éditer le parcours », « modifier avec Forge AI » et « analyser avec Forge ». La convergence doit diminuer ce coût de choix sans supprimer les capacités.

### 2.3 Learner

| Surface réelle | Route ou composant principal | État observé |
| --- | --- | --- |
| Dashboard | `/app/learner` | Progression globale, parcours à reprendre, prochaine leçon, favoris, livrables et certificats. Livrables et certificats sont encore des états d'attente. |
| Mes formations | `/app/learner/courses` | Regroupement En cours / Terminées / Non commencées, progression et reprise. Bon candidat au libellé « Mes apprentissages ». |
| Progression | `/app/learner/progress` | Synthèse par cours ; exercices annoncés pour plus tard. |
| Ressources | `/app/learner/resources` | Bibliothèque et favoris. Les favoris disposent aussi d'un mécanisme local de repli/démonstration. |
| Certificats | `/app/learner/certificates` | Écran présent mais état annoncé comme fictif. |
| Vue de parcours | `/learn/[courseSlug]` | Structure du cours, modules, leçons et CTA de reprise. |
| Leçon | `/learn/[courseSlug]/[lessonSlug]` | `LearningShell`, navigation du parcours, contenu central, ressources, complétion, notes et navigation précédente/suivante. |
| Notes | `LessonNotes` | Autosave via Server Action et service de learning ; la base locale historique existe encore dans le repository. |

La leçon actuelle couvre déjà deux zones de la référence Forge : navigation et contenu. Elle est organisée en deux colonnes au-delà de 980 px, puis replie la navigation dans le flux et dans le drawer mobile. Aucun copilote Learner contextuel n'est branché. Ajouter immédiatement une troisième colonne réduirait la largeur de lecture et dégraderait le responsive ; le futur copilote doit être un panneau optionnel et repliable.

### 2.4 Admin

L'Admin présente des écrans crédibles visuellement, mais ses données proviennent de `data/admin.ts` via les repositories synchrones. Les modifications de rôle, statut, publication, domaines et paramètres sont simulées en état client. Les pages et boutons l'indiquent explicitement.

| Surface | Réalité actuelle | Conséquence pour Forge |
| --- | --- | --- |
| Dashboard | Métriques et activité calculées sur fixtures Admin | Peut inspirer le futur pilotage, pas servir de métrique produit. |
| Utilisateurs | Table et actions locales de démonstration | La future version doit interroger les profils réels et conserver des actions serveur autorisées. |
| Formations | Filtres et catalogue de fixtures ; publication simulée | Ne pas reprendre les nombres ni états comme données réelles. |
| Domaines | Fixtures et mutations locales | Conserver comme hypothèse de taxonomie, pas comme gestion opérationnelle réelle. |
| Paramètres | Configuration de démonstration | Reporter la convergence tant qu'un contrat de configuration réel n'existe pas. |
| Qualité / IA | Aucune route réelle | L'entrée de la capture est une direction ; `ai_generations` existe côté données mais n'a pas de surface Admin. |

### 2.5 Routes à préserver pendant la convergence

Les routes existantes constituent des points d'entrée stables. Une nouvelle IA de navigation doit d'abord les réutiliser :

- création : `/app/teacher/courses/new` et `/app/teacher/courses/forge` ;
- créations : `/app/teacher/courses` ;
- cockpit : `/app/teacher/courses/[courseId]/edit` ;
- parcours : `/app/teacher/courses/[courseId]/builder` ;
- apprentissages : `/app/learner/courses` et `/learn/[courseSlug]/[lessonSlug]` ;
- pilotage actuel : `/app/admin`, `/app/admin/courses`, `/app/admin/users`.

Des changements de libellés et des liens croisés peuvent précéder toute alias ou migration de route.

## 3. Forge reference principles

Les captures fournies suggèrent les principes suivants.

1. **Commencer par l'intention.** « Qu'allez-vous construire aujourd'hui ? » place le résultat souhaité avant le choix d'un formulaire ou d'un provider IA.
2. **Organiser par usages.** Créer, Mes créations, Mes apprentissages et Piloter sont plus proches des objectifs que Teacher, Learner et Admin.
3. **Rendre l'IA contextuelle.** Le copilote connaît la création, le module ou l'étape courante ; il ne se présente pas comme un chatbot généraliste.
4. **Montrer le contrôle humain.** Les propositions doivent exposer contexte, avant/après, raison et action explicite.
5. **Faire du cockpit le point de convergence.** Informations, parcours, sources, Forge AI, preview et publication sont les facettes d'une même création.
6. **Préserver la lecture.** Dans la référence Learner, navigation, contenu et copilote ont chacun une responsabilité ; la colonne centrale reste dominante.
7. **Piloter avec des états vérifiables.** Publication, structure et qualité sont utiles seulement s'ils proviennent de données réelles.

Éléments à ne pas interpréter comme des exigences : réseau, connexions, messages, bibliothèque communautaire, recommandations, notes sociales, nombre d'apprenants actifs, variations mensuelles et file « À valider ». Leur présence dans les captures illustre un horizon produit, pas la maturité du repository.

## 4. Learnit → Forge mapping

| Learnit actuel | Direction Forge | Décision | Justification / condition |
| --- | --- | --- | --- |
| Dashboard Teacher | Accueil Forge orienté intention | refondre progressivement | Premier écran à faire évoluer ; réutiliser les indicateurs réels et les routes de création. |
| Mes formations Teacher | Mes créations | renommer | Changement de vocabulaire sans changement de table `courses`. |
| Créer une formation | Nouvelle création — mode manuel | fusionner | Devient un choix dans une même entrée de création, tout en gardant sa route. |
| Créer avec Forge AI | Nouvelle création — guidée par Forge | fusionner | Même intention initiale, chemin assisté distinct après le choix. |
| Course Brief | Cadrage de création | conserver | Contrat utile ; l'afficher par étapes plutôt que comme écran concurrent. |
| Domaines lors de la création | Catégorisation contextuelle | déplacer | Garder le picker dans le flux ; ne pas faire de la gestion de domaine une étape centrale. |
| Liste d'actions sur une formation | Ouvrir le cockpit | simplifier | Une action primaire, les actions secondaires dans le cockpit. |
| `TeacherCourseCockpit` | Cockpit de création | conserver | Noyau existant à étendre, pas à remplacer. |
| Onglet Informations | Informations | conserver | Stable et conforme au modèle métier. |
| Résumé Parcours + builder séparé | Parcours du cockpit | refondre progressivement | Conserver le builder ; unifier le shell et le retour de navigation avant de rapprocher les écrans. |
| Sources dans Forge AI | Sources | déplacer | Une destination explicite du cockpit, utilisable avec ou sans génération. |
| ForgeCourseContextPanel | Forge AI du cours | simplifier | Séparer visuellement sources, intention d'analyse et propositions. |
| Forge Revision module | Copilote contextuel module | conserver | Meilleure primitive V1 : bornage, diff, raison, décision humaine. |
| Assistant de leçon | Copilote contextuel leçon | simplifier | Conserver la capacité, harmoniser états et barre de décision. |
| Preview | Preview du cockpit | conserver | Garde-fou avant publication. |
| Publication | Publication du cockpit | conserver | Checklist et confirmation déjà adaptées au principe humain décisionnaire. |
| Ressources Teacher simulées | Sources / ressources réelles | reporter | Ne pas consolider une mutation fictive comme capacité produit. |
| Apprenants Teacher fictifs | Audience / suivi | reporter | Nécessite des données d'inscription et de progression fiables. |
| Dashboard Learner | Accueil Apprendre | simplifier | Prioriser Reprendre et apprentissages actifs ; réduire les blocs « prochainement ». |
| Mes formations Learner | Mes apprentissages | renommer | Le modèle `courses` reste inchangé. |
| Progression séparée | Progression contextuelle + synthèse | conserver | La synthèse peut rester ; éviter la duplication avec chaque cours. |
| Leçon deux colonnes | Navigation + contenu + copilote optionnel | refondre progressivement | Ajouter le copilote seulement après contrat, sources et responsive dédiés. |
| Notes privées | Outil contextuel d'apprentissage | conserver | Capacité réelle et utile, indépendante de l'IA. |
| Favoris de ressources | Bibliothèque personnelle | conserver | Ne pas confondre avec favoris ou recommandations communautaires. |
| Certificats fictifs | Certification | reporter | Éviter de mettre en avant une promesse non opérationnelle. |
| Dashboard Admin de fixtures | Vue d'ensemble Pilotage | refondre progressivement | Rebrancher d'abord sur données réelles ; afficher moins de métriques. |
| Formations Admin de fixtures | Catalogue éditorial réel | refondre progressivement | Publication et structure sont pertinentes, mais nécessitent des requêtes et actions réelles. |
| Utilisateurs Admin de fixtures | Utilisateurs | refondre progressivement | Permissions et audit indispensables avant mutations. |
| Domaines Admin | Taxonomie | conserver | Conserver le concept, reporter les mutations de production. |
| Qualité IA de la capture | Qualité / observabilité | reporter | `ai_generations` prépare ce besoin, mais aucun agrégat ni écran Admin n'existe. |
| Réseau, messages, communauté | Exploration produit | reporter | Aucune capacité sociale réelle dans Learnit. |
| Navigation par rôle | Navigation par usage sous permissions | refondre progressivement | Les rôles restent le mécanisme d'autorisation, pas le seul vocabulaire visible. |

## 5. Target information architecture

### 5.1 Principe

La navigation visible doit présenter les usages autorisés à la personne connectée. Le rôle continue de déterminer les routes et opérations accessibles. Un Teacher qui est aussi Learner peut voir Créer et Apprendre ; un Admin voit Piloter. Il n'est pas nécessaire de fusionner les modèles d'autorisation pour obtenir cette expérience.

### 5.2 Forge V1 réaliste

```text
Forge
├── Accueil
├── Créer                          [Teacher]
│   ├── Mes créations              → /app/teacher/courses
│   └── Nouvelle création
│       ├── Avec Forge             → /app/teacher/courses/forge
│       └── Manuellement           → /app/teacher/courses/new
│
├── Création sélectionnée          [Teacher + ownership]
│   ├── Informations               → cockpit existant
│   ├── Parcours                   → builder existant
│   ├── Sources                    → service/source panel existant
│   ├── Forge AI                   → analyses et propositions existantes
│   └── Preview & publication      → cockpit existant
│
├── Apprendre                      [Learner]
│   ├── Mes apprentissages         → /app/learner/courses
│   ├── Progression                → /app/learner/progress
│   └── Ressources                 → /app/learner/resources
│       └── Étape                  → /learn/[courseSlug]/[lessonSlug]
│           ├── contenu
│           ├── ressources
│           ├── notes / progression
│           └── copilote           [reporté]
│
└── Piloter                        [Admin]
    ├── Vue d'ensemble             → /app/admin
    ├── Formations                 → /app/admin/courses
    ├── Utilisateurs               → /app/admin/users
    ├── Domaines                   → /app/admin/domains
    └── Qualité / IA               [reporté : aucune surface réelle]
```

### 5.3 Règles de transition

- Ne pas casser les liens profonds existants.
- Introduire d'abord les nouveaux libellés dans la navigation et les breadcrumbs.
- Garder les noms techniques `course`, `courseId`, tables `courses` et services associés.
- Ne pas afficher une destination à un rôle qui ne possède pas l'autorisation correspondante.
- Permettre un retour prévisible au même cockpit depuis le builder, la preview et Forge AI.
- Éviter un méga-écran : le cockpit est un shell cohérent, pas nécessairement un composant qui rend tout simultanément.

## 6. Teacher / Creator convergence

### 6.1 Home Forge cible

Le dashboard `/app/teacher` est le meilleur premier écran produit à refondre. Il concentre peu de risque métier, utilise déjà des données réelles Teacher et pointe vers tous les flux nécessaires.

Workflow cible :

```text
Qu'allez-vous construire aujourd'hui ?
        ↓
Intention courte
        ↓
Choix explicite du mode
        ├── Être guidé par Forge
        │       ↓
        │   Course Brief progressif
        │       ↓
        │   Proposition → sélection → brouillon
        └── Commencer manuellement
                ↓
            Informations minimales → brouillon
        ↓
Cockpit de la création
```

Une troisième entrée « Améliorer une création existante » doit d'abord être un raccourci vers Mes créations, puis vers le cockpit du cours choisi. Elle ne doit pas demander à l'IA de sélectionner ou modifier arbitrairement un cours.

Les suggestions de type « cours complet », « atelier pratique » ou « module thématique » peuvent être des aides de cadrage. Tant que le modèle métier ne gère que `courses`, elles doivent modifier le brief ou le gabarit, pas prétendre créer des entités différentes.

### 6.2 `courses` versus « créations »

Le mot « création » est pertinent au niveau de la navigation et de l'accueil : il exprime une activité et ouvre l'imaginaire produit. Le mot « parcours » est préférable dans le cockpit et l'expérience Learner. Le mot « formation » reste utile dans les textes légaux, la publication, le catalogue et l'Admin tant que l'entité persistée est un cours.

Recommandation de vocabulaire :

| Contexte | Libellé recommandé | Modèle conservé |
| --- | --- | --- |
| Navigation Teacher | Mes créations | `courses` |
| CTA | Nouvelle création | création manuelle ou Course Brief |
| Liste | Créations / parcours | cartes de cours |
| Cockpit | Parcours sélectionné ou formation sélectionnée | `courseId` |
| Learner | Mes apprentissages | enrollments + courses |
| Admin | Formations | courses publiables et gouvernance |

Ce renommage serait prématuré dans les types, schémas Supabase, repositories, URLs et libellés de publication. Une future pluralité d'objets devra être prouvée par des workflows réels avant de modifier le modèle.

### 6.3 Cockpit de création

Le cockpit actuel est fonctionnel mais incomplet comme shell commun :

- Informations, Parcours et Forge AI sont des onglets, mais l'édition détaillée du parcours quitte la page ;
- Sources se trouvent à l'intérieur de Forge AI alors qu'elles ont aussi une valeur éditoriale propre ;
- preview et publication sont placées dans le header, ce qui est cohérent ;
- « Modifier le parcours avec Forge AI » concurrence l'onglet Forge AI qu'il active ;
- la liste Mes formations expose trop d'actions qui répètent celles du cockpit ;
- `ForgeCourseContextPanel`, `ForgeModuleRevision` et `ForgeLessonAssistant` utilisent des variantes différentes de feedback, diff et application.

Convergence proposée :

1. faire de « Ouvrir » / « Continuer » l'action primaire de chaque carte ;
2. conserver preview comme action secondaire directe seulement si elle est très fréquente ;
3. installer un header de création persistant : identité, état, preview, publication ;
4. présenter cinq destinations stables : Informations, Parcours, Sources, Forge AI, Publication ;
5. continuer à rendre le builder sur sa route, mais dans un shell visuel et un breadcrumb cohérents ;
6. ne rapprocher physiquement les routes qu'après mesure des usages et vérification de la gestion d'état.

## 7. Learner convergence

### 7.1 Ce qui peut rester

- `LearningShell` et sa navigation responsive ;
- `LessonSidebar` et l'ouverture du module courant ;
- la colonne de lecture bornée ;
- les métadonnées de leçon, objectifs, Markdown/MDX et ressources ;
- la complétion explicite, les notes et les liens précédent/suivant ;
- les pages Mes formations, Progression et Ressources, avec un vocabulaire harmonisé.

### 7.2 Écarts avec la référence

| Axe | Learnit actuel | Direction Forge |
| --- | --- | --- |
| Hiérarchie | Contenu riche mais page longue avec ressources, complétion, notes et navigation | Distinguer contenu, activité, ressources et actions de fin sans perdre la continuité de lecture. |
| Navigation | Sidebar cours + modules + leçons | Très proche de la référence ; renforcer l'étape courante et la progression globale. |
| Progression | Barre, statut leçon et CTA de complétion | Conserver ; clarifier « terminé » versus simple consultation. |
| Ressources | Bloc dans la leçon et bibliothèque séparée | Conserver, avec provenance et portée cours/module/leçon plus visibles. |
| CTA | Complétion puis précédent/suivant | Définir un CTA principal de fin d'étape et garder la navigation secondaire. |
| Copilote | Absent | Futur panneau contextuel, non ouvert par défaut et jamais nécessaire pour suivre le cours. |
| Responsive | Deux colonnes, sidebar repliée sous 980 px et drawer mobile | Le futur troisième panneau doit devenir drawer latéral ou bottom sheet, pas une colonne forcée. |

### 7.3 Ordre recommandé

1. renommer Mes formations en Mes apprentissages ;
2. simplifier le dashboard autour de « Reprendre » et masquer les blocs purement fictifs ;
3. stabiliser le layout de leçon, le CTA de progression et la navigation mobile ;
4. documenter un contrat de contexte Learner : cours, module, leçon, sources autorisées et historique minimal ;
5. seulement ensuite prototyper un copilote repliable avec citations et réponses bornées.

Le copilote ne doit pas être requis pour accéder au contenu, effectuer une activité ou terminer une leçon. Il doit expliquer, questionner et aider à raisonner, sans produire une validation pédagogique ou une progression à la place de l'apprenant.

## 8. Admin convergence

### 8.1 Pilotage possible avec les données existantes

À court terme, une vraie vue de pilotage peut utiliser seulement des données vérifiables :

- nombre de cours accessibles à l'Admin ;
- statut brouillon/publié et date de mise à jour ;
- nombre de modules et leçons ;
- propriétaire Teacher ;
- comptes et rôles réellement présents ;
- génération IA : provider, modèle, type, statut, durée, tokens et erreur lorsqu'ils sont persistés dans `ai_generations`.

Cette surface nécessitera des repositories Admin branchés sur Supabase et des requêtes autorisées. Le repository actuel ne fournit pas ce read model réel.

### 8.2 Éléments non disponibles ou incomplets

- apprenants actifs et évolution mensuelle ;
- score de qualité pédagogique ;
- file « à réviser » ou « à valider » ;
- modération éditoriale ;
- coût consolidé des générations ;
- anomalies IA, taux d'acceptation et faux positifs ;
- historique fiable des changements de rôle ou de publication.

Ces métriques ne doivent pas être calculées à partir de fixtures ni remplacées par des estimations dans le produit réel.

### 8.3 Direction

La référence « Pilotage des formations » est cohérente comme architecture d'information. La première version réelle doit être plus sobre que la capture : catalogue éditorial, état de publication, structure, mise à jour et propriétaire. Qualité et IA peuvent ensuite apparaître comme une section d'observabilité, distincte des décisions éditoriales et sans permettre l'application automatique d'une suggestion.

## 9. Forge AI interaction model

### 9.1 Surfaces actuelles

| Surface | Contexte | Sortie | Décision humaine |
| --- | --- | --- | --- |
| `ForgeCourseCreator` | Course Brief + sources | Proposition complète et sélectionnable | Import explicite en brouillon |
| `ForgeCourseContextPanel` | Cours existant + brief + sources | Suggestions cours/module/leçon | Ignorer ou accepter en brouillon |
| `ForgeModuleRevision` | Module sélectionné + leçons | Diff titre/description et raison | Ignorer ou appliquer après confirmation |
| `ForgeLessonAssistant` | Leçon + cours + voisines + sources | Contenu éditable et preview | Régénérer, ignorer ou enregistrer |

Le contrat d'infrastructure est convergent (`forgeAiService`, validation, Server Actions, journalisation), mais le langage d'interface ne l'est pas encore totalement.

### 9.2 Primitives UX communes

Une fondation Forge AI devrait définir des composants de présentation, sans créer un nouveau pipeline :

- `ForgeContextHeader` : objet analysé, portée et sources utilisées ;
- `ForgeActionTrigger` : action secondaire contextualisée, état disabled et prévention du double submit ;
- `ForgeRunState` : analyse en cours, erreur exploitable et relance ;
- `ForgeNoSuggestion` : absence de correction comme résultat valide ;
- `ForgeProposal` : statut de proposition, synthèse et provenance ;
- `ForgeDiff` : actuel / proposé, champs réellement modifiés et stale state ;
- `ForgeRationale` : justification courte séparée du contenu proposé ;
- `ForgeDecisionBar` : Ignorer, Régénérer si autorisé, Appliquer ;
- `ForgeSources` : références, extraits et avertissement lorsque la proposition n'est pas sourcée ;
- `ForgeAppliedFeedback` : succès, périmètre modifié et rappel du statut brouillon.

`ForgeModuleRevision` constitue le meilleur point de départ visuel. Il matérialise le principe « l'IA propose, l'humain décide » avec le moins de bruit.

### 9.3 Règles transverses

- Toujours nommer la portée : cours, module ou leçon.
- Afficher « aucune correction » sans forcer une suggestion.
- Séparer proposition, édition humaine et application.
- Ne jamais laisser un texte généré se transformer directement en opération DB.
- Conserver Auth, ownership, RLS, validation métier et stale-state côté serveur.
- Exposer les sources ou l'absence de sources.
- Ne pas employer un rendu conversationnel quand la tâche produit une proposition structurée.
- Dans l'espace Learner, interdire au copilote de modifier progression, contenu ou publication.

## 10. Design system audit

### 10.1 Fondations existantes à conserver

- tokens de typographie, espaces, rayons, durées et containers dans `styles/tokens.scss` ;
- thèmes clair/sombre et tokens sémantiques dans `styles/themes.scss` ;
- palette violet/rose/cyan déjà compatible avec l'accent violet Forge ;
- `Inter` et hiérarchie typographique lisible ;
- boutons primaire/secondaire, badges d'état, champs et focus visibles ;
- containers de lecture et breakpoints dédiés ;
- `AppPageHeader`, `AppBreadcrumb`, `AppEmptyState`, shell et primitives de feedback ;
- icônes Lucide cohérentes.

### 10.2 Points à harmoniser

| Primitive | Constat | Fondation recommandée |
| --- | --- | --- |
| Couleur | Accent cohérent, mais variation du rose en thème sombre et usages nombreux des mélanges de couleur | Définir des rôles Forge explicites : action, IA, succès, attention, danger, surface copilote. |
| Typographie | Échelle solide ; headings parfois très différents selon public/app/lesson | Définir une échelle « workspace » et une échelle « reading » distinctes. |
| Espacement | Tokens présents ; densités très variables entre dashboards, builder et leçon | Définir compact / standard / reading au niveau des layouts. |
| Radius | La plupart des rayons md/lg/xl valent 0,5 rem | Assumer ce style plus sobre ou redéfinir une vraie échelle ; éviter des noms sans différence visuelle. |
| Shadows | Échelle disponible mais applications hétérogènes | Réserver l'élévation aux overlays, panneaux contextuels et éléments interactifs. |
| Cards | Beaucoup de variantes locales | Limiter à métrique, liste, proposition et panneau ; ne pas transformer chaque section en carte. |
| Buttons | Les boutons fonctionnent, mais plusieurs primaires coexistent sur certaines pages | Une action primaire par contexte ; Forge AI est secondaire tant qu'aucune proposition n'est affichée. |
| Badges | États nombreux et utiles | Centraliser la sémantique draft/published/pending/completed/AI proposal. |
| Forms | Teacher possède une famille cohérente | Mutualiser labels, aide, erreurs et pending avant toute refonte visuelle. |
| Sidebars | App, learning et références utilisent des structures différentes | Définir largeur, densité, état actif, footer et comportement mobile communs. |
| Headers | `AppPageHeader`, header de leçon et cockpit se chevauchent conceptuellement | Définir page header, object header et reading header comme trois primitives. |
| Responsive | Breakpoints nombreux et répartis entre grands fichiers SCSS | Documenter 4 paliers communs et tester cockpit, builder et leçon à chacun. |

### 10.3 Ce qui paraît trop générique ou incohérent

- les dashboards par rôle partagent une grammaire de panneaux/metrics sans exprimer assez fortement l'intention principale ;
- les pages Teacher exposent simultanément plusieurs CTA de création et de modification ;
- les grands fichiers `styles/app.scss` et `styles/globals.scss` accumulent des primitives, pages et responsive, ce qui rend la convergence risquée ;
- les états Forge AI utilisent plusieurs cartes, toasts, diffs et libellés proches sans contrat visuel unique ;
- la distinction données réelles / démo dépend principalement du texte local de chaque écran.

### 10.4 Fondations à stabiliser avant refonte

1. glossaire produit : création, parcours, formation, apprentissage, source, proposition ;
2. hiérarchie action primaire / secondaire / destructive / IA ;
3. trois headers : page, objet édité, lecture ;
4. primitives Forge AI communes ;
5. règles de densité et largeur des panneaux ;
6. breakpoints et stratégie drawer pour navigation/copilote ;
7. états standard : loading, empty, no suggestion, error, stale, applied ;
8. indication systématique « réel », « indisponible » ou « démonstration » lorsque nécessaire ;
9. focus, navigation clavier, dialogues et reduced motion ;
10. découpage progressif du SCSS par shell/primitives/features, sans réécriture globale.

## 11. Components and reuse strategy

### 11.1 Réutilisation interne prioritaire

| Besoin Forge | Base existante | Stratégie |
| --- | --- | --- |
| Navigation usage-centrique | `AppSidebar`, `lib/navigation.ts` | Recomposer les groupes et libellés, conserver les contrôles de rôle et routes. |
| Accueil de création | dashboard Teacher + `AppPageHeader` | Remplacer progressivement le hero et regrouper les entrées existantes. |
| Mes créations | page Teacher courses | Changer vocabulaire et priorité d'actions, conserver cards/services. |
| Cockpit | `TeacherCourseCockpit` | Étendre le shell et les destinations ; ne pas recréer un éditeur. |
| Parcours | `TeacherCourseBuilder` | Réutiliser intégralement, harmoniser seulement le shell et le retour. |
| Proposition IA | `ForgeModuleRevision` | Extraire les primitives communes après validation de leurs variantes. |
| Expérience Learner | `LearningShell`, `LessonSidebar`, `LessonContent` | Consolider le responsive avant d'ajouter un panneau. |
| Pilotage | pages Admin + futurs read models Supabase | Réutiliser la structure de table, remplacer les fixtures avant évolution visuelle. |

### 11.2 Vercel AI Elements

AI Elements peut devenir utile plus tard pour des besoins précis : rendu Markdown en streaming, sources/citations, états de chargement, confirmations de tool calls et pièces de conversation. Son catalogue actuel inclut notamment Prompt Input, Message Response, Conversation, Sources, Loader et Confirmation.

Il ne doit pas être adopté maintenant :

- les opérations Forge actuelles produisent des propositions structurées, pas une conversation ;
- le projet possède son propre SCSS et très peu de primitives `components/ui` ;
- AI Elements s'appuie sur l'écosystème shadcn et introduirait une deuxième grammaire de composants ;
- une adoption globale risquerait de diluer le design system Forge.

Décision : **reporter l'installation**. Lorsqu'un vrai streaming ou copilote cité sera planifié, évaluer composant par composant et adapter le code source au design Forge. Les composants de conversation génériques ne doivent pas remplacer les diffs et décisions humaines actuels.

Références officielles : [AI Elements](https://elements.ai-sdk.dev/), [Sources](https://elements.ai-sdk.dev/components/sources), [Confirmation](https://elements.ai-sdk.dev/components/confirmation).

## 12. Deferred product hypotheses

| Hypothèse visible dans les références | Classification | Motif |
| --- | --- | --- |
| Réseau et connexions | exploration produit / hors roadmap immédiate | Aucun graphe social, relation ou permission associée. |
| Messages | exploration produit / hors roadmap immédiate | Aucune messagerie, modération ou notification temps réel. |
| Activité du réseau | exploration produit / hors roadmap immédiate | Nécessiterait un modèle d'événements, de confidentialité et de pertinence. |
| Recommandations communautaires | exploration produit / hors roadmap immédiate | Aucun signal de qualité, ranking ou catalogue communautaire. |
| Favoris sociaux | exploration produit / hors roadmap immédiate | Les favoris actuels sont personnels et liés aux ressources. |
| Versioning collaboratif « comme GitHub » | exploration produit | Aucun contrat de version, branche, diff multi-auteur ou merge. |
| Copilote Learner | chantier futur | AI provider présent, mais contexte, sources, citations et garde-fous Learner à définir. |
| Qualité IA Admin | chantier futur | `ai_generations` est une base d'observabilité, pas un score qualité. |
| File de validation éditoriale | chantier futur | Aucun workflow d'approbation multi-acteur persistant. |

Construire une communauté maintenant détournerait l'équipe de la convergence du cœur de valeur : créer, apprendre et valider avec un copilote contextualisé.

## 13. Risks

| Risque | Impact | Mitigation |
| --- | --- | --- |
| Renommer l'UX avant d'aligner le glossaire | « création », « cours », « parcours » deviennent interchangeables | Glossaire et règles par contexte avant déploiement des libellés. |
| Casser les favoris/URLs | Liens externes et habitudes perdus | Conserver les routes, préférer labels et aliases. |
| Masquer les permissions sous une navigation unifiée | Accès refusés tardifs ou surfaces incohérentes | Construire la navigation à partir des capacités autorisées, garder les guards serveur. |
| Transformer le cockpit en méga-page | Performance, état client et charge cognitive | Shell commun + sous-routes existantes ; chargement par destination. |
| Multiplier les actions IA | Perte de confiance et ambiguïté d'application | Primitive contextuelle unique, portée et décision visibles. |
| Confondre absence de suggestion et échec | Faux sentiment d'inefficacité | État `no suggestion` de premier rang. |
| Afficher des métriques Admin fictives comme réelles | Décisions de pilotage erronées | Remplacer les fixtures par read models avant redesign. |
| Ajouter une troisième colonne Learner trop tôt | Lecture comprimée et mobile dégradé | Panneau repliable, tests responsive et contenu accessible sans IA. |
| Deux design systems | Incohérences et dette CSS | Ne pas installer AI Elements/shadcn sans cas précis. |
| Extraire trop tôt des composants communs | Abstraction qui ne couvre pas les variantes réelles | Stabiliser Module Revision puis comparer au cours et à la leçon. |
| Mélange persistance serveur / local | Progression ou favoris divergents entre appareils | Documenter le mode de persistance et supprimer les fallbacks de démo par capacité. |
| Refonte simultanée navigation + métier | Régressions difficiles à isoler | Sprints incrémentaux, flags ou rollout par surface, tests des chemins existants. |

## 14. Recommended rollout

L'ordre ci-dessous privilégie la valeur Teacher déjà disponible et traite les fondations avant les écrans à données fictives.

### Sprint 9.6 — Forge UX foundation

- définir le glossaire Forge et la matrice des libellés ;
- fixer la hiérarchie des actions et les états communs ;
- formaliser les primitives Forge AI à partir de Module Revision ;
- inventorier les breakpoints et documenter page/object/reading headers ;
- aucun renommage de route ni nouvelle capacité IA.

**Valeur :** réduit la dette avant tout nouvel écran.
**Risque :** faible si limité aux primitives et à la documentation/tests visuels.

### Sprint 9.7 — Mes créations et navigation Creator

- renommer les libellés Teacher « Mes formations » en « Mes créations » là où le contexte est créatif ;
- regrouper création manuelle et Forge sous « Nouvelle création » dans la navigation ;
- supprimer l'entrée « Leçons » redondante ou la déplacer dans le cockpit après vérification des usages ;
- faire de l'ouverture du cockpit l'action primaire des cartes ;
- conserver toutes les routes.

**Valeur :** convergence immédiate sans mutation métier.
**Risque :** moyen, surtout navigation active et repères existants.

### Sprint 9.8 — Forge Home / entrée par intention

- faire évoluer `/app/teacher` vers « Qu'allez-vous construire aujourd'hui ? » ;
- offrir mode guidé Forge et mode manuel ;
- utiliser l'intention pour préremplir le Course Brief, sans génération automatique ;
- présenter les créations récentes et l'action Reprendre ;
- ne pas introduire recommandations ou communauté fictives.

**Valeur :** forte, car la promesse Forge devient le premier geste.
**Risque :** moyen, contrôlé par réutilisation des flux existants.

### Sprint 9.9 — Cockpit unifié

- harmoniser le shell entre edit et builder ;
- rendre Informations, Parcours, Sources, Forge AI et Publication prévisibles ;
- mutualiser les états de proposition/diff/décision ;
- préserver preview, checklist, ownership et RLS ;
- éviter de déplacer toutes les fonctionnalités dans un seul composant.

**Valeur :** forte pour les utilisateurs fréquents.
**Risque :** élevé ; nécessite tests de non-régression Teacher complets.

### Sprint 10.0 — Learner foundation

- renommer Mes formations en Mes apprentissages ;
- recentrer le dashboard sur Reprendre ;
- clarifier progression et CTA de fin d'étape ;
- consolider la persistance notes/favoris/progression ;
- valider le responsive de la leçon sans copilote.

**Valeur :** améliore le cœur LMS sans dépendre d'une nouvelle IA.
**Risque :** moyen.

### Sprint 10.1 — Admin Pilotage réel

- remplacer les fixtures par des read models Supabase autorisés ;
- livrer un catalogue éditorial minimal sur données réelles ;
- distinguer consultation, publication et administration des rôles ;
- n'ajouter Qualité / IA qu'avec définitions, requêtes et limites documentées.

**Valeur :** rend le pilotage crédible.
**Risque :** élevé côté permissions et gouvernance des données.

### Sprint 10.2+ — Learner Copilot, après cadrage dédié

- contrat de contexte borné à l'étape ;
- sources et citations ;
- panneau repliable desktop/mobile ;
- absence de mutation de progression ou contenu ;
- expérimentation AI Elements composant par composant si elle réduit réellement le code.

**Valeur :** différenciation Forge.
**Risque :** élevé sur exactitude, coût, sécurité pédagogique et UX.

### Critères de passage entre sprints

- aucun lien profond existant cassé ;
- parcours Teacher manuel et Forge AI toujours accessibles ;
- une seule action primaire par écran ;
- états loading/empty/error/no suggestion testés ;
- distinction données réelles/démo explicite ;
- navigation clavier et responsive vérifiés ;
- aucune extension du modèle Supabase motivée uniquement par le vocabulaire.

## Conclusion

1. **Learnit peut-il évoluer vers Forge sans réécriture globale ?** Oui. Les services, routes, modèles et principaux composants peuvent être conservés ; la convergence porte d'abord sur l'architecture d'information, le shell et les primitives d'interaction.
2. **Quel écran doit être refondu en premier ?** Le dashboard Teacher `/app/teacher`, transformé progressivement en Home Forge orientée intention. C'est le point de valeur le plus visible avec le moins de dépendances métier nouvelles.
3. **Quelle dette UX doit être traitée avant le prochain développement fonctionnel ?** La hiérarchie de navigation et d'actions : vocabulaire rôle/objet incohérent, entrées de création concurrentes, actions de cours fragmentées et patterns Forge AI non mutualisés. Le glossaire et les primitives Forge sont la première fondation.
4. **Les captures Forge constituent-elles une direction cohérente avec le produit réel ?** Oui pour Créer / Apprendre / Piloter, l'entrée par intention, le cockpit, le copilote contextuel et la validation humaine. Non comme périmètre littéral : communauté, recommandations, métriques Admin et copilote Learner dépassent les capacités réelles actuelles et doivent rester reportés.
