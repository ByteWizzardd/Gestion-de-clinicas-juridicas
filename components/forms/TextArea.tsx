interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function TextArea({ label, error, ...props }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-base font-normal text-foreground mb-1">
          {label.split(' *').map((part, index, array) =>
            index < array.length - 1 ? (
              <span key={index}>
                {part} <span className="text-danger">*</span>
              </span>
            ) : (
              <span key={index}>{part}</span>
            )
          )}
        </label>
      )}

      <textarea
        className={`
          w-full p-4 rounded-lg border bg-[var(--input-bg)]
          ${error ? 'border-danger' : 'border-transparent'}
          focus:outline-none focus:ring-1
          ${error ? 'focus:ring-danger' : 'focus:ring-primary'}
          text-base text-foreground placeholder:text-[var(--input-placeholder)] resize-none
        `}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

