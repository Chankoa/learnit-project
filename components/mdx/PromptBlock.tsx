import { Sparkles } from "lucide-react";

type PromptBlockProps = {
  label?: string;
  prompt: string;
  title?: string;
};

export function PromptBlock({
  label = "Prompt",
  prompt,
  title = "Prompt de départ"
}: PromptBlockProps) {
  return (
    <figure className="mdx-prompt-block">
      <figcaption>
        <span>
          <Sparkles size={17} aria-hidden="true" />
          {label}
        </span>
        <strong>{title}</strong>
      </figcaption>
      <blockquote>{prompt}</blockquote>
    </figure>
  );
}
