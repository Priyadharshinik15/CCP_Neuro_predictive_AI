import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-md ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
