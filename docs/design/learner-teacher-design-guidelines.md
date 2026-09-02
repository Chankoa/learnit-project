# LearnIt / Forge — Learner & Teacher Design Guidelines

## Objet

Ce document définit les principes visuels et UX communs aux espaces Learner et Teacher / Creator.

Il complète le Design System 1.1 sans le remplacer.

Il sert de référence aux futurs sprints UI.

---

## Références obligatoires

Avant toute modification UI, inspecter :

- `docs/design/ds-1.1-reference-light.png`
- `docs/design/ds-1.1-reference-dark.png`
- `docs/design/learner-teacher-convergence-reference.png`
- `docs/design/design-system-1.1.md`
- `docs/ux/forge-learner-foundations-audit.md`

---

## Ordre de priorité

1. comportements et données réels du produit ;
2. Design System 1.1 et tokens existants ;
3. maquette Learner / Teacher comme direction de convergence ;
4. références Light / Dark comme guide de hiérarchie visuelle ;
5. audits UX existants.

Les PNG ne doivent pas être reproduits pixel-perfect.

Ils servent de référence pour :
- hiérarchie ;
- densité ;
- proportions ;
- navigation ;
- composition ;
- cohérence inter-espaces.

---

## Principes de convergence

Les deux espaces partagent :

- sidebars rétractables ;
- rails icon-only ;
- headers de contexte ;
- breadcrumbs ;
- timelines ;
- badges ;
- icon buttons ;
- drawers ;
- panneaux Forge ;
- patterns responsive ;
- modes Light / Dark.

Réutiliser les mêmes primitives lorsque cela est pertinent.

Les contrôles contextuels Structure/Parcours et Forge utilisent les mêmes icônes et primitives dans les espaces Teacher et Learner. Le sens varie selon le rôle, pas le langage visuel.

---

## Différence d’intention

### Teacher / Creator

Priorité :
- édition ;
- contrôle ;
- décision ;
- publication ;
- actions contextuelles.

L’interface peut être plus dense et orientée outil.

### Learner

Priorité :
- lecture ;
- compréhension ;
- progression ;
- continuité pédagogique.

L’interface doit rester plus calme, plus respirante et centrée sur le contenu.

---

## Architecture spatiale

### Teacher

`Structure | Éditeur | Forge`

### Learner

`Parcours | Contenu | Forge`

Forge conserve un langage visuel commun mais adapte son rôle au contexte.

---

## Navigation

Le contexte courant doit toujours être explicite.

Préférer les retours nommés :

- `Retour au tableau de bord`
- `Retour à la formation`
- `Retour à la publication`

Éviter les boutons génériques ou les burgers lorsque l’action attendue est un retour contextuel.

---

## Timeline

La timeline représente un ordre ou une progression réelle.

Elle doit rester discrète.

- numéro = ordre ;
- check = terminé uniquement si donnée métier réelle ;
- badge = statut ;
- accent = élément actif.

Ne pas mélanger ces rôles.

---

## Forge AI

Forge est contextuel.

Le panneau doit afficher clairement :

- formation ;
- module ;
- leçon ;
- surface active ;
- sources disponibles / utilisées.

### Teacher

Forge aide à :
- analyser ;
- améliorer ;
- détecter les incohérences ;
- proposer des modifications.

### Learner

Forge aide à :
- expliquer ;
- clarifier ;
- reformuler ;
- illustrer ;
- vérifier la compréhension.

Il ne doit pas faire les exercices à la place de l’apprenant.

---

## Responsive

### Desktop

Les panneaux peuvent être persistants ou rétractables.

### Tablette

Préférer des drawers temporaires.

### Mobile

Une seule colonne principale.

Aucun rail permanent.

Structure / Parcours et Forge passent en drawers.

Les cibles tactiles doivent rester ≥ 44 px.

---

## Light / Dark

Utiliser exclusivement les tokens du Design System.

Ne pas créer deux implémentations parallèles.

Le violet reste la couleur système principale.

Le rose reste un accent éditorial ponctuel.

---

## Règle pour les futurs sprints

Tout sprint UI doit commencer par :

> Lire `docs/design/learner-teacher-design-guidelines.md` et respecter ses principes avant toute modification.

Toute divergence significative doit être :
- justifiée ;
- documentée ;
- intégrée au Design System si elle devient une règle récurrente.