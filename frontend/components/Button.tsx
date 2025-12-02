"use client";

import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

export default function Button({
  children,
  onClick,
  variant,
  className = "",
}: ButtonProps) {
  const base =
    "px-6 py-3 rounded font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantStylesMap = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    ghost:
      "bg-transparent text-white border border-gray-600 hover:bg-gray-800/30 focus:ring-gray-400",
  };

  // Use optional chaining safely
  const variantStyles = variant ? variantStylesMap[variant] : "";

  return (
    <button
      onClick={onClick}
      className={`${base} ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
}
