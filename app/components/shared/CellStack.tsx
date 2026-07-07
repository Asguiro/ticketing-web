type CellStackProps = {
  primary: string;
  secondary?: string | null;
  mono?: boolean;
};

export function CellStack({ primary, secondary, mono = false }: CellStackProps) {
  return (
    <div className="cell-content-start min-w-0">
      <p className="truncate text-cell-primary" title={primary}>
        {primary}
      </p>
      {secondary ? (
        <p
          className={`truncate text-cell-secondary ${mono ? "font-mono tracking-wide" : ""}`}
          title={secondary}
        >
          {secondary}
        </p>
      ) : null}
    </div>
  );
}
