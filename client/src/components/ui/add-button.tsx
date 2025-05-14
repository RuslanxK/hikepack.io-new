// src/components/AddButton.tsx

import React from 'react';
import { Plus } from 'lucide-react';
import { AddButtonProps } from '@/types/button';
import { Button } from './button';

const AddButton: React.FC<AddButtonProps> = ({ onClick, className = '', text}) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className={`bg-white dark:bg-dark-box flex flex-col items-center justify-center border border-2 border-dashed border-black dark:border-gray-400 rounded-lg cursor-pointer dark:hover:border-white ${className}`}
      style={{ minHeight: '210px', height: 'calc(100% - 1rem)' }}>
      <Plus className="dark:text-white"/>
      {text}
    </Button>
  );
};

export default AddButton;
