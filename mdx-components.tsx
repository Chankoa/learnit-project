import type { ElementType } from "react";

import { Callout } from "@/components/mdx/Callout";
import { Checklist } from "@/components/mdx/Checklist";
import { CodeBlock } from "@/components/mdx/CodeBlock";
import { DownloadCard } from "@/components/mdx/DownloadCard";
import { Exercise } from "@/components/mdx/Exercise";
import { FileTree } from "@/components/mdx/FileTree";
import { PromptBlock } from "@/components/mdx/PromptBlock";
import { StepList } from "@/components/mdx/StepList";

type MDXComponents = Record<string, ElementType>;

const components: MDXComponents = {
  Callout,
  Checklist,
  CodeBlock,
  DownloadCard,
  Exercise,
  FileTree,
  PromptBlock,
  StepList
};

export function useMDXComponents(): MDXComponents {
  return components;
}
