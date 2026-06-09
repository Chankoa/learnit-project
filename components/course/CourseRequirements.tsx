type CourseRequirementsProps = {
  requirements?: string[];
};

export function CourseRequirements({ requirements = [] }: CourseRequirementsProps) {
  if (requirements.length === 0) {
    return null;
  }

  return (
    <section className="section-shell content-section course-content-section">
      <span className="eyebrow w-fit">Pré-requis</span>
      <h2>Avant de commencer</h2>
      <ul className="lesson-card mt-6 divide-y divide-border overflow-hidden">
        {requirements.map((requirement) => (
          <li className="p-4 text-sm font-bold text-text-strong" key={requirement}>
            {requirement}
          </li>
        ))}
      </ul>
    </section>
  );
}
