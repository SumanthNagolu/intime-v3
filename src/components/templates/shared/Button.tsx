'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30',
  secondary: 'bg-gradient-to-r from-forest-600 to-forest-700 text-white shadow-lg shadow-forest-500/20 hover:shadow-xl hover:shadow-forest-500/30',
  ghost: 'bg-transparent hover:bg-charcoal-100 text-charcoal-700',
  outline: 'bg-transparent border-2 border-charcoal-200 hover:border-charcoal-400 text-charcoal-700',
  dark: 'bg-charcoal-900 text-white hover:bg-charcoal-800 shadow-lg'
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-10 py-5 text-sm'
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  icon,
  iconPosition = 'left',
  className,
  onClick,
  disabled,
  type = 'button'
}) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center gap-3 rounded-full font-bold uppercase tracking-widest transition-all duration-300',
    variants[variant],
    sizes[size],
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  const content = (
    <>
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {content}
    </button>
  );
};

export default Button;
