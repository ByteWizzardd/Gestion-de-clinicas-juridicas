interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function TextArea({ label, error, ...props }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-md font-medium">{label}</label>}
      <textarea
        className={`
          w-full p-2 rounded-md border
          ${error ? 'border-danger' : 'border-gray-300'}
          focus:outline-none focus:ring-2
          ${error ? 'focus:ring-danger' : 'focus:ring-primary'}
          resize-none
        `}
        {...props}
      />
      {error && <p className="text-md text-danger">{error}</p>}
    </div>
  );
}

