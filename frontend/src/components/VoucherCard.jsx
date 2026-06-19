import { Tag } from "lucide-react";
import PointsBadge from "./PointsBadge";

export default function VoucherCard({
  brand,
  category,
  title,
  description,
  cost,
  pointsLabel,
  badge,
  onGetCode,
}) {
  return (
    <article className="voucher-card">
      <div className="voucher-card-top-row">
        <span className="voucher-card-category-tag">
          <Tag className="voucher-card-category-tag-icon" aria-hidden="true" />
          {category}
        </span>
        {badge && (
          <span
            className={`voucher-card-badge ${
              badge.tone === "danger" ? "voucher-card-badge-danger" : "voucher-card-badge-accent"
            }`}
          >
            {badge.label}
          </span>
        )}
      </div>

      <div className="voucher-card-brand-row">
        <div className="voucher-card-brand-icon" aria-hidden="true">
          {brand?.charAt(0)}
        </div>
        <span className="voucher-card-brand-name">{brand}</span>
      </div>

      <h3 className="voucher-card-title">{title}</h3>
      <p className="voucher-card-description">{description}</p>

      <div className="voucher-card-footer">
        <div>
          <PointsBadge points={cost} />
          {pointsLabel && <p className="voucher-card-points-label">{pointsLabel}</p>}
        </div>
        <button type="button" onClick={onGetCode} className="voucher-card-cta">
          Get Code
        </button>
      </div>
    </article>
  );
}
