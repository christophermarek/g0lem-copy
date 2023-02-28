import React from 'react';
import { PropsWithChildren } from 'react';
import { TabColors, TextColors } from './HeaderTabs';

export interface ButtonSecondaryProps {
  onClick?: any;
  className?: string;
  borderColor?: string;
  textColor?: string;
  selected?: boolean;
  noHoverAnimation?: boolean;
  noCursor?: boolean;
  hoverScaleDirection?: string;
  disabled?: boolean;
}

export const ButtonSecondary: React.FC<PropsWithChildren<ButtonSecondaryProps>> = ({
  onClick,
  className,
  children,
  borderColor = TabColors.Default.secondary,
  textColor = TextColors.Default.primary,
  selected,
  noHoverAnimation = false,
  noCursor,
  hoverScaleDirection = 'x',
  disabled,
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex 
      ${
        noHoverAnimation
          ? ''
          : `hover:scale-${hoverScaleDirection}-95 hover:text-gray-400 hover:underline`
      }
      ${noCursor ? 'cursor-default' : 'cursor-pointer'}
      ${selected ? 'bg-gray-800' : className && className.includes('bg') ? ' ' : ' bg-secondary '}
      ${selected ? 'font-bold text-gray-400 underline' : textColor} 
      
      ${
        className && className.includes('justify') ? '' : 'justify-between'
      } ${borderColor} border-opacity-50	
      ${className && className.includes('rounded') ? '' : 'rounded-lg'}
      ${className && className.includes('border') ? ' ' : ' border-2 '}
      ${className && className.includes('py') ? ' ' : ' py-2 '}
      ${className && className.includes('px') ? ' ' : ' px-4 '}
        ${className}`}
    >
      {children}
    </button>
  );
};
