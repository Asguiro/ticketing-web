import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
};

export function Select({
  label,
  error,
  options,
  id,
  className = "",
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className="form-control w-full">
      <div className="label py-1">
        <span className="label-text text-col-header">{label}</span>
      </div>
      <select
        id={selectId}
        className={`select select-bordered w-full ${error ? "select-error" : ""} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <div className="label py-1">
          <span className="label-text-alt text-error">{error}</span>
        </div>
      ) : null}
    </label>
  );
}
