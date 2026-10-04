import {
  APPLICATIONS,
  SECTIONS,
  getTracksInRecommendedOrder,
  type SectionMeta,
} from "./curriculum";
import { getAllLessons, totalMinutes } from "./content";
import type { Section } from "./types";

export interface NavLesson {
  title: string;
  href: string;
  key: string;
  estMinutes?: number;
  level?: string;
}

export interface NavPillar {
  slug: string;
  number: number | string;
  title: string;
  blurb: string;
  href: string;
  count: number;
  lessons: NavLesson[];
}

export interface NavSection {
  slug: Section;
  title: string;
  blurb: string;
  pillars: NavPillar[];
}

/** Merge the static curriculum with whatever lessons exist on disk. */
export function getNav(): NavSection[] {
  const lessons = getAllLessons();

  return (Object.values(SECTIONS) as SectionMeta[]).map((s) => ({
    slug: s.slug,
    title: s.title,
    blurb: s.blurb,
    pillars: s.pillars.map((p) => {
      const ls = lessons.filter((l) => l.section === s.slug && l.pillar === p.slug);
      return {
        slug: p.slug,
        number: p.number,
        title: p.title,
        blurb: p.blurb,
        href: `/${s.slug}/${p.slug}`,
        count: ls.length,
        lessons: ls.map((l) => ({
          title: l.title,
          href: l.href,
          key: l.key,
          estMinutes: totalMinutes(l),
          level: l.level,
        })),
      };
    }),
  }));
}

export function getAllNavLessons(): NavLesson[] {
  return getNav().flatMap((s) => s.pillars.flatMap((p) => p.lessons));
}

/** A Foundations pillar an Applications track builds on, with its lesson keys for progress. */
export interface FoundationRef {
  slug: string;
  title: string;
  href: string;
  count: number;
  lessonKeys: string[];
  /** Only the track's code paths use it; everyone else can skip it. */
  optional: boolean;
}

/** An Applications track plus the Foundations it builds on — drives /path and the "Builds on" block. */
export interface TrackPath {
  slug: string;
  /** The track's course letter, A–D. */
  letter: string;
  title: string;
  blurb: string;
  href: string;
  goalFit: string;
  recommendedOrder: number;
  count: number;
  buildsOn: FoundationRef[];
}

function foundationRefs(
  foundations: NavSection | undefined,
  slugs: string[],
  optional: string[] = [],
): FoundationRef[] {
  if (!foundations) return [];
  return slugs
    .map((slug) => foundations.pillars.find((p) => p.slug === slug))
    .filter((p): p is NavPillar => Boolean(p))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      href: p.href,
      count: p.count,
      lessonKeys: p.lessons.map((l) => l.key),
      optional: optional.includes(p.slug),
    }));
}

/** All Applications tracks in recommended order, each with its resolved Foundations. */
export function getTrackPaths(): TrackPath[] {
  const nav = getNav();
  const foundations = nav.find((s) => s.slug === "foundations");
  const apps = nav.find((s) => s.slug === "applications");

  return getTracksInRecommendedOrder().map((t) => ({
    slug: t.slug,
    letter: String(t.number),
    title: t.title,
    blurb: t.blurb,
    href: `/applications/${t.slug}`,
    goalFit: t.goalFit ?? "",
    recommendedOrder: t.recommendedOrder ?? 99,
    count: apps?.pillars.find((p) => p.slug === t.slug)?.count ?? 0,
    buildsOn: foundationRefs(foundations, t.buildsOn ?? [], t.optional),
  }));
}

/** The Foundations a single Applications track builds on (for the per-track "Builds on" block). */
export function getBuildsOnForTrack(trackSlug: string): FoundationRef[] {
  const track = APPLICATIONS.find((t) => t.slug === trackSlug);
  if (!track?.buildsOn?.length) return [];
  const foundations = getNav().find((s) => s.slug === "foundations");
  return foundationRefs(foundations, track.buildsOn, track.optional);
}
