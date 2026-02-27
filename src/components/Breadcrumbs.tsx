import type { BreadcrumbItem } from "../utils/mandalaHelpers";

interface BreadcrumbsProps {
  path: BreadcrumbItem[];
  onNavigate: (index: number) => void;
}

export default function Breadcrumbs({ path, onNavigate }: BreadcrumbsProps) {
  return (
    <nav
      style={{
        padding: "8px 20px",
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        flexWrap: "wrap",
        minHeight: "36px",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {path.map((crumb, i) => (
        <span key={crumb.unitId} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {i > 0 && (
            <span style={{ color: "#ccc", fontSize: "11px" }}>›</span>
          )}
          <span
            onClick={() => onNavigate(i)}
            style={{
              cursor: i < path.length - 1 ? "pointer" : "default",
              color: i === path.length - 1 ? "#1a1a1a" : "#1565C0",
              fontWeight: i === path.length - 1 ? "600" : "400",
              textDecoration: i < path.length - 1 ? "underline" : "none",
              textDecorationColor: "#1565C044",
              textUnderlineOffset: "2px",
              padding: "2px 4px",
              borderRadius: "4px",
              transition: "background-color 0.1s",
            }}
            onMouseEnter={(e) => {
              if (i < path.length - 1)
                e.currentTarget.style.backgroundColor = "#e3f2fd";
            }}
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            {crumb.label}
          </span>
        </span>
      ))}
    </nav>
  );
}
