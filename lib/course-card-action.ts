type Input = {
  slug: string; published: boolean; public: boolean; enrolled: boolean; canEdit: boolean;
  primaryHref: string; primaryLabel: string; surface?: "explore";
};
export function getCourseCardAction(input: Input) {
  const explore = input.surface === "explore";
  const enroll = explore && input.published && input.public && !input.enrolled;
  return {
    enroll,
    href: explore && !input.enrolled ? `/app/courses/${input.slug}?mode=view` : input.primaryHref,
    label: explore ? input.enrolled ? "Continuer" : "Découvrir" : input.primaryLabel,
    showEdit: input.canEdit && (input.enrolled || explore)
  };
}
