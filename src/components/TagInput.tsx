import React, { useEffect, useRef, useState } from "react";
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
}

const TagInput: React.FC<TagInputProps> = ({
    tags,
    setTags,
    tagsColors,
    setTagsColors,
    disabled,
    placeholder
}) => {
    const [input, setInput] = useState("");
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Ajoute une couleur par défaut si absente
    useEffect(() => {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.includes(",")) {
            const parts = value.split(",");
            const newTags = parts.slice(0, -1).map(t => t.trim()).filter(Boolean);
            if (newTags.length > 0) {
                setTags([...tags, ...newTags]);
            }
            setInput(parts[parts.length - 1]);
        } else {
            setInput(value);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === "Backspace" || e.key === "Delete") && input === "" && tags.length > 0) {
            setTags(tags.slice(0, -1));
        }
        if (e.key === "Enter" && input.trim() !== "") {
            setTags([...tags, input.trim()]);
            setInput("");
        }
    };

    const removeTag = (idx: number) => {
        const tagToRemove = tags[idx];
        setTags(tags.filter((_, i) => i !== idx));
        // Nettoie la couleur associée
        const newColors = { ...tagsColors };
        delete newColors[tagToRemove];
        setTagsColors(newColors);
    };

    const handleDotClick = (tag: string) => {
        if (disabled) return;
        setShowColorPicker(tag === showColorPicker ? null : tag);
    };

    const handleColorChange = (tag: string, color: string) => {
        setTagsColors({
            ...tagsColors,
            [tag]: color
        });
    };

    return (
        <div className="tag-input-container" onClick={() => inputRef.current?.focus()}>
            {tags.map((tag, idx) => (
                <span
                    className="tag-chip"
                    key={tag + idx}
                    style={{ background: "#f3f4f6" }}
                >
                    <span
                        className="tag-dot"
                        style={{
                            background: tagsColors[tag] || getRandomDotColor(),
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
                    {tag}
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
            />
        </div>
    );
};

export default TagInput;