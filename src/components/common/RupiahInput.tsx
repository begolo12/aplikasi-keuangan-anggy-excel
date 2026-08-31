import React, { useState, useEffect } from 'react'

export function formatRibuan(v: number | string | undefined | null): string {
  if (v === '' || v === undefined || v === null) return ''
  const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/\D/g, ''))
  if (isNaN(num) || num === 0) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}

export function parseRibuan(str: string): number {
  if (!str) return 0
  const clean = String(str).replace(/\D/g, '')
  return clean ? parseInt(clean, 10) : 0
}

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
  const [displayVal, setDisplayVal] = useState(() => formatRibuan(value))

  useEffect(() => {
    setDisplayVal(formatRibuan(value))
  }, [value])

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
      className={className}
    />
  )
}
