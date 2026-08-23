# Sprint 9.6 — Fondations UX & primitives Forge AI

Ce document transforme l'audit 9.5 en conventions applicables sans modifier l'architecture métier. Il accompagne les primitives présentes dans `components/app/ForgeAIPrimitives.tsx` et leur premier consommateur complet, `ForgeModuleRevision`.

## Principles

1. **Consolider avant de refondre.** Réutiliser les routes, services, composants et tokens existants.
2. **L'intention avant la technique.** L'interface parle de créer, apprendre, analyser et appliquer ; provider, modèle et tables restent secondaires.
3. **L'IA propose, l'humain décide.** Une proposition n'est jamais une mutation implicite.
4. **Contexte borné.** Toute surface Forge nomme l'objet analysé et la portée autorisée.
5. **Absence de suggestion valide.** Une analyse peut conclure qu'aucune correction n'est nécessaire.
6. **Un état, une suite claire.** Loading, erreur, stale et applied conduisent chacun à des actions explicites.
7. **Une action primaire par contexte.** Le caractère « IA » ne rend pas automatiquement un bouton primaire.
8. **Accessibilité fonctionnelle.** Les états sont annoncés, nommés et distingués autrement que par la couleur.
9. **Responsive par responsabilité.** Contenu principal prioritaire ; navigation et copilote se replient avant de comprimer la lecture.
10. **Pas de second design system.** Les primitives utilisent les tokens, boutons et conventions SCSS existants.

## Glossary

Le glossaire complet se trouve dans [`docs/ux/forge-glossary.md`](./forge-glossary.md).

Résumé des décisions structurantes :

| Technique | UX Creator | UX Learner | UX Admin |
| --- | --- | --- | --- |
| `course` | création ou parcours | parcours / apprentissage | formation |
| `teacher` | créateur | — | enseignant si nécessaire à la gouvernance |
| `lesson` | leçon | étape ou leçon selon le contexte | leçon |
| AI output | proposition Forge | réponse/aide Forge future | génération IA en observabilité |
| `course_analysis` | analyse Forge | — | analyse de cours en observabilité |

Les rôles, types, tables, repositories et URLs ne sont pas renommés pour refléter ces libellés.

## Action hierarchy

### Primary

Action qui accomplit l'objectif immédiat de la vue. Une seule action primaire doit dominer un contexte visuel.

Exemples :

- Enregistrer les informations ;
- Publier la formation ;
- Importer la sélection en brouillon ;
- Appliquer une proposition déjà examinée ;
- Continuer ou reprendre une étape.

Convention : classe existante `btn btn-primary`. Une confirmation ou un garde-fou serveur peut rester nécessaire.

### Secondary

Action importante mais facultative, réversible ou préparatoire.

Exemples :

- Analyser avec Forge ;
- Prévisualiser ;
- Ajouter une source ;
- Régénérer ;
- Ignorer une proposition.

Convention : `btn btn-secondary`. `ForgeAIAction` utilise cette hiérarchie par défaut.

### Tertiary / navigation légère

Lien contextuel, retour, changement d'onglet ou action à faible engagement. Utiliser un lien texte, un bouton d'icône correctement nommé ou la navigation existante. Ne pas créer une troisième apparence pleine uniquement pour différencier un bouton.

### Destructive

Suppression, retrait irréversible ou dépublication. Le texte doit nommer la conséquence. La couleur danger ne remplace pas la confirmation ni le libellé. Le repository ne possède pas encore une primitive `.btn-danger` commune : sa création est reportée jusqu'à l'inventaire complet des suppressions du Sprint 9.7.

### AI action

« Analyser avec Forge » reste secondaire dans un module éditable, car « Enregistrer » est l'action métier dominante. Après apparition d'une proposition, « Appliquer » devient l'action primaire de la proposition, pas de toute la page.

Exceptions justifiées :

- « Analyser et générer » dans le Course Creator est primaire à l'intérieur du formulaire, car il accomplit l'étape courante ;
- « Importer en brouillon » devient primaire après sélection ;
- aucune action IA ne concurrence « Publier » dans le cockpit.

## Header patterns

