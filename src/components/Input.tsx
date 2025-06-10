import React from 'react';
import './Input.css';

interface InputProps {
  header: string;
  placeholder?: string;
  type?: string;
  [key: string]: any;
}

const Input: React.FC<InputProps> = ({ header, placeholder, type = "text", ...props }) => (
  <div className="input-container">
    <div className="input-header">{header}</div>
    <input
      className="input-field"
      type={type}
      placeholder={placeholder}
      {...props}
    />
  </div>
);

export default Input;