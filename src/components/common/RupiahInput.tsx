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
  const [lastProp, setLastProp] = useState(value)
  if (value !== lastProp) {
    setLastProp(value)
    setDisplayVal(formatRibuan(value))
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
      className={className}
    />
  )
}
