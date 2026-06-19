import { LoadingState } from "@/components/app/LoadingState";

export default function AdminLoading() {
  return (
    <div className="app-page admin-page">
      <LoadingState
        description="Chargement des utilisateurs, formations et paramètres de supervision."
        title="Chargement de l'administration"
        variant="table"
      />
    </div>
  );
}
