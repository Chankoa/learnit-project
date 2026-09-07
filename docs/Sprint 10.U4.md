# Sprint 10.U4.2 — Single Account & Role-neutral Authoring

Modèle :
Astra-6
Raisonnement :
High

IMPORTANT :
Ce sprint est un chantier d'architecture Auth / authorization / RLS.
Prendre le temps d'auditer le système avant toute modification.
Ne pas effectuer un refactor massif à l'aveugle.

Ne PAS démarrer U4.3 / travail de redesign DS dans cette session.

======================================================================
0. ÉTAT DE DÉPART / BRANCHE
======================================================================

Le travail précédent se trouve sur :

sprint-10-u4-1-visible-convergence

Cette branche contient notamment :

- entrée publique unifiée ;
- `/app/create` ;
- correction du switch `mode=learn|edit` ;
- disparition des routes Learner/Teacher de la navigation nominale.

U4.1 n'est PAS encore accepté/mergé séparément.
U4.2 doit partir de cette branche et l'absorber.

Vérifier :

git status
git branch --show-current
git log -5 --oneline

Attendu au départ :
branche `sprint-10-u4-1-visible-convergence`.

Si nécessaire :

git switch sprint-10-u4-1-visible-convergence
git pull

Puis créer :

git switch -c sprint-10-u4-2-single-account-authoring

Ne pas repartir de main.
Ne pas perdre les modifications U4.1.

Ne pas commit/push automatiquement à la fin.
Présenter d'abord le CR et le diff.

======================================================================
1. CONTEXTE PRODUIT
======================================================================

Principe Forge / LearnIt désormais validé :

> J'apprends autant que j'enseigne.

LearnIt ne doit plus considérer Learner et Teacher comme deux identités
de produit différentes.

La cible est :

UN COMPTE UTILISATEUR
+
DES RELATIONS / CAPACITÉS CONTEXTUELLES

Un utilisateur peut :

- apprendre un parcours ;
- créer un parcours ;
- posséder un parcours ;
- éventuellement contribuer à un parcours ;
- apprendre un parcours qu'il possède lui-même.

Le rôle global historique `profiles.role` ne doit plus décider
des capacités pédagogiques ou éditoriales d'un parcours.

`admin` reste une capacité globale privilégiée.

======================================================================
2. PROBLÈMES RÉELS À RÉSOUDRE
======================================================================

La convergence UI U4.1 révèle encore plusieurs contradictions structurelles.

A. INSCRIPTION

`/register` demande encore :

Type de compte
- Apprenant
- Enseignant

Le code repose encore sur :

publicRegistrationRoles
normalizePublicRegistrationRole()

et inscrit explicitement un rôle learner/teacher.

Ce choix ne doit plus être exposé.

B. LOGIN

Après login, le code utilise encore :

getProfileHomePath(profile.role)

Le rôle historique continue donc à choisir le home.

La cible est :

tous les utilisateurs actifs
→ `/app`

Un `next=` sûr doit continuer à être honoré.

C. AUTHORING

De nombreux services utilisent encore :

requireRole("teacher")

notamment dans :

- `lib/teacher-service.ts`
- `lib/forge-ai/service.ts`
- Server Actions / services Teacher associés.

Résultat actuel :

un ancien compte Teacher peut créer/modifier,
un ancien compte Learner ne le peut pas.

C'est incompatible avec le modèle unifié.

D. RLS

Les protections serveur ne suffisent pas.

Auditer également les policies Supabase authoring encore dépendantes de :

current_profile_role() = 'teacher'

ou équivalent.

La suppression du gate applicatif Teacher ne doit JAMAIS
créer un bypass RLS ou élargir accidentellement les droits.

======================================================================
3. INVARIANTS DE SÉCURITÉ
======================================================================

Ces invariants sont non négociables.

1. Une simple inscription à un cours / enrollment
NE DONNE JAMAIS de droit d'édition.

2. Un utilisateur ne peut pas modifier le cours d'un autre utilisateur
simplement parce que son ancien profil vaut `teacher`.

3. Un ancien profil `learner` qui CRÉE son propre cours
doit pouvoir le modifier.

4. Un ancien profil `teacher` conserve ses cours et ses capacités existantes.

5. Un owner peut administrer son parcours.

