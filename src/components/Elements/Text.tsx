import React from 'react';
import './Text.css';

interface TextProps {
    children: React.ReactNode;
    size?: number | string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string; // Peut être un nom ou un code hex
    className?: string;
}

// Couleurs prédéfinies
const COLORS: Record<string, string> = {
    primary: '#A200FFFF',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    dark: '#343a40',
    light: '#f8f9fa',
    muted: '#6c757d',
};

const Text: React.FC<TextProps> = ({
    children,
    size = 16,
    bold = false,
    italic = false,
    underline = false,
    color = '#222',
    className = '',
}) => {
    // Utilise la couleur prédéfinie si elle existe, sinon la valeur passée
    const resolvedColor = color && COLORS[color] ? COLORS[color] : color;

    const style: React.CSSProperties = {
        fontFamily: "'Inter', sans-serif",
        fontSize: typeof size === 'number' ? `${size}px` : size,
        fontWeight: bold ? 'bold' : 'normal',
        fontStyle: italic ? 'italic' : 'normal',
        textDecoration: underline ? 'underline' : 'none',
        color: resolvedColor,
    };

    return (
        <span className={`custom-text ${className}`} style={style}>
            {children}
        </span>
    );
};

export default Text;