import { AppShellFrame } from "@/components/app/AppShellFrame";
import { LoadingState } from "@/components/app/LoadingState";

export default function AppLoading() {
  return (
    <AppShellFrame role="visitor" title="Accès plateforme">
      <LoadingState
        description="Préparation des tableaux de bord, cartes et tableaux de l'espace app."
        title="Chargement de l'espace LearnIt"
      />
    </AppShellFrame>
  );
}
