import React from 'react';
import './Input.css';

interface InputProps {
  header: string;
  placeholder?: string;
  type?: string;
  options?: string[]; // pour les select
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  [key: string]: any;
}

const Input: React.FC<InputProps> = ({
  header,
  placeholder,
  type = "text",
  options,
  value,
  onChange,
  ...props
}) => (
  <div className="input-container">
    <div className="input-header">{header}</div>

    {type === "textarea" ? (
      <textarea
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
    ) : type === "select" && options ? (
      <select
        className="input-field"
        value={value}
        onChange={onChange}
        {...props}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    ) : (
      <input
        className="input-field"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
    )}
  </div>
);

export default Input;
