import React from 'react'

const control =
  'w-full px-3 py-2 bg-surface text-text border border-border rounded-lg text-[13px] outline-none transition-colors placeholder:text-text-subtle focus:border-accent disabled:opacity-45 disabled:cursor-not-allowed'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  invalid?: boolean
}

export function Input({ invalid = false, className = '', ...props }: InputProps) {
  return <input className={`${control} ${invalid ? 'border-negative' : ''} ${className}`} {...props} />
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export function Select({ invalid = false, className = '', children, ...props }: SelectProps) {
  return (
    <select className={`${control} cursor-pointer ${invalid ? 'border-negative' : ''} ${className}`} {...props}>
      {children}
    </select>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export function Textarea({ invalid = false, className = '', ...props }: TextareaProps) {
  return <textarea className={`${control} min-h-[76px] resize-y ${invalid ? 'border-negative' : ''} ${className}`} {...props} />
}

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

/** Label + kontrol + pesan. Mengikat error ke `aria-describedby` sekaligus. */
export function Field({ label, htmlFor, error, hint, children, className = '' }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-[11px] font-semibold tracking-wide text-text-muted mb-1.5">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-[11px] text-negative">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-text-subtle">{hint}</p>
      ) : null}
    </div>
  )
}
