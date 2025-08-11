import React from 'react';

const ResponsiveGrid = ({ 
  children, 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className = ""
}) => {
  const gapClasses = {
    1: "gap-1",
    2: "gap-2", 
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
    8: "gap-8"
  };

  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3", 
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6"
  };

  const gridClasses = `
    grid
    ${colClasses[cols.sm] || 'grid-cols-1'}
    ${cols.md ? `md:${colClasses[cols.md]}` : ''}
    ${cols.lg ? `lg:${colClasses[cols.lg]}` : ''}
    ${cols.xl ? `xl:${colClasses[cols.xl]}` : ''}
    ${cols['2xl'] ? `2xl:${colClasses[cols['2xl']]}` : ''}
    ${gapClasses[gap] || 'gap-4'}
    ${className}
  `;

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;