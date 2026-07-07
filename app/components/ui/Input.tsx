import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="form-control w-full">
      <div className="label py-1">
        <span className="label-text font-medium">{label}</span>
      </div>
      <input
        id={inputId}
        className={`input input-bordered w-full ${error ? "input-error" : ""} ${className}`}
        {...props}
      />
      {error ? (
        <div className="label py-1">
          <span className="label-text-alt text-error">{error}</span>
        </div>
      ) : null}
    </label>
  );
}
