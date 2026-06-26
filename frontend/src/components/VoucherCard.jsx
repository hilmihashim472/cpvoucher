import {
  Tag,
  UtensilsCrossed,
  Laptop,
  Plane,
  ShoppingBag,
  Home as HomeIcon,
  Sparkles,
  Dumbbell,
  Car,
  BookOpen,
  Heart,
  Music,
  Coffee,
  Gift,
  Gamepad2,
  Zap,
  Star,
  Baby,
} from "lucide-react";
import PointsBadge from "./PointsBadge";

// Icon map - same as Categories page
const ICON_MAP = {
  UtensilsCrossed: UtensilsCrossed,
  Laptop: Laptop,
  Plane: Plane,
  ShoppingBag: ShoppingBag,
  Home: HomeIcon,
  Sparkles: Sparkles,
  Tag: Tag,
  Dumbbell: Dumbbell,
  Car: Car,
  BookOpen: BookOpen,
  Heart: Heart,
  Music: Music,
  Coffee: Coffee,
  Gift: Gift,
  Gamepad2: Gamepad2,
  Zap: Zap,
  Star: Star,
  Baby: Baby,
};

export default function VoucherCard({
  image,
  brand,
  category,
  categoryIcon,
  categoryColor,
  title,
  description,
  cost,
  pointsLabel,
  badge,
  onGetCode,
}) {
  const IconComponent = ICON_MAP[categoryIcon] || Tag;
  const color = categoryColor || "#F97316";

  return (
    <article className="voucher-card">
      {/* Image / placeholder banner */}
      <div className="voucher-card-image">
        {image ? (
          <img src={image} alt={title} className="voucher-card-img" />
        ) : (
          <div
            className="voucher-card-img-placeholder"
            style={{ background: `linear-gradient(135deg, ${color}25, ${color}55)` }}
            aria-hidden="true"
          >
            <span className="voucher-card-img-initial" style={{ color }}>
              {brand?.charAt(0)}
            </span>
          </div>
        )}

        {/* Badge overlaid on image */}
        {badge && (
          <span
            className={`voucher-card-badge-overlay ${
              badge.tone === "danger" ? "voucher-card-badge-danger" : "voucher-card-badge-accent"
            }`}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="voucher-card-body">
        <div className="voucher-card-top-row">
          <span
            className="voucher-card-category-tag"
            style={{
              backgroundColor: `${color}15`,
              borderColor: `${color}40`,
              color: color,
            }}
          >
            <IconComponent
              className="voucher-card-category-tag-icon"
              aria-hidden="true"
              style={{ color: color }}
            />
            {category}
          </span>
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
      </div>
    </article>
  );
}