import type {
  ForgeLessonCalloutType,
  ForgeLessonContentProposal,
  ForgeLessonSection
} from "@/types/forge-ai";

type StructuredLesson = Omit<ForgeLessonContentProposal, "contentMarkdown">;

function cleanHeading(value: string) {
  return value.replace(/^#+\s*/, "").replace(/\s+/g, " ").trim();
}

function quoteBlock(value: string) {
  return value
    .trim()
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

function calloutLabel(type: ForgeLessonCalloutType) {
  return type.toUpperCase();
}

function sectionToMarkdown(section: ForgeLessonSection) {
  const blocks = [`## ${cleanHeading(section.title)}`, section.content.trim()];

  if (section.example.trim()) {
    blocks.push(`### Exemple\n\n${section.example.trim()}`);
  }

  if (section.code.trim()) {
    const language = section.codeLanguage.replace(/[^a-z0-9+-]/gi, "").slice(0, 24);
    const code = section.code.replace(/```/g, "").trim();
    blocks.push(`### Exemple de code\n\n\`\`\`${language}\n${code}\n\`\`\``);
  }

  if (section.calloutType !== "none" && section.callout.trim()) {
    blocks.push(`> [!${calloutLabel(section.calloutType)}]\n${quoteBlock(section.callout)}`);
  }

  return blocks.filter(Boolean).join("\n\n");
}

export function lessonProposalToMarkdown(proposal: StructuredLesson) {
  const blocks = ["## Introduction", proposal.intro.trim()];

  blocks.push(...proposal.sections.map(sectionToMarkdown));

  if (proposal.practice.trim()) {
    blocks.push(`## Mise en pratique\n\n> [!EXERCISE]\n${quoteBlock(proposal.practice)}`);
  }

  if (proposal.keyTakeaways.length > 0) {
    blocks.push(`## À retenir\n\n${proposal.keyTakeaways.map((item) => `- ${item}`).join("\n")}`);
  }

  if (proposal.furtherReading.trim()) {
    blocks.push(`## Pour aller plus loin\n\n${proposal.furtherReading.trim()}`);
  }

  return blocks.filter(Boolean).join("\n\n");
}