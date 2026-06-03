import { AudienceSection } from "@/components/sections/AudienceSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { LearningPreview } from "@/components/sections/LearningPreview";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AudienceSection />
      <LearningPreview />
    </>
  );
}
