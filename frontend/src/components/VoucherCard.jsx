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
  // Get the correct icon component, fallback to Tag
  const IconComponent = ICON_MAP[categoryIcon] || Tag;
  const color = categoryColor || "#F97316"; // Default orange if no color

  return (
    <article className="voucher-card">
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