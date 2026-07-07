import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function Textarea({
  label,
  error,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <label className="form-control w-full">
      <div className="label py-1">
        <span className="label-text font-medium">{label}</span>
      </div>
      <textarea
        id={textareaId}
        className={`textarea textarea-bordered min-h-24 w-full ${error ? "textarea-error" : ""} ${className}`}
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
