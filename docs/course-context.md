# Course Context

Sprint 8.1 introduit un contexte pédagogique structuré pour Forge AI.

## Course Brief

`CourseBrief` décrit l'intention pédagogique utilisée par Forge.

Champs V1 :

- `subject` : sujet ou titre de travail ;
- `domainId` : domaine Supabase sélectionné ;
- `targetAudience` : public cible ;
- `entryLevel` : niveau initial ;
- `targetLevel` : niveau visé ;
- `prerequisites` : prérequis ;
- `learningObjectives` : objectifs pédagogiques ;
- `duration` : durée cible ;
- `constraints` : contraintes particulières ;
- `sourceIds` : sources documentaires associées.

Le brief peut servir à une nouvelle formation ou à une formation existante.

## Course Source

Les sources sont stockées dans `public.course_sources`.

Colonnes principales :

- `id`
- `teacher_id`
- `course_id` nullable
- `title`
- `type`
- `file_name`
- `storage_bucket`
- `storage_path`
- `mime_type`
- `file_size`
- `metadata`
- `created_at`
- `updated_at`

`course_id` reste nullable pour permettre un brief de nouvelle formation avant import. Lors de l'import, les sources du brief sont rattachées à la formation créée.

## Storage

Bucket :

`course-sources`

Statut :

- privé ;
- taille max 10 Mo ;
- MIME V1 : PDF, TXT, Markdown.

Organisation :

```txt
teacherId/courseId-or-brief/timestamp-filename
```

## Retrieval V1.5

`lib/forge-ai/retrieval.ts` sépare le stockage des sources de leur utilisation IA.

V1.5 :

- lecture serveur via Supabase Storage ;
- extraction directe pour TXT et Markdown ;
- découpage en snippets courts ;
- scoring lexical simple selon la requête de contexte ;
- sélection plus pertinente pour une leçon précise ;
- PDF signalé comme source associée, sans extraction textuelle complète ;
- aucun moteur vectoriel maison.

Les documents sont toujours injectés dans le prompt comme données de contexte, pas comme instructions système.

## Références visibles

Les propositions de leçon peuvent retourner :

```ts
sourceReferences: Array<{
  sourceId: string,
  label: string,
  excerpt?: string
}>
```

Le service filtre ces références : une référence n'est affichée et journalisée que si le `sourceId` existe dans les snippets réellement récupérés.

Si Forge génère à partir de connaissances générales ou si aucune source pertinente n'est fournie, l'UI affiche explicitement qu'aucune source documentaire n'est citée.

## Traçabilité

Table :

`public.ai_generation_sources`

Elle relie :

- `ai_generations.id`
- `course_sources.id`

Cela permet d'afficher plus tard les références ayant contribué à une proposition.

Sprint 8.2 utilise déjà cette table pour journaliser les sources réellement référencées par une génération de leçon.

## RLS

Un Teacher peut gérer uniquement ses propres sources :

- `teacher_id = auth.uid()`
- rôle courant `teacher`
- si `course_id` est présent, la formation doit appartenir au Teacher.

Storage limite les fichiers au préfixe :

```txt
auth.uid()/...
```

Un autre Teacher ne peut pas lire, uploader, modifier ou supprimer ces sources.

## Limites

- Pas d'extraction PDF complète en V1.
- Pas de DOCX malgré le type prévu dans le modèle TypeScript.
- Pas de recherche vectorielle.
- Citations affichées uniquement pour les sources réellement référencées, sans garantie de page/section pour les PDF.
- Pas de partage de sources entre Teachers.
