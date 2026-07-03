import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export default function Input({ label, icon, rightElement, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 text-left w-full">
      {label && (
        <label className="text-2xs font-extrabold text-zinc-400 uppercase tracking-wider pl-1 select-none">
          {label}
        </label>
      )}
      {icon || rightElement ? (
        <div className={`border border-zinc-200 bg-white focus-within:border-zinc-950 rounded-2xl flex items-center px-4.5 py-2.5 transition-all gap-2 ${className}`}>
          {icon}
          <input
            className="w-full bg-transparent text-zinc-900 text-xs font-bold outline-none border-none p-0 focus:ring-0 placeholder-zinc-350"
            {...props}
          />
          {rightElement}
        </div>
      ) : (
        <input
          className={`border border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-2.5 text-sm text-zinc-900 font-medium outline-none transition-colors ${className}`}
          {...props}
        />
      )}
    </div>
  );
}
