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

type CourseContextOptions = {
  maxSnippets?: number;
  query?: string;
};

function cleanText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getQueryTerms(query = "") {
  return Array.from(
    new Set(
      query
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((term) => term.length >= 4)
    )
  ).slice(0, 24);
}

function scoreSnippet(snippet: CourseContextSnippet, terms: string[]) {
  if (terms.length === 0) {
    return 0;
  }

  const haystack = `${snippet.sourceTitle} ${snippet.text}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function splitIntoSnippets(source: CourseSource, text: string): CourseContextSnippet[] {
  const cleaned = cleanText(text).slice(0, Math.max(maxTextChars, 12000));
  const snippets: CourseContextSnippet[] = [];
  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length > 0) {
    let chunk = "";

    paragraphs.forEach((paragraph) => {
      const nextChunk = chunk ? `${chunk}\n\n${paragraph}` : paragraph;

      if (nextChunk.length > maxSnippetChars && chunk) {
        snippets.push({
          sourceId: source.id,
          sourceTitle: source.title,
          text: chunk.slice(0, maxSnippetChars).trim()
        });
        chunk = paragraph;
      } else {
        chunk = nextChunk;
      }
    });

    if (chunk) {
      snippets.push({
        sourceId: source.id,
        sourceTitle: source.title,
        text: chunk.slice(0, maxSnippetChars).trim()
      });
    }

    return snippets;
  }

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
  if (source.extractionStatus !== "ready") {
    return [];
  }

  if (source.sourceKind === "url" || source.sourceKind === "text") {
    return source.extractedContent ? splitIntoSnippets(source, source.extractedContent) : [];
  }

  if (source.type === "pdf") {
    return [getPdfMetadataSnippet(source)];
  }

  const supabase = await createOptionalClient();

  if (!supabase) {
    return [];
  }

  if (!source.storageBucket || !source.storagePath) {
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
  sourceIds: string[] = [],
  options: CourseContextOptions = {}
): Promise<CourseContext> {
  const uniqueSourceIds = Array.from(new Set(sourceIds.filter(Boolean))).slice(0, 8);
  const snippetLimit = options.maxSnippets ?? maxSnippets;

  if (uniqueSourceIds.length === 0) {
    return {
      sourceCount: 0,
      snippets: []
    };
  }

  const sources = await forgeSourceRepository.getSourcesByIds(teacherId, uniqueSourceIds);
  const terms = getQueryTerms(options.query);
  const snippets = (await Promise.all(sources.map(readSource)))
    .flat()
    .map((snippet, index) => ({
      index,
      score: scoreSnippet(snippet, terms),
      snippet
    }))
    .sort((first, second) => second.score - first.score || first.index - second.index)
    .slice(0, snippetLimit)
    .map((item) => item.snippet);

  return {
    sourceCount: sources.length,
    snippets
  };
}
