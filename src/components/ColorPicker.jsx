import { useCallback } from 'react'
import { isValidHex, ensureHash } from '../utils/color'

export default function ColorPicker({ label, value, onChange }) {
  const handleTextChange = useCallback((e) => {
    const v = e.target.value
    onChange(v)
  }, [onChange])

  const handlePickerChange = useCallback((e) => {
    onChange(e.target.value)
  }, [onChange])

  const valid = isValidHex(value)
  const displayColor = valid ? ensureHash(value) : '#000000'

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={displayColor}
          onChange={handlePickerChange}
          className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={handleTextChange}
          placeholder="#000000"
          className={`input-field flex-1 font-mono ${!valid && value ? 'border-red-300 focus:ring-red-400' : ''}`}
        />
      </div>
      {!valid && value && (
        <p className="mt-1 text-xs text-red-500">Enter a valid hex color (e.g. #FF5500)</p>
      )}
    </div>
  )
}
