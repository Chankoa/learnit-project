import "server-only";

import { createOptionalClient } from "@/lib/supabase/server";
import * as forgeSourceRepository from "@/lib/repositories/forgeSourceRepository";
import type {
  CourseContext,
  CourseContextSnippet,
  CourseSource
} from "@/types/forge-ai";

const maxSnippets = 6;
const maxSnippetChars = 1200;
const maxTextChars = maxSnippets * maxSnippetChars;

function cleanText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitIntoSnippets(source: CourseSource, text: string): CourseContextSnippet[] {
  const cleaned = cleanText(text).slice(0, maxTextChars);
  const snippets: CourseContextSnippet[] = [];

  for (let index = 0; index < cleaned.length && snippets.length < maxSnippets; index += maxSnippetChars) {
    const chunk = cleaned.slice(index, index + maxSnippetChars).trim();

    if (chunk) {
      snippets.push({
        sourceId: source.id,
        sourceTitle: source.title,
        text: chunk
      });
    }
  }

  return snippets;
}

function getPdfMetadataSnippet(source: CourseSource): CourseContextSnippet {
  return {
    sourceId: source.id,
    sourceTitle: source.title,
    text:
      `Source PDF fournie : ${source.title} (${source.fileName}). ` +
      "Extraction textuelle intégrale reportée en V1 ; utiliser cette source comme référence documentaire signalée, sans inventer de citations."
  };
}

async function readSource(source: CourseSource): Promise<CourseContextSnippet[]> {
  if (source.type === "pdf") {
    return [getPdfMetadataSnippet(source)];
  }

  const supabase = await createOptionalClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.storage
    .from(source.storageBucket)
    .download(source.storagePath);

  if (error || !data) {
    console.error("[forge-ai] source download failed", {
      error: error?.message,
      sourceId: source.id
    });
    return [];
  }

  return splitIntoSnippets(source, await data.text());
}

export async function getCourseContext(
  teacherId: string,
  sourceIds: string[] = []
): Promise<CourseContext> {
  const uniqueSourceIds = Array.from(new Set(sourceIds.filter(Boolean))).slice(0, 8);

  if (uniqueSourceIds.length === 0) {
    return {
      sourceCount: 0,
      snippets: []
    };
  }

  const sources = await forgeSourceRepository.getSourcesByIds(teacherId, uniqueSourceIds);
  const snippets = (await Promise.all(sources.map(readSource)))
    .flat()
    .slice(0, maxSnippets);

  return {
    sourceCount: sources.length,
    snippets
  };
}
