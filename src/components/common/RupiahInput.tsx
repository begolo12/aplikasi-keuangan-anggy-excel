import React, { useState } from 'react'
import { formatRibuan } from './format'

interface RupiahInputProps {
  value?: number | string
  onChange?: (val: number) => void
  placeholder?: string
  className?: string
  required?: boolean
  name?: string
  id?: string
  disabled?: boolean
  autoFocus?: boolean
}

/** Sama dengan `control` di Input.tsx supaya kolom rupiah tidak perlu dihias ulang. */
const control =
  'w-full px-3 py-2 bg-surface text-text border border-border rounded-lg text-[13px] num outline-none transition-colors placeholder:text-text-subtle focus:border-accent disabled:opacity-45 disabled:cursor-not-allowed'

export function RupiahInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  required = false,
  name,
  id,
  disabled = false,
  autoFocus = false,
}: RupiahInputProps) {
  const formatInputVal = (v: number | string | undefined) => {
    if (v === '' || v === undefined || v === null || Number(v) === 0) return ''
    return formatRibuan(v)
  }
  const [displayVal, setDisplayVal] = useState(() => formatInputVal(value))
  const [lastProp, setLastProp] = useState(value)
  if (value !== lastProp) {
    setLastProp(value)
    setDisplayVal(formatInputVal(value))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const num = raw ? parseInt(raw, 10) : 0
    const formatted = num > 0 ? new Intl.NumberFormat('id-ID').format(num) : ''
    setDisplayVal(formatted)
    if (onChange) onChange(num)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      name={name}
      id={id}
      disabled={disabled}
      autoFocus={autoFocus}
      required={required}
      placeholder={placeholder}
      value={displayVal}
      onChange={handleChange}
      className={className || control}
    />
  )
}
