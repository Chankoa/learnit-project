# Sprint 10.0 — Forge Visual & Semantic Refinement

## Visual audit

L’architecture Creator est stable, mais quatre tensions restent visibles :

- une graisse `850/900` est utilisée dans de nombreuses cartes, métadonnées et sous-sections ;
- les surfaces de travail, de contexte et Forge partagent souvent la même bordure, le même padding et la même ombre ;
- les CTA primaires conservent un glow plus démonstratif que nécessaire dans un outil de travail ;
- les écrans denses, surtout proposition, builder et publication, exposent beaucoup de détails au même niveau.

Les décisions de ce sprint sont volontairement locales à l’espace Creator. L’échelle globale, la police, les routes et les composants métier ne sont pas remplacés.

## Typography

Hiérarchie retenue :

- Display : Home Forge uniquement, avec une taille maximale réduite et un interlignage moins serré ;
- H1 : titre de page ou de création, poids `850` au lieu de `900` ;
- H2 : section principale, poids `750` à `850` selon la surface ;
- H3 : titre de carte, poids `750` ;
- Body : poids normal, interlignage lisible ;
- Meta : petite taille, poids `500–650`, couleur atténuée.

Les labels fonctionnels restent visibles. Les eyebrows décoratifs deviennent plus rares et plus calmes : le violet est réservé à Forge, à une sélection ou à une action.

## Spacing

Le rythme Creator utilise principalement `space-3`, `space-4` et `space-5`. Les cartes secondaires passent à un padding plus compact ; les surfaces principales conservent davantage d’air. Sur mobile, le padding et les gaps sont réduits sans diminuer les cibles interactives.

## Buttons

La hauteur minimale accessible de 44 px est conservée. Dans l’espace Creator :

- le padding horizontal est réduit ;
- la graisse passe de très forte à `750` ;
- le glow primaire devient une ombre courte et discrète ;
- les actions secondaires restent bordées sans effet d’élévation dominant ;
- une action Forge n’est primaire que lorsqu’elle accomplit l’étape courante.

## Cards

Les surfaces sont distinguées ainsi :

| Surface | Traitement |
| --- | --- |
| Travail principal | fond `surface-card`, bordure nette, espace confortable |
| Contexte / métadonnées | fond `surface-muted`, ombre supprimée, densité compacte |
| Forge | teinte violette très légère et bordure d’accent réduite |
| Validation | couleur sémantique, résumé visible, détails repliables |

## Tabs

Les cinq onglets restent inchangés fonctionnellement. Leur padding est réduit, l’état actif utilise une barre fine et la couleur de texte reste lisible. Le scroll horizontal et la navigation clavier sont conservés.

## Forge surfaces

Le panneau Forge est visuellement secondaire avant génération puis devient la surface de proposition. Les propositions présentent d’abord le résumé et les contrôles de sélection ; chaque module utilise une divulgation progressive, avec les cases de sélection toujours visibles dans son résumé.

Les états `loading`, `success`, `error`, `stale` et `applied` conservent leurs libellés et leur rôle accessible.

## Mobile

Sous 760 px :

- les headers et actions s’empilent ;
- les cartes réduisent leur padding ;
- les métadonnées redondantes sont compactées ;
- les modules du builder et de la proposition sont lisibles comme groupes ;
- les actions essentielles restent visibles et pleine largeur lorsque nécessaire.

Sous 520 px, la Home conserve le champ d’intention comme surface dominante, les métriques passent à une colonne et les détails restent repliables.

## Semantic corrections

La valeur « Création web » ne provenait ni du modèle ni d’une analyse fiable de l’intention. Elle provenait d’un fallback d’interface : `TeacherDomainPicker`, le formulaire manuel et le Course Creator sélectionnaient automatiquement le premier élément de `domains`.

Ce fallback transformait l’ordre d’affichage de la taxonomie en décision métier, puis persistait cette valeur pendant la création ou l’import.

La correction source est :

1. aucun domaine n’est sélectionné par défaut pour une nouvelle création ;
2. le sélecteur affiche « À préciser » ;
3. la validation serveur continue d’exiger un domaine avant création ou génération ;
4. un cours existant conserve son domaine enregistré jusqu’à une correction humaine explicite ;
5. aucun mapping IA ou taxonomie codée en dur n’est ajouté.

## Domain logic

| Contexte | Comportement |
| --- | --- |
| Nouvelle création manuelle | domaine vide, choix humain obligatoire |
| Intention → Course Brief | aucun domaine déduit sans signal fiable |
| Course Creator sans domaine | génération refusée par la validation Forge avec message exploitable |
| Cours existant | domaine enregistré affiché et modifiable dans Informations |
| Nouveau domaine | création explicite puis sélection du domaine créé |

Les cours déjà persistés avec une valeur incohérente ne sont pas modifiés automatiquement : le système ne peut pas distinguer une ancienne présélection accidentelle d’un choix réel sans historique de provenance.

## Demo vs real data

L’audit confirme que les dashboards Teacher et les listes Creator utilisent les cours et métriques du repository actif. Les surfaces Admin explicitement marquées démo restent hors scope. Aucun statut, score de qualité ou activité simulée n’est ajouté à l’espace Creator.

## Accessibility

- cibles de bouton conservées à 44 px minimum ;
- focus visible des onglets, résumés et champs ;
- option « À préciser » textuelle, pas uniquement chromatique ;
- `details/summary` clavier pour les contenus secondaires ;
- contrôles de sélection visibles dans les propositions ;
- validation et feedback annoncés par texte et rôles ARIA ;
- les icônes ne remplacent pas les libellés essentiels.

## Visual regression manual checklist

Sur Vercel avec un compte Teacher, contrôler :

### Desktop — environ 1440 px

- Home : champ d’intention dominant, hero non surdimensionnée, métriques secondaires ;
- Course Creator : intention, essentiel, domaine « À préciser », sources et panneau Forge ;
- proposition : résumé, sélection, modules et leçons scannables ;
- cockpit : header compact, onglets, Sources, Forge AI et Publication ;
- builder : hiérarchie modules/leçons et panneau d’édition ;
- preview : largeur du descriptif, CTA et programme.

### Tablette — environ 900 px

- bascule correcte des layouts à une colonne ;
- absence de compression du panneau Forge et du builder ;
- onglets accessibles par scroll horizontal.

### Mobile — environ 390 px

- absence d’overflow horizontal ;
- padding réduit sans perte de lisibilité ;
- CTA principal unique et visible ;
- sections avancées et détails de publication repliables ;
- ordre logique intention → brief → sources → proposition.

Pour chaque écran : vérifier densité, alignements, titres, focus, contraste, whitespace et absence de contenu masqué.

## Remaining debt

- corriger manuellement les anciens cours dont le domaine a été involontairement présélectionné ;
- vérifier la totalité des combinaisons de contenu réelles sur Vercel ;
- mesurer l’usage des accordéons avant de les généraliser ;
- appliquer ce langage à Learner selon ses propres besoins de lecture et progression ;
- laisser Admin, RAG, streaming, copilote et AI Elements hors de ce chantier.
