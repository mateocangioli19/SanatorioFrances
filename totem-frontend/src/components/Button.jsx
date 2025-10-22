// components/Button.jsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Button({ text, onClick, color = 'primary' }) {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${color} btn-lg w-100`}
    >
      {text}
    </button>
  );
}
