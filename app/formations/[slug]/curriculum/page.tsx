import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { CourseCurriculum } from "@/components/course/CourseCurriculum";
import { CourseRecommendations } from "@/components/course/CourseRecommendations";
import {
  getCatalogCourseBySlug,
  getCatalogCourseStaticParams,
  getCourseLessons,
  getCourseModules,
  getOtherCatalogCoursesInSameDomain,
  getRelatedCourses
} from "@/lib/courses";

type CurriculumPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getCatalogCourseStaticParams();
}

export async function generateMetadata({ params }: CurriculumPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCatalogCourseBySlug(slug);

  if (!course) {
    return {
      title: "Curriculum introuvable"
    };
  }

  return {
    title: `Curriculum - ${course.title}`,
    description: `Consultez les modules, les leçons et la progression prévue pour ${course.title}.`
  };
}

export default async function CurriculumPage({ params }: CurriculumPageProps) {
  const { slug } = await params;
  const course = getCatalogCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const modules = getCourseModules(course.id);
  const lessons = getCourseLessons(course.id);
  const hasFullCoursePage = course.status === "published" && course.availability === "complete";
  const backHref = hasFullCoursePage ? `/formations/${course.slug}` : `/domaines/${course.domain.slug}`;
  const domainCourses = getOtherCatalogCoursesInSameDomain(course.id, 2);
  const domainCourseIds = new Set(domainCourses.map((domainCourse) => domainCourse.id));
  const relatedCourses = getRelatedCourses(course.id, 3)
    .filter((relatedCourse) => !domainCourseIds.has(relatedCourse.id))
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
