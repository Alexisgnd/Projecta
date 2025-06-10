import React from "react";
import "./Button.css";

type Variant = "primary" | "secondary" | "success";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    variant?: Variant;
    selected?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    text,
    variant = "primary",
    selected = false,
    ...props
}) => {
    const className = [
        "button",
        variant,
        selected ? "selected" : ""
    ].join(" ");

    return (
        <button className={className} {...props}>
            {text}
        </button>
    );
};

export default Button;