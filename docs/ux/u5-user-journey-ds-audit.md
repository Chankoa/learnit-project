# U5 — Unified User Journey & DS convergence

## Audit avant implémentation — 7 septembre 2026

Base réelle : `e1dce31`, branche `sprint-10-u5-unified-user-journey-ds`, arbre propre.
U4.2, U4.2.F (dispatch Forge) et U4.2.P (publication canonique) sont intégrés.
Les libellés ci-dessous suivent exactement `docs/design/user-journey/readme.md`.
Les neuf images et les cinq références DS/convergence ont été inspectées.
Les documents DS 1.1, guidelines, produit, capabilities et read model ont été lus.
Le contrat U5 fourni prévaut sur les anciennes feuilles de route qui nommaient U5 « collaboration ».

| Référence | Route actuelle | Composants actuels | Écarts observés avant changement |
| --- | --- | --- | --- |
| 00 — Public home | `/` | Header, hub-hero, FeaturedCourse, CourseCatalog | Hero catalogue et grande image, aucune intention Forge ; longs blocs marketing ; cartes surdimensionnées ; CTA Workspace absent. |
| 01 — Workspace home | `/app` | UnifiedAppShell, AppPageHeader, unified-hero, UnifiedCourseCard | Double introduction ; reprise en carte très textuelle ; pas de rangée Explorer ; thème déplacé dans un contrôle flottant sur desktop ; pas de données réelles pour le flux social des références. |
| 02 — Create / intent | `/app/create` | ForgeHomeIntent, TeacherCourseForm | Formulaire manuel intégral affiché d'emblée ; intention perdue dans des sections ; absence de hiérarchie hero / intention / résultat. |
| 03 — Generated path | `/app/create?intent=…` | ForgeCourseCreator, ForgeSourceManager | Brief et proposition denses ; conserver sélection des modules/leçons, sources, import explicite ; carte de proposition et modules à rapprocher du résultat compact de la référence. |
| 04 — My paths | `/app/courses` | UnifiedCourseCard, unified-filter-list | Filtres = ancres sans cible réelle ; longues descriptions, aucune couverture ; priorité relationnelle correcte, accès secondaire Modifier absent pour owner inscrit. |
| 05 — Course overview | `/app/courses/[slug]?mode=view` | UnifiedCourseOverview, UnifiedCourseModeSwitch | Hiérarchie hero/mesures/programme existante mais proportions et densité éloignées ; Participants redirige Teacher ; statut insuffisamment visible. |
| 06 — Learn | `/app/courses/[slug]/lessons/[lessonSlug]?mode=learn` | LearningShell, LearnerLessonWorkspace, CourseOutlineRail, LearnerForgePanel | Bonne structure fonctionnelle ; harmoniser largeur, contrôles et surfaces avec Edit ; conserver progression, notes autosave et sources. |
| 07 — Edit | `/app/courses/[slug]?mode=edit`, leçon canonique | TeacherAuthoringWorkspace, TeacherCourseBuilder, CourseOutlineRail, TeacherLessonTabs | Module éditable mais affordance discrète ; chrome différent de Learn ; calibrer rails 17–20rem / Forge 20–23rem et densité. |
| 08 — Publish & collaborate | `/app/courses/[slug]?mode=view&panel=publication` | CanonicalPublicationPanel, overview | Publication réelle avec modal ; présentation linéaire/large bouton ; absence d'URL publique et copie ; invitations, commentaires, remix non disponibles. |

## Réutilisation et sécurité

- Conserver AppShell/Sidebar/Topbar, CourseOutlineRail, les drawers et leur logique, le resolver de mode, les formulaires Teacher, ForgeCourseCreator, les actions de publication et EnrollmentButton.
- Retirer du parcours nominal le hero catalogue, les ancres de filtres inopérantes, les liens Participants Teacher et les répétitions de panneaux.
- Aucun faux avatar, compteur, avis, notification, commentaire, historique Forge ou invitation. Les couvertures affichent les données du cours ; sans image, utiliser un pictogramme neutre.
- Préserver Auth sans rôle, `next`, création active, membership owner, garde course capability, publication confirmée, Explorer public-only, auto-inscription, notes/progression, Forge source-aware et Apprendre ↔ Modifier.
- Editor/contributor ne reçoivent pas de mutations nouvelles. Aucune modification RLS, migration ou déploiement U5.

