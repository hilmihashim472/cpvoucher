export default function CategoryPill({ label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`category-pill ${active ? "category-pill-active" : "category-pill-inactive"}`}
    >
      {label}
    </button>
  );
}
