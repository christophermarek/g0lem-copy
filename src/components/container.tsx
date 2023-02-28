import React from 'react';

interface FrameProps {
  onClick?: any;
  className?: string;
  children: any;
  style?: any;
  parentBorderColor?: string;
}
export const Frame: React.FC<FrameProps> = ({
  children,
  className,
  onClick,
  style,
  parentBorderColor,
}: any): any => {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`border-solid ${parentBorderColor} h-fit	border-opacity-70
      ${className && className.includes('bg') ? ' ' : ' bg-tertiary '}
      ${className && className.includes('rounded') ? '' : ' rounded-lg '}
      ${
        className && className.includes('border')
          ? ' '
          : ' border-t-2 border-l-2 border-b-2 border-r-2 '
      }
      ${className && className.includes('py') ? ' ' : ' py-2 '}
      ${className && className.includes('px') ? ' ' : ' px-4 '}
      ${className}`}
    >
      {children}
    </div>
  );
};
