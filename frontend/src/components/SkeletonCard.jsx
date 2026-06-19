export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card-top-row">
        <div className="skeleton-category-tag" />
        <div className="skeleton-badge" />
      </div>
      <div className="skeleton-brand-row">
        <div className="skeleton-brand-icon" />
        <div className="skeleton-brand-name" />
      </div>
      <div className="skeleton-title" />
      <div className="skeleton-description" />
      <div className="skeleton-description-short" />
      <div className="skeleton-footer-row">
        <div className="skeleton-price" />
        <div className="skeleton-button" />
      </div>
    </div>
  );
}
