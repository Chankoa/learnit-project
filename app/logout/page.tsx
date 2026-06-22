import type { Metadata } from "next";
import Link from "next/link";

import { logoutAction } from "@/app/auth/actions";

export const metadata: Metadata = {
  title: "Déconnexion"
};

export default function LogoutPage() {
  return (
    <main className="auth-page" id="main-content">
      <section className="auth-card" aria-labelledby="logout-title">
        <div className="auth-card__heading">
          <span className="eyebrow w-fit">Session</span>
          <h1 id="logout-title">Déconnexion</h1>
          <p>Fermez votre session LearnIt sur cet appareil.</p>
        </div>

        <form action={logoutAction} className="auth-form">
          <button className="btn btn-primary" type="submit">
            Se déconnecter
          </button>
        </form>

        <p className="auth-card__footer">
          <Link href="/app/learner">Retour à l'espace apprenant</Link>
        </p>
      </section>
    </main>
  );
}