6. `admin` conserve ses privilèges globaux existants.

7. Un utilisateur non propriétaire / sans capacité
ne peut pas :

- modifier un cours ;
- créer/modifier/supprimer ses modules ;
- créer/modifier/supprimer ses leçons ;
- publier/dépublier ;
- modifier les ressources ;
- modifier les sources ;
- utiliser Forge authoring sur ce cours ;
- gérer les participants.

8. Les accès Learning déjà role-neutral doivent rester intacts.

9. Aucun changement ne doit affaiblir les RLS.

======================================================================
4. NE PAS SUPPRIMER `profiles.role`
======================================================================

Ne PAS supprimer brutalement :

profiles.role

Ne PAS renommer massivement l'enum DB.

Ne PAS introduire automatiquement un nouveau rôle DB `user`
sans démontrer qu'il est indispensable.

Pour U4.2 :

`profiles.role` devient une propriété de compatibilité legacy.

Elle peut encore servir à :

- compatibilité des anciennes routes ;
- administration ;
- migrations progressives ;
- éventuellement certains écrans legacy.

Mais elle NE DOIT PLUS servir de condition :

"peut apprendre"
ou
"peut créer/modifier un parcours".

Pour les nouvelles inscriptions publiques,
si le schéma exige toujours une valeur de rôle :

