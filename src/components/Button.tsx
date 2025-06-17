import React from "react";
import "./Button.css";

type Variant = "primary" | "secondary" | "success" | "failure";
type Size = "small" | "medium" | "large";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    variant?: Variant;
    selected?: boolean;
    size?: Size;
    prefixIcon?: React.ReactNode;
    suffixIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    text,
    variant = "primary",
    selected = false,
    size = "medium",
    prefixIcon,
    suffixIcon,
    ...props
}) => {
    const className = [
        "button",
        variant,
        selected ? "selected" : "",
        `button-${size}`
    ].join(" ");

    return (
        <button className={className} {...props}>
            {prefixIcon && <span className="button-icon prefix">{prefixIcon}</span>}
            <span>{text}</span>
            {suffixIcon && <span className="button-icon suffix">{suffixIcon}</span>}
        </button>
    );
};

export default Button;