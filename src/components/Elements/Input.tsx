import React from 'react';
import './Input.css';

interface SelectOption {
  value: string | number;
  label: string;
}

interface InputProps {
  header: string;
  placeholder?: string;
  type?: string;
  options?: string[] | SelectOption[]; // pour les select
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
        {options.map(opt =>
          typeof opt === 'string' ? (
            <option key={opt} value={opt}>{opt}</option>
          ) : (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          )
        )}
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