utiliser une valeur de compatibilité interne stable
(par exemple `learner` si c'est le choix le moins risqué),

MAIS :

- ne pas afficher ce choix à l'utilisateur ;
- ne pas présenter le compte comme "Learner" ;
- documenter clairement que cette valeur est legacy.

Ne pas modifier le rôle des comptes existants.

======================================================================
5. INSCRIPTION — UN COMPTE UNIQUE
======================================================================

Refondre `/register`.

Supprimer de l'UI :

- "Type de compte"
- "Apprenant"
- "Enseignant"

L'utilisateur renseigne uniquement les informations nécessaires,
par exemple :

- nom ;
- email ;
- mot de passe.

Le produit crée :

un compte LearnIt.

Pas un "compte Learner" ou un "compte Teacher".

Adapter :

- `app/register/page.tsx`
- `app/auth/actions.ts`
- `lib/auth/role-governance.ts`

sans casser la gouvernance Admin.

La promotion Admin doit rester privilégiée et impossible publiquement.

Après inscription / confirmation :

→ `/app`
ou le `next=` sûr explicitement demandé.

Ne jamais renvoyer automatiquement vers :

/app/learner
/app/teacher

======================================================================
6. LOGIN — HOME UNIQUE
======================================================================

Auditer `loginAction`.

Le code actuel calcule déjà `nextPath`
mais finit encore par rediriger via le rôle.

Corriger le contrat :

si login valide et profil actif :

- respecter `nextPath` s'il est sûr ;
- sinon `/app`.

Le rôle learner/teacher ne doit plus choisir le home.

Pour Admin :

la connexion peut également arriver sur `/app`.

L'Administration reste accessible depuis la navigation
conditionnelle Admin.

Ne pas forcer Admin vers `/app/admin`
sauf nécessité de compatibilité explicitement documentée.

Mettre à jour les tests correspondants.

======================================================================
7. HEADER PUBLIC / AUTH CTA
======================================================================

U4.1 laisse actuellement deux CTA qui servent pratiquement
le même objectif :

- Accéder à LearnIt
- Se connecter

La cible publique non authentifiée est simple :

SE CONNECTER
CRÉER UN COMPTE

Par exemple :

secondary → Se connecter → `/login`
primary → Créer un compte → `/register`

Supprimer le CTA redondant `/app`
s'il ne fait que provoquer une redirection Auth.

Sur mobile : même contrat.

Ne pas créer trois CTA.

Ne pas réintroduire de choix Learner / Teacher / Admin.

======================================================================
8. ACCÈS À LA CRÉATION
======================================================================

La route canonique existe :

/app/create

Elle doit être accessible à TOUT PROFIL ACTIF authentifié.

La création d'un parcours ne doit plus appeler :

requireRole("teacher")

comme précondition globale.

Créer une abstraction explicite si utile :

requireActiveCreator()
ou
requireCourseCreationAccess()

mais ne pas transformer "creator" en nouveau rôle global.

Sémantique :

active authenticated user
→ peut créer un nouveau parcours.

Lors de la création :

- `courses.teacher_id` peut rester temporairement la colonne propriétaire
  si le schéma existant en dépend ;
- sa valeur doit être l'id du profil/session courant ;
- l'utilisateur devient OWNER du parcours ;
- une membership owner active doit exister si le modèle U2 l'exige.

======================================================================
9. OWNER MEMBERSHIP À LA CRÉATION
======================================================================

AUDITER avant de modifier.

Le modèle dispose de :

course_memberships

avec notamment :

viewer
participant
contributor
editor
owner

et d'un backfill historique depuis `courses.teacher_id`.

Vérifier impérativement ce qui se passe pour un NOUVEAU cours créé
après cette migration.

Cas attendu :

user crée course C
→ courses.teacher_id = user.id
→ course_memberships(C,user) = owner / active

Si cette membership est déjà créée par :

- trigger DB ;
- repository ;
- Server Action ;

ne rien dupliquer.

Si elle n'est PAS automatiquement créée :

implémenter le mécanisme le plus sûr et transactionnel possible.

Préférer une garantie DB robuste si l'architecture existante s'y prête.

Éviter :

course créé
mais owner membership absente.

Ajouter un test explicite.

======================================================================
10. AUTHORING EXISTANT — REMPLACER LE GATE GLOBAL TEACHER
======================================================================

Auditer tous les :

requireRole("teacher")

dans les chemins réellement utilisés par le workspace canonique.

Priorité :

`lib/teacher-service.ts`

Aujourd'hui plusieurs fonctions font :

requireRole("teacher")
→ repository(... profile.id ...)

La nouvelle logique doit être contextuelle.

Deux catégories :

A. OPERATIONS SANS COURSE EXISTANT

Exemples :

- créer un cours ;
- préparer un brief Forge ;
- éventuellement uploader une source temporaire non attachée.

Règle :

profil actif authentifié suffisant.

B. OPERATIONS SUR UN COURSE EXISTANT

Exemples :

- update course ;
- modules ;
- lessons ;
- resources ;
- publication ;
- sources ;
- Forge authoring ;
- students / participants.

Règle :

vérifier une capacité authoring du course.

Introduire / réutiliser une abstraction centralisée,
par exemple conceptuellement :

requireCourseCapability(courseId, "edit")
requireCourseCapability(courseId, "publish")
requireCourseCapability(courseId, "manage_members")

ou équivalent adapté au code existant.

ÉVITER de disperser des tests :

profile.role === "teacher"

dans chaque service.

======================================================================
11. SCOPE DE CAPABILITIES U4.2
======================================================================

Objectif minimum obligatoire :

un utilisateur propriétaire de son cours doit pouvoir l'éditer
QUEL QUE SOIT son ancien profiles.role.

Cela doit marcher pour :

legacy learner + owner
legacy teacher + owner

Ne pas forcer dans ce sprint l'implémentation complète
des mutations pour memberships `editor` ou `contributor`
si les repositories / RLS ne sont pas encore prêts.

Si `editor` est déjà réellement supporté de bout en bout :
préserver ce support.

Sinon :

- ne pas promettre qu'editor peut muter ;
- documenter cette dette ;
- ne pas élargir les droits partiellement.

Le besoin critique de U4.2 est :

OWNER ≠ TEACHER ROLE.

======================================================================
12. REPOSITORIES
======================================================================

Auditer notamment :

- teacherCourseRepository
- teacherResourceRepository
- teacherStudentRepository
- forgeSourceRepository

Plus généralement tout repository invoqué par :

- `/app/create`
- `/app/courses/[slug]?mode=edit`
- TeacherAuthoringWorkspace
- Forge authoring.

Les noms `teacher*` peuvent rester pour l'instant
si un renommage n'apporte aucune valeur fonctionnelle.

Ne pas lancer un renommage massif.

En revanche leurs autorisations effectives
ne doivent plus dépendre du rôle Teacher.

Lorsque les repositories utilisent :

userId / profile.id
+
courses.teacher_id

comme ownership check,
préserver cette barrière tant qu'elle est cohérente.

======================================================================
13. FORGE AUTHORING
======================================================================

`lib/forge-ai/service.ts`
contient encore plusieurs :

requireRole("teacher")

Auditer toutes les fonctions authoring.

Distinguer :

A. Forge création avant existence d'un cours

Exemples :

- génération de structure ;
- brief ;
- source temporaire non attachée.

Profil actif authentifié → autorisé.

B. Forge sur un cours existant

Exemples :

- course improvement ;
- course revision ;
- module revision ;
- lesson content ;
- apply proposal ;
- sources du cours.

Doit exiger :

ownership / capacité authoring réelle sur le cours.

Un simple enrollment ne suffit jamais.

C. Forge Learning

NE PAS modifier le contrat déjà validé :

requireLearningAccess()
+
enrollment/published course.

Ne pas mélanger Forge Learning et Forge Authoring.

======================================================================
14. RLS AUTHORING — AUDIT OBLIGATOIRE
======================================================================

C'est un point critique du sprint Astra.

Auditer les policies réelles / migrations pour les écritures de :

- courses
- course_modules
- lessons
- resources
- course_sources
- storage course sources
- storage resources/covers si pertinent
- ai_generations
- ai_generation_sources
- enrollments / participant management si nécessaire

Rechercher les gates historiques :

current_profile_role() = 'teacher'

ou équivalent.

La cible :

les policies authoring doivent dépendre de :

auth.uid()
+
ownership / capability course

et non du rôle global Teacher.

Pour CREATE COURSE :

profil authentifié actif
+
teacher_id/owner correspondant à auth.uid()
selon le contrat DB existant.

Pour UPDATE/DELETE :

ownership/capability réelle.

Pour nested resources :

capability via parent course.

Ne JAMAIS utiliser uniquement une valeur transmise par le client
pour décider du propriétaire.

======================================================================
15. MIGRATION SUPABASE
======================================================================

Si des policies doivent changer :

créer UNE migration U4.2 claire et idempotente autant que possible.

Nom suggéré :

supabase/migrations/20260907xxxxxx_role_neutral_authoring.sql

Elle peut inclure si nécessaire :

- helpers private authoring ;
- remplacement de policies Teacher role-based ;
- garantie owner membership sur création.

Respecter :

search_path explicite pour fonctions SECURITY DEFINER ;
révocations / grants minimaux ;
pas de policy permissive générique.

IMPORTANT :

Si la migration n'est pas appliquée à la DB réelle,
ne PAS déclarer :

RLS role-neutral authoring: PASS

Retourner :

MIGRATION READY — NOT APPLIED

et fournir les probes SQL exacts à exécuter.

Ne pas falsifier une validation DB.

======================================================================
16. `getCourseCapabilities` / CONTEXT RESOLVER
======================================================================

Réutiliser autant que possible les fondations U2/U3 existantes :

- course_memberships
- getCourseCapabilities()
- getUnifiedCourseRelations()
- unified course context

Ne pas créer un deuxième système parallèle.

La UI doit afficher `Modifier`
si et seulement si le serveur considère l'utilisateur autorisé.

Attention :

UI capability
≠
authorization serveur.

Les deux doivent converger,
mais le serveur reste l'autorité.

======================================================================
17. SWITCH APPRENDRE / MODIFIER
======================================================================

Après U4.2 :

un ancien compte `learner` doit pouvoir obtenir le switch
s'il remplit les DEUX conditions contextuelles :

- enrollment / canLearn ;
- owner / canEdit.

Test central :

Legacy Learner
→ crée un cours public
→ devient owner
→ s'inscrit à son propre cours
→ relation `J'apprends · Je crée`
→ switch :

Apprendre | Modifier

doit fonctionner.

Le switch ne doit PAS apparaître
à un learner seulement enrolled sur le cours d'un autre owner.

======================================================================
18. ROUTES LEGACY
======================================================================

Ne pas supprimer brutalement :

/app/learner
/app/teacher
/app/admin

Elles peuvent rester comme compatibilité temporaire.

Mais :

- login ne doit plus les cibler ;
- register ne doit plus les cibler ;
- navigation nominale ne doit plus les cibler ;
- création nominale ne doit plus les cibler.

Documenter clairement leur statut Legacy.

Admin reste utilisable conditionnellement.

======================================================================
19. PROFIL
======================================================================

La page Profil ne doit plus présenter le rôle historique
comme l'identité centrale de l'utilisateur.

Si `profiles.role` est encore affiché :

le rendre secondaire / technique
ou le masquer du parcours normal,
sauf contexte Admin.

Ne pas proposer à l'utilisateur :

"Changer de rôle".

Le produit doit parler de :

- parcours suivis ;
- parcours créés ;
- contributions/capacités.

Pas de persona global Learner/Teacher.

======================================================================
20. PUBLIC / REGISTER / LOGIN COPY
======================================================================

Nettoyer les derniers textes tels que :

"espace apprenant, enseignant ou admin"

ou :

"Type de compte"

ou toute phrase indiquant que l'utilisateur choisit une identité.

Cible :

"Votre compte LearnIt"
"Se connecter à LearnIt"
"Créer un compte"
"Accéder à vos parcours"

Ton sobre.

Pas de marketing excessif.

======================================================================
21. TESTS AUTOMATIQUES — AUTH
======================================================================

Ajouter/adapter les tests.

A. Register

- aucun select learner/teacher ;
- aucune option `Apprenant`;
- aucune option `Enseignant`;
- signup fonctionne sans champ role public ;
- rôle de compatibilité interne correct si nécessaire ;
- admin impossible publiquement ;
- redirect /app.

B. Login

legacy learner → /app
legacy teacher → /app
admin → /app ou contrat unifié décidé

`next=/app/create`
→ respecté

unsafe next
→ /app

C. Public header

exactement les actions pertinentes :

- Se connecter
- Créer un compte

pas deux CTA de connexion.

======================================================================
22. TESTS AUTOMATIQUES — AUTHORING
======================================================================

Cas impératifs :

1. Legacy learner ACTIVE
   crée un cours
   → PASS

2. Ce même utilisateur
   devient owner du cours
   → PASS

3. owner membership existe
   → PASS

4. legacy learner owner
   modifie le cours
   → PASS

5. legacy learner owner
   modifie module/leçon
   → PASS

6. legacy learner owner
   utilise Forge authoring
   → PASS

7. legacy teacher owner
   workflows existants
   → PASS

8. enrollment seulement
   sur cours d'autrui
   tentative edit
   → DENIED

9. profil actif non owner
   tentative mutation directe
   → DENIED

10. draft d'autrui
    reste invisible/non modifiable
    selon règles existantes.

11. learning role-neutral existant
    → toujours PASS.

======================================================================
23. TEST RLS / SQL À PRODUIRE
======================================================================

Préparer des probes transactionnels pour au moins :

A. legacy learner owner :

- create course
- read own course
- update own course
- create module
- create lesson
- authoring AI metadata si applicable

Attendu : autorisé.

B. legacy learner non-owner :

- update autre course
- insert module autre course
- update lesson autre course

Attendu : refus.

C. enrolled learner sur autre course :

- read published course = oui
- learning actions = oui
- edit course = non.

D. legacy teacher :

- propre course = oui
- course d'autrui = non.

E. admin :

préserver comportement actuel.

Utiliser transaction + rollback pour probes
lorsque possible.

======================================================================
24. CRÉATION MANUELLE ET FORGE CREATE
======================================================================

Valider les DEUX chemins :

/app/create
→ création manuelle

et

/app/create
→ Forge / brief / génération

pour un ancien compte Learner.

Attendu :

aucune redirection :

/app/teacher/...

Le résultat final doit être :

/app/courses/[slug]?mode=edit

======================================================================
25. NON-RÉGRESSION U3 / U4.1
======================================================================

Ne casser aucun comportement déjà validé :

- public catalogue ;
- Explorer public-only ;
- enrollment ;
- progression ;
- notes autosave ;
- ressources ;
- source-aware learning Forge ;
- self-enrollment ;
- owner + enrolled relation ;
- Learn/Edit URL helper ;
- canonical workspace ;
- `/app/create` ;
- drawers ;
- publication ;
- participants ;
- public `/formations/[slug]`.

======================================================================
26. DESIGN SYSTEM
======================================================================

U4.2 n'est PAS le sprint de redesign.

Ne pas consacrer du temps Astra à refaire SCSS / esthétique.

Seulement corriger les éléments UI indispensables :

- Register sans rôle ;
- CTA Header ;
- textes Auth ;
- Profile si rôle trop exposé ;
- affichage capability cohérent.

Le vrai chantier DS sera :

10.U4.3 — DS Fidelity & Unified Workspace Visual Rebuild

Ne pas le commencer.

======================================================================
27. DOCUMENTATION
======================================================================

Mettre à jour réellement :

docs/architecture/contextual-roles-and-capabilities.md
docs/architecture/unified-course-workspace.md

et éventuellement un document court :

docs/architecture/single-account-role-neutral-authoring.md

Documenter :

- profiles.role = compatibility role ;
- admin = global privileged role ;
- learning = enrollment relation ;
- authoring = ownership/capability relation ;
- creation = active authenticated user ;
- legacy routes = compatibility only.

Ne pas produire un long document redondant.

======================================================================
28. CRITÈRES DE FERMETURE
======================================================================

U4.2 ne peut être CLOSED que si le scénario suivant fonctionne réellement :

NOUVEAU COMPTE

Homepage
→ Créer un compte
→ aucune question Learner/Teacher
→ confirmation/login
→ /app
→ Créer
→ /app/create
→ créer un parcours
→ devient owner
→ éditer module/leçon
→ Forge authoring
→ publier éventuellement
→ s'inscrire au même parcours
→ `J'apprends · Je crée`
→ Apprendre
→ Modifier
→ Apprendre

sans jamais dépendre de :

profiles.role = teacher.

Deuxième gate :

ancien compte Learner
→ peut créer et éditer SON cours.

Troisième gate :

enrollment seul sur cours d'autrui
→ NE PEUT PAS éditer.

======================================================================
29. VALIDATION TECHNIQUE
======================================================================

Exécuter :

npm run config:check
npm run typecheck
npm run build
tests complets
git diff --check

Conserver l'avertissement connu :

AI_API_KEY / AI_MODEL legacy aliases

hors scope.

======================================================================
30. STOP CONDITIONS
======================================================================

STOP et expliquer avant d'élargir le scope si :

- supprimer profiles.role devient nécessaire ;
- modifier profondément le schéma Profiles est nécessaire ;
- editor/contributor nécessite une migration majeure non prévue ;
- le modèle courses.teacher_id empêche une migration sûre ;
- les RLS existantes se contredisent avec les capabilities U2 ;
- une migration destructrice devient nécessaire.

Ne jamais contourner une incohérence de sécurité
simplement pour faire passer la UI.

======================================================================
31. COMPTE RENDU FINAL
======================================================================

Retourner un CR structuré :

## Audit
- dépendances historiques au rôle trouvées
- authoring gates trouvés
- RLS role-based trouvées

## Auth
- register
- login
- next
- rôle compatibility

## Creation
- active user create
- owner assignment
- owner membership

## Authoring
- course
- modules
- lessons
- resources
- publication
- participants

## Forge
- pre-course creation
- course-scoped authoring
- learning untouched

## RLS
- migrations
- policies
- probes
- appliquées ou NOT APPLIED

## Legacy
- routes conservées
- dépendances restantes

## Tests
- config
- typecheck
- build
- suite
- diff

## Manuel
- smoke encore nécessaire

Puis gates :

U4.2 Single Account: PASS / PARTIAL / FAIL

Public registration without role choice: PASS / FAIL

Unified login → /app: PASS / FAIL

Legacy Learner can create: PASS / NOT VERIFIED / FAIL

Legacy Learner can edit owned course: PASS / NOT VERIFIED / FAIL

Owner membership creation: PASS / NOT VERIFIED / FAIL

Role-neutral course authoring: PASS / PARTIAL / FAIL

Role-neutral Forge authoring: PASS / PARTIAL / FAIL

Enrollment does not grant edit: PASS / NOT VERIFIED / FAIL

RLS authoring: PASS / MIGRATION READY NOT APPLIED / FAIL

Legacy Teacher regression: PASS / NOT VERIFIED / FAIL

Learning regression: PASS / NOT VERIFIED / FAIL

New-account end-to-end flow: PASS / NOT VERIFIED / FAIL

Ne pas démarrer U4.3.

Ne pas commit/push automatiquement.