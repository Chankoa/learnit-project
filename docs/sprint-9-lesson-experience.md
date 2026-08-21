# Sprint 9 - Experience pedagogique de la lecon

## Audit avant implementation

### Teacher

- La generation Forge fournissait un champ `contentMarkdown` libre : titres, objectifs et resume pouvaient etre repetes dans le corps.
- Le textarea Markdown etait fonctionnel mais son apercu Teacher transformait les titres et blocs en simples paragraphes.
- Les actions Forge etaient toutes visibles dans la meme liste, sans priorite claire pour la generation de lecon.
- La proposition demandait une validation avant application, mais ne presentait pas le rendu apprenant final.
- Les ressources etaient deja liees a la lecon, mais occupaient beaucoup d'espace lorsqu'elles etaient absentes.

### Learner

- Le lecteur affichait bien le Markdown, la sidebar, les notes, les ressources, la progression et la navigation precedente/suivante.
- La typographie Markdown ne differenciait pas suffisamment les sections, sous-sections, tableaux, citations et blocs de code.
- Les pages longues etaient peu scannables : interlignes et largeur du contenu etaient coherents, mais les reperes pedagogiques restaient faibles.
- Les blocs de code avaient un overflow, sans style de lecture distinct ni information de langage.
- La sidebar possede deja un scroll independant sur desktop et devient compacte sous 980 px ; elle n'a pas ete refondue dans ce sprint.

## Modele pedagogique V1

`LessonType` existant utilise `reading` comme equivalent de la lecon de lecture. Forge produit pour ce type :

1. une introduction orientee apprenant ;
2. des sections de notions, explications et exemples ;
3. une mise en pratique si utile ;
4. des points a retenir ;
5. une piste pour aller plus loin si elle apporte une valeur reelle.

Le titre, le resume court et les objectifs restent respectivement dans `lessons.title`, `lessons.description` et `lessons.objectives`. Le Markdown `lessons.content` ne les repete pas mot pour mot. Les autres types existants (`video`, `exercise`, `quiz`, `project`) recoivent le meme contrat structure comme fallback editable. Les futurs types workshop et resource demandent une evolution explicite du modele de donnees, hors de ce sprint.

## Contrat Forge et Markdown

Le Structured Output strict retourne `intro`, `sections`, `practice`, `keyTakeaways`, `furtherReading`, les metadonnees et les references de sources. Chaque section contient du texte, un exemple, du code et un callout facultatifs. Le provider ne demande plus de Markdown libre.

[`lessonProposalToMarkdown`](../lib/forge-ai/lesson-markdown.ts) compose ensuite les titres, listes et fenced code blocks. Le mapper supprime les delimiters de code fournis par erreur et borne le langage a un identifiant court. Cette etape stabilise la hierarchie et conserve le Markdown comme source de verite.

Conventions supportees par le renderer :

```md
> [!NOTE]
> Repere utile.

> [!TIP]
> Conseil pratique.

> [!WARNING]
> Point de vigilance.

> [!EXERCISE]
> Mise en pratique guidee.
```

## Experience Teacher

- Le textarea Markdown reste l'editeur principal, avec une hauteur utile et une police monospace.
- `Previsualiser le rendu` ouvre le meme renderer Markdown que l'apprenant.
- Forge propose six actions dans un seul menu : generer, ameliorer, proposer un exemple, ajouter une mise en pratique, simplifier et synthetiser.
- Une proposition est toujours editee et previsualisee avant `Accepter`; aucune mutation n'est silencieuse.
- L'acceptation section par section reste une dette UX : le contrat le rend possible, mais l'UI ne l'expose pas encore.

## Experience Learner

- Le corps est limite a une largeur de lecture d'environ 72 caracteres, avec une hierarchie H2/H3 plus nette.
- Listes, citations, callouts, code inline, code fenced, tables et separateurs ont des styles dedies.
- Les blocs de code defilent horizontalement sur mobile et conservent une police monospace lisible.
- Les notes et la completion restent apres le contenu et les ressources. Le bloc Ressources est absent lorsqu'il n'y en a pas.
- Les cartes precedente/suivante indiquent desormais l'etat termine ou a faire de la lecon cible.

## Test de reference

Cas a executer apres deploiement : `Introduction au positionnement moderne`.

1. Ouvrir la lecon en Teacher et lancer `Generer la lecon`.
2. Relever `input_tokens`, `output_tokens`, `total_tokens`, `duration_ms`, `status` et `error_code` dans `ai_generations`.
3. Verifier que le preview n'a pas de repetition entre titre, resume, objectifs et corps, puis accepter explicitement la proposition.
4. Verifier le rendu Learner a 375 px, 768 px et desktop : headings, code, blocs pedagogiques, ressources, notes, completion et navigation.

Le test reel OpenAI et le parcours navigateur authentifie restent a executer dans l'environnement deploye : ils exigent un compte Teacher, un compte Learner et les secrets Vercel/Supabase qui ne sont pas disponibles localement.

## Dette restante

- Accepter ou refuser individuellement les sections Forge.
- Ajouter une copie de bloc de code si les usages le justifient.
- Rendre le rate limit Forge persistant avant une exposition importante.
- Traiter la densite globale, les formulaires et la navigation Teacher dans Sprint 9.1, sans etendre ce sprint a une refonte complete du studio.