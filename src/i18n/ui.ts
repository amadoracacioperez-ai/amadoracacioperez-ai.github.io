import type { Locale } from '@/config/site';

// Textos de la interfaz. Cada clave existe en los tres idiomas (lo comprueba el tipo).
const en = {
  'meta.title': 'Amador Acacio · SaaS & ERP Consultant · Computer Engineer',
  'meta.description':
    'Amador Acacio: SaaS & ERP consultant and computer engineer with an MBA, based in Paris. Procure-to-Pay and Order-to-Cash solutions integrated with SAP and Oracle, plus my own apps and AI tools.',
  'a11y.skip': 'Skip to content',
  'a11y.mainNav': 'Main navigation',
  'a11y.stations': 'Sections',
  'a11y.languages': 'Language',
  'a11y.home': 'Amador Acacio, home',

  'nav.about': 'About',
  'nav.journey': 'Journey',
  'nav.milestones': 'Milestones',
  'nav.projects': 'Projects',
  'nav.contact': 'Contact',

  'cta.projects': 'View projects',
  'cta.cv': 'Download CV',
  'cta.cvShort': 'CV',
  'cta.contact': 'Get in touch',

  'view.quick': 'Quick view',
  'view.immersive': '3D view',
  'view.quickHint': 'Switch to a simple layout without 3D',
  'view.immersiveHint': 'Switch back to the 3D journey',

  'hero.hello': "Hi, I'm",
  'hero.scroll': 'Scroll to start the journey',
  'hero.basedIn': 'Based in Paris',

  'about.title': 'About',
  'about.languages': 'Languages',
  'about.skills': 'Skills',
  'stat.languages': 'languages',
  'stat.countries': 'countries I have lived in',
  'stat.projects': 'personal projects',

  'journey.title': 'Journey',
  'journey.earlier': 'Earlier experience',
  'journey.education': 'Education',
  'journey.present': 'Present',

  'milestones.title': 'Milestones',
  'milestones.professional': 'Professional',
  'milestones.sports': 'Sport',
  'milestones.academic': 'Academic',
  'milestones.goals': 'Next goals',

  'projects.title': 'Projects',
  'projects.group.ai': 'AI tools',
  'projects.group.apps': 'Apps & games',
  'projects.group.web': 'Web & business',
  'projects.status.live': 'Live',
  'projects.status.in-use': 'In daily use',
  'projects.status.prototype': 'Working prototype',
  'projects.status.in-progress': 'In development',
  'projects.status.design': 'In design',
  'projects.private': 'Private code · demo on request',
  'projects.count': 'projects',

  'contact.title': 'Contact',
  'contact.lead': 'Looking for new opportunities. Based in Paris and happy to travel.',
  'contact.email': 'Email',
  'contact.linkedin': 'LinkedIn',
  'contact.github': 'GitHub',
  'contact.cv': 'CV (PDF, English)',
  'contact.emailFallback': 'amadoracacioperez [at] gmail [dot] com',

  'footer.built': 'Designed and built with Astro and Three.js.',
  'footer.top': 'Back to top',

  'theme.title': 'Visual style',
  'theme.hint': 'Preview mode: pick the style you like best.',
  'theme.space': 'Space journey',
  'theme.sport': 'Sport-tech',
  'theme.glass': 'Glass & chrome',
  'theme.grid': 'Cyber-grid',
  'theme.supercar': 'Supercar',

  'hud.progress': 'Progress',

  '404.title': 'Lost in space',
  '404.text': "This page doesn't exist, or it has moved.",
  '404.back': 'Back to the start',
};

type UiKey = keyof typeof en;

const fr: Record<UiKey, string> = {
  'meta.title': 'Amador Acacio · Consultant SaaS & ERP · Ingénieur informaticien',
  'meta.description':
    "Amador Acacio : consultant SaaS & ERP et ingénieur informaticien titulaire d'un MBA, à Paris. Solutions Procure-to-Pay et Order-to-Cash intégrées à SAP et Oracle, et mes propres apps et outils d'IA.",
  'a11y.skip': 'Aller au contenu',
  'a11y.mainNav': 'Navigation principale',
  'a11y.stations': 'Sections',
  'a11y.languages': 'Langue',
  'a11y.home': "Amador Acacio, page d'accueil",

  'nav.about': 'À propos',
  'nav.journey': 'Parcours',
  'nav.milestones': 'Jalons',
  'nav.projects': 'Projets',
  'nav.contact': 'Contact',

  'cta.projects': 'Voir les projets',
  'cta.cv': 'Télécharger le CV',
  'cta.cvShort': 'CV',
  'cta.contact': 'Me contacter',

  'view.quick': 'Vue rapide',
  'view.immersive': 'Vue 3D',
  'view.quickHint': 'Passer à une mise en page simple, sans 3D',
  'view.immersiveHint': 'Revenir au voyage en 3D',

  'hero.hello': 'Bonjour, je suis',
  'hero.scroll': 'Faites défiler pour commencer le voyage',
  'hero.basedIn': 'Je vis à Paris',

  'about.title': 'À propos',
  'about.languages': 'Langues',
  'about.skills': 'Compétences',
  'stat.languages': 'langues',
  'stat.countries': "pays où j'ai vécu",
  'stat.projects': 'projets personnels',

  'journey.title': 'Parcours',
  'journey.earlier': 'Expériences précédentes',
  'journey.education': 'Formation',
  'journey.present': "Aujourd'hui",

  'milestones.title': 'Jalons',
  'milestones.professional': 'Professionnel',
  'milestones.sports': 'Sport',
  'milestones.academic': 'Études',
  'milestones.goals': 'Prochains objectifs',

  'projects.title': 'Projets',
  'projects.group.ai': "Outils d'IA",
  'projects.group.apps': 'Apps et jeux',
  'projects.group.web': 'Web et business',
  'projects.status.live': 'En ligne',
  'projects.status.in-use': 'Utilisé au quotidien',
  'projects.status.prototype': 'Prototype fonctionnel',
  'projects.status.in-progress': 'En développement',
  'projects.status.design': 'En conception',
  'projects.private': 'Code privé · démo sur demande',
  'projects.count': 'projets',

  'contact.title': 'Contact',
  'contact.lead':
    'À la recherche de nouvelles opportunités. Je vis à Paris et je peux me déplacer.',
  'contact.email': 'E-mail',
  'contact.linkedin': 'LinkedIn',
  'contact.github': 'GitHub',
  'contact.cv': 'CV (PDF, anglais)',
  'contact.emailFallback': 'amadoracacioperez [at] gmail [point] com',

  'footer.built': 'Conçu et développé avec Astro et Three.js.',
  'footer.top': 'Retour en haut',

  'theme.title': 'Style visuel',
  'theme.hint': 'Mode aperçu : choisissez le style que vous préférez.',
  'theme.space': 'Voyage spatial',
  'theme.sport': 'Sport-tech',
  'theme.glass': 'Verre et chrome',
  'theme.grid': 'Cyber-grille',
  'theme.supercar': 'Supercar',

  'hud.progress': 'Progression',

  '404.title': "Perdu dans l'espace",
  '404.text': "Cette page n'existe pas ou a été déplacée.",
  '404.back': 'Revenir au début',
};

