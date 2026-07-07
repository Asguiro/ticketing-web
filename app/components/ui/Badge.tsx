export type BadgeVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  /** pill = fond léger arrondi (défaut) ; solid = badge DaisyUI plein ; outline = contour */
  appearance?: "pill" | "solid" | "outline";
  className?: string;
};

const PILL_CLASSES: Record<BadgeVariant, string> = {
  primary: "msk-badge-primary",
  secondary: "msk-badge-secondary",
  accent: "msk-badge-accent",
  info: "msk-badge-info",
  success: "msk-badge-success",
  warning: "msk-badge-warning",
  error: "msk-badge-error",
  neutral: "msk-badge-neutral",
};

const SOLID_CLASSES: Record<BadgeVariant, string> = {
  primary: "badge-primary",
  secondary: "badge-secondary",
  accent: "badge-accent",
  info: "badge-info",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
  neutral: "badge-neutral",
};

export function Badge({
  children,
  variant = "neutral",
  appearance = "pill",
  className = "",
}: BadgeProps) {
  if (appearance === "solid") {
    return (
      <span className={`badge badge-sm whitespace-nowrap ${SOLID_CLASSES[variant]} ${className}`}>
        {children}
      </span>
    );
  }

  if (appearance === "outline") {
    return (
      <span
        className={`badge badge-sm badge-outline whitespace-nowrap ${SOLID_CLASSES[variant]} ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <span className={`msk-badge ${PILL_CLASSES[variant]} ${className}`}>{children}</span>
  );
}
