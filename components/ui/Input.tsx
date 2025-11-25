interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps){
    return(
        <div className="flex flex-col gap-2">
            {label && <label className="text-xl font-medium">{label}</label>}
            <input className={`w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${className}`} {...props} />
            {error && <p className="text-md text-red-500">{error}</p>}
        </div>
    );
}