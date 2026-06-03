type EmptyStateProps = {
  title?: string;
  description?: string;
};

export function EmptyState({
  title = "Aucune formation trouvée",
  description = "Essayez une recherche plus large ou retirez un filtre pour retrouver les parcours disponibles."
}: EmptyStateProps) {
  return (
    <div className="lesson-card mt-6 p-6 text-center">
      <h3 className="text-lg font-black text-text-strong">{title}</h3>
      <p className="mt-2 text-sm text-text-muted">{description}</p>
    </div>
  );
}
