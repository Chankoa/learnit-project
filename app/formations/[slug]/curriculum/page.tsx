import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { CourseCurriculum } from "@/components/course/CourseCurriculum";
import {
  getCatalogCourseBySlug,
  getCatalogCourseStaticParams,
  getCourseLessons,
  getCourseModules
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
  const backHref = course.status === "published" ? `/formations/${course.slug}` : `/domaines/${course.domain.slug}`;

  return (
    <div className="section-shell curriculum-page">
      <Link className="nav-link inline-flex items-center gap-2" href={backHref}>
        <ArrowLeft size={16} aria-hidden="true" />
        {course.status === "published" ? "Retour à la formation" : `Retour au domaine ${course.domain.name}`}
      </Link>
      <CourseCurriculum course={course} lessons={lessons} modules={modules} />
    </div>
  );
}
