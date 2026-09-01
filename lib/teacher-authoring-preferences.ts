export const FORGE_PANEL_WIDTH_STORAGE_KEY = "forge:authoring-panel:v1";
export const FORGE_PANEL_DEFAULT_WIDTH = 352;
export const FORGE_PANEL_MIN_WIDTH = 320;
export const FORGE_PANEL_MAX_WIDTH = 704;
export const FORGE_PANEL_MAX_VIEWPORT_RATIO = 0.48;
// 17rem Structure + 34rem Editor, matching the desktop grid minima.
export const FORGE_PANEL_DESKTOP_RESERVED_WIDTH = 816;

type ForgePanelPreference = {
  width: number;
};

export function getForgePanelMaxWidth(viewportWidth: number) {
  return Math.max(
    FORGE_PANEL_MIN_WIDTH,
    Math.min(
      FORGE_PANEL_MAX_WIDTH,
      Math.floor(viewportWidth * FORGE_PANEL_MAX_VIEWPORT_RATIO),
      viewportWidth - FORGE_PANEL_DESKTOP_RESERVED_WIDTH
    )
  );
}

export function clampForgePanelWidth(width: number, viewportWidth?: number) {
  const maximum = viewportWidth
    ? getForgePanelMaxWidth(viewportWidth)
    : FORGE_PANEL_MAX_WIDTH;

  return Math.min(maximum, Math.max(FORGE_PANEL_MIN_WIDTH, Math.round(width)));
}

export function parseForgePanelPreference(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const preference = JSON.parse(value) as Partial<ForgePanelPreference>;

    if (typeof preference.width !== "number" || !Number.isFinite(preference.width)) {
      return null;
    }

    return clampForgePanelWidth(preference.width);
  } catch {
    return null;
  }
}

export function serializeForgePanelPreference(width: number) {
  return JSON.stringify({ width: clampForgePanelWidth(width) } satisfies ForgePanelPreference);
}
