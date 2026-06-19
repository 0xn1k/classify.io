type AuthFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  inputMode?: "numeric" | "tel" | "text";
  autoComplete?: string;
  autoFocus?: boolean;
};

export function AuthField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  inputMode,
  autoComplete,
  autoFocus
}: AuthFieldProps) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
