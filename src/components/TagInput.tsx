import React, { useRef, useState } from "react";
import "./TagInput.css";

// Détecte si une couleur est au format HSL
function isHslColor(str: string) {
    return /^hsl/i.test(str);
}

// Convertit une couleur HSL en hexadécimal
function hslStringToHex(hsl: string): string {
    // hsl(206, 70%, 55%)
    const match = hsl.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/i);
    if (!match) return "#a259ff";
    const h = parseInt(match[1], 10) / 360;
    const s = parseInt(match[2], 10) / 100;
    const l = parseInt(match[3], 10) / 100;
    const [r, g, b] = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
}

function getRandomDotColor() {
    const hue = Math.floor(Math.random() * 360);
    const rgb = hslToRgb(hue / 360, 0.7, 0.55);
    return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

// Convertit HSL en RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r: number, g: number, b: number;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Convertit RGB en hexadécimal
function rgbToHex(r: number, g: number, b: number): string {
    return (
        "#" +
        [r, g, b]
            .map((x) => {
                const hex = x.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
    );
}

interface TagInputProps {
    tags: string[];
    setTags: (tags: string[]) => void;
    tagsColors: { [tag: string]: string };
    setTagsColors: (colors: { [tag: string]: string }) => void;
    disabled?: boolean;
    placeholder?: string;
    header?: string; // <-- Ajout de la prop header
}

const TagInput: React.FC<TagInputProps> = ({
    tags,
    setTags,
    tagsColors,
    setTagsColors,
    disabled,
    placeholder,
    header
}) => {
    const [input, setInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const colorInputRefs = useRef<{ [tag: string]: HTMLInputElement | null }>({});

    // Ajoute une couleur par défaut si absente ou convertit HSL en hex
    React.useEffect(() => {
        let changed = false;
        const newColors = { ...tagsColors };
        tags.forEach(tag => {
            let color = tagsColors[tag];
            if (!color) {
                color = getRandomDotColor();
                newColors[tag] = color;
                changed = true;
            } else if (isHslColor(color)) {
                // Convertit HSL en hex
                color = hslStringToHex(color);
                newColors[tag] = color;
                changed = true;
            }
        });
        if (changed) setTagsColors(newColors);
        // eslint-disable-next-line
    }, [tags]);

    // Ajoute un tag à la liste
    const addTag = (tag: string) => {
        const clean = tag.trim();
        if (clean && !tags.includes(clean)) {
            setTags([...tags, clean]);
        }
    };

    // Gestion de la saisie
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Si la saisie contient une virgule, on split et ajoute les tags
        if (value.includes(",")) {
            const parts = value.split(",");
            parts.slice(0, -1).forEach(part => addTag(part));
            setInput(parts[parts.length - 1]);
        } else {
            setInput(value);
        }
    };

    // Gestion des touches
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === "Backspace" || e.key === "Delete") && input === "" && tags.length > 0) {
            setTags(tags.slice(0, -1));
        }
        if ((e.key === "Enter" || e.key === ",") && input.trim() !== "") {
            addTag(input);
            setInput("");
            e.preventDefault();
        }
    };

    // Retirer un tag
    const removeTag = (idx: number) => {
        const tagToRemove = tags[idx];
        setTags(tags.filter((_, i) => i !== idx));
        // Nettoie la couleur associée
        const newColors = { ...tagsColors };
        delete newColors[tagToRemove];
        setTagsColors(newColors);
    };

    // Afficher le color picker natif au clic sur la pastille
    const handleDotClick = (tag: string) => {
        if (disabled) return;
        colorInputRefs.current[tag]?.click();
    };

    // Changer la couleur de la pastille
    const handleColorChange = (tag: string, color: string) => {
        setTagsColors({
            ...tagsColors,
            [tag]: color
        });
    };

    return (
        <div className="input-container">
            {header && <div className="input-header">{header}</div>}
            <div className="tag-input-container" onClick={() => inputRef.current?.focus()}>
                {tags.map((tag, idx) => (
                    <span className="tag-chip" key={tag + idx}>
                        <span
                            className="tag-dot"
                            style={{
                                background: tagsColors[tag] || "#a259ff",
                                cursor: disabled ? "default" : "pointer",
                                position: "relative"
                            }}
                            onClick={() => handleDotClick(tag)}
                        >
                            <input
                                type="color"
                                ref={el => { colorInputRefs.current[tag] = el; }}
                                value={tagsColors[tag] || "#a259ff"}
                                onChange={e => handleColorChange(tag, e.target.value)}
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    width: "100%",
                                    height: "100%",
                                    opacity: 0,
                                    border: "none",
                                    padding: 0,
                                    margin: 0,
                                    cursor: "pointer"
                                }}
                                tabIndex={-1}
                                disabled={disabled}
                            />
                        </span>
                        <span className="tag-label">{tag}</span>
                        {!disabled && (
                            <span className="tag-remove" onClick={() => removeTag(idx)}>
                                &times;
                            </span>
                        )}
                    </span>
                ))}
                <input
                    ref={inputRef}
                    className="tag-input"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={placeholder}
                    style={{ minWidth: 80, flex: 1, border: "none", background: "transparent" }}
                />
            </div>
        </div>
    );
};

export default TagInput;