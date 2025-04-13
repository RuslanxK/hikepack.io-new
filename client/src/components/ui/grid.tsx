
import React from 'react';
import { GridProps } from '@/types/grid';

const Grid: React.FC<GridProps> = ({ children, className = '' }) => {
  return (
    <div className="w-full flex-grow">
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-5 ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Grid;
