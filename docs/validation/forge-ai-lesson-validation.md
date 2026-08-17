# Validation Forge AI - Leçon Flexbox, Grid et responsive

Date d'audit : 2026-08-17

Statut : **non terminé / bloqué avant test humain**

Ce document prépare la validation comparative Sprint 8.2.1. Il ne conclut pas sur la qualité pédagogique de Forge AI, car les prérequis d'exécution réelle ne sont pas réunis dans l'environnement disponible.

## Objectif du test

Vérifier si Forge AI transforme un brief pédagogique en leçon exploitable, puis mesurer l'apport du contexte documentaire.

Le test attendu compare :

- **TEST A - BRIEF ONLY** : génération sans source documentaire.
- **TEST B - BRIEF + RETRIEVAL** : même brief avec 2 à 3 sources TXT/Markdown.

## Cas cible

Cours : Formation Création Web

Module : CSS, responsive et composants

Leçon cible : Flexbox, Grid et responsive

Observation Supabase :

- La formation `formation-creation-web` existe en production.
- Le module `css-responsive` existe.
- La leçon `flexbox-grid-responsive` existe avec une durée de 70 minutes.
- La formation seed a `teacher_id = null` dans l'état inspecté, donc elle n'est pas éditable par un Teacher réel via le Teacher Studio actuel.
- Une formation Teacher réelle existe : `Formation Test`, propriétaire `teacher`, mais elle ne correspond pas au squelette demandé.
- Aucune ligne `course_sources` n'est présente au moment de l'audit.
- Les dernières lignes `ai_generations` utilisent `provider = mock` et `model = forge-mock-v1`.

Conséquence : pour un test valide, il faut créer une copie draft appartenant au Teacher, ou recréer le squelette demandé dans une formation Teacher-owned.

## Course Brief

Public :

Débutant en développement web ayant déjà acquis les bases HTML et CSS.

Objectif :

À la fin de la leçon, l'apprenant doit être capable de construire une mise en page responsive simple en utilisant Flexbox et Grid et de choisir l'outil adapté à la situation.

Durée cible :

60 à 75 minutes.

Prérequis :

- structure HTML ;
- sélecteurs CSS ;
- box model ;
- propriétés CSS courantes.

Notions attendues :

- flex container / flex items ;
- axe principal / axe secondaire ;
- `justify-content` / `align-items` ;
- `gap` ;
- CSS Grid ;
- colonnes / lignes ;
- unité `fr` ;
- `repeat()` ;
- `minmax()` ;
- `auto-fit` / `auto-fill` ;
- media queries ;
- principe mobile-first.

Mise en pratique attendue :

Transformer une grille fixe de cartes en interface responsive.

## Sources prévues pour TEST B

Le test doit privilégier TXT ou Markdown, car l'extraction PDF complète n'est pas encore disponible.

Source locale existante :

- `public/resources/kit-flexbox-grid.txt` : utilisable, mais trop courte pour servir de référence pédagogique principale.

Sources recommandées à téléverser via l'UI Teacher :

1. `flexbox-notions-debutant.md`
   - flex container / flex items ;
   - main axis / cross axis ;
   - `justify-content`, `align-items`, `gap` ;
   - cas d'usage : aligner une barre d'actions ou une liste de cartes.

2. `css-grid-responsive.md`
   - lignes, colonnes, `fr` ;
   - `repeat()`, `minmax()` ;
   - différence `auto-fit` / `auto-fill` ;
   - cas d'usage : grille de cartes responsive.

3. `atelier-cartes-responsive.md`
   - grille fixe initiale ;
   - approche mobile-first ;
   - media queries ;
   - critères de réussite de l'exercice.

## Préconditions d'exécution réelle

Le test ne doit pas être exécuté avec le provider mock.

Variables serveur nécessaires :

```txt
AI_PROVIDER=openai-compatible
AI_MODEL=<modele-json-compatible>
AI_API_KEY=<cle-secrete-serveur>
AI_BASE_URL=<optionnel>
```

Comptes nécessaires :

- un compte Teacher réel permettant de créer/éditer une formation draft ;
- un compte Learner réel permettant de consulter la leçon et la progression ;
- un accès email/session si le test nécessite reconnexion.

Environnement recommandé :

- production Netlify ou preview isolée ;
- Supabase production uniquement si les données de test peuvent rester visibles ;
- sinon branche Supabase / environnement de test.

## TEST A - BRIEF ONLY

Statut : **non exécuté**

Raison :

- provider IA réel non configuré dans `.env.local` ;
- le provider actif par défaut est `mock` ;
- le mock ne génère pas une leçon pédagogique riche et ne permet pas une évaluation qualitative fiable.

Résultat attendu à conserver lors du test :

- sortie complète Markdown ;
- structured output brut si disponible ;
- absence de source citée ;
- ligne `ai_generations` avec `prompt_type = lesson_generate` ou mode équivalent ;
- statut draft, sans publication.

Scores :

| Critère | Score | Notes |
| --- | ---: | --- |
| Exactitude technique | N/A | Test non exécuté |
| Respect du niveau débutant | N/A | Test non exécuté |
| Progression pédagogique | N/A | Test non exécuté |
| Clarté des explications | N/A | Test non exécuté |
| Couverture des notions demandées | N/A | Test non exécuté |
| Pertinence des exemples | N/A | Test non exécuté |
| Qualité de l'exercice | N/A | Test non exécuté |
| Cohérence avec 60-75 min | N/A | Test non exécuté |
| Structure / lisibilité | N/A | Test non exécuté |
| Exploitabilité sans réécriture importante | N/A | Test non exécuté |

