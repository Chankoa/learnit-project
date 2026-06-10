import type { LessonContentDocument } from "@/types/learning";

type LessonContentProps = {
  content: LessonContentDocument;
};

export function LessonContent({ content }: LessonContentProps) {
  return (
    <div className="lesson-content">
      <p className="lesson-content__lead">{content.lead}</p>

      {content.sections.map((section) => (
        <section id={section.id} key={section.id}>
          <h2>{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.points?.length ? (
            <ul>
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
