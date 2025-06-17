import React, { useRef, useState } from "react";
import "./TagInput.css";

function getRandomDotColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 55%)`;
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
    header // <-- Ajout ici
}) => {
    const [input, setInput] = useState("");
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Ajoute une couleur par défaut si absente
    React.useEffect(() => {
        tags.forEach(tag => {
            if (!tagsColors[tag]) {
                setTagsColors({
                    ...tagsColors,
                    [tag]: getRandomDotColor()
                });
            }
        });
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

    // Afficher le color picker
    const handleDotClick = (tag: string) => {
        if (disabled) return;
        setShowColorPicker(tag === showColorPicker ? null : tag);
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
                    <span
                        className="tag-chip"
                        key={tag + idx}
                    >
                        <span
                            className="tag-dot"
                            style={{
                                background: tagsColors[tag] || "#a259ff",
                                cursor: disabled ? "default" : "pointer",
                                position: "relative"
                            }}
                            onClick={() => handleDotClick(tag)}
                        >
                            {showColorPicker === tag && !disabled && (
                                <input
                                    type="color"
                                    className="tag-color-picker"
                                    value={tagsColors[tag] || "#a259ff"}
                                    onChange={e => handleColorChange(tag, e.target.value)}
                                    onBlur={() => setShowColorPicker(null)}
                                    autoFocus
                                    tabIndex={0}
                                />
                            )}
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