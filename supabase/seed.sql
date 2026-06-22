insert into public.domains (id, slug, name, description, icon, status, display_order)
values
  ('00000000-0000-4000-8000-000000000001', 'creation-web', 'Creation web', 'Concevoir, developper et publier des sites web modernes.', 'code', 'active', 1),
  ('00000000-0000-4000-8000-000000000002', 'creation-audiovisuelle-ia', 'Creation audiovisuelle IA', 'Imaginer, produire et monter des contenus video avec des outils IA.', 'film', 'active', 2)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  status = excluded.status,
  display_order = excluded.display_order;

insert into public.courses (
  id,
  domain_id,
  teacher_id,
  slug,
  title,
  subtitle,
  description,
  level,
  status,
  visibility,
  availability,
  cover_image,
  duration_minutes,
  format,
  tags,
  published_at
)
values
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000001',
    (select id from public.profiles where role in ('teacher', 'admin') order by created_at limit 1),
    'formation-creation-web',
    'Formation creation web',
    'De l''idee au site publie avec HTML, CSS, Next.js et Netlify',
    'Une formation complete et progressive pour concevoir, developper, tester et publier un site web professionnel.',
    'beginner',
    'published',
    'public',
    'complete',
    '/images/courses/web-creation-cover.png',
    780,
    'Formation guidee',
    array['html', 'css', 'nextjs', 'typescript', 'netlify'],
    '2026-06-03'
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000001',
    (select id from public.profiles where role in ('teacher', 'admin') order by created_at limit 1),
    'wordpress-pour-independants',
    'WordPress pour independants',
    null,
    'Un futur parcours pratique pour creer un site vitrine WordPress clair, credible et facile a maintenir.',
    'beginner',
    'published',
    'public',
    'coming-soon',
    '/images/courses/web-creation-cover.png',
    75,
    'Parcours guide',
    array['wordpress', 'independants', 'site vitrine', 'no-code'],
    '2026-06-03'
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000002',
    (select id from public.profiles where role in ('teacher', 'admin') order by created_at limit 1),
    'ai-filmmaking-foundations',
    'AI Filmmaking Foundations',
    'Concevoir une video courte avec un workflow IA clair, de l''idee au montage demo',
    'Une formation en apercu pour decouvrir les bases de la creation audiovisuelle assistee par IA.',
    'beginner',
    'published',
    'public',
    'preview',
    '/images/courses/ai-creative-media-cover.png',
    150,
    'Fiche apercu',
    array['ia', 'video', 'prompt', 'filmmaking'],
    '2026-06-03'
  ),
  (
    '00000000-0000-4000-8000-000000000104',
    '00000000-0000-4000-8000-000000000002',
    (select id from public.profiles where role in ('teacher', 'admin') order by created_at limit 1),
    'prompt-design-pour-creatifs',
    'Prompt Design pour creatifs',
    null,
    'Une fiche apercu pour apprendre a formuler, tester et ameliorer des prompts visuels, editoriaux et video.',
    'intermediate',
    'published',
    'public',
    'preview',
    '/images/courses/ai-creative-media-cover.png',
    60,
    'Atelier pratique',
    array['ia', 'prompt', 'creation', 'workflow'],
    '2026-06-03'
  )
on conflict (slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  status = excluded.status,
  visibility = excluded.visibility,
  availability = excluded.availability,
  duration_minutes = excluded.duration_minutes,
  format = excluded.format,
  tags = excluded.tags;

insert into public.course_modules (id, course_id, slug, title, description, duration_minutes, display_order, status)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 'strategie-et-cadrage', 'Strategie et cadrage', 'Transformer une idee en brief exploitable.', 135, 1, 'published'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000101', 'html-et-structure', 'HTML et structure', 'Construire les fondations semantiques du site.', 130, 2, 'published'),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000101', 'css-responsive', 'CSS, responsive et composants', 'Designer une interface propre et responsive.', 190, 3, 'published'),
  ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000101', 'nextjs-typescript', 'Next.js et TypeScript', 'Structurer l''application et les donnees.', 180, 4, 'locked'),
  ('00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000101', 'qualite-et-publication', 'Qualite et publication', 'Tester et publier le projet web.', 145, 5, 'locked'),
  ('00000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-000000000102', 'apercu-site-independant', 'Apercu du parcours WordPress', 'Preparer un futur parcours WordPress.', 75, 1, 'locked'),
  ('00000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-000000000103', 'preproduction-et-concept', 'Preproduction IA et concept', 'Cadrer l''intention et la shotlist.', 45, 1, 'published'),
  ('00000000-0000-4000-8000-000000000208', '00000000-0000-4000-8000-000000000103', 'prompts-video-et-direction-artistique', 'Prompts video et direction artistique', 'Ecrire et iterer des prompts video.', 55, 2, 'locked'),
  ('00000000-0000-4000-8000-000000000209', '00000000-0000-4000-8000-000000000103', 'montage-demo-et-export', 'Montage demo et export', 'Assembler une sequence courte.', 50, 3, 'locked'),
  ('00000000-0000-4000-8000-000000000210', '00000000-0000-4000-8000-000000000104', 'apercu-prompt-design', 'Apercu Prompt Design', 'Tester un workflow de prompt creatif.', 60, 1, 'published')
on conflict (course_id, slug) do update set
  title = excluded.title,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  display_order = excluded.display_order,
  status = excluded.status;

