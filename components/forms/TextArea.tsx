interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function TextArea({ label, error, ...props }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-base font-normal text-foreground mb-1">{label}</label>}
      <textarea
        className={`
          w-full p-4 rounded-lg border
          ${error ? 'border-danger' : 'border-transparent bg-[#E5E7EB]'}
          focus:outline-none focus:ring-1
          ${error ? 'focus:ring-danger' : 'focus:ring-primary'}
          text-base placeholder:text-[#717171] resize-none
        `}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

