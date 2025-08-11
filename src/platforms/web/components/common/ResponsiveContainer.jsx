import React from 'react';
import { motion } from 'framer-motion';

const ResponsiveContainer = ({ 
  children, 
  title, 
  subtitle, 
  icon: Icon,
  className = "",
  animate = true,
  maxWidth = "full"
}) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full"
  };

  const containerClasses = `
    w-full 
    ${maxWidthClasses[maxWidth] || maxWidthClasses.full}
    mx-auto
    bg-white 
    rounded-xl 
    shadow-sm 
    border 
    border-gray-200 
    overflow-hidden
    ${className}
  `;

  const Container = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  } : {};

  return (
    <Container className={containerClasses} {...animationProps}>
      {/* Header */}
      {(title || subtitle || Icon) && (
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex-shrink-0">
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              {title && (
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </Container>
  );
};

export default ResponsiveContainer;