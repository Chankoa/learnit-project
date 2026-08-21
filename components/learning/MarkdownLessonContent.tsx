import ReactMarkdown from "react-markdown";
import { isValidElement, type ReactNode } from "react";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/learning/CodeBlock";

type MarkdownLessonContentProps = {
  content?: string;
};

function isExternalHref(href?: string) {
  return Boolean(href && /^https?:\/\//i.test(href));
}

function textFromChildren(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(textFromChildren).join("");
  }

  return isValidElement(children) ? textFromChildren(children.props.children) : "";
}

function getCallout(content: string) {
  const match = content.match(/^\s*\[!(NOTE|TIP|WARNING|EXERCISE|KEY TAKEAWAYS)\]\s*/i);

  if (!match) {
    return undefined;
  }

  return {
    label:
      {
        NOTE: "Note",
        TIP: "Conseil",
        WARNING: "Attention",
        EXERCISE: "Mise en pratique",
        "KEY TAKEAWAYS": "À retenir"
      }[match[1].toUpperCase()] ?? "Repère",
    type: match[1].toLowerCase().replace(/\s+/g, "-"),
    value: content.replace(match[0], "").trim()
  };
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
          },
          blockquote({ children }) {
            const callout = getCallout(textFromChildren(children));

            if (!callout) {
              return <blockquote>{children}</blockquote>;
            }

            return (
              <aside className="lesson-callout" data-type={callout.type}>
                <strong>{callout.label}</strong>
                <p>{callout.value}</p>
              </aside>
            );
          },
          code({ children, className, ...props }) {
            const language = className?.replace("language-", "") || undefined;

            return (
              <code {...props} className={className} data-language={language}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            if (!isValidElement(children)) {
              return <pre>{children}</pre>;
            }

            const codeProps = children.props as { className?: string; children?: ReactNode };
            const language = codeProps.className?.replace("language-", "");

            return <CodeBlock code={textFromChildren(codeProps.children).replace(/\n$/, "")} language={language} />;
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
