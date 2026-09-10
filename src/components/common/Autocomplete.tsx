import { useState, useRef, useMemo, useEffect, useId } from 'react'
import { Search, Plus, User } from 'lucide-react'

interface AutocompleteProps {
  value: string
  onChange: (v: string) => void
  suggestions: string[]
  placeholder?: string
  required?: boolean
  allowCreate?: boolean
  emptyHint?: string
}

export function Autocomplete({ value, onChange, suggestions, placeholder, required, allowCreate = true, emptyHint }: AutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const uid = useId()
  const listboxId = `${uid}-listbox`
  const hintId = `${uid}-hint`
  const optionId = (i: number) => `${listboxId}-opt-${i}`

  const norm = (s: string) => s.trim().toUpperCase()

  const uniqSorted = useMemo(() => {
    const map = new Map<string, string>()
    suggestions.forEach((s) => {
      const k = norm(s)
      if (k && !map.has(k)) map.set(k, s.trim())
    })
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b))
  }, [suggestions])

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return uniqSorted.slice(0, 8)
    return uniqSorted.filter((s) => s.toLowerCase().includes(q)).slice(0, 8)
  }, [uniqSorted, value])

  const exactMatch = useMemo(() => uniqSorted.some((s) => norm(s) === norm(value)), [uniqSorted, value])
  const canCreate = allowCreate && value.trim() && !exactMatch
  const showDropdown = open && (filtered.length > 0 || canCreate)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const select = (v: string) => {
    onChange(norm(v))
    setOpen(false)
    setHighlight(0)
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            const raw = e.target.value.toUpperCase()
            onChange(raw)
            setOpen(true)
            setHighlight(0)
          }}
          onFocus={() => setOpen(true)}
          aria-expanded={showDropdown ? 'true' : 'false'}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
          aria-controls={listboxId}
          aria-describedby={hintId}
          aria-activedescendant={
            showDropdown
              ? highlight < filtered.length
                ? optionId(highlight)
                : canCreate
                  ? optionId(filtered.length)
                  : undefined
              : undefined
          }
          onKeyDown={(e) => {
            if (!showDropdown) return
            const total = filtered.length + (canCreate ? 1 : 0)
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setHighlight((h) => (h + 1) % total)
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setHighlight((h) => (h - 1 + total) % total)
            } else if (e.key === 'Enter') {
              if (highlight < filtered.length) {
                e.preventDefault()
                select(filtered[highlight])
              } else if (canCreate) {
                e.preventDefault()
                select(value)
              }
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          spellCheck={false}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-strong rounded-lg text-xs font-normal text-text placeholder:text-text-subtle outline-none focus:border-accent transition"
        />
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
        {value && exactMatch && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-positive" title="Terdaftar" />}
      </div>

      {showDropdown && (
        <div role="listbox" id={listboxId} className="absolute z-20 mt-1.5 w-full bg-surface rounded-lg md-elevation-2 border border-border overflow-hidden max-h-56 overflow-y-auto p-1">
          {filtered.map((s, idx) => (
            <button
              key={s}
              type="button"
              role="option"
              id={optionId(idx)}
              aria-selected={idx === highlight}
              onMouseDown={(e) => { e.preventDefault(); select(s) }}
              className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 text-xs rounded-lg transition ${idx === highlight ? 'bg-accent-soft text-text font-medium' : 'hover:bg-surface-sunken text-text'}`}
            >
              <User size={15} className={idx === highlight ? 'text-text' : 'text-text-subtle'} />
              <span className="truncate">{s}</span>
              <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${idx === highlight ? 'bg-surface/80 text-text' : 'bg-surface-sunken text-text-muted'}`}>Pilih</span>
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              role="option"
              id={optionId(filtered.length)}
              aria-selected={highlight === filtered.length}
              onMouseDown={(e) => { e.preventDefault(); select(value) }}
              className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2 text-xs rounded-lg border-t border-border transition ${highlight === filtered.length ? 'bg-positive text-on-fill font-medium' : 'bg-positive-soft hover:bg-positive-soft text-positive'}`}
            >
              <Plus size={15} />
              <span className="font-medium truncate">Tambah nasabah baru: {norm(value)}</span>
            </button>
          )}
          {filtered.length === 0 && !canCreate && (
            <div className="px-4 py-3 text-xs text-text-subtle text-center">{emptyHint || 'Tidak ada saran. Ketik untuk menambah.'}</div>
          )}
        </div>
      )}
      <p id={hintId} className="mt-1 text-[11px] text-text-subtle">
        {exactMatch ? '✓ Nasabah terdaftar' : value.trim() ? '↳ Akan disimpan sebagai nasabah baru (huruf besar otomatis)' : 'Ketik untuk mencari atau menambah nasabah'}
      </p>
    </div>
  )
}
