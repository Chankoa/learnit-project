import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownLessonContentProps = {
  content?: string;
};

function isExternalHref(href?: string) {
  return Boolean(href && /^https?:\/\//i.test(href));
}

export function MarkdownLessonContent({ content }: MarkdownLessonContentProps) {
  const markdown = content?.trim();

  if (!markdown) {
    return (
      <div className="lesson-content lesson-content--empty">
        <p>Aucun contenu pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="lesson-content lesson-content--mdx">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children, ...props }) {
            const external = isExternalHref(href);

            return (
              <a
                {...props}
                href={href}
                rel={external ? "noreferrer noopener" : undefined}
                target={external ? "_blank" : undefined}
              >
                {children}
              </a>
            );
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
