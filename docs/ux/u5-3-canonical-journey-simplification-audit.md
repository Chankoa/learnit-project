# U5.3 — Audit avant code

Date : 9 septembre 2026. Branche `sprint-10-u5-unified-user-journey-ds`, base `78db3f3`, changements U5--U5.3 non commités préservés. U5–U5.2 conservés.
Les références produit, capabilities, read model, DS1, tokens/thèmes et PNG 00–08 déjà lus dans cette tâche restent les références. Les audits/handoffs U5.1/U5.2 et le README local sont relus pour confronter leurs conclusions au code.

1. **Switches** : `UnifiedCourseOverview`, `TeacherCourseBuilder.modeActions`, route canonique de leçon Learn. Le switch overview concurrence ses CTA ; dans les leçons, il concurrence `CourseContextNavigation`.
2. **CourseContextNavigation** : overview/publication, Participants, deux appels de builder dans les routes cours/leçon et enfants du workspace Learn. U5.2 y a ajouté Apprendre en plus de Modifier. Retirer ce composant des activités de leçon ; conserver une navigation de gestion au niveau cours sans modes Learn/Edit.
3. **Overview** : `UnifiedCourseOverview` porte enrollment et reprise, mais le switch et un bouton Modifier primaire brouillent leur priorité. Conserver un seul CTA d’apprentissage, avec gestion secondaire capability-gated.
4. **Parcours** : Learn utilise `LearningShell` + `LessonSidebar`, non repliable sur desktop, drawer à seuil différent. Edit utilise `TeacherAuthoringWorkspace`, rail repliable, redimensionnement Forge, overlays mutuellement exclusifs. Extraire cette implémentation mature en shell canonique et l’utiliser aussi en Learn ; laisser un adaptateur Teacher pour compatibilité et provider de surface authoring.
5. **Forge** : primitives `ContextualForgeRail` déjà communes mais deux conteneurs/lifecycles spatiaux. Builder injecte un élément conditionnel module/leçon non keyé pour la branche leçon, parmi des slots serveur consommés par un composant client. Aucun `.map` direct autour de `ForgeLessonAssistant`. Ajouter une clé métier à chaque racine conditionnelle et un emplacement stable, sans index ; vérifier le rendu React quand possible. La cause exacte du warning nécessite une session authentifiée pour reproduction.
6. **Explorer** : `UnifiedCourseCard` utilise primaryHref/primaryLabel des relations, sinon route cours sans mode + « Consulter ». Owner non inscrit part directement en Edit. Ajouter un contexte de carte Explorer : découverte de l’overview explicite et inscription réelle visible ; inscrit → Continuer ; owner conserve une action Modifier secondaire.
7. **Enrollment** : réutiliser `EnrollmentButton` → `enrollAction` → `enrollInCourse`. L’action ne redirige pas, le bouton ne fait qu’un refresh. Après succès, naviguer vers `/app/courses/[slug]?mode=view`, puis refresh ; invalider aussi les collections canoniques.
8. **Factorisation sûre** : un seul shell spatial, mêmes slots Parcours/Contenu/Forge ; provider authoring autour de l’adaptateur uniquement ; notes/progression/questions/mutations restent dans leurs composants. Pas de nouvelle API, provider IA, migration ou permission.

## Plan de vérification
Tests des CTA relationnels, non-duplication navigation, shell partagé, clés métier et routes canoniques ; config/typecheck/build/suite complète/diff check. Browser : uniquement avec session disponible ; sinon `AUTH SESSION REQUIRED`, sans demander de credentials.

## Validation effectuée

- `npm run config:check` : PASS, avec l’avertissement préexistant sur les alias `AI_API_KEY` et `AI_MODEL`.
- `npm run typecheck` : PASS.
- `npm run build` : PASS.
- `npx tsx --test tests/*.test.ts` : PASS, 86 tests.
- `git diff --check` : PASS.
- Smoke navigateur authentifié : `AUTH SESSION REQUIRED`.
