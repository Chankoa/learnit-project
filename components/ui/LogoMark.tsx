import { siteConfig } from "@/data/site";

type LogoMarkProps = {
  tone?: "default" | "inverse";
};

export function LogoMark({ tone = "default" }: LogoMarkProps) {
  const titleClassName = tone === "inverse" ? "block text-base font-extrabold text-white" : "block text-base font-extrabold text-text-strong";
  const taglineClassName =
    tone === "inverse" ? "block text-[10px] font-bold uppercase text-slate-300" : "block text-[10px] font-bold uppercase text-text-muted";

  return (
    <div className="flex items-center gap-3">
      <span className="brand-mark" aria-hidden="true" />
      <span className="leading-tight">
        <span className={titleClassName}>{siteConfig.name}</span>
        <span className={taglineClassName}>{siteConfig.tagline}</span>
      </span>
    </div>
  );
}
