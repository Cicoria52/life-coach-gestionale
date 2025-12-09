import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex flex-col items-center ${className}`}>
    <div className="w-32 h-32 mb-2 relative">
       {/* Using the user uploaded 4.png exactly as requested */}
       <img 
         src="4.png" 
         alt="FD Life Coach Logo" 
         className="w-full h-full object-contain drop-shadow-2xl" 
       />
    </div>
    <div className="text-center">
      <h1 className="text-[#D4AF37] font-extrabold text-xl tracking-widest uppercase" style={{ fontFamily: 'serif' }}>
        LIFE COACH
      </h1>
      <p className="text-zinc-400 text-[10px] tracking-wider uppercase mt-1">
        Studio Di Consulenza E Supporto
      </p>
      <p className="text-zinc-600 text-[9px] mt-0.5">Dott. Fabio Donati</p>
    </div>
  </div>
);