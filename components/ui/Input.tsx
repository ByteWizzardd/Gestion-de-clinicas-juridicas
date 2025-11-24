interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({ label, error, disabled, ...props }: InputProps){
    return(
        <div className="flex flex-col gap-1">
            {label && <label className="text-base font-normal text-foreground mb-1">{label}</label>}
            <input 
                className={`
                    w-full h-[40px] px-4 rounded-full border
                    ${error ? 'border-danger' : 'border-transparent'}
                    ${disabled ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-[#E5E7EB]'}
                    focus:outline-none focus:ring-1 focus:ring-primary
                    ${error ? 'focus:ring-danger' : 'focus:ring-primary'}
                    ${disabled ? 'focus:ring-0' : ''}
                    text-base placeholder:text-[#717171]
                `} 
                disabled={disabled}
                {...props} 
            />
            {error && <p className="text-xs text-danger mt-1">{error}</p>}
        </div>
    );
}