import React from 'react';
import { cn } from './Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, rightElement, ...props }, ref) => {
    const generatedId = id || Math.random().toString(36).substr(2, 9);
    
    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={generatedId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={generatedId}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500",
              rightElement && "pr-10",
              error && "border-red-500 focus:ring-red-500 dark:border-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-sm font-medium text-red-500 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