## Écarts fonctionnels révélés

- Les filtres de collection doivent réellement sélectionner des lignes, tout en conservant une seule carte par cours.
- Participants doit être un sous-écran canonique réutilisant le suivi autorisé existant.
- Suppression de parcours : aucune méthode repository/service de suppression complète n'existe. La RLS ne permet que les brouillons ; les fichiers Storage nécessitent un protocole de nettoyage. Ne pas présenter une suppression fictive ou incomplète ; dette documentée, sans élargissement RLS.
- Publication : partager le lien public réel est possible ; invitations/commentaires/revue collaborative restent « À venir ».
- Le correctif du dispatch provider U4.2.F fait partie de la base ; vérifier les tests et le contexte actif sans refaire le moteur IA.

## Reprise et statut — 7 septembre 2026

Le travail U5 repris est non commité sur `sprint-10-u5-unified-user-journey-ds`, depuis la base `e1dce31`. Les changements existants sont conservés : filtres relationnels fonctionnels, cartes compactes, accès Modifier pour owner inscrit, Participants canonique, publication avec lien public copiable, introduction Forge et rails Edit calibrés.

| Référence | Statut code | Vérification effectuée | Reste à confirmer visuellement authentifié |
| --- | --- | --- | --- |
| 00 — Public home | PARTIAL | Forge est le point focal ; CTA Workspace et catalogue secondaire sont présents. Smoke public local disponible. | Composition 1440/1280/900/768/390 en light et dark. |
| 01 — Workspace home | PARTIAL | Cockpit à données réelles : reprise, parcours, Explorer et création sont composés depuis les relations/cataloque. | Densité et proportions avec session. |
| 02 — Create / intent | PARTIAL | Intent Forge au premier niveau ; création manuelle explicite, sans formulaire fictif. | Parcours Forge réel et mobile. |
| 03 — Generated path | PARTIAL | Brief, sources, proposition et import existants sont conservés ; modules compactés. | Génération réelle, responsive et dark. |
| 04 — My paths | PASS code | Filtres serveur Tous/J'apprends/Je crée actifs, sans duplication ; relation et Modifier owner inscrit visibles. | Smoke avec owner + enrolled réel. |
| 05 — Course overview | PASS code | Hub unifié, relations, mode switch et Participants `/app/courses/[slug]/participants` canoniques. | États capability et mobile. |
| 06 — Learn | PARTIAL | Fonctionnel existant préservé ; rails et Forge restent la base commune. | Continuité visuelle Learn/Edit et drawers. |
| 07 — Edit | PASS code | Édition de module réelle (titre, description, durée, statut), rails 17–20rem et Forge 20–23rem. | Édition connectée, mobile et dark. |
| 08 — Publish & collaborate | PARTIAL | Checklist, confirmation, publication et copie du lien public sont réelles. | Publication connectée, Explorer après publication et dark. |

### Dette confirmée

- Suppression owner : backend sécurisé manquant. Aucune mutation ou nettoyage Storage complet n'est proposé par U5.
- Invitations, commentaires, revue et remix : indisponibles ; explicitement « À venir ».
- Les routes `/app/learner` et `/app/teacher` restent des compatibilités. Les nouvelles surfaces nominales ne les ciblent pas.
- Les smokes authentifiés, les cinq largeurs demandées et les thèmes light/dark nécessitent une session navigateur de test partagée. Aucun résultat visuel connecté n'est inféré des tests statiques.

## Comparaison et validation

Pour chaque écran : comparer composition, container/gutters, header/sidebar/rails, grille, typographie, rythme vertical, contrôles, CTA, surface Forge et état actif aux PNG. Le DS prime sur les gradients et données fictives des maquettes. Le header/drawer mobile partagé reste la navigation de référence, sans ajouter une seconde navigation concurrente.

Résultats finaux et preuves de smoke à compléter après implémentation.
