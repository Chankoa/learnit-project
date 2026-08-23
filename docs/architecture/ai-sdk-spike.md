# Sprint 9.3 — Vercel AI SDK Architecture Spike

Date de l'audit : 23 août 2026.

## Périmètre et sources

Ce document décrit l'architecture réellement présente dans le dépôt au début du spike, puis le prototype ajouté. Les références d'API utilisées sont les documentations embarquées dans `ai@7.0.68` et `@ai-sdk/openai@4.0.44`, recoupées avec la documentation officielle :

- [AI SDK — Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) ;
- [AI SDK — Output](https://ai-sdk.dev/docs/reference/ai-sdk-core/output) ;
- [AI SDK — OpenAI provider](https://ai-sdk.dev/providers/ai-sdk-providers/openai).

Le spike ne met en place ni RAG vectoriel, ni tool calling, ni agent, ni publication automatique.

## 1. Architecture IA actuelle

```text
ForgeCourseCreator / ForgeLessonAssistant / ForgeCourseContextPanel
  -> Server Actions Forge
  -> lib/forge-ai/service.ts (contrat métier)
     -> Auth Teacher + ownership repository
     -> rate limit + normalisation des entrées
     -> retrieval optionnel des sources
     -> prompts Forge
     -> provider Forge sélectionné côté serveur
     -> validation métier Forge
     -> ai_generations (+ ai_generation_sources)
  -> proposition renvoyée à l'UI
  -> preview / diff / sélection humaine
  -> action d'import ou d'application explicite
  -> repositories Teacher
  -> Supabase sous RLS
```

Fichiers structurants :

- `lib/forge-ai/service.ts` : façade métier Forge AI ;
- `lib/forge-ai/provider.ts` : contrat provider, mock, adaptateurs OpenAI et schémas JSON ;
- `lib/forge-ai/config.ts` et `lib/config/runtime.ts` : configuration serveur ;
- `lib/forge-ai/prompts.ts` : system prompts et prompts utilisateur ;
- `lib/forge-ai/validation.ts` : parsing et règles de validation/normalisation Forge ;
- `lib/forge-ai/retrieval.ts` : contexte documentaire remplaçable ;
- `lib/forge-ai/generation-log.ts` : persistance des métadonnées ;
- `lib/forge-ai/rate-limit.ts` et `lib/forge-ai/token-budget.ts` : garde-fous ;
- `types/forge-ai.ts` : Course Brief, propositions et sélections ;
- `app/app/teacher/forge/actions.ts` : frontière Server Actions et messages d'erreur ;
- `components/app/ForgeCourseCreator.tsx` : brief, preview, sélection et import ;
- `components/app/ForgeLessonAssistant.tsx` et `components/app/ForgeCourseContextPanel.tsx` : autres consommateurs du même service.

Le dépôt possédait trois valeurs configurables avant le spike : `mock`, `openai-compatible` et `openai`. Le provider `openai` employait déjà `generateText()` de AI SDK, mais ajoutait le schéma au prompt et parsait encore `result.text` avec `JSON.parse`. Il ne constituait donc pas encore l'expérience de structured output demandée.

## 2. Flux Course Brief → preview → import

1. `ForgeCourseCreator` construit un `CourseBrief` avec sujet, domaine, niveaux, public, objectifs, prérequis, durée, contraintes et IDs de sources.
2. `generateForgeCourseProposalAction()` appelle `generateForgeCourseProposal()`.
3. Le service impose le rôle `teacher`, tronque et normalise le brief, vérifie les champs obligatoires puis applique le rate limit.
4. `getCourseContext()` vérifie les sources du Teacher et construit le contexte disponible.
5. `buildCourseStructureUserPrompt()` associe brief et contexte au system prompt Forge.
6. `getForgeAIProvider().generateJson()` exécute le provider sélectionné par `AI_PROVIDER`.
7. `validateForgeCourseProposal()` impose le modèle métier : titre, résumé, audience, niveau, objectifs, 1 à 6 modules et 1 à 6 leçons par module. Le serveur génère les `clientId` utilisés par l'UI.
8. Une génération réussie est inscrite dans `ai_generations`, et ses sources dans `ai_generation_sources`.
9. L'UI affiche la proposition, sélectionne initialement tous les modules/leçons, puis laisse le Teacher modifier cette sélection.
10. `importForgeCourseProposalAction()` renvoie la sélection au serveur. Le serveur revalide la proposition et ne conserve que les modules/leçons sélectionnés.
11. Les repositories créent le cours, ses modules et ses leçons. Modules et leçons sont explicitement `draft`; la publication n'est pas appelée.
12. Les sources du brief sont rattachées au cours et l'UI redirige vers le builder de brouillon.

## 3. Responsabilités de `forgeAiService`

Dans le code, ce service correspond aux exports de `lib/forge-ai/service.ts`, et non à une classe nommée littéralement `forgeAiService`. Il reste le contrat métier utilisé par l'application :

- contrôle du rôle Teacher et de l'ownership ;
- normalisation et limite de taille des entrées ;
- contrôle du rate limit ;
- construction du contexte et orchestration des prompts ;
- appel du contrat provider `generateJson()` ;
- validation métier systématique après le provider ;
- journalisation des succès et échecs ;
- filtrage des références de sources ;
- import/application explicite via les repositories.

Il ne délègue jamais au modèle le choix d'une opération SQL et ne publie pas automatiquement.

## 4. Responsabilités des providers actuels

Le contrat `ForgeAIProvider` accepte un type de prompt, l'entrée métier et les deux prompts. Il retourne un objet JSON inconnu, le provider/modèle, la durée et, si disponibles, les compteurs de tokens.

- `mock` fabrique des propositions déterministes sans réseau et permet de conserver la boucle produit hors credentials.
- `openai-compatible` construit directement un appel HTTP `POST /responses`, fournit un JSON Schema strict, interprète les statuts/réponses OpenAI et parse le JSON.
- `openai` utilise `@ai-sdk/openai` et `generateText()`, mais conservait avant ce spike une instruction JSON dans le prompt et un parsing manuel.
- `ai-sdk` (prototype) utilise `@ai-sdk/openai`, `generateText()` et `Output.object()` avec un `jsonSchema()` validant. Il convertit les erreurs AI SDK dans la taxonomie `ForgeAIProviderError`.

Les providers n'accèdent ni à Supabase, ni à l'identité du Teacher, ni aux repositories.

## 5. Validation des sorties

La validation est volontairement en deux étages pour `ai-sdk` :

1. AI SDK transmet le JSON Schema au modèle, parse la réponse et appelle la fonction de validation de `jsonSchema()` ; une sortie illisible ou invalide devient une erreur structurée AI SDK.
2. `service.ts` appelle encore le validateur Forge correspondant avant journalisation réussie ou écriture métier.

Les fonctions de `lib/forge-ai/validation.ts` restent l'autorité métier. Elles imposent les champs essentiels, bornent les listes et durées, créent les identifiants client et fabriquent le Markdown de leçon côté serveur. AI SDK n'est donc jamais une autorisation d'écriture.

## 6. Persistance `ai_generations`

`supabase/migrations/20260817075543_forge_ai_generations.sql` crée la table et ses RLS Teacher. `supabase/migrations/202608210001_ai_generation_prompt_types.sql` ajoute les compteurs de tokens et étend les types de prompts.

Les métadonnées enregistrées sont : contexte, type de prompt, provider, modèle, statut, durée, code d'erreur, timestamps et tokens d'entrée/sortie/total lorsqu'ils existent. Ni prompt, ni contenu généré, ni clé ne sont persistés. La colonne texte `provider` accepte déjà `ai-sdk`; aucune migration n'est nécessaire.

`course_sources` et `ai_generation_sources` sont créées par `supabase/migrations/20260817083313_course_sources.sql`. Le Storage `course-sources` est privé et les policies imposent l'identité Teacher.

## 7. Points de couplage OpenAI

- variables `OPENAI_API_KEY`, `OPENAI_MODEL` et `AI_BASE_URL` dans `lib/config/runtime.ts` ;
- package `@ai-sdk/openai` ;
- choix explicite de `openai.responses(model)` ;
- payload et parsing spécifiques Responses API dans `openai-compatible` ;
- messages et diagnostics orientés OpenAI dans `provider.ts` ;
- schémas stricts compatibles avec les contraintes Structured Outputs d'OpenAI.

Le nom métier du provider expérimental est `ai-sdk`, mais son adaptateur de modèle reste OpenAI pour comparer le même modèle et la même API de transport. Tester un autre constructeur AI SDK pourra être une extension séparée sans modifier l'UI ou le service.

## 8. Point d'intégration recommandé

Le point recommandé et retenu est la factory `getForgeAIProvider()` dans `lib/forge-ai/provider.ts`. Elle préserve le contrat `generateJson()` et garde AI SDK sous la frontière serveur. Le service et les composants n'importent aucun symbole de `ai` ou `@ai-sdk/openai`.

## 9. Fichiers impactés

Impact minimal du prototype :

- `lib/config/runtime.ts` : valeur `ai-sdk` autorisée ;
- `lib/forge-ai/provider.ts` : adaptateur structured output et mapping d'erreurs ;
- `.env.example` : provider expérimental documenté ;
- `docs/forge-ai.md` : inventaire des providers ;
- `docs/architecture/ai-sdk-spike.md` : audit, résultats et décision.

Aucun composant UI, Server Action, repository ou schéma Supabase n'a besoin d'être modifié.

## 10. Risques de régression

- divergence entre JSON Schema et validateurs Forge si l'un évolue sans l'autre ;
- différences de support des structured outputs selon le modèle ou une base URL compatible ;
- erreur AI SDK enveloppée dans plusieurs causes et classification imparfaite ;
- double validation intentionnelle pouvant normaliser deux fois la même sortie ;
- budget de sortie trop faible pour un parcours complet ;
- absence de credentials empêchant une mesure réelle de qualité/latence/coût ;
- rate limit en mémoire non fiable sur plusieurs instances serverless ;
- streaming partiel non validable et plus complexe à raccorder aux Server Actions actuelles.

## 11. Plan minimal d'implémentation

1. Ajouter `ai-sdk` à la configuration serveur sans changer la valeur par défaut.
2. Réutiliser les packages déjà installés, les prompts, JSON Schemas et validateurs Forge.
3. Implémenter `generateText({ output: Output.object(...) })` dans un adaptateur respectant `ForgeAIProvider`.
4. Mapper les erreurs de structured output, HTTP/retry et timeout vers `ForgeAIProviderError`.
5. Conserver la validation du service, la preview, la sélection et l'import draft inchangés.
6. Vérifier les trois providers demandés, typecheck, build et diff.
7. Ne pas ajouter le streaming si cela exige un nouveau transport client avant d'avoir validé le provider non-streamé avec credentials.

## Prototype AI SDK obtenu

Configuration serveur :

```text
AI_PROVIDER=ai-sdk
OPENAI_MODEL=<modèle Responses compatible>
OPENAI_API_KEY=<secret serveur>
AI_BASE_URL=https://api.openai.com/v1
```

Le provider expérimental :

- réutilise le modèle de proposition Forge existant ;
- demande un objet structuré via `Output.object()` ;
- réutilise le JSON Schema déjà envoyé par `openai-compatible` ;
- attache un validateur runtime à `jsonSchema()` ;
- retourne `result.output` au lieu de parser `result.text` ;
- propage durée et usage de tokens à `ai_generations` ;
- transforme les erreurs invalides en `structured_output_invalid` ;
- n'introduit aucune dépendance client.

### Streaming

AI SDK 7 permet `streamText()` avec `Output.object()` et expose `partialOutputStream`. Cependant, la documentation précise que les objets partiels ne peuvent pas être validés tant qu'ils sont incomplets. Le flux Forge actuel repose sur une Server Action atomique, puis une preview complète et validée. Un prototype streaming propre demanderait une Route Handler dédiée, un protocole d'événements, une gestion d'annulation/reprise et un état UI séparé, sans améliorer la validation finale.

Conclusion du spike : ne pas implémenter le streaming dans Sprint 9.3. Un futur test isolé pourra streamer des jalons UX non autoritatifs tout en ne dévoilant la proposition qu'après validation finale.

## Comparaison A/B observée

| Critère | `openai-compatible` | `ai-sdk` |
| --- | --- | --- |
| Structured output | JSON Schema strict construit dans le payload Responses | `Output.object()` + `jsonSchema()` ; résultat accessible via `result.output` |
| Robustesse validation | parsing/extraction manuel puis validation Forge | parsing et validation AI SDK, puis validation Forge conservée |
| Code provider-specific | transport, payload, extraction et statuts Responses codés dans Forge | constructeur de modèle OpenAI + appel AI SDK ; moins de transport maison |
| Gestion des erreurs | classification HTTP et cas `failed/incomplete/refusal` très détaillée | erreurs SDK normalisées puis adaptées à `ForgeAIProviderError`; moins de détails Responses bruts |
| Streaming | à construire intégralement | primitives disponibles, mais transport/UI Forge encore à concevoir |
| Changement de modèle/provider | limité aux endpoints compatibles Responses | abstraction AI SDK utile, mais nouveau package/adaptateur requis par famille de provider |
| Observabilité | diagnostics contrôlés et spécifiques Responses | durée/usage standardisés ; détails provider moins directs sans instrumentation supplémentaire |
| Maintenabilité | plus de code Forge à maintenir lors des évolutions API | surface d'adaptation réduite, dépendance aux changements majeurs AI SDK |
| Préparation RAG/tools | primitives à développer | primitives AI SDK disponibles, sans qu'elles soient autorisées ou implémentées dans ce sprint |

La comparaison porte sur le code réellement intégré. La qualité, la latence et le coût d'une réponse modèle restent non conclusifs sans exécution credentialée du même brief.

## Points d'extension futurs (sans implémentation)

- Sprint 9.4 — conserver `CourseContext` comme frontière d'extraction de sources, indépendamment du provider.
- Sprint 9.5 — remplacer ou enrichir `getCourseContext()` par un retrieval avec citations vérifiables, puis continuer à passer un contexte borné au service.
- Sprint 9.6 — ajouter des capacités Copilot comme nouveaux cas métier du service, toujours avec preview et validation humaine.
- 10.x — exposer d'éventuels tools sous forme d'opérations applicatives autorisées, typées et contrôlées par rôle ; le modèle ne doit jamais recevoir un accès repository/SQL arbitraire.

## Validation technique

- `npm run typecheck` : **PASS**.
- `npm run build` : **PASS** avec Next.js 16.2.7 / Turbopack.
- matrice `npm run config:check` avec `AI_PROVIDER=mock`, `openai-compatible` et `ai-sdk` : **PASS** pour les trois valeurs.
- tests JavaScript/TypeScript existants : aucun script `test` et aucune suite applicative présente dans `package.json`.
- tests SQL `supabase/tests/*.sql` : **NON EXÉCUTÉS**, car la CLI/stack Supabase locale n'est pas disponible dans l'environnement.
- `git diff --check` : **PASS** (uniquement des avertissements de normalisation LF/CRLF sous Windows).
- recherche de secret dans le diff : **PASS** ; seule la valeur factice de `.env.example` est présente.
- smoke navigateur : la page de connexion se rend sans overlay et la route Forge protège correctement `/app/teacher/courses/forge` en redirigeant vers `/login?next=...` sans session.
- workflow Teacher → Forge → preview → import draft : **NON EXÉCUTÉ**, faute de session Teacher. Aucun compte, cookie ou RLS n'a été contourné.
- accès Supabase depuis le dev server : **INDISPONIBLE** dans le sandbox réseau (`fetch failed` sur la page publique) ; cela ne provient pas du changement du provider.
- appel credentialé `ai-sdk` : **NON EXÉCUTÉ**. Les credentials sont configurés côté serveur, mais l'unique chemin applicatif autorisé exige une session Teacher indisponible. L'import direct de `provider.ts` hors runtime Next est aussi volontairement bloqué par sa garde `server-only`.

Les branches `mock` et `openai-compatible` n'ont pas été réécrites. Leur configuration, leur compilation et la factory passent les contrôles ; une génération end-to-end reste à rejouer dans un environnement Teacher connecté avant promotion du provider expérimental.

## Decision

### B — HYBRID

AI SDK apporte une valeur concrète sur les générations structurées : suppression du parsing JSON artisanal dans le nouveau chemin, validation runtime intégrée, usage standardisé et primitives futures de streaming/outils. Le contrat Forge, sa validation métier, la preview et l'import draft restent intacts.

Il serait prématuré d'en faire le provider standard : le spike n'a pas pu mesurer une génération credentialée end-to-end, `openai-compatible` conserve des diagnostics Responses plus fins et reste utile pour les endpoints compatibles qui ne sont pas couverts ou testés par `@ai-sdk/openai`. La recommandation est d'utiliser `ai-sdk` sur un environnement de preview pour le Course Brief, de comparer qualité/latence/erreurs sur les mêmes briefs, puis d'étendre progressivement les cas validés. `mock` et `openai-compatible` restent disponibles pendant cette phase.
