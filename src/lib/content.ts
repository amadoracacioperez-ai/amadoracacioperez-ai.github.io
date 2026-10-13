import { getCollection, type CollectionEntry } from 'astro:content';

type Ordered = { data: { order: number } };
const byOrder = (a: Ordered, b: Ordered) => a.data.order - b.data.order;

export type Experience = CollectionEntry<'experience'>;
export type Education = CollectionEntry<'education'>;
export type Achievement = CollectionEntry<'achievements'>;
export type Goal = CollectionEntry<'goals'>;
export type Project = CollectionEntry<'projects'>;
export type ProjectGroup = Project['data']['group'];

export const PROJECT_GROUPS: ProjectGroup[] = ['ai', 'apps', 'web'];

/** Carga todo el contenido publicado (sin borradores), ordenado. */
export async function loadContent() {
  const published = <T extends { data: { draft: boolean } }>(e: T) => !e.data.draft;
  const [experience, education, achievements, goals, projects] = await Promise.all([
    getCollection('experience', published),
    getCollection('education', published),
    getCollection('achievements', published),
    getCollection('goals', published),
    getCollection('projects', published),
  ]);
  return {
    experience: experience.sort(byOrder),
    education: education.sort(byOrder),
    achievements: achievements.sort(byOrder),
    goals: goals.sort(byOrder),
    projects: projects.sort(byOrder),
  };
}

export type SiteContent = Awaited<ReturnType<typeof loadContent>>;

/** Pantallas de la trayectoria: una por experiencia principal; las compactas, de dos en dos. */
export type JourneyFrame =
  | { kind: 'role'; item: Experience }
  | { kind: 'earlier'; items: Experience[] }
  | { kind: 'education'; items: Education[] };

export function journeyFrames(experience: Experience[], education: Education[]): JourneyFrame[] {
  const frames: JourneyFrame[] = [];
  let buffer: Experience[] = [];
  const flush = () => {
    if (buffer.length) frames.push({ kind: 'earlier', items: buffer });
    buffer = [];
  };
  for (const entry of experience) {
    if (entry.data.compact) {
      buffer.push(entry);
      if (buffer.length === 2) flush();
    } else {
      flush();
      frames.push({ kind: 'role', item: entry });
    }
  }
  flush();
  if (education.length) frames.push({ kind: 'education', items: education });
  return frames;
}
