export type NavItem = {
  label: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: string[];
};

export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  nav: NavItem[];
  footer: FooterColumn[];
};

export type HeroStatIcon = "clock" | "video" | "project" | "certificate";

export type HeroStat = {
  label: string;
  detail: string;
  icon: HeroStatIcon;
};

export type AudienceProfileIcon = "sparkles" | "briefcase" | "wand" | "heart";

export type AudienceProfile = {
  title: string;
  text: string;
  icon: AudienceProfileIcon;
};

export type LearningModule = {
  title: string;
  status: "Termine" | "En cours";
};
