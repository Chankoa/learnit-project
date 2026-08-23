import type {
  ForgeCreationFormatHint,
  ForgeCreationIntent
} from "@/types/forge-ai";

export const forgeCreationIntentLimits = {
  maxLength: 360,
  minLength: 12
} as const;

export const forgeCreationFormats = [
  {
    description: "Une progression structurée en modules et leçons.",
    label: "Parcours guidé",
    value: "guided-course"
  },
  {
    description: "Un parcours centré sur la mise en pratique.",
    label: "Atelier pratique",
    value: "practical-workshop"
  },
  {
    description: "Un parcours court consacré à un thème précis.",
    label: "Module thématique",
    value: "thematic-module"
  }
] as const satisfies ReadonlyArray<{
  description: string;
  label: string;
  value: ForgeCreationFormatHint;
}>;

type ForgeCreationIntentInput = {
  formatHint?: string;
  text: string;
};

export type ForgeCreationIntentValidation =
  | { data: ForgeCreationIntent; ok: true }
  | { error: string; ok: false };

function normalizeIntentText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isFormatHint(value: string | undefined): value is ForgeCreationFormatHint {
  return forgeCreationFormats.some((format) => format.value === value);
}

export function validateForgeCreationIntent(
  input: ForgeCreationIntentInput
): ForgeCreationIntentValidation {
  const text = normalizeIntentText(input.text);

  if (text.length < forgeCreationIntentLimits.minLength) {
    return {
      error: `Décrivez votre besoin en au moins ${forgeCreationIntentLimits.minLength} caractères.`,
      ok: false
    };
  }

  if (text.length > forgeCreationIntentLimits.maxLength) {
    return {
      error: `Votre intention doit contenir au maximum ${forgeCreationIntentLimits.maxLength} caractères.`,
      ok: false
    };
  }

  return {
    data: {
      ...(isFormatHint(input.formatHint) ? { formatHint: input.formatHint } : {}),
      text
    },
    ok: true
  };
}

export function getForgeCreationFormat(formatHint?: ForgeCreationFormatHint) {
  return forgeCreationFormats.find((format) => format.value === formatHint);
}

export function getForgeCourseBriefPrefill(intent?: ForgeCreationIntent) {
  const format = getForgeCreationFormat(intent?.formatHint);

  return {
    constraints: format ? `Format pédagogique souhaité : ${format.label}.` : "",
    subject: intent?.text ?? ""
  };
}

export function getForgeCourseCreatorHref(intent: ForgeCreationIntent) {
  const params = new URLSearchParams({ intent: intent.text });

  if (intent.formatHint) {
    params.set("format", intent.formatHint);
  }

  return `/app/teacher/courses/forge?${params.toString()}`;
}
