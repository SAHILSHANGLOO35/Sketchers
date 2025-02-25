import * as React from "react";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { className = "", variant = "default", size = "default", ...props },
        ref
    ) => {
        const baseStyles =
            "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

        const variantStyles = {
            default: "bg-violet-600 text-white hover:bg-violet-600/90",
            destructive: "bg-red-600 text-white hover:bg-red-600/90",
            outline: "border border-white/10 hover:bg-violet-500/10",
            secondary: "bg-violet-200 text-violet-900 hover:bg-violet-200/80",
            ghost: "hover:bg-violet-500/10",
            link: "underline-offset-4 hover:underline",
        }[variant];

        const sizeStyles = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        }[size];

        const combinedClassName = `${baseStyles} ${variantStyles} ${sizeStyles} ${className}`;

        return <button className={combinedClassName} ref={ref} {...props} />;
    }
);
Button.displayName = "Button";

export { Button };
