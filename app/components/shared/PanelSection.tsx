import type { ReactNode } from "react";

type PanelSectionProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
};

export function PanelSection({
  title,
  description,
  actions,
  children,
  className = "",
  bodyClassName = "",
  headerClassName = "",
}: PanelSectionProps) {
  return (
    <section className={`panel-section ${className}`}>
      <div className={`panel-section-header ${headerClassName}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="panel-section-title">{title}</h2>
            {description ? <p className="panel-section-desc">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>
      <div className={`panel-section-body ${bodyClassName}`}>{children}</div>
    </section>
  );
}
