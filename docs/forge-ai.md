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
- `openai-compatible` : endpoint Chat Completions compatible OpenAI.

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

Depuis l'Éditeur de parcours, **Demander à Forge** propose :

- plan ;
- introduction ;
- synthèse ;
- simplification.

Le bouton **Insérer dans le contenu** remplit le textarea, mais ne sauvegarde pas. Le Teacher doit cliquer sur **Enregistrer la leçon**.

## Retrieval

Le Sprint 8.1 ajoute un `Retrieval Service` remplaçable.

V1 :

- sources stockées en Supabase Storage dans `course-sources` ;
- TXT/Markdown téléchargés côté serveur et découpés en extraits courts ;
- PDF référencés comme sources associées, sans fausses citations ni extraction intégrale ;
- maximum 8 sources attachées à une génération ;
- maximum 6 snippets transmis au provider.

Cette V1 évite un moteur vectoriel maison. Un provider de file search/vector search pourra remplacer `lib/forge-ai/retrieval.ts`.

## Traçabilité

`ai_generations` stocke les métadonnées des générations.

`ai_generation_sources` relie une génération aux sources utilisées.

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

## Fallback

Si le provider externe est indisponible ou absent, le Teacher Studio reste fonctionnel.

Le provider `mock` préserve la boucle produit sans dépendre d'une clé externe.
