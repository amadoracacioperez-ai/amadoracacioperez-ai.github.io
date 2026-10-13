import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Un fichero YAML por entrada. Los textos traducibles llevan { en, fr, es }.
// `draft: true` oculta la entrada (y una sección sin entradas publicadas no se muestra).

const localized = z.object({ en: z.string(), fr: z.string(), es: z.string() });
const text = z.union([z.string(), localized]);

const yamlIn = (dir: string) => glob({ pattern: '**/[^_]*.yaml', base: `./src/content/${dir}` });

const experience = defineCollection({
  loader: yamlIn('experience'),
  schema: z.object({
    order: z.number(),
    role: text,
    org: text,
    location: localized.optional(),
    start: z.string(), // 'AAAA-MM' o 'AAAA'
    end: z.string().optional(), // sin fin = actualidad
    summary: localized,
    highlights: z.array(localized).default([]),
    tags: z.array(z.string()).default([]),
    /** Las entradas compactas se agrupan de dos en dos en la misma pantalla. */
    compact: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const education = defineCollection({
  loader: yamlIn('education'),
  schema: z.object({
    order: z.number(),
    degree: localized,
    institution: z.string(),
    start: z.string(),
    end: z.string().optional(),
    detail: localized.optional(),
    draft: z.boolean().default(false),
  }),
});

const achievements = defineCollection({
  loader: yamlIn('achievements'),
  schema: z.object({
    order: z.number(),
    track: z.enum(['professional', 'sports', 'academic']),
    period: z.string().optional(),
    title: localized,
    detail: localized.optional(),
    /** Cifra destacada (por ejemplo "4") y su etiqueta. */
    metric: z.string().optional(),
    metricLabel: localized.optional(),
    draft: z.boolean().default(false),
  }),
});

const goals = defineCollection({
  loader: yamlIn('goals'),
  schema: z.object({
    order: z.number(),
    track: z.enum(['professional', 'sports', 'personal']),
    title: localized,
    detail: localized.optional(),
    horizon: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: yamlIn('projects'),
  schema: z.object({
    order: z.number(),
    group: z.enum(['ai', 'apps', 'web']),
    name: text,
    tagline: localized,
    description: localized,
    stack: z.array(z.string()),
    status: z.enum(['live', 'in-use', 'prototype', 'in-progress', 'design']),
    year: z.number().optional(),
    links: z.array(z.object({ label: text, url: z.url() })).default([]),
    /** El código no es público (se muestra "Código privado · demo bajo petición"). */
    privateCode: z.boolean().default(true),
    note: localized.optional(),
    /** Color de acento de la portada generada. */
    accent: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { experience, education, achievements, goals, projects };
