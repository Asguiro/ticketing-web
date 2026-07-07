import type { LucideIcon } from "lucide-react";

type StatsCardProps = {
  label: string;
  value: number;
  description?: string;
  icon?: LucideIcon;
  tone?: "default" | "warning" | "success" | "info" | "neutral";
};

const TONE_VALUE_CLASS: Record<NonNullable<StatsCardProps["tone"]>, string> = {
  default: "text-base-content",
  warning: "text-warning",
  success: "text-success",
  info: "text-info",
  neutral: "text-base-content",
};

const TONE_ICON_CLASS: Record<NonNullable<StatsCardProps["tone"]>, string> = {
  default: "text-primary",
  warning: "text-warning",
  success: "text-success",
  info: "text-info",
  neutral: "text-base-content/40",
};

export function StatsCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "default",
}: StatsCardProps) {
  return (
    <div className="stat stat-card">
      {Icon ? (
        <div className={`stat-figure ${TONE_ICON_CLASS[tone]}`}>
          <Icon className="size-6" />
        </div>
      ) : null}
      <div className="text-stat-label">{label}</div>
      <div className={`text-stat-value ${TONE_VALUE_CLASS[tone]}`}>
        {value.toLocaleString("fr-FR")}
      </div>
      {description ? <div className="stat-card-desc">{description}</div> : null}
    </div>
  );
}
