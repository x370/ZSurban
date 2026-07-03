'use client';

import React from 'react';
import { ShoppingBag as ShoppingBagIcon } from '@mui/icons-material';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-zinc-900 text-white p-2 rounded-xl flex items-center justify-center">
        <ShoppingBagIcon fontSize="small" />
      </div>
      <div className="text-left">
        <span className="font-bold text-zinc-900 tracking-tight text-lg leading-tight block">ZSurban</span>
        <span className="text-[10px] text-zinc-500 font-medium block">Pakistan Store</span>
      </div>
    </div>
  );
}
