import type { ReactNode } from 'react';

export function Field({ label, value, onChange, area, hint }: { label: string; value: string; onChange: (v: string) => void; area?: boolean; hint?: string }) {
  return (
    <label className="fld"><span>{label}</span>
      {area ? <textarea rows={4} value={value} onChange={e => onChange(e.target.value)} /> : <input value={value} onChange={e => onChange(e.target.value)} />}
      {hint && <small>{hint}</small>}
    </label>
  );
}
