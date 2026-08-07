import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { CourseCurriculum } from "@/components/course/CourseCurriculum";
import { CourseRecommendations } from "@/components/course/CourseRecommendations";
import {
  getLmsCatalog,
  getLmsCatalogCourse
} from "@/lib/lms";
import { createPageMetadata } from "@/lib/seo";

type CurriculumPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CurriculumPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getLmsCatalogCourse(slug);

  if (!course) {
    return {
      title: "Curriculum introuvable"
    };
  }

  return createPageMetadata({
    title: `Curriculum - ${course.title}`,
    description: `Consultez les modules, les leçons et la progression prévue pour ${course.title}.`,
    path: `/formations/${course.slug}/curriculum`,
    image: course.coverImage
  });
}

export default async function CurriculumPage({ params }: CurriculumPageProps) {
  const { slug } = await params;
  const [course, catalogCourses] = await Promise.all([getLmsCatalogCourse(slug), getLmsCatalog()]);

  if (!course) {
    notFound();
  }

  const modules = course.modules;
  const lessons = modules.flatMap((module) => module.lessons);
  const hasFullCoursePage = course.status === "published" && course.availability === "complete";
  const backHref = hasFullCoursePage ? `/formations/${course.slug}` : `/domaines/${course.domain.slug}`;
  const domainCourses = catalogCourses
    .filter((candidate) => candidate.domain.id === course.domain.id && candidate.id !== course.id)
    .slice(0, 2);
  const domainCourseIds = new Set(domainCourses.map((domainCourse) => domainCourse.id));
  const relatedCourses = catalogCourses
    .filter((candidate) => candidate.id !== course.id && !domainCourseIds.has(candidate.id))
    .slice(0, 2);

  return (
    <>
      <div className="section-shell curriculum-page">
        <Link className="nav-link inline-flex items-center gap-2" href={backHref}>
          <ArrowLeft size={16} aria-hidden="true" />
          {hasFullCoursePage ? "Retour à la formation" : `Retour au domaine ${course.domain.name}`}
        </Link>
        <CourseCurriculum course={course} lessons={lessons} modules={modules} />
      </div>

      <CourseRecommendations
        domainCourses={domainCourses}
        domainName={course.domain.name}
        relatedCourses={relatedCourses}
      />
    </>
  );
}
