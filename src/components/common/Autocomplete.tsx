import { useState, useRef, useMemo, useEffect } from 'react'
import { Search, Plus, User } from 'lucide-react'

interface AutocompleteProps {
  value: string
  onChange: (v: string) => void
  suggestions: string[]
  placeholder?: string
  required?: boolean
  label?: string
  allowCreate?: boolean
  emptyHint?: string
}

export function Autocomplete({ value, onChange, suggestions, placeholder, required, allowCreate = true, emptyHint }: AutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
          aria-controls="autocomplete-listbox"
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
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#747775] rounded-xl text-xs font-normal text-[#1f1f1f] placeholder:text-[#747775] outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition"
        />
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747775] pointer-events-none" />
        {value && exactMatch && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#137333]" title="Terdaftar" />}
      </div>

      {showDropdown && (
        <div role="listbox" className="absolute z-20 mt-1.5 w-full bg-white rounded-2xl md-elevation-2 border border-[#e0e2e0] overflow-hidden max-h-56 overflow-y-auto p-1">
          {filtered.map((s, idx) => (
            <button
              key={s}
              type="button"
              role="option"
              aria-selected={idx === highlight}
              onMouseDown={(e) => { e.preventDefault(); select(s) }}
              className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 text-xs rounded-xl transition ${idx === highlight ? 'bg-[#c2e7ff] text-[#001d35] font-medium' : 'hover:bg-[#f1f3f4] text-[#1f1f1f]'}`}
            >
              <User size={15} className={idx === highlight ? 'text-[#001d35]' : 'text-[#747775]'} />
              <span className="truncate">{s}</span>
              <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${idx === highlight ? 'bg-white/80 text-[#001d35]' : 'bg-[#f1f3f4] text-[#444746]'}`}>Pilih</span>
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(value) }}
              className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2 text-xs rounded-xl border-t border-[#f1f3f4] transition ${highlight === filtered.length ? 'bg-[#137333] text-white font-medium' : 'bg-[#e6f4ea] hover:bg-[#ceead6] text-[#137333]'}`}
            >
              <Plus size={15} />
              <span className="font-medium truncate">Tambah nasabah baru: {norm(value)}</span>
            </button>
          )}
          {filtered.length === 0 && !canCreate && (
            <div className="px-4 py-3 text-xs text-[#747775] text-center">{emptyHint || 'Tidak ada saran. Ketik untuk menambah.'}</div>
          )}
        </div>
      )}
      <p className="mt-1 text-[11px] text-[#747775]">
        {exactMatch ? '✓ Nasabah terdaftar' : value.trim() ? '↳ Akan disimpan sebagai nasabah baru (huruf besar otomatis)' : 'Ketik untuk mencari atau menambah nasabah'}
      </p>
    </div>
  )
}
