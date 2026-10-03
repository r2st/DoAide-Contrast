import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ColorPicker from '../components/ColorPicker'
import ShareButton from '../components/ShareButton'
import { hexToRgb, rgbToHex, contrastRatio, wcagResults, isValidHex, ensureHash } from '../utils/color'

export default function ContrastChecker() {
  const [searchParams] = useSearchParams()
  const [fg, setFg] = useState(searchParams.get('fg') || '#1a1a2e')
  const [bg, setBg] = useState(searchParams.get('bg') || '#ffffff')

  const fgValid = isValidHex(fg)
  const bgValid = isValidHex(bg)

  const ratio = useMemo(() => {
    if (!fgValid || !bgValid) return null
    return contrastRatio(hexToRgb(ensureHash(fg)), hexToRgb(ensureHash(bg)))
  }, [fg, bg, fgValid, bgValid])

  const results = ratio ? wcagResults(ratio) : null

  const swap = () => {
    const tmp = fg
    setFg(bg)
    setBg(tmp)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Color Contrast Checker</h1>
        <p className="mt-2 text-gray-600">Check if your color combinations meet WCAG 2.1 accessibility standards.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="card">
            <div className="space-y-4">
              <ColorPicker label="Foreground (Text)" value={fg} onChange={setFg} />
              <div className="flex justify-center">
                <button onClick={swap} className="btn-secondary text-sm" title="Swap colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>
              <ColorPicker label="Background" value={bg} onChange={setBg} />
            </div>
          </div>

          {ratio && (
            <div className="card">
              <div className="text-center mb-4">
                <div className="text-sm font-medium text-gray-500 mb-1">Contrast Ratio</div>
                <div className="text-5xl font-bold text-gray-900">{ratio.toFixed(2)}<span className="text-lg text-gray-400">:1</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'AA Normal', pass: results.aa.normal, req: '4.5:1' },
                  { label: 'AA Large', pass: results.aa.large, req: '3:1' },
                  { label: 'AAA Normal', pass: results.aaa.normal, req: '7:1' },
                  { label: 'AAA Large', pass: results.aaa.large, req: '4.5:1' },
                ].map(r => (
                  <div key={r.label} className={`p-3 rounded-lg border ${r.pass ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{r.label}</span>
                      <span className={r.pass ? 'badge-pass' : 'badge-fail'}>{r.pass ? 'PASS' : 'FAIL'}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Min {r.req}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <ShareButton params={{ fg: ensureHash(fg), bg: ensureHash(bg) }} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {fgValid && bgValid && (
            <>
              <div className="card" style={{ backgroundColor: ensureHash(bg), color: ensureHash(fg) }}>
                <h3 className="text-2xl font-bold mb-2">Preview — Large Text (24px+)</h3>
                <p className="text-lg">This is how your text will look against the background at large sizes. Large text is defined as 18pt (24px) or 14pt bold (18.66px).</p>
              </div>
              <div className="card" style={{ backgroundColor: ensureHash(bg), color: ensureHash(fg) }}>
                <h3 className="text-base font-semibold mb-2">Preview — Normal Text</h3>
                <p className="text-sm">This is how your text will look at normal body text sizes. Normal text is anything smaller than 18pt or 14pt bold. Ensure adequate contrast for readability.</p>
              </div>
              <div className="card" style={{ backgroundColor: ensureHash(fg), color: ensureHash(bg) }}>
                <h3 className="text-base font-semibold mb-2">Preview — Reversed</h3>
                <p className="text-sm">Same colors swapped. Sometimes the reverse combination works better for buttons, badges, or callout elements.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
