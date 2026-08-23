# Sprint 9.8 — Home Forge orientée intention

## User intent model

La Home utilise un contrat volontairement court :

```ts
type ForgeCreationIntent = {
  text: string;
  formatHint?: "guided-course" | "practical-workshop" | "thematic-module";
};
```

`text` est normalisé, puis validé entre 12 et 360 caractères. `formatHint` reste facultatif et ne crée pas une nouvelle entité métier : les trois formats sont tous représentables par le modèle actuel `courses → modules → lessons`.

L'intention n'est ni un prompt libre envoyé directement au modèle, ni une instruction de création. Elle sert uniquement à préparer le Course Brief existant.

## Home hierarchy

La page `/app/teacher` répond désormais dans cet ordre à trois besoins :

1. **Commencer** : exprimer une intention, préciser éventuellement un format, ou choisir le chemin manuel ;
2. **Reprendre** : ouvrir l'une des créations récentes avec son statut réel ;
3. **Consulter** : voir les métriques réelles et les dernières modifications.

Le hero « Qu'allez-vous construire aujourd'hui ? » devient le geste principal. Les métriques ont été déplacées sous « Reprendre votre travail » afin de ne plus concurrencer l'entrée par intention.

La salutation utilise le nom de profil lorsqu'il est exploitable. Une adresse e-mail n'est pas affichée comme prénom et les suffixes de rôle courants (`Teacher`, `formateur`, `créateur`) sont retirés. Le fallback est simplement « Bonjour ».

## Intent → Brief flow

L'option retenue est **déterministe** :

```text
Intention courte
    ↓ validation locale bornée
Course Creator existant
    ↓ sujet prérempli + format en contrainte
Course Brief modifiable
    ↓ validation humaine et submit explicite
generateForgeCourseProposalAction
    ↓ forgeAiService / getForgeAIProvider()
Proposition structurée existante
    ↓ sélection humaine
Import explicite en brouillon
```

Le sujet reprend exactement le texte saisi. Le format, s'il est choisi, devient une contrainte lisible (`Format pédagogique souhaité : …`). Le public, les objectifs, les niveaux, la durée et le domaine ne sont pas inférés : le créateur les complète ou les vérifie lui-même.

Cette adaptation légère réutilise `ForgeCourseCreator`, `CourseBrief`, la validation Forge, les providers et le workflow de preview/import. Aucun second générateur et aucun nouveau Server Action ne sont introduits.

## Human validation

La soumission de la Home ne lance aucune génération. Sur `/app/teacher/courses/forge`, un état de succès indique précisément les champs repris et invite à compléter le brief.

Le créateur garde le contrôle à trois moments :

1. il modifie le Course Brief avant « Analyser et générer » ;
2. il examine puis sélectionne modules et leçons dans la preview ;
3. il déclenche explicitement l'import en brouillon.

La publication reste une action séparée. L'intention, le brief et la proposition ne constituent jamais une commande d'écriture Supabase.

## Manual fallback

Le lien « Créer manuellement » reste visible dans le bloc d'intention et mène à `/app/teacher/courses/new`. Cette route conserve le choix manuel / Forge ainsi que le formulaire manuel existant. Les routes et workflows 9.7 restent canoniques.

## AI calls

Le préremplissage déterministe ajoute **zéro appel IA**.

Pour le parcours standard complet :

- Home → Course Brief : 0 appel ;
- « Analyser et générer » : 1 appel `course_structure` via le provider configuré par `AI_PROVIDER` ;
- preview, sélection et import : 0 appel supplémentaire ;
- « Régénérer » : 1 nouvel appel explicite, comme auparavant.

`mock`, `openai-compatible` et `ai-sdk` restent supportés sans branche spécifique dans la Home. Aucun appel OpenAI direct n'est ajouté dans l'UI.

## Persistence

L'intention déterministe n'est pas écrite dans `ai_generations`, car aucune génération n'a eu lieu. La génération de parcours existante continue à journaliser `prompt_type = course_structure`, provider, modèle, statut, durée et tokens disponibles.

Le transport Home → Course Creator utilise des paramètres de recherche bornés et encodés. Ils permettent le rechargement de l'écran de vérification sans état client global. Ils ne doivent pas être utilisés pour des données confidentielles ; un transport serveur temporaire pourra être évalué si de futurs briefs manipulent des informations sensibles.

## Error states

| État | Comportement |
| --- | --- |
| `idle` | Champ libre, formats facultatifs et chemin manuel disponibles. |
| `invalid` | Une erreur de champ annoncée bloque une intention vide, trop courte ou trop longue ; le texte reste saisi. |
| `loading` | « Forge prépare votre point de départ… », submit et contrôles désactivés, `aria-busy` actif. |
| `success` | Le Course Creator affiche le brief prérempli et rappelle les champs à vérifier. |
| `error` | Une erreur de navigation récupérable est affichée inline ; l'intention reste disponible. Les erreurs de génération restent gérées par le Course Creator. |

La double soumission est bloquée pendant la transition. Aucun état de succès ne prétend qu'une interprétation IA a eu lieu.

## Responsive

- **Desktop** : intention et CTA restent visibles dans le hero ; formats sur une ligne lorsque l'espace le permet.
- **Tablet** : le bloc conserve une seule responsabilité et les formats passent naturellement à la ligne.
- **Mobile ≤ 760 px** : champ puis CTA pleine largeur, footer empilé, une seule colonne pour les contenus.
- **Mobile ≤ 520 px** : formats pleine largeur, métriques en une colonne et padding du hero réduit.

L'ordre DOM reste titre, intention, formats, CTA, créations récentes, puis activité secondaire.

## Accessibility

- label réel relié au champ ;
- soumission par Entrée avec un formulaire natif ;
- erreur de champ reliée par `aria-describedby` et annoncée avec `role="alert"` ;
- `aria-invalid`, `aria-busy`, disabled et libellé de loading explicites ;
- formats implémentés comme boutons à état `aria-pressed` ;
- focus visible via le token existant ;
- icônes décoratives masquées ;
- aucune information portée uniquement par la couleur.

## Deferred opportunities

- interprétation IA structurée de l'intention seulement si les tests montrent que le remplissage déterministe est insuffisant ; elle devra alors constituer un appel unique, validé et journalisé avant la génération de parcours ;
- transport temporaire côté serveur si l'intention doit contenir des données sensibles ;
- amélioration du focus initial sur le premier champ incomplet du brief ;
- fusion visuelle du Course Creator avec le futur cockpit, sans fusionner les contrats métier ;
- historique d'intentions, recommandations, streaming, chatbot, RAG et génération automatique restent hors scope.