insert into public.lessons (id, course_id, module_id, slug, title, description, type, status, duration_minutes, content_path, display_order)
values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', 'brief-et-objectifs', 'Brief, cible et objectifs', 'Transformer une idee en brief clair.', 'reading', 'published', 35, 'content/lessons/web/brief-et-objectifs.md', 1),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', 'arborescence-et-parcours', 'Arborescence et parcours utilisateur', 'Organiser les pages et appels a l''action.', 'exercise', 'published', 45, 'content/lessons/web/arborescence-et-parcours.md', 2),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', 'wireframe-rapide', 'Wireframe rapide', 'Dessiner la structure de la page principale.', 'project', 'published', 55, 'content/lessons/web/wireframe-rapide.md', 3),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000202', 'structure-html-semantique', 'Structure HTML semantique', 'Construire une page lisible avec les balises adaptees.', 'video', 'published', 50, 'content/lessons/web/structure-html-semantique.md', 1),
  ('00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000202', 'contenus-et-liens', 'Contenus, liens et medias', 'Ajouter textes, liens, images et boutons.', 'exercise', 'published', 45, 'content/lessons/web/contenus-et-liens.md', 2),
  ('00000000-0000-4000-8000-000000000306', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000202', 'bases-accessibilite', 'Bases d''accessibilite', 'Appliquer les premieres bonnes pratiques.', 'reading', 'locked', 35, 'content/lessons/web/bases-accessibilite.md', 3),
  ('00000000-0000-4000-8000-000000000307', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000203', 'couleurs-typo-espacements', 'Couleurs, typographie et espacements', 'Mettre en place une base visuelle reutilisable.', 'video', 'published', 55, 'content/lessons/web/couleurs-typo-espacements.md', 1),
  ('00000000-0000-4000-8000-000000000308', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000203', 'flexbox-grid-responsive', 'Flexbox, Grid et responsive', 'Creer des layouts lisibles sur mobile et desktop.', 'exercise', 'published', 70, 'content/lessons/web/flexbox-grid-responsive.md', 2),
  ('00000000-0000-4000-8000-000000000309', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000203', 'composants-ui', 'Composants UI reutilisables', 'Construire boutons, cartes et sections coherentes.', 'project', 'locked', 65, 'content/lessons/web/composants-ui.md', 3),
  ('00000000-0000-4000-8000-000000000310', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000204', 'demarrer-nextjs', 'Demarrer avec Next.js', 'Installer et comprendre une application App Router.', 'video', 'locked', 50, 'content/lessons/web/demarrer-nextjs.md', 1),
  ('00000000-0000-4000-8000-000000000311', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000204', 'donnees-et-types', 'Donnees et types TypeScript', 'Structurer le contenu avec des donnees typees.', 'exercise', 'locked', 55, 'content/lessons/web/donnees-et-types.md', 2),
  ('00000000-0000-4000-8000-000000000312', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000204', 'assembler-page', 'Assembler une page complete', 'Brancher sections, donnees et styles.', 'project', 'locked', 75, 'content/lessons/web/assembler-page.md', 3),
  ('00000000-0000-4000-8000-000000000313', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000205', 'qualite-avant-publication', 'Qualite avant publication', 'Verifier lisibilite, responsive et performance.', 'quiz', 'locked', 40, 'content/lessons/web/qualite-avant-publication.md', 1),
  ('00000000-0000-4000-8000-000000000314', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000205', 'deployer-netlify', 'Deployer sur Netlify', 'Configurer le build et publier le projet.', 'video', 'locked', 45, 'content/lessons/web/deployer-netlify.md', 2),
  ('00000000-0000-4000-8000-000000000315', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000205', 'revue-projet-final', 'Revue du projet final', 'Presenter le site et preparer la suite.', 'project', 'locked', 60, 'content/lessons/web/revue-projet-final.md', 3),
  ('00000000-0000-4000-8000-000000000316', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000207', 'concept-video-courte', 'Concept d''une video courte', 'Passer d''une intention creative a une sequence simple.', 'reading', 'published', 25, 'content/lessons/ai-filmmaking/concept-video-courte.md', 1),
  ('00000000-0000-4000-8000-000000000317', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000208', 'prompts-video-ia', 'Prompts video IA', 'Ecrire des prompts courts pour decrire un plan.', 'exercise', 'locked', 35, 'content/lessons/ai-filmmaking/prompts-video-ia.md', 1),
  ('00000000-0000-4000-8000-000000000318', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000209', 'montage-demo', 'Montage demo', 'Assembler quelques plans generes.', 'project', 'locked', 40, 'content/lessons/ai-filmmaking/montage-demo.md', 1),
  ('00000000-0000-4000-8000-000000000319', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000206', 'positionner-son-site', 'Positionner son site d''independant', 'Identifier offre, pages et contenus.', 'reading', 'locked', 30, 'content/lessons/wordpress/positionner-son-site.md', 1),
  ('00000000-0000-4000-8000-000000000320', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000206', 'site-vitrine-wordpress', 'Assembler un site vitrine WordPress', 'Construire une premiere structure de site.', 'project', 'locked', 45, 'content/lessons/wordpress/site-vitrine-wordpress.md', 2),
  ('00000000-0000-4000-8000-000000000321', '00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000210', 'brief-creatif-prompt', 'Brief creatif et intention', 'Transformer une intention en brief exploitable.', 'reading', 'published', 25, 'content/lessons/prompt-design/brief-creatif-prompt.md', 1),
  ('00000000-0000-4000-8000-000000000322', '00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000210', 'iterer-ses-prompts', 'Iterer ses prompts', 'Comparer plusieurs variantes et affiner le resultat.', 'exercise', 'locked', 35, 'content/lessons/prompt-design/iterer-ses-prompts.md', 2)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  type = excluded.type,
  status = excluded.status,
  duration_minutes = excluded.duration_minutes,
  content_path = excluded.content_path,
  display_order = excluded.display_order;
