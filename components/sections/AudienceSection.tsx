import { BriefcaseBusiness, Heart, Sparkles, WandSparkles } from "lucide-react";

import { audienceProfiles } from "@/data/site";

const profileIcons = {
  sparkles: Sparkles,
  briefcase: BriefcaseBusiness,
  wand: WandSparkles,
  heart: Heart
};

export function AudienceSection() {
  return (
    <section className="section-shell py-8" id="apropos">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-black text-text-strong md:text-3xl">Pour qui est cette formation ?</h2>
        <p className="mt-2 text-sm text-text-muted">Une formation concue pour tous les profils motives.</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {audienceProfiles.map((profile) => {
          const Icon = profileIcons[profile.icon];

          return (
            <article className="profile-card p-5" key={profile.title}>
              <span className="icon-badge">
                <Icon size={18} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-base font-extrabold text-text-strong">{profile.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{profile.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
