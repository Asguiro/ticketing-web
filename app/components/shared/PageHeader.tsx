import { Bell, Plus, Search } from "lucide-react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-base-content">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm text-base-content/60">{description}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="btn btn-ghost btn-square">
          <Search className="size-5" />
        </button>
        <button type="button" className="btn btn-ghost btn-square">
          <Bell className="size-5" />
        </button>
        {actions ?? (
          <button type="button" className="btn btn-primary btn-circle">
            <Plus className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
