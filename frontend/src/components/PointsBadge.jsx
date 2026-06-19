export default function PointsBadge({ points, className = "" }) {
  return (
    <span className={`points-badge ${className}`}>
      {Number(points).toLocaleString()} Pts
    </span>
  );
}
