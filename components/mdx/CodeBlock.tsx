import { Code2 } from "lucide-react";

type CodeBlockProps = {
  code: string;
  filename?: string;
  language?: string;
};

export function CodeBlock({
  code,
  filename,
  language = "text"
}: CodeBlockProps) {
  return (
    <figure className="mdx-code-block">
      <figcaption>
        <span>
          <Code2 size={16} aria-hidden="true" />
          {filename ?? "Exemple"}
        </span>
        <small>{language}</small>
      </figcaption>
      <pre>
        <code>{code.trim()}</code>
      </pre>
    </figure>
  );
}
