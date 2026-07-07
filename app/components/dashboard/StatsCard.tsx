type StatsCardProps = {
  label: string;
  value: number;
  tone?: "default" | "warning" | "success";
};

export function StatsCard({
  label,
  value,
  tone = "default",
}: StatsCardProps) {
  if (tone === "default") {
    return (
      <div className="stat-gradient-card rounded-box p-6 shadow-lg">
        <p className="text-sm font-medium text-white/80">{label}</p>
        <p className="mt-3 text-4xl font-bold">{value.toLocaleString("fr-FR")}</p>
      </div>
    );
  }

  const toneClass =
    tone === "warning"
      ? "border-warning/30 bg-warning/10"
      : "border-success/30 bg-success/10";

  return (
    <div className={`card border shadow-md ${toneClass}`}>
      <div className="card-body">
        <p className="text-sm text-base-content/70">{label}</p>
        <p className="text-4xl font-bold">{value.toLocaleString("fr-FR")}</p>
      </div>
    </div>
  );
}