const es: Record<UiKey, string> = {
  'meta.title': 'Amador Acacio · Consultor SaaS y ERP · Ingeniero informático',
  'meta.description':
    'Amador Acacio: consultor SaaS y ERP e ingeniero informático con un MBA, en París. Soluciones Procure-to-Pay y Order-to-Cash integradas con SAP y Oracle, y mis propias apps y herramientas con IA.',
  'a11y.skip': 'Saltar al contenido',
  'a11y.mainNav': 'Navegación principal',
  'a11y.stations': 'Secciones',
  'a11y.languages': 'Idioma',
  'a11y.home': 'Amador Acacio, inicio',

  'nav.about': 'Sobre mí',
  'nav.journey': 'Trayectoria',
  'nav.milestones': 'Hitos',
  'nav.projects': 'Proyectos',
  'nav.contact': 'Contacto',

  'cta.projects': 'Ver proyectos',
  'cta.cv': 'Descargar CV',
  'cta.cvShort': 'CV',
  'cta.contact': 'Contactar',

  'view.quick': 'Vista rápida',
  'view.immersive': 'Vista 3D',
  'view.quickHint': 'Cambiar a una maqueta sencilla, sin 3D',
  'view.immersiveHint': 'Volver al viaje en 3D',

  'hero.hello': 'Hola, soy',
  'hero.scroll': 'Haz scroll para empezar el viaje',
  'hero.basedIn': 'Vivo en París',

  'about.title': 'Sobre mí',
  'about.languages': 'Idiomas',
  'about.skills': 'Competencias',
  'stat.languages': 'idiomas',
  'stat.countries': 'países en los que he vivido',
  'stat.projects': 'proyectos propios',

  'journey.title': 'Trayectoria',
  'journey.earlier': 'Experiencia anterior',
  'journey.education': 'Formación',
  'journey.present': 'Actualidad',

  'milestones.title': 'Hitos',
  'milestones.professional': 'Profesional',
  'milestones.sports': 'Deporte',
  'milestones.academic': 'Académico',
  'milestones.goals': 'Próximos objetivos',

  'projects.title': 'Proyectos',
  'projects.group.ai': 'Herramientas con IA',
  'projects.group.apps': 'Apps y juegos',
  'projects.group.web': 'Web y negocio',
  'projects.status.live': 'Publicado',
  'projects.status.in-use': 'En uso diario',
  'projects.status.prototype': 'Prototipo funcional',
  'projects.status.in-progress': 'En desarrollo',
  'projects.status.design': 'En diseño',
  'projects.private': 'Código privado · demo bajo petición',
  'projects.count': 'proyectos',

  'contact.title': 'Contacto',
  'contact.lead': 'Busco nuevas oportunidades. Vivo en París y puedo viajar.',
  'contact.email': 'Email',
  'contact.linkedin': 'LinkedIn',
  'contact.github': 'GitHub',
  'contact.cv': 'CV (PDF, inglés)',
  'contact.emailFallback': 'amadoracacioperez [arroba] gmail [punto] com',

  'footer.built': 'Diseñada y desarrollada con Astro y Three.js.',
  'footer.top': 'Volver arriba',

  'theme.title': 'Estilo visual',
  'theme.hint': 'Modo vista previa: elige el estilo que más te guste.',
  'theme.space': 'Viaje espacial',
  'theme.sport': 'Deportivo-tech',
  'theme.glass': 'Cristal y cromo',
  'theme.grid': 'Cyber-grid',
  'theme.supercar': 'Superdeportivo',

  'hud.progress': 'Progreso',

  '404.title': 'Perdido en el espacio',
  '404.text': 'Esta página no existe o ha cambiado de sitio.',
  '404.back': 'Volver al inicio',
};

export const ui: Record<Locale, Record<UiKey, string>> = { en, fr, es };
export type { UiKey };
