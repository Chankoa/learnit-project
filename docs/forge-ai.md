# Forge AI

Forge AI est le copilote de conception pédagogique de LearnIt. Il assiste le Teacher, mais ne publie jamais et ne modifie jamais silencieusement une formation.

Principe produit :

```txt
proposition IA -> preview / diff -> validation humaine -> persistence explicite
```

## Architecture

Flux principal :

```txt
UI Teacher
-> Server Actions
-> forgeAiService
-> Retrieval Service / AIProvider
-> validation JSON
-> preview / diff
-> repositories Teacher
-> Supabase
```

Les composants React ne connaissent ni SQL, ni Storage, ni provider IA.

Fichiers principaux :

- `lib/forge-ai/service.ts`
- `lib/forge-ai/provider.ts`
- `lib/forge-ai/retrieval.ts`
- `lib/forge-ai/prompts.ts`
- `lib/forge-ai/validation.ts`
- `app/app/teacher/forge/actions.ts`
- `components/app/ForgeCourseCreator.tsx`
- `components/app/ForgeCourseContextPanel.tsx`
- `components/app/ForgeLessonAssistant.tsx`

## Provider

Providers V1 :

- `mock` : provider déterministe, utile sans clé externe.
- `openai` : provider OpenAI officiel via Vercel AI SDK.
- `openai-compatible` : provider compatible OpenAI Responses API.
- `ai-sdk` : provider expérimental Sprint 9.3 utilisant `Output.object()` et la validation structurée de AI SDK.

Variables serveur :

```txt
AI_PROVIDER=openai
OPENAI_MODEL=gpt-5-mini
OPENAI_API_KEY=
AI_BASE_URL=https://api.openai.com/v1
AI_TIMEOUT_MS=25000
FORGE_AI_MAX_INPUT_CHARS=3000
FORGE_AI_MAX_OUTPUT_TOKENS=4000
FORGE_AI_RATE_LIMIT_PER_HOUR=8
```

Aucune clé IA ne doit être exposée en `NEXT_PUBLIC_*`.

Configuration Vercel recommandée pour OpenAI :

```txt
AI_PROVIDER=openai
OPENAI_MODEL=gpt-5-mini
OPENAI_API_KEY=<secret serveur>
AI_BASE_URL=https://api.openai.com/v1
FORGE_AI_MAX_OUTPUT_TOKENS=4000
```

Dans Vercel, ajoutez ces variables dans **Settings > Environment Variables** pour les environnements Production, Preview et Development selon le besoin. `OPENAI_API_KEY` est uniquement lu côté serveur. `AI_MODEL` et `AI_API_KEY` restent pris en charge uniquement comme aliases de migration et ne doivent pas être ajoutés à une nouvelle configuration.

`AI_BASE_URL` est une base URL, pas un endpoint complet. L'adapter construit lui-même `POST /responses`. Les valeurs terminant par `/chat/completions` ou `/responses` sont refusées par le validateur ; la configuration à conserver est `/v1`.

Le provider demande des Structured Outputs stricts via `text.format: { type: "json_schema", strict: true }`, puis applique encore les validateurs métier dans `lib/forge-ai/validation.ts`. Les erreurs HTTP sont journalisées côté serveur sans secret : statut, endpoint sans query string, modèle, type/code/message OpenAI tronqué.

Les protections de coût V1 sont `FORGE_AI_MAX_INPUT_CHARS`, `FORGE_AI_MAX_OUTPUT_TOKENS`, `AI_TIMEOUT_MS` et `FORGE_AI_RATE_LIMIT_PER_HOUR`. `FORGE_AI_MAX_OUTPUT_TOKENS` est un plafond global, par défaut `4000` et borné à `4000`. Les budgets par action restent inférieurs à ce plafond : `course_structure` `2400`, `course_analysis` et `course_improvement` `1800`, `lesson_generate` `3600`, `lesson_outline` et `lesson_plan` `1200`, `lesson_intro` et `lesson_summary` `900`, `lesson_simplify` `1600`. Les autres actions de leçon sont plafonnées à `1600`. Le rate limit actuel est en mémoire : il est suffisant en développement et test, mais non fiable dans un environnement Vercel distribué. Une limite persistante est nécessaire avant une exposition publique importante. Les métadonnées de génération conservent le modèle, l'action, le statut, la durée et, lorsque le provider les fournit, les tokens d'entrée, sortie et total. Elles n'incluent jamais les prompts, contenus, sources ni secrets.

Quand OpenAI retourne un statut `incomplete`, Forge journalise uniquement le statut, l'identifiant de réponse, le modèle, les types et le nombre d'items de sortie, la longueur du texte, le motif structuré `incomplete_details.reason` et les compteurs de tokens. Les prompts, contenus pédagogiques, sources et secrets ne sont jamais journalisés. Le provider distingue ensuite une limite de sortie, une réponse incomplète, vide, refusée ou structurée invalide.

## Format de leçon

Pour `lesson_generate`, Forge demande un Structured Output pédagogique plutôt que du Markdown libre : introduction, sections, exemples, code, callouts, mise en pratique, points à retenir et approfondissement facultatif. Le serveur valide ce contrat puis utilise `lessonProposalToMarkdown()` pour construire `lessons.content`. Le budget de sortie reste plafonné à `3600` tokens pour cette action, sans viser systématiquement ce maximum. Le formateur prévisualise et accepte toujours la proposition avant mutation.

## Course Brief

Le brief contient :

