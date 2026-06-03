import { siteConfig } from "@/data/site";

export function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="brand-mark" aria-hidden="true" />
      <span className="leading-tight">
        <span className="block text-base font-extrabold text-text-strong">{siteConfig.name}</span>
        <span className="block text-[10px] font-bold uppercase text-text-muted">{siteConfig.tagline}</span>
      </span>
    </div>
  );
}
