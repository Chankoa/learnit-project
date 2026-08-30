# Sprint 10.T1 — Teacher Contextual Editing & Sources URL

## Scope

Ce jalon ferme le Teacher Studio V1 sans modifier les contrats LMS, Auth, RLS, publication ou providers IA. Il consolide le chemin suivant :

```text
Mes créations → Parcours → Objet sélectionné → Contenu / Forge / Ressources → Validation → Publication
```

## Contextual editor

La sélection d’un module ou d’une leçon reste portée par les paramètres `module` et `lesson` de la route Builder. Cette URL est la source de vérité de la sélection : elle reste partageable et toutes les Server Actions existantes la réutilisent.

- Desktop supérieur à 900 px : structure et détail restent côte à côte ; le détail est sticky.
- Tablette : les surfaces passent sur une colonne.
- Mobile inférieur à 760 px : une sélection masque temporairement la structure, place immédiatement le détail en premier et affiche un header sticky `← Parcours` avec le type et le titre de l’objet actif.
- Aucun `scrollIntoView()` n’est utilisé comme architecture.

Les sections existantes Contenu, Forge et Ressources restent dans le même panneau. Des onglets locaux n’ont pas été ajoutés : ils auraient fragmenté plusieurs formulaires serveur et masqué des actions sans résoudre davantage la rupture principale.

## Publication to correction

La checklist ne regroupe plus toutes les leçons sans contenu derrière un lien vers la première. Chaque leçon concernée affiche :

- son titre ;
- le module parent et `Contenu manquant` ;
- un lien `Corriger cet élément` vers `builder?lesson=<id>&from=publication`.

Le Builder sélectionne cette leçon. Son header mobile propose alors `← Publication`, et les sauvegardes de module/leçon conservent ce contexte de retour.

Les règles de publication de `getPublicationIssues()` sont inchangées.

## Course source model

La migration `20260830090000_course_source_urls.sql` étend `course_sources` :

| Champ | Rôle |
| --- | --- |
| `source_kind` | `file`, `url`, ou futur `text` |
| `type` | format documentaire : `pdf`, `text`, `markdown`, `docx`, `web` |
| `original_url` | URL saisie, conservée sans substitution |
| `file_name` | fichier éventuel, nullable pour URL |
| `storage_bucket`, `storage_path` | emplacement Storage éventuel |
| `extracted_content` | texte extrait côté serveur |
| `mime_type` | type de contenu contrôlé |
| `extraction_status` | `pending`, `ready`, `error` |
| `extraction_error` | erreur technique éventuelle |
| `metadata` | URL finale après redirections et contexte d’usage |

Les lignes existantes sont reprises comme `source_kind=file` et `extraction_status=ready`. Les policies RLS existantes restent applicables parce que la table, l’ownership `teacher_id` et les opérations autorisées ne changent pas.

La migration a été créée mais n’est pas appliquée par ce repository. Le CLI Supabase n’est pas installé dans l’environnement Codex actuel. Elle doit être appliquée avant le déploiement du code qui sélectionne les nouvelles colonnes.

## Secure URL retrieval

`retrieveUrlSource()` s’exécute uniquement depuis le service Forge authentifié Teacher. Ses garde-fous sont :

- protocoles HTTP/HTTPS uniquement ;
- refus des identifiants inclus dans l’URL ;
- résolution DNS avant chaque requête et chaque redirection ;
- refus de localhost, loopback, link-local, réseaux privés, CGNAT, multicast et IPv6 local ;
- redirections manuelles limitées à quatre ;
- timeout de huit secondes par requête ;
- réponse limitée à 2 Mo, avec contrôle de `content-length` puis du flux réel ;
- content-types acceptés : HTML, texte et Markdown ;
- suppression des scripts, styles, navigation, header/footer, formulaires, SVG, canvas et iframe ;
- rejet d’un contenu textuel trop faible.

Le texte extrait est enregistré seulement après une récupération réussie. Une erreur reste visible dans l’interface et aucune source n’est présentée comme prête. Une protection absolue contre le DNS rebinding demanderait un transport HTTP permettant d’épingler l’adresse résolue ; l’implémentation actuelle couvre les contournements SSRF ordinaires et revalide chaque destination de redirection.

## Forge context

Les listes destinées à l’UI n’incluent pas `extracted_content`. `getSourcesByIds()` le charge uniquement côté serveur, puis `getCourseContext()` :

1. ignore toute source dont le statut n’est pas `ready` ;
2. découpe le texte URL avec le même budget que les sources TXT/Markdown ;
3. classe les extraits selon la requête pédagogique ;
4. fournit les snippets bornés aux prompts Forge ;
5. conserve les identifiants de source pour `ai_generation_sources` et de futures citations.

Il ne s’agit ni d’un RAG, ni d’une promesse de citation automatique.

## Forge generation reliability

Le message `La proposition générée n’a pas pu être validée` fusionnait deux erreurs provider distinctes :

- `response_empty` : aucune sortie exploitable ;
- `structured_output_invalid` : sortie absente, non parsable ou rejetée par le schéma AI SDK.

La validation métier Forge se produit ensuite et reste séparée sous le code `forge_business_validation`. Le correctif :

- conserve structured output et validation métier ;
- renvoie un message propre à l’étape en échec ;
- journalise le code stable dans `ai_generations.error_code` ;
- propose `Réessayer` sur Revision, assistant de leçon et analyse de cours ;
- expose un disclosure technique borné sans clé, prompt système ni données privées.

## Accessibility and dark mode

- cibles tactiles de 44 px pour le contexte mobile, les types de source et les actions de récupération ;
- focus visible sur menu, navigation, tabs de source et disclosures ;
- contraste du drawer mobile renforcé en dark mode ;
- sélection exprimée par texte, bordure et couleur ;
- aucune dépendance au hover ou à une animation ;
- header contextuel sticky sous la topbar mobile.

## Deployment and manual validation

Ordre requis :

1. appliquer la migration Supabase ;
2. déployer l’application ;
3. ouvrir une session Teacher réelle ;
4. tester une source URL publique, une URL invalide et une URL privée ;
5. lancer une génération de leçon ou une analyse utilisant cette source ;
6. vérifier la ligne `course_sources`, le statut `ready`, le contenu extrait côté serveur et la relation `ai_generation_sources` ;
7. tester le parcours publication → leçon → sauvegarde → retour publication à 1440 px et 390 px, en light et dark mode.

## Remaining debt

- L’extraction PDF reste limitée au signal documentaire historique ; ce sprint ne lui ajoute pas de parseur.
- Les échecs réseau ne créent pas de ligne persistée : ils sont récupérables dans l’UI. Le modèle possède néanmoins les états `pending/error` pour une future extraction asynchrone.
- Le transport `fetch` ne permet pas d’épingler simplement l’IP après résolution DNS ; ce point devra être durci avant des sources provenant de réseaux à confiance faible.
- La validation navigateur authentifiée et l’application distante de la migration restent nécessaires avant de déclarer le jalon validé en production.
