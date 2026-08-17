# Forge AI

Sprint 8 introduit Forge AI comme copilote de conception pédagogique.

Principe produit : l'IA propose, le formateur valide, puis seulement les éléments validés sont persistés.

## Architecture

Flux :

```txt
UI Teacher
-> Server Action
-> forgeAiService
-> AIProvider
-> validation JSON
-> preview / import explicite
-> repositories Teacher
-> Supabase
```

Les composants React ne connaissent pas le provider IA.

Fichiers principaux :

- `lib/forge-ai/provider.ts`
- `lib/forge-ai/service.ts`
- `lib/forge-ai/prompts.ts`
- `lib/forge-ai/validation.ts`
- `app/app/teacher/forge/actions.ts`
- `components/app/ForgeCourseCreator.tsx`
- `components/app/ForgeLessonAssistant.tsx`

## Provider

Providers V1 :

- `mock` : provider déterministe local, utile en développement ou démonstration.
- `openai-compatible` : endpoint chat completions compatible OpenAI.

Variables serveur :

```txt
AI_PROVIDER=mock
AI_MODEL=
AI_API_KEY=
AI_BASE_URL=
AI_TIMEOUT_MS=25000
FORGE_AI_MAX_INPUT_CHARS=3000
FORGE_AI_RATE_LIMIT_PER_HOUR=8
```

Aucune clé IA ne doit être exposée en `NEXT_PUBLIC_*`.

## Première boucle

Route :

`/app/teacher/courses/forge`

Le Teacher renseigne :

- sujet ;
- domaine ;
- public cible ;
- niveau ;
- objectif général ;
- durée éventuelle ;
- contraintes ;
- ton / approche.

Forge retourne une proposition structurée :

```ts
{
  title: string,
  summary: string,
  audience: string,
  level: "beginner" | "intermediate" | "advanced",
  objectives: string[],
  prerequisites?: string[],
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

Le formateur peut décocher des modules ou leçons avant import.

L'import crée :

- une formation `draft` ;
- des modules `draft` ;
- des leçons `draft`.

La publication reste manuelle dans le Teacher Studio.

## Assistant leçon

Depuis l'Éditeur de parcours, le bloc **Demander à Forge** propose :

- plan ;
- introduction ;
- synthèse ;
- simplification.

La proposition s'affiche en preview. Le bouton **Insérer dans le contenu** ajoute le texte dans le textarea, mais ne sauvegarde pas. Le Teacher doit cliquer sur **Enregistrer la leçon**.

## Prompts

Les prompts séparent clairement :

- instructions système ;
- données utilisateur ;
- contexte de leçon.

Les contenus Teacher sont traités comme données et ne peuvent pas redéfinir les règles système.

Règles pédagogiques principales :

- objectifs observables ;
- progression du simple vers le complexe ;
- 3 à 6 modules ;
- 2 à 6 leçons par module ;
- durée réaliste ;
- vocabulaire adapté au niveau ;
- éviter les formulations marketing.

## Validation

La sortie IA est validée côté serveur.

Si la réponse n'est pas un JSON exploitable ou ne respecte pas le schéma minimal, l'UI affiche une erreur et aucune donnée métier n'est créée.

## Sécurité

- Appels IA côté serveur uniquement.
- `requireRole("teacher")` sur les actions Forge.
- Aucun token Auth, secret ou clé Supabase envoyé au provider.
- Données envoyées minimisées et tronquées.
- Pas de publication automatique.
- Pas d'écrasement silencieux de contenu.

## Historique minimal

Migration :

`20260817075543_forge_ai_generations.sql`

Table :

`public.ai_generations`

Elle stocke uniquement des métadonnées :

- `user_id`
- `context_type`
- `context_id`
- `prompt_type`
- `provider`
- `model`
- `status`
- `duration_ms`
- `error_code`
- `created_at`

Elle ne stocke pas les prompts complets ni les contenus générés.

## RLS

Un Teacher peut :

- insérer ses propres métadonnées de génération ;
- lire ses propres métadonnées.

Learner et anon n'ont aucun accès.

## Limites

- Rate limiting V1 en mémoire, best-effort en environnement serverless.
- Pas de chat généraliste.
- Pas de RAG, embeddings ou knowledge graph.
- Pas de génération massive.
- Pas de quiz complexes.
- Pas de scoring IA.
- Pas de billing IA.

## Fallback

Si le provider externe est indisponible ou absent, le Teacher Studio reste fonctionnel.

Le provider `mock` peut être utilisé pour préserver la boucle produit sans dépendre d'une clé externe.
