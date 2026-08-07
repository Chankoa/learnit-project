"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error("LearnIt page data error", error);
  }, [error]);

  return (
    <main className="auth-page" id="main-content">
      <section className="auth-card" aria-labelledby="data-error-title">
        <div className="auth-card__heading">
          <span className="eyebrow w-fit">Données indisponibles</span>
          <h1 id="data-error-title">Le contenu ne peut pas être chargé.</h1>
          <p>Réessayez dans un instant. Si le problème persiste, vérifiez la configuration de la source de données.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={reset}>
          Réessayer
        </button>
      </section>
    </main>
  );
}