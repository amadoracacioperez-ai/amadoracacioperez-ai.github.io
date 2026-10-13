import type { Localized, Text } from '@/i18n/utils';

// Datos personales verificados (fuente: CVGENERATOR/perfil/perfil_maestro.yaml).
// Reglas: no inventar nada; sin teléfono ni nacionalidad (ver AGENTS.md).

export interface LanguageSkill {
  code: string;
  name: Localized;
  level: Localized;
}

export interface SkillGroup {
  group: Localized;
  items: Text[];
}

export const profile = {
  name: 'Amador Acacio',
  fullName: 'Amador Acacio Pérez',
  givenName: 'Amador',
  familyName: 'Acacio Pérez',

  /** Puesto corto para el JSON-LD y la imagen OG. */
  jobTitle: {
    en: 'SaaS & ERP Consultant',
    fr: 'Consultant SaaS & ERP',
    es: 'Consultor SaaS y ERP',
  } satisfies Localized,

  /** Titular del hero: tres frases cortas. */
  headline: [
    { en: 'SaaS & ERP consultant.', fr: 'Consultant SaaS & ERP.', es: 'Consultor SaaS y ERP.' },
    {
      en: 'Computer engineer & MBA.',
      fr: 'Ingénieur informaticien & MBA.',
      es: 'Ingeniero informático y MBA.',
    },
    {
      en: 'I build apps and AI tools.',
      fr: "Je crée des apps et des outils d'IA.",
      es: 'Creo apps y herramientas con IA.',
    },
  ] satisfies Localized[],

  location: { en: 'Paris, France', fr: 'Paris, France', es: 'París, Francia' } satisfies Localized,

  bio: [
    {
      en: "I'm a computer engineer with an MBA, working as a Professional Services Consultant at Esker. I implement SaaS solutions that automate Procure-to-Pay and Order-to-Cash processes and integrate them with ERP systems such as SAP and Oracle, from client workshops and functional specifications to go-live and support.",
      fr: "Ingénieur informaticien titulaire d'un MBA, je suis Professional Services Consultant chez Esker. Je mets en place des solutions SaaS qui automatisent les processus Procure-to-Pay et Order-to-Cash et je les intègre aux ERP comme SAP et Oracle, des ateliers avec le client et des spécifications fonctionnelles jusqu'à la mise en production et au support.",
      es: 'Soy ingeniero informático con un MBA y trabajo como Professional Services Consultant en Esker. Implanto soluciones SaaS que automatizan los procesos Procure-to-Pay y Order-to-Cash y las integro con ERP como SAP y Oracle, desde los talleres con el cliente y las especificaciones funcionales hasta la puesta en producción y el soporte.',
    },
    {
      en: 'Earlier, I worked as an IT consultant at PwC on IT audit, risk and cybersecurity engagements and on data analysis. In parallel, I design and build my own iOS and Android apps and AI-assisted tools.',
      fr: "Auparavant, j'ai été consultant IT chez PwC, sur des missions d'audit informatique, de risques et de cybersécurité, ainsi que d'analyse de données. En parallèle, je conçois et développe mes propres applications iOS et Android et des outils assistés par l'IA.",
      es: 'Antes fui consultor IT en PwC, en proyectos de auditoría informática, riesgos y ciberseguridad, y de análisis de datos. En paralelo, diseño y desarrollo mis propias apps para iOS y Android y herramientas con IA.',
    },
    {
      en: "I've lived and worked in Madrid and Dublin, and I'm now based in Paris. I work with clients in Spanish, English and French. Sport has always been part of my life: I spent four years as a semi-professional basketball referee.",
      fr: "J'ai vécu et travaillé à Madrid et à Dublin, et je vis aujourd'hui à Paris. Je travaille avec mes clients en espagnol, en anglais et en français. Le sport a toujours fait partie de ma vie : pendant quatre ans, j'ai été arbitre de basket-ball semi-professionnel.",
      es: 'He vivido y trabajado en Madrid y Dublín, y ahora vivo en París. Trabajo con clientes en español, inglés y francés. El deporte siempre ha formado parte de mi vida: durante cuatro años fui árbitro semiprofesional de baloncesto.',
    },
  ] satisfies Localized[],

  languages: [
    {
      code: 'es',
      name: { en: 'Spanish', fr: 'Espagnol', es: 'Español' },
      level: { en: 'Native', fr: 'Langue maternelle', es: 'Nativo' },
    },
    {
      code: 'en',
      name: { en: 'English', fr: 'Anglais', es: 'Inglés' },
      level: { en: 'Fluent · C1', fr: 'Courant · C1', es: 'Fluido · C1' },
    },
    {
      code: 'fr',
      name: { en: 'French', fr: 'Français', es: 'Francés' },
      level: { en: 'Fluent', fr: 'Courant', es: 'Fluido' },
    },
    {
      code: 'it',
      name: { en: 'Italian', fr: 'Italien', es: 'Italiano' },
      level: { en: 'Intermediate', fr: 'Intermédiaire', es: 'Intermedio' },
    },
  ] satisfies LanguageSkill[],

  /** Países en los que ha vivido (Madrid, Dublín, París). */
  countries: [
    { en: 'Spain', fr: 'Espagne', es: 'España' },
    { en: 'Ireland', fr: 'Irlande', es: 'Irlanda' },
    { en: 'France', fr: 'France', es: 'Francia' },
  ] satisfies Localized[],

  skills: [
    {
      group: { en: 'SaaS & ERP', fr: 'SaaS & ERP', es: 'SaaS y ERP' },
      items: [
        { en: 'SaaS implementation', fr: 'Implémentation SaaS', es: 'Implantación SaaS' },
        { en: 'ERP integration (SAP, Oracle)', fr: 'Intégration ERP (SAP, Oracle)', es: 'Integración con ERP (SAP, Oracle)' },
        'Procure-to-Pay',
        'Order-to-Cash',
        { en: 'E-invoicing & EDI', fr: 'Facturation électronique & EDI', es: 'Facturación electrónica y EDI' },
        { en: 'Single sign-on (SSO)', fr: 'Authentification unique (SSO)', es: 'Inicio de sesión único (SSO)' },
      ],
    },
    {
      group: { en: 'Consulting', fr: 'Conseil', es: 'Consultoría' },
      items: [
        { en: 'Client workshops & Fit-Gap', fr: 'Ateliers clients & Fit-Gap', es: 'Talleres con clientes y Fit-Gap' },
        { en: 'Functional specifications', fr: 'Spécifications fonctionnelles', es: 'Especificaciones funcionales' },
        { en: 'Pre-sales demos & PoC', fr: 'Démos avant-vente & PoC', es: 'Demos de preventa y PoC' },
        { en: 'Training & documentation', fr: 'Formation & documentation', es: 'Formación y documentación' },
        { en: 'N1/N2 support', fr: 'Support N1/N2', es: 'Soporte N1/N2' },
        'Agile · Scrum',
      ],
    },
    {
      group: { en: 'Development & data', fr: 'Développement & données', es: 'Desarrollo y datos' },
      items: ['JavaScript', 'SQL', 'REST · SOAP', 'XML · JSON', { en: 'Python (scripts)', fr: 'Python (scripts)', es: 'Python (scripts)' }, 'Power BI'],
    },
    {
      group: { en: 'Apps & AI', fr: 'Apps & IA', es: 'Apps e IA' },
      items: [
        'Swift · SwiftUI',
        'React Native',
        { en: 'LLM APIs & agents', fr: 'API de LLM & agents', es: 'API de LLM y agentes' },
        'Prompt engineering',
        'Claude Code',
        'Git · GitHub',
      ],
    },
  ] satisfies SkillGroup[],
};
