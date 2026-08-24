type NoteFieldProps = {
  value: string
  onChange: (next: string) => void
  label: string
  placeholder?: string
  rows?: number
}

export function NoteField({ value, onChange, label, placeholder, rows = 3 }: NoteFieldProps) {
  return (
    <label className="block">
      <span className="micro mb-1.5 block">{label}</span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="field resize-y text-[13px] leading-relaxed"
      />
    </label>
  )
}
