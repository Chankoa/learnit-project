import type { Metadata } from "next";
import {
  Award,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LockKeyhole,
  Sparkles
} from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import {
  certificateStatusLabels,
  formatLearnerDate,
  getLearnerCertificateSummaries
} from "@/lib/learner";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Certificats apprenant",
  description: "Consultez les certificats obtenus, les formations éligibles et les certificats à venir.",
  path: "/app/learner/certificates",
  noIndex: true
});

export default function LearnerCertificatesPage() {
  const certificates = getLearnerCertificateSummaries();
  const obtainedCertificates = certificates.filter(
    ({ certificate }) => certificate.status === "obtained"
  );
  const eligibleCertificates = certificates.filter(
    ({ certificate }) => certificate.status === "eligible" || certificate.status === "in-progress"
  );
  const comingSoonCertificates = certificates.filter(
    ({ certificate }) => certificate.status === "coming-soon"
  );

  return (
    <div className="app-page learner-page">
      <AppBreadcrumb
        items={[
          { label: "Espace apprenant", href: "/app/learner" },
          { label: "Certificats" }
        ]}
      />

      <AppPageHeader
        eyebrow="Certificats"
        title="Attestations et critères"
        description="Retrouvez les certificats obtenus, les formations éligibles et les certificats annoncés comme bientôt disponibles."
      />

      <section className="learning-metrics learner-metrics" aria-label="Synthese des certificats">
        <article>
          <span className="learning-metric-icon learning-metric-icon--green">
            <Award size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Obtenus</small>
            <strong>{obtainedCertificates.length}</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--purple">
            <GraduationCap size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Formations éligibles</small>
            <strong>{eligibleCertificates.length}</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--amber">
            <Clock3 size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Bientôt disponibles</small>
            <strong>{comingSoonCertificates.length}</strong>
          </div>
        </article>
      </section>

      <section className="learning-panel">
        <div className="learning-panel__heading">
          <div>
            <span>Certificats obtenus</span>
            <h2>Validations disponibles</h2>
          </div>
          <CheckCircle2 size={20} aria-hidden="true" />
        </div>

        <div className="learner-certificate-grid">
          {obtainedCertificates.map(({ certificate, course }) => (
            <article className="learner-certificate-card" key={certificate.id}>
              <span className="state-badge" data-state={certificate.status}>
                {certificateStatusLabels[certificate.status]}
              </span>
              <h3>{certificate.title}</h3>
              <p>{certificate.description}</p>
              <dl>
                <div>
                  <dt>Formation</dt>
                  <dd>{course?.title ?? "Formation"}</dd>
                </div>
                <div>
                  <dt>Obtention</dt>
                  <dd>{formatLearnerDate(certificate.issuedAt)}</dd>
                </div>
                <div>
                  <dt>Identifiant</dt>
                  <dd>{certificate.credentialId}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="learning-panel">
        <div className="learning-panel__heading">
          <div>
            <span>Formations éligibles</span>
            <h2>Progression requise</h2>
          </div>
          <Sparkles size={20} aria-hidden="true" />
        </div>

        <div className="learner-certificate-grid">
          {eligibleCertificates.map(({ certificate, course }) => (
            <article className="learner-certificate-card" key={certificate.id}>
              <span className="state-badge" data-state={certificate.status}>
                {certificateStatusLabels[certificate.status]}
              </span>
              <h3>{certificate.title}</h3>
              <p>{certificate.description}</p>
              <div className="learner-certificate-card__progress">
                <div>
                  <span>Progression actuelle</span>
                  <strong>{certificate.currentProgressPercentage}%</strong>
                </div>
                <div className="learning-progress">
                  <span style={{ width: `${certificate.currentProgressPercentage}%` }} />
                </div>
                <small>
                  {course?.title ?? "Formation"} · {certificate.requiredProgressPercentage}% requis
                </small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="learning-panel">
        <div className="learning-panel__heading">
          <div>
            <span>À venir</span>
            <h2>État fictif bientôt disponible</h2>
          </div>
          <LockKeyhole size={20} aria-hidden="true" />
        </div>

        <div className="learner-certificate-grid">
          {comingSoonCertificates.map(({ certificate, course }) => (
            <article className="learner-certificate-card" key={certificate.id}>
              <span className="state-badge" data-state={certificate.status}>
                {certificateStatusLabels[certificate.status]}
              </span>
              <h3>{certificate.title}</h3>
              <p>{certificate.description}</p>
              <div className="learner-certificate-card__progress">
                <div>
                  <span>Progression requise</span>
                  <strong>{certificate.requiredProgressPercentage}%</strong>
                </div>
                <div className="learning-progress">
                  <span style={{ width: `${certificate.currentProgressPercentage}%` }} />
                </div>
                <small>
                  {course?.title ?? "Formation"} · {certificate.availableAtLabel}
                </small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
