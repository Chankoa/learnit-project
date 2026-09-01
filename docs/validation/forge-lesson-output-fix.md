# Sprint 10.T2.F — Forge Lesson Generation Output Fix

## Chaîne d'exécution

Les actions visibles `Générer le contenu` et `Améliorer le contenu` passent par la même chaîne :

```text
ForgeLessonAssistant
→ generateLessonWithForgeAction
→ generateForgeLessonContent
→ lesson_generate | lesson_improve
→ buildLessonContentUserPrompt
→ getForgeAIProvider
→ OpenAI Responses API
→ JSON Schema strict
→ validation métier Forge
→ proposition à valider humainement
```

`lesson_generate` utilise un budget de 3 600 tokens et `lesson_improve` un budget de 3 000 tokens.
Ces valeurs sont transmises au provider après application du plafond global, fixé à 4 000 tokens par
défaut. Aucun alias ni budget par défaut intermédiaire ne les remplace.

## Cause

Le diagnostic `finishReason = length` / `output_token_limit` est déclenché avant l'accès au
Structured Output. Il ne s'agit donc ni d'un parsing JSON ni d'un rejet du schéma métier.

Trois facteurs se cumulaient :

- `max_output_tokens` couvre à la fois la sortie visible et les tokens de raisonnement ;
- `gpt-5-mini` utilisait l'effort de raisonnement par défaut du provider ;
- le prompt demandait un objet pédagogique complet sans gabarit concret et annonçait à tort un
  plafond de 3 600 tokens même pour `lesson_improve`, réellement limité à 3 000 tokens.

L'amélioration reconstruisait par ailleurs une proposition complète sans demander explicitement de
préserver une longueur comparable, ce qui favorisait l'inflation du contenu existant.

## Correctif

Les budgets restent inchangés. Pour `lesson_generate` et `lesson_improve` uniquement :

- la durée de la leçon pilote un gabarit de 2–3, 3–4 ou 4–5 sections ;
- introduction, paragraphes et points à retenir sont bornés ;
- exemple, code, encadré et approfondissement doivent rester vides s'ils n'apportent pas de valeur ;
- la génération doit rester complète mais concise ;
- l'amélioration doit conserver les parties utiles, éviter les doublons et ne pas augmenter
  systématiquement la longueur ;
- les modèles GPT-5 utilisent `reasoning: low` sur ces deux actions.

La politique d'effort est transmise par le paramètre portable `reasoning` avec AI SDK et par
`reasoning: { effort: "low" }` sur le payload Responses direct. Les autres actions et les modèles non
GPT-5 conservent leur comportement antérieur.

Le JSON Schema, la validation AI SDK, la validation métier Forge, le contrôle humain et la
persistance restent inchangés.

Références techniques :

- [OpenAI Responses API — `max_output_tokens` et `reasoning`](https://platform.openai.com/docs/api-reference/responses-streaming/response/refusal?lang=python) ;
- AI SDK 7 installé, documentation locale `node_modules/ai/docs/03-ai-sdk-core/26-reasoning.mdx`.

## Retry

Aucun retry automatique n'est ajouté. Après réduction de la cause à la source, un second appel
automatique doublerait potentiellement le coût et compliquerait l'attribution des tokens et des
sources. Le bouton utilisateur `Réessayer` demeure disponible si le provider retourne encore
`output_token_limit`.

## Validation attendue en production

La clôture requiert deux générations authentifiées sur une leçon de 35–45 minutes de
`Préparation pratique au permis VTC` :

1. `Générer le contenu` ;
2. `Améliorer le contenu` sur un Markdown existant.

Pour chaque appel, relever le modèle, les tokens d'entrée/sortie/total, le `finishReason`, la durée,
le statut `ai_generations` et les références `ai_generation_sources`. Une réponse locale ou mock ne
suffit pas à marquer 10.T2.F comme fermé.
