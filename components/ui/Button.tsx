'use client';
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;    
}

export default function Button({ children, className="", variant='primary', size='md', isLoading=false, disabled, ...props }: ButtonProps) {
    //estilos base
    const baseStyles = 'justify-center items-center inline-flex cursor-pointer rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none'
    
    //estilos para las variantes
    const variantStyles = {
        primary: "bg-primary text-white hover:bg-primary-dark",
        secondary: "bg-secondary text-white hover:bg-secondary-dark",
        outline: "bg-transparent text-primary border border-primary hover:bg-primary-light",
        danger: "bg-danger text-white hover:bg-danger-dark",
        success: "bg-success text-white hover:bg-success-dark"
    }

    //estilos para los tamaños
    const sizeStyles = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-[55px] px-6 text-xl rounded-[15px]",
    }
    
    return(
        <button className={`${baseStyles} ${className} ${variantStyles[variant]} ${sizeStyles[size]}`} disabled={disabled} {...props} >
            {isLoading ? <ArrowPathIcon className="animate-spin" /> : children}
        </button>
    );
}