Points forts : non évalué.

Points faibles : non évalué.

Erreurs factuelles : non évalué.

Manques : non évalué.

Modifications humaines nécessaires : non évalué.

## TEST B - BRIEF + RETRIEVAL

Statut : **non exécuté**

Raison :

- aucune source `course_sources` n'est présente en base ;
- provider IA réel non configuré ;
- le mock cite des sources de façon mécanique à partir des IDs et ne prouve pas l'utilisation sémantique des extraits.

Résultat attendu à conserver lors du test :

- mêmes données que TEST A ;
- sources téléversées ;
- snippets récupérés par Retrieval V1.5 ;
- `sourceReferences` visibles dans la proposition ;
- lignes `ai_generation_sources` correspondant uniquement aux sources réellement référencées.

Scores :

| Critère | Score | Notes |
| --- | ---: | --- |
| Exactitude technique | N/A | Test non exécuté |
| Respect du niveau débutant | N/A | Test non exécuté |
| Progression pédagogique | N/A | Test non exécuté |
| Clarté des explications | N/A | Test non exécuté |
| Couverture des notions demandées | N/A | Test non exécuté |
| Pertinence des exemples | N/A | Test non exécuté |
| Qualité de l'exercice | N/A | Test non exécuté |
| Cohérence avec 60-75 min | N/A | Test non exécuté |
| Structure / lisibilité | N/A | Test non exécuté |
| Exploitabilité sans réécriture importante | N/A | Test non exécuté |
| Utilisation pertinente des sources | N/A | Test non exécuté |
| Traçabilité des informations | N/A | Test non exécuté |

Points forts : non évalué.

Points faibles : non évalué.

Erreurs factuelles : non évalué.

Manques : non évalué.

Modifications humaines nécessaires : non évalué.

## Vérification Retrieval prévue

À relever pendant TEST B :

- IDs et titres des sources récupérées ;
- extraits sélectionnés par le Retrieval Service ;
- `sourceReferences` affichées par Forge ;
- correspondance entre les extraits et le contenu généré ;
- absence de source inexistante ou non récupérée.

Critère de rejet :

Si Forge cite une source non présente dans les snippets récupérés, la proposition doit être classée comme non fiable, même si le contenu semble correct.

## Test "Modifier avec Forge AI"

Statut : **non exécuté**

Précondition :

Importer volontairement le meilleur résultat A ou B dans une leçon draft Teacher-owned.

Instruction de test :

> Analyse cette leçon et propose les améliorations nécessaires pour un public débutant, sans augmenter sa durée cible.

À vérifier :

- mode analyse non mutatif ;
- preview / diff visible ;
- sources affichées si réellement utilisées ;
- aucune modification automatique avant acceptation ;
- acceptation volontaire d'une proposition pertinente ;
- persistence après reload.

## Test Learner

Statut : **non exécuté**

À vérifier avec un compte Learner réel :

- rendu Markdown ;
- hiérarchie des titres ;
- longueur de la leçon ;
- lisibilité ;
- progression pédagogique ;
- ressources visibles ;
- navigation ;
- bouton de progression ;
- responsive.

Question centrale :

> Est-ce que je pourrais réellement utiliser cette leçon dans une formation destinée à des apprenants ?

Réponse actuelle : non déterminée.

## Anomalies techniques observées

1. Provider réel non configuré localement.
   - Cause probable : variables `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY` absentes de `.env.local`.
   - Impact : toute génération locale passe par `forge-mock-v1`.

2. Formation cible seed non éditable par Teacher.
   - Cause probable : `teacher_id = null` sur `formation-creation-web`.
   - Impact : le Teacher Studio ne peut pas modifier directement le squelette demandé.

3. Aucune source documentaire Forge présente.
   - Cause probable : aucun upload encore réalisé dans le bucket `course-sources`.
   - Impact : TEST B ne peut pas mesurer le retrieval.

4. Validation humaine non réalisée.
   - Cause : absence de session/identifiants Teacher et Learner dans l'environnement d'exécution.
   - Impact : le sprint ne peut pas être déclaré terminé.

## Hypothèses de causes si la qualité est insuffisante

À renseigner après exécution :

- modèle ;
- prompt ;
- Course Brief ;
- retrieval ;
- qualité des sources ;
- UI ;
- structured output ;
- architecture pédagogique.

## Décision

Classement : **non classé**

Le résultat ne peut pas être classé `A - convaincant`, `B - prometteur` ou `C - insuffisant` sans exécution réelle avec provider IA, sources et validation Teacher/Learner.

## Recommandation immédiate

Avant de choisir une nouvelle technologie, exécuter le test dans les conditions minimales suivantes :

1. Configurer un provider IA réel côté serveur.
2. Créer une formation draft Teacher-owned dédiée au test.
3. Ajouter la leçon `TEST A / TEST B - Flexbox, Grid et responsive`.
4. Téléverser 2 à 3 sources Markdown/TXT.
5. Générer A et B sans modification manuelle.
6. Remplir la grille comparative.
7. Tester l'insertion volontaire via `Modifier avec Forge AI`.
8. Tester le rendu Learner.

Chantier probable si le test révèle un écart : amélioration prompts / Course Brief avant RAG vectoriel ou extraction PDF.