L'audit n'a pas justifié une abstraction supplémentaire. Trois composants existants couvrent des responsabilités différentes.

### Page header

Composant : `AppPageHeader`.

```text
Contexte / eyebrow
Titre de page
Description
Actions de page
```

Usage : listes, dashboards, formulaires d'entrée. Les actions concernent la page entière.

### Object / cockpit header

Composant : `TeacherCourseCockpit` dans son rôle actuel.

```text
Statut + nom de l'objet
Métadonnées
Preview / publication / raccourcis
```

Usage : création sélectionnée. Le statut et l'identité restent visibles ; les sous-espaces sont accessibles sans multiplier les titres de page.

### Reading header

Composant : `LessonHeader`, complété par le header de `LearningShell`.

```text
Retour / fil d'Ariane
Type + durée + progression
Titre et description
Objectifs
```

Usage : lecture et apprentissage. La largeur et la hiérarchie de contenu priment sur les actions de gestion.

### Règle d'extraction

Ne créer un header partagé que lorsque deux écrans ont la même sémantique, le même niveau de titre et les mêmes contraintes responsive. Une simple ressemblance visuelle ne suffit pas.

## Forge AI interaction model

Le modèle commun est :

```text
Contexte borné
    ↓
Action Forge secondaire
    ↓
État explicite
    ↓
Proposition structurée
    ├── actuel
    ├── proposition
    └── pourquoi
    ↓
Décision humaine
    ├── ignorer
    └── appliquer
```

### Primitives livrées

| Primitive | Responsabilité | Ne fait pas |
| --- | --- | --- |
| `ForgeAIPanel` | Nomme contexte, portée et action Forge | Aucun appel réseau, aucune gestion métier |
| `ForgeAIAction` | Uniformise secondary par défaut, loading, disabled et `aria-busy` | Ne choisit pas le provider ni l'opération |
| `ForgeAIStatus` | Présente et annonce les sept états | Ne déduit pas l'état depuis une exception |
| `ForgeAIProposal` | Encadre une suggestion à vérifier | N'applique aucune donnée |
| `ForgeAIComparison` | Montre actuel et proposé | N'interprète pas le schéma métier |
| `ForgeAIReason` | Isole la justification | Ne remplace pas la validation serveur |
| `ForgeAIDecisionBar` | Regroupe les décisions humaines | Ne confirme ni n'exécute l'application |

Les primitives restent purement présentationnelles. Les Server Actions, `forgeAiService`, validations, ownership, RLS et repositories restent inchangés.

## Forge AI states

| État | Libellé de base | Intention visuelle | Comportement | Actions disponibles |
| --- | --- | --- | --- | --- |
| `idle` | Forge est prêt. | neutre | Aucun appel en cours, contexte lisible | Lancer l'analyse |
| `loading` | Forge analyse le contenu… | accent Forge + spinner | Double soumission bloquée, région annoncée | Aucune action concurrente |
| `success` | Proposition Forge prête à être vérifiée. | accent Forge | Proposition présente, aucune mutation | Vérifier, éditer si permis, ignorer, appliquer |
| `no-suggestion` | Aucune correction nécessaire. | succès | Résultat valide sans proposition artificielle | Relancer seulement si le contexte change |
| `error` | L'analyse Forge n'a pas abouti. | danger | Message exploitable, proposition invalide absente | Réessayer après correction du problème |
| `stale` | Cette proposition n'est plus à jour. | warning | Application refusée, proposition conservée pour compréhension | Relancer Forge ; aucune application |
| `applied` | Proposition Forge appliquée. | succès | Mutation serveur confirmée, UI rafraîchie | Continuer l'édition ou prévisualiser |

Les libellés peuvent être contextualisés, mais la sémantique et les actions restent stables.

### Détection stale dans Forge Revision

Le repository Supabase compare déjà le titre et la description sources pendant l'`UPDATE`. Si aucune ligne ne correspond, il renvoie : « Le module a changé depuis l'analyse. Relancez Forge avant d'appliquer la proposition. » Le composant classe cette réponse comme `stale`; aucun changement n'a été apporté au contrat serveur.

## Proposal pattern

Pattern de base :

```text
FORGE AI
Suggestion

Actuel                    Proposition
[valeurs sources]         [valeurs proposées]

Pourquoi ?
[justification courte]

                    [Ignorer] [Appliquer]
```

Règles :

- afficher la portée avant la proposition ;
- ne montrer que les champs susceptibles de changer ;
- conserver les valeurs sources reçues avec la proposition pour la protection stale ;
- autoriser l'absence de bloc Actuel pour une génération sans remplacement, par exemple un nouveau parcours ;
- rendre « Pourquoi ? » distinct du contenu proposé ;
- placer la décision après le contenu, dans l'ordre de lecture ;
- rappeler dans le contexte qu'aucune modification n'est automatique ;
- appliquer uniquement via une action serveur validée.

`ForgeModuleRevision` consomme le pattern complet. L'assistant de leçon garde son éditeur spécialisé et le Course Creator garde sa sélection hiérarchique : ils partagent l'état commun sans perdre leurs besoins propres.

## Feedback

### Convention

| Feedback | Composant / convention | Durée |
| --- | --- | --- |
| État dans une opération Forge | `ForgeAIStatus` inline | Persistant tant que pertinent |
| Notification globale après navigation ou mutation indépendante | `ToastProvider` | Temporaire, dismissible |
| Erreur de champ | message près du champ + association label | Jusqu'à correction |
| Empty state de page/liste | `AppEmptyState` | Persistant |
| Confirmation à conséquence | dialogue ou confirmation explicite | Jusqu'à décision |

Une erreur Forge reste dans le panneau concerné. Un toast seul n'est pas suffisant pour une erreur qui empêche l'application. Le succès de génération est distinct du succès d'application.

### Messages

- commencer par le résultat : « Proposition Forge appliquée » ;
- indiquer l'action suivante pour stale/error ;
- ne pas exposer clé, endpoint, stack ou payload provider ;
- ne pas présenter `no-suggestion` comme un échec ;
- employer « proposition Forge » plutôt que « contenu généré par IA » côté produit.

## Responsive rules

Les règles s'alignent sur les breakpoints déjà dominants du repository.

| Palier | Règle |
| --- | --- |
| Desktop large, `> 1180px` | Trois responsabilités possibles : navigation bornée, contenu dominant, copilote secondaire. La colonne de lecture garde une largeur minimale confortable. |
| Desktop/tablet, `761–1180px` | Deux zones maximum. Le copilote devient panneau secondaire, drawer ou bloc sous le contenu. |
| Mobile, `≤ 760px` | Une colonne. Header et actions s'empilent ; comparaison Actuel/Proposition passe en séquence ; boutons de décision pleine largeur. |
| Mobile compact, `≤ 520px` | Réduire métadonnées et densité, conserver des cibles d'au moins 44 px et éviter les actions côte à côte. |

### Primitives Forge

- `ForgeAIComparison` passe de deux colonnes à une colonne sous 760 px ; Actuel précède Proposition.
- Le header de `ForgeAIPanel` s'empile et son action occupe la largeur disponible.
- La barre de décision s'empile en boutons pleine largeur.
- Les valeurs longues utilisent des conteneurs `min-width: 0` ; le contenu ne doit pas imposer de largeur fixe.
- Une proposition complexe reste inline dans un éditeur. Un futur copilote transversal pourra utiliser un drawer, mais pas dans ce sprint.

### Futur layout Learner

Le layout `navigation | contenu | copilote` n'est autorisé que sur desktop large. Le copilote doit être repliable et ne jamais être requis pour lire, progresser ou naviguer. Sur tablet il devient drawer latéral ; sur mobile, sheet ou bloc inline déclenché explicitement.

## Accessibility

- `ForgeAIPanel` relie la région à son titre avec `aria-labelledby` et un identifiant stable via `useId`.
- `ForgeAIStatus` utilise `role="alert"` pour l'erreur et `role="status"` pour les autres états.
- L'icône complète le texte ; aucune information ne dépend uniquement de la couleur.
- `ForgeAIAction` expose `aria-busy`, désactive la double soumission et conserve un libellé de loading explicite.
- Les boutons conservent les styles de focus globaux et une hauteur minimale de 44 px.
- `ForgeAIProposal` est reliée à son titre ; la barre de décision possède un nom accessible.
- L'ordre DOM reste contexte, état, proposition, raison, décisions.
- La confirmation d'application du module reste explicite.
- Les animations de spinner respectent la règle globale `prefers-reduced-motion` déjà présente.

Points à surveiller lors des futurs sprints : focus dans les drawers/sheets, retour de focus après fermeture, annonce après navigation et navigation clavier complète des tabs du cockpit.

## Tokens

### Réutilisés sans modification

| Besoin | Tokens existants |
| --- | --- |
| Espacement | `--space-1` à `--space-24` |
| Rayon | `--radius-xs` à `--radius-pill` |
| Bordures | `--border-soft`, `--border-strong` |
| Surfaces | `--surface-bg`, `--surface-panel`, `--surface-card`, `--surface-muted`, `--surface-elevated` |
| Forge / action | `--accent-primary`, `--accent-primary-strong` |
| Succès | `--status-success` |
| Warning / stale | `--status-warning` |
| Erreur / destructive | `--status-danger` |
| Information | `--status-info` |
| Élévation / focus | `--shadow-xs` à `--shadow-lg`, `--shadow-focus` |
| Typographie | échelle `--text-*`, poids et interlignages existants |

Les surfaces d'état sont dérivées avec `color-mix` à partir des tokens sémantiques. Aucun token Forge parallèle n'a été ajouté. La faible différence actuelle entre `radius-md`, `radius-lg` et `radius-xl` est documentée mais ne justifie pas une migration globale dans ce sprint.

## Component inventory

### Créés

- `components/app/ForgeAIPrimitives.tsx` : famille de présentation Forge AI.

### Consolidés

- styles génériques `.forge-ai-panel`, `.forge-ai-status`, `.forge-ai-proposal`, `.forge-ai-comparison`, `.forge-ai-reason`, `.forge-ai-decision-bar` dans `styles/app.scss` ;
- feedback Forge inline partagé par Revision, Course Creator et assistant de leçon.

### Refactorés

- `ForgeModuleRevision` : consommateur complet, incluant loading, no-suggestion, error, stale, applied, comparaison, raison et décisions ;
- `ForgeLessonAssistant` : adoption du statut commun et vocabulaire « proposition Forge » ;
- `ForgeCourseCreator` : adoption du statut commun dans la preview, workflow et sélection inchangés.

### Conservés

- `AppPageHeader`, `TeacherCourseCockpit`, `LessonHeader` : responsabilités différentes, pas d'abstraction forcée ;
- `ToastProvider`, `AppEmptyState`, boutons et champs existants ;
- Server Actions, services, providers, validations et repositories Forge AI.

### Catalogue

Aucun Storybook n'est présent et aucun n'a été ajouté. Les écrans réels restent le catalogue de validation : builder module, assistant leçon et Course Creator.

## Deferred patterns

- navigation Creator et libellé global « Mes créations » : Sprint 9.7 ;
- Home Forge orientée intention : Sprint 9.8 ;
- unification physique du cockpit : Sprint 9.9 ;
- primitive destructive globale après inventaire des suppressions ;
- drawers/sheets et copilote Learner ;
- streaming, citations, tool calls et conversation ;
- AI Elements : aucune installation avant un cas réel réduisant la dette ;
- Storybook ou catalogue dédié : à reconsidérer lorsque le nombre de primitives partagées le justifie ;
- migration ou renommage Supabase : hors de ce socle UX.

## Readiness for Sprint 9.7

Le Sprint 9.7 peut s'appuyer sur ces règles à condition de :

1. conserver les routes et permissions actuelles ;
2. appliquer le glossaire par contexte, sans remplacement global aveugle ;
3. réduire les CTA concurrents avant de changer leur apparence ;
4. utiliser les trois patterns de header existants ;
5. ne pas étendre les primitives Forge AI à des composants qui n'ont pas le même modèle d'interaction ;
6. tester navigation active, responsive et accès clavier après chaque changement visible.
