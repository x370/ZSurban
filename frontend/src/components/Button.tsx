import React from 'react';
import { CircularProgress } from '@mui/material';

interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  component?: 'button' | 'div' | 'span' | 'a';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 
    | 'primary' 
    | 'danger' 
    | 'outline' 
    | 'ghost' 
    | 'icon' 
    | 'sidebar' 
    | 'social'
    | 'dark'
    | 'secondary'
    | 'nav'
    | 'storefront';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  isActive?: boolean; // For sidebar navigation active states
}

export default function Button({
  component = 'button',
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  isActive = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  
  const baseClasses = 'inline-flex items-center justify-center transition-all duration-200 active:scale-97 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    // Admin & Common
    primary: 'bg-zinc-900 hover:bg-black text-white shadow-sm font-bold rounded-xl py-2.5 text-sm',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm font-bold rounded-xl py-2.5 text-sm',
    outline: 'border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold rounded-xl py-2.5 text-sm',
    ghost: 'text-zinc-500 hover:text-zinc-950 font-bold text-xs py-1.5 transition-colors',
    icon: 'border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 transition-colors shrink-0',
    sidebar: isActive 
      ? 'bg-zinc-900 text-white shadow-sm shadow-zinc-900/10 px-4 py-2.5 rounded-xl text-sm font-bold w-full justify-start'
      : 'text-zinc-550 hover:text-zinc-900 hover:bg-zinc-100/80 px-4 py-2.5 rounded-xl text-sm font-bold w-full justify-start',
    social: 'border border-zinc-200 hover:border-zinc-300 bg-white rounded-2xl py-2.5 text-2xs font-bold text-zinc-650 hover:text-zinc-900 shadow-3xs w-full',
    
    // User Storefront specific
    dark: 'bg-zinc-950 hover:bg-black text-white shadow-md shadow-zinc-950/10 rounded-full font-bold',
    secondary: 'bg-zinc-900 hover:bg-zinc-950 text-white rounded-full shadow-sm hover:shadow-md font-bold',
    nav: isActive 
      ? 'text-zinc-900 bg-zinc-100 rounded-lg font-semibold px-3 py-2 text-sm' 
      : 'text-zinc-650 hover:text-zinc-900 rounded-lg font-medium hover:bg-zinc-50/50 px-3 py-2 text-sm',
    storefront: 'bg-[#00b884] hover:bg-[#00a374] text-white shadow-md shadow-[#00b884]/20 rounded-full font-bold'
  };

  const iconSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8 h-8 rounded-full',
    lg: 'w-10 h-10 rounded-full',
  };

  const standardSizes = {
    sm: 'text-2xs px-3 py-1.5',
    md: 'text-xs md:text-sm px-5 py-2.5',
    lg: 'text-xs md:text-sm px-6 py-3'
  };

  const isUserPill = variant === 'dark' || variant === 'secondary' || variant === 'storefront';

  const compiledClasses = [
    baseClasses,
    variants[variant],
    variant === 'icon' ? iconSizes[size] : '',
    variant !== 'icon' && variant !== 'sidebar' && variant !== 'social' && variant !== 'nav' && variant !== 'ghost' ? standardSizes[size] : '',
    isUserPill ? 'rounded-full' : '',
    fullWidth && variant !== 'sidebar' && variant !== 'social' ? 'w-full flex-1' : '',
    className
  ].filter(Boolean).join(' ');

  const Component = component as React.ElementType;
  
  // Safe prop spreading for non-button tags
  const componentProps: any = { ...props, className: compiledClasses };
  if (component === 'button') {
    componentProps.disabled = disabled || loading;
  } else {
    // If not a button, disabled needs to be simulated or passed carefully
    if (disabled || loading) {
      componentProps['aria-disabled'] = true;
      componentProps.style = { ...props.style, pointerEvents: 'none', opacity: 0.5 };
    }
  }

  return (
    <Component {...componentProps}>
      {loading ? <CircularProgress size={16} color="inherit" /> : children}
    </Component>
  );
}
