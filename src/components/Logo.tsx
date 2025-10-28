import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-epic-gold p-1 rounded-md">
        <div className="text-epic-blue font-bold text-xl">EC</div>
      </div>
      <span className="font-semibold text-lg text-foreground">EPICSPOT</span>
    </div>
  );
};

export default Logo;