- sujet / titre de travail ;
- domaine ;
- public cible ;
- niveau initial ;
- niveau visé ;
- prérequis ;
- objectifs pédagogiques ;
- durée cible ;
- contraintes ;
- sources documentaires associées.

Il est utilisé pour créer une nouvelle formation ou contextualiser une formation existante.

## Nouvelle formation

Route :

`/app/teacher/courses/forge`

Workflow :

```txt
Brief -> Sources -> Analyse -> Proposition -> Sélection -> Import draft
```

Le Teacher peut créer un domaine depuis le formulaire via `TeacherDomainPicker`. La création réutilise `createTeacherDomainAction()`, le slug serveur et l'anti-doublon du Teacher Studio.

Forge retourne une proposition structurée :

```ts
{
  title: string,
  summary: string,
  audience: string,
  level: "beginner" | "intermediate" | "advanced",
  objectives: string[],
  prerequisites?: string[],
  sourceCount?: number,
  modules: Array<{
    title: string,
    description?: string,
    lessons: Array<{
      title: string,
      objective?: string,
      estimatedMinutes?: number
    }>
  }>
}
```

Le Teacher peut décocher des modules ou leçons avant import.

L'import crée uniquement :

- une formation `draft` ;
- des modules `draft` ;
- des leçons `draft`.

La publication reste manuelle.

## Formation existante

La page `/app/teacher/courses/[courseId]/edit` expose **Travailler avec Forge AI**.

Forge reçoit :

- les informations du cours ;
- le domaine ;
- les modules ;
- les leçons ;
- le Course Brief rempli ou ajusté ;
- les sources attachées à cette formation.

Modes V1 :

- analyser le parcours ;
- améliorer la structure.

La sortie est affichée en diff :

- structure actuelle ;
- proposition Forge ;
- justification.

Seules les suggestions de type `module` ou `lesson` peuvent être appliquées automatiquement, et uniquement après clic explicite **Accepter en brouillon**. Les autres suggestions restent à appliquer manuellement dans l'éditeur.

## Assistant leçon

Depuis l'Éditeur de parcours, **Modifier avec Forge AI** propose :

- générer le contenu ;
- améliorer le contenu existant ;
- simplifier ;
- développer ;
- générer une introduction ;
- générer une synthèse ;
- proposer des exemples ;
- proposer un exercice ;
- analyser la cohérence pédagogique.

Forge charge uniquement le contexte utile :

- informations de formation ;
- domaine ;
- module parent ;
- leçon cible ;
- durée et contenu actuels ;
- leçons précédente et suivante ;
- sources associées au cours ;
- passages récupérés par le Retrieval Service.

La sortie structurée est :

```ts
{
  title: string,
  summary: string,
  objectives: string[],
  contentMarkdown: string,
  keyPoints: string[],
  estimatedMinutes: number,
  sourceReferences: Array<{
    sourceId: string,
    label: string,
    excerpt?: string
  }>
}
```

L'UI affiche **Contenu actuel** vs **Proposition Forge**. Le Teacher peut modifier la proposition avant de cliquer sur **Accepter**. Le mode **Analyser cette leçon** ne peut pas être appliqué automatiquement : il produit des recommandations à traiter manuellement.

## Retrieval

Le Sprint 8.1 ajoute un `Retrieval Service` remplaçable. Sprint 8.2 le fait évoluer en RAG applicatif V1.5.

V1.5 :

- sources stockées en Supabase Storage dans `course-sources` ;
- TXT/Markdown téléchargés côté serveur et découpés en extraits courts ;
- snippets triés par score lexical à partir du titre de leçon, module, objectifs et contenu ;
- PDF référencés comme sources associées, sans fausses citations ni extraction intégrale ;
- maximum 8 sources attachées à une génération ;
- maximum 6 snippets transmis au provider.

Workflow :

```txt
Intent Teacher
-> contexte de leçon
-> retrieval sources
-> prompt Forge
-> structured output
-> preview
-> validation
-> application explicite
```

Cette V1.5 évite un moteur vectoriel maison. Un provider de file search/vector search pourra remplacer `lib/forge-ai/retrieval.ts`.

## Traçabilité

`ai_generations` stocke les métadonnées des générations.

`ai_generation_sources` relie une génération aux sources utilisées.

Pour les leçons, seules les sources réellement référencées dans `sourceReferences` et présentes dans le contexte récupéré sont liées à la génération.

Le contenu complet des prompts et des sorties n'est pas stocké en V1.

## Sécurité

- Appels IA côté serveur uniquement.
- `requireRole("teacher")` sur les Server Actions Forge.
- RLS sur `course_sources` et `ai_generation_sources`.
- Storage `course-sources` privé.
- Aucun token Auth, secret Supabase ou clé IA envoyé au provider.
- Données utilisateur et documents traités comme données, jamais comme instructions système.
- Inputs tronqués, fichiers limités, rate limit best-effort.
- Sorties JSON validées côté serveur.

## Limites

- Rate limiting V1 en mémoire, best-effort en environnement serverless.
- PDF non extrait en texte dans cette V1.
- Pas de RAG global entre Teachers.
- Pas de vector database maison.
- Pas de chat généraliste.
- Pas de génération massive.
- Pas de publication automatique.
- Pas de versioning complet des propositions.
- Les références visibles restent au niveau source/extrait, sans citations vérifiées page par page pour les PDF.

## Fallback

Si le provider externe est indisponible ou absent, le Teacher Studio reste fonctionnel.

Le provider `mock` préserve la boucle produit sans dépendre d'une clé externe.
