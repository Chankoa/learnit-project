# U4 Unified Workspace DS Audit

## Scope

Audit limited to the canonical course overview, Learn lesson workspace and Edit builder.

| Area | Observed divergence | U4 calibration |
| --- | --- | --- |
| Structure / layout | Learn and Edit use the same three-surface model but their panel rhythm differs. | Align rail widths, panel padding and workspace separators. |
| Typography | Edit navigation and action groups carry more visual weight than the selected object. | Use DS1 label, section and object hierarchy; keep metadata muted. |
| Surfaces | Edit Forge uses a local accent color mix while Learn uses `surface-ai`. | Use `surface-ai` for both Forge containers and neutral internal surfaces. |
| Controls | Edit places Structure, Forge, Preview and Publication at equal prominence. | Retain all actions, visually demote contextual utilities and preserve the mode switch. |
| Navigation | Learn rail is calm; Edit rail exposes dense authoring controls. | Keep controls keyboard-accessible while making navigation and selection primary. |
| Forge | The two panels have different framing despite sharing the same contextual role. | Match Forge header, panel surface, borders and overlay behavior through shared tokens. |
| Responsive | Existing breakpoints and drawer behavior match the intended model. | Preserve the established 1279px and 899px transitions; retain 44px targets. |
| Light / Dark | Theme tokens are mostly available, but some legacy authoring rules use compatibility surface aliases. | Prefer DS1 semantic surface and text tokens in U4 workspace overrides. |
| Legacy visual debt | Teacher-prefixed class names and legacy subviews remain. | Keep naming and legacy routes; converge only the canonical composition. |