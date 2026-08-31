# Sprint 10.T1.F — Forge Structured Output Fix

## Incident

Les occurrences de production du 29 et 30 août 2026 concernent principalement :

- `course_improvement`, avec un budget de sortie historique de 1 800 tokens ;
- `lesson_improve`, avec un budget de sortie historique de 1 600 tokens.

Vercel enregistrait `AI SDK returned no structured output.` et `ai_generations` persistait
`structured_output_invalid`, sans tokens ni motif de fin. Le même déploiement a produit avec succès
des sorties `course_analysis`, ce qui exclut un défaut général de clé, de modèle ou d'endpoint.

## Cause racine

Avec `generateText({ output: Output.object(...) })`, AI SDK ne construit `result.output` que lorsque
la dernière étape se termine avec `finishReason === "stop"`. Forge accédait directement à
`result.output`. Lors d'une fin non normale, AI SDK levait donc `NoOutputGeneratedError`, ensuite
convertie sans distinction en `structured_output_invalid`.

Les actions défaillantes avaient les deux budgets les plus faibles parmi les générations structurées
longues. Avec `gpt-5-mini`, le plafond couvre également les tokens de raisonnement. La réponse était
donc interrompue avant que l'objet JSON complet puisse être validé. L'ancienne instrumentation ayant
supprimé le `finishReason`, la valeur historique brute ne peut pas être récupérée a posteriori ; la
conjonction des budgets, des actions concernées et du chemin AI SDK identifie une troncature comme
cause opérationnelle.

## Correctif

Forge inspecte désormais `result.finishReason` avant `result.output` :

- `length` devient `output_token_limit` avec usage et tokens ;
- `content-filter` devient `response_refusal` ;
- toute autre fin non `stop` devient `response_incomplete` ;
- `NoObjectGeneratedError` reste `structured_output_invalid` et distingue parsing JSON et validation
  de schéma ;
- `NoOutputGeneratedError` résiduel devient `response_empty`.

Les budgets ciblés passent à :

- `course_improvement` : 3 200 tokens ;
- `lesson_improve` : 3 000 tokens.

Le plafond global de 4 000 tokens, les autres actions et le rate limiting restent inchangés.

## Contrat provider

La production utilise :

```text
AI_PROVIDER=ai-sdk
@ai-sdk/openai
openai.responses("gpt-5-mini")
generateText()
Output.object()
jsonSchema()
OpenAI Responses API text.format.type=json_schema, strict=true
```

Il s'agit de JSON Schema strict et non du simple `json_object` mode. Après validation AI SDK, les
validateurs Forge restent appliqués avant toute utilisation métier ou persistance.

## Diagnostic sûr

En cas de rejet, les logs serveur peuvent maintenant contenir :

- étape (`finish_reason`, `json_parse`, `schema_validation`, `output_missing`) ;
- finish reason ;
- identifiant de réponse ;
- tokens ;
- clés racines, types et longueurs du JSON.

Aucune valeur générée, source, prompt, clé ou donnée utilisateur n'est journalisée.

## Validation

Tests automatisés :

```text
npx tsx --test tests/forge-structured-output.test.ts tests/forge-url-source.test.ts
```

Le script `scripts/verify-forge-structured-output.ts` réalise un appel OpenAI direct et ne journalise
que les métadonnées. Il nécessite une clé OpenAI valide dans son environnement d'exécution.

La clôture de 10.T1 requiert encore, après déploiement, une génération Teacher authentifiée avec la
source URL existante, puis la vérification de `ai_generations` et `ai_generation_sources`.
