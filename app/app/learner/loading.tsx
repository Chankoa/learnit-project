import { LoadingState } from "@/components/app/LoadingState";

export default function LearnerLoading() {
  return (
    <div className="app-page learner-page">
      <LoadingState
        description="Chargement de la progression, des formations et des ressources apprenant."
        title="Chargement de l'espace apprenant"
      />
    </div>
  );
}
