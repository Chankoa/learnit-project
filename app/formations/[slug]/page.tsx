import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseAudience } from "@/components/course/CourseAudience";
import { CourseCta } from "@/components/course/CourseCta";
import { CourseFaq } from "@/components/course/CourseFaq";
import { CourseHero } from "@/components/course/CourseHero";
import { CourseInstructor } from "@/components/course/CourseInstructor";
import { CourseMeta } from "@/components/course/CourseMeta";
import { CourseMethod } from "@/components/course/CourseMethod";
import { CourseObjectives } from "@/components/course/CourseObjectives";
import { CourseProgramPreview } from "@/components/course/CourseProgramPreview";
import { CourseRecommendations } from "@/components/course/CourseRecommendations";
import { CourseRequirements } from "@/components/course/CourseRequirements";
import { CourseResources } from "@/components/course/CourseResources";
import {
  getLmsCatalog,
  getLmsCatalogCourse
} from "@/lib/lms";
import { getCurrentProfile } from "@/lib/auth/server";
import { createPageMetadata } from "@/lib/seo";
import { getUnifiedCourseContext } from "@/lib/unified-course-workspace";

type FormationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: FormationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getLmsCatalogCourse(slug);

  if (!course) {
    return {
      title: "Formation introuvable"
    };
  }

  return createPageMetadata({
    title: course.title,
    description: course.description,
    path: `/formations/${course.slug}`,
    image: course.coverImage
  });
}

export default async function FormationPage({ params }: FormationPageProps) {
  const { slug } = await params;
  const [course, catalogCourses, profile] = await Promise.all([
    getLmsCatalogCourse(slug),
    getLmsCatalog(),
    getCurrentProfile()
  ]);

  if (!course) {
    notFound();
  }

  const context = profile ? await getUnifiedCourseContext(course.slug) : undefined;
  const primaryCta = !profile
    ? {
        href: `/login?next=${encodeURIComponent(`/app/courses/${course.slug}`)}`,
        label: "Se connecter pour s'inscrire"
      }
    : context?.canLearn
      ? {
          href: context.learning.resumeLesson
            ? `/app/courses/${course.slug}/lessons/${context.learning.resumeLesson.slug}?mode=learn`
            : `/app/courses/${course.slug}?mode=learn`,
          label: context.learning.ctaLabel
        }
      : context?.canEdit
        ? {
            href: `/app/courses/${course.slug}?mode=edit`,
            label: "Gérer le parcours"
          }
      : {
          href: `/app/courses/${course.slug}`,
          label: "S'inscrire à la formation"
        };
  const modules = course.modules;
  const domainCourses = catalogCourses
    .filter((candidate) => candidate.domain.id === course.domain.id && candidate.id !== course.id)
    .slice(0, 2);
  const domainCourseIds = new Set(domainCourses.map((domainCourse) => domainCourse.id));
  const relatedCourses = catalogCourses
    .filter((candidate) => candidate.id !== course.id && !domainCourseIds.has(candidate.id))
    .slice(0, 2);

  return (
    <>
      <CourseHero course={course} primaryCtaHref={primaryCta.href} primaryCtaLabel={primaryCta.label} />
      <CourseMeta course={course} modules={modules} />
      <CourseAudience audience={course.audience} />
      <CourseObjectives objectives={course.objectives} />
      <CourseRequirements requirements={course.requirements} />
      <CourseMethod method={course.method} />
      <CourseProgramPreview courseSlug={course.slug} modules={modules} />
      <CourseResources resources={course.resources} />
      <CourseInstructor instructors={course.instructors} />
      <CourseFaq faq={course.faq} />
      <CourseRecommendations
        domainCourses={domainCourses}
        domainName={course.domain.name}
        relatedCourses={relatedCourses}
      />
      <CourseCta
        courseSlug={course.slug}
        primaryCtaHref={primaryCta.href}
        primaryCtaLabel={primaryCta.label}
      />
    </>
  );
}
