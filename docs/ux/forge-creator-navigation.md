# Forge Creator navigation

## Scope

Sprint 9.7 fait évoluer l'espace Teacher vers une lecture Creator sans modifier le rôle `teacher`, les routes `/app/teacher/*`, le modèle `courses`, Supabase ou les policies RLS. Les termes ci-dessous sont des libellés d'interface ; les noms techniques restent inchangés.

## Navigation visible

| Route conservée | Libellé UX | Rôle |
| --- | --- | --- |
| `/app/teacher` | Vue d'ensemble | Hub Creator, créations récentes et dernières modifications |
| `/app/teacher/courses` | Mes créations | Liste des parcours possédés par le Teacher |
| `/app/teacher/courses/new` | Nouvelle création | Point d'entrée commun vers le démarrage manuel ou assisté |
| `/app/teacher/courses/forge` | Avec Forge, dans le flux Nouvelle création | Course Brief et proposition structurée existants |
| `/app/teacher/resources` | Ressources | Bibliothèque de supports existante |
| `/app/teacher/students` | Apprenants | Suivi existant, conservé hors du groupe éditorial principal |
| `/app/profile` | Profil | Compte et préférences |

Le shell affiche « Créer » comme espace et « Créateur » comme contexte. Le rôle d'autorisation reste `teacher`. Les entrées redondantes « Leçons » et « Créer avec Forge AI » ne sont plus des destinations de premier niveau : le builder reste accessible depuis chaque création, et Forge depuis Nouvelle création ou le cockpit.

## Active state

- Vue d'ensemble est active uniquement sur `/app/teacher`.
- Mes créations couvre la liste et toutes les sous-routes d'un cours, y compris le builder, la preview, les inscrits et le cockpit.
- Nouvelle création couvre `/courses/new` et `/courses/forge`.
- Une seule destination peut être active pour ces parcours.

## Mes créations

Chaque carte expose des données déjà disponibles : titre, description, domaine, statut réel, nombre de modules et leçons, inscrits et dernière mise à jour. Aucun score éditorial ou statut IA n'est inventé.

Hiérarchie retenue :

- brouillon : `Continuer` ouvre le cockpit ;
- publié : `Gérer` ouvre le cockpit ;
- `Autres actions` regroupe Éditer le parcours, Travailler avec Forge, Prévisualiser/Voir sur le site et Apprenants.

Le regroupement repose sur l'élément natif `details`/`summary` : il est utilisable au clavier, ne nécessite pas de nouvel état client et s'empile sans débordement sur mobile. `Travailler avec Forge` ouvre l'onglet Forge du cockpit avec `?tab=forge`; ce paramètre ne change ni le contrat métier ni l'URL canonique de l'objet.

L'état vide n'offre qu'une action : `Créer mon premier parcours`, vers Nouvelle création.

## Nouvelle création

Le flux conserve les deux implémentations existantes :

```text
Nouvelle création
        ├── Créer manuellement
        │       └── formulaire existant → brouillon → cockpit
        └── Construire avec Forge
                └── Course Brief → proposition → sélection humaine → brouillon
```

`/courses/new` présente le choix et affiche le formulaire manuel comme mode courant. `/courses/forge` reste la route du Course Creator et propose de revenir au choix avec « Changer de mode ». Aucune génération ne démarre au clic d'entrée et aucun import ne contourne la validation humaine.

## Header and breadcrumb conventions

- espace : `Créer` ;
- collection : `Mes créations` ;
- point d'entrée : `Nouvelle création` ;
- objet : titre réel du parcours ;
- contexte de publication et catalogue : le terme `formation` reste autorisé conformément au glossaire.

Le dashboard et Mes créations n'exposent qu'une action principale de page : Nouvelle création. Les actions propres à un objet restent dans sa carte ou son cockpit.

## Responsive and accessibility

- sous 760 px, les deux modes de création passent en une colonne et les actions de carte prennent la largeur disponible ;
- sous 520 px, métadonnées et actions de liste s'empilent sans imposer de largeur horizontale ;
- la navigation mobile réutilise les mêmes items et états `aria-current` que la sidebar ;
- les liens externes de preview conservent `rel="noreferrer"` ;
- les libellés d'actions restent textuels et ne dépendent pas des icônes ou de la couleur ;
- `details` conserve une cible native au clavier et les boutons/liens gardent le focus global existant.

## Deferred to Sprint 9.8

- le champ d'intention « Qu'allez-vous construire aujourd'hui ? » ;
- le préremplissage du Course Brief depuis une intention ;
- une Home Forge éditorialisée ;
- les gabarits cours/atelier/module ;
- les recommandations et surfaces communautaires ;
- toute fusion technique des workflows manuel et Forge.

