import { LoadingState } from "@/components/app/LoadingState";

export default function TeacherLoading() {
  return (
    <div className="app-page teacher-page">
      <LoadingState
        description="Chargement des formations, ressources et apprenants enseignant."
        title="Chargement de l'espace enseignant"
      />
    </div>
  );
}
