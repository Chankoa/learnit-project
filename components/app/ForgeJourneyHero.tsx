import { FileText, GraduationCap, Lightbulb, Sparkles } from "lucide-react";
import { ForgeHomeIntent } from "@/components/app/ForgeHomeIntent";

export function ForgeJourneyArt() {
  return <div className="journey-art" aria-hidden="true">
    <span className="journey-art__tile journey-art__course"><GraduationCap /></span>
    <span className="journey-art__tile journey-art__idea"><Lightbulb /></span>
    <span className="journey-art__tile journey-art__content"><FileText /></span>
    <p>Une idée devient un parcours.</p>
    <ol><li>Idée</li><li>Structure</li><li>Contenu</li><li>Apprentissage</li></ol>
  </div>;
}

export function ForgeJourneyHero() {
  return <section className="journey-hero" aria-labelledby="journey-title">
    <div className="journey-hero__copy">
      <span className="journey-eyebrow">Apprendre <Sparkles size={16} aria-hidden="true" /> Créer · Partager</span>
      <h1 id="journey-title">Qu’allez-vous <em>construire</em> aujourd’hui ?</h1>
      <p>Transformez une idée, un besoin ou une question en un parcours de connaissance avec Forge.</p>
    </div>
    <ForgeJourneyArt />
    <div className="journey-hero__intent"><ForgeHomeIntent /></div>
  </section>;
}
