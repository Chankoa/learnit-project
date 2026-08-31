export type ForgeStructuredOutputStage =
  | "finish_reason"
  | "json_parse"
  | "schema_validation"
  | "output_missing";

export type ForgeStructuredFinishFailure = {
  code: "output_token_limit" | "response_incomplete" | "response_refusal";
  stage: ForgeStructuredOutputStage;
};

export function classifyStructuredFinishReason(
  finishReason: string
): ForgeStructuredFinishFailure | undefined {
  if (finishReason === "stop") {
    return undefined;
  }

  if (finishReason === "length") {
    return { code: "output_token_limit", stage: "finish_reason" };
  }

  if (finishReason === "content-filter") {
    return { code: "response_refusal", stage: "finish_reason" };
  }

  return { code: "response_incomplete", stage: "finish_reason" };
}

function valueShape(value: unknown): string {
  if (Array.isArray(value)) {
    return `array(${value.length})`;
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

export function describeStructuredOutput(text: string) {
  const length = text.length;

  try {
    const value = JSON.parse(text) as unknown;

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { length, rootType: valueShape(value) };
    }

    const entries = Object.entries(value);

    return {
      keys: entries.map(([key]) => key).slice(0, 24),
      length,
      rootType: "object",
      valueShapes: Object.fromEntries(
        entries.slice(0, 24).map(([key, item]) => [key, valueShape(item)])
      )
    };
  } catch {
    return { length, rootType: "invalid-json" };
  }
}
