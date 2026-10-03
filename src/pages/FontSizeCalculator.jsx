import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ShareButton from '../components/ShareButton'

function getMinFontSize(ratio) {
  if (ratio >= 7) return { aa: { normal: 1, large: 1 }, aaa: { normal: 1, large: 1 } }
  if (ratio >= 4.5) return { aa: { normal: 1, large: 1 }, aaa: { normal: null, large: 1 } }
  if (ratio >= 3) return { aa: { normal: null, large: 1 }, aaa: { normal: null, large: null } }
  return { aa: { normal: null, large: null }, aaa: { normal: null, large: null } }
}

const fontWeights = [
  { value: 400, label: 'Regular (400)' },
  { value: 500, label: 'Medium (500)' },
  { value: 600, label: 'Semibold (600)' },
  { value: 700, label: 'Bold (700)' },
]

export default function FontSizeCalculator() {
  const [searchParams] = useSearchParams()
  const [ratio, setRatio] = useState(searchParams.get('ratio') || '4.5')

  const ratioNum = parseFloat(ratio)
  const validRatio = !isNaN(ratioNum) && ratioNum > 0

  const recommendations = useMemo(() => {
    if (!validRatio) return null

    const sizes = []
    for (let px = 10; px <= 48; px += 2) {
      const pt = px * 0.75
      for (const w of fontWeights) {
        const isLarge = pt >= 18 || (pt >= 14 && w.value >= 700)
        const aaReq = isLarge ? 3 : 4.5
        const aaaReq = isLarge ? 4.5 : 7
        sizes.push({
          px,
          pt: pt.toFixed(1),
          weight: w.value,
          weightLabel: w.label,
          isLarge,
          aaPass: ratioNum >= aaReq,
          aaaPass: ratioNum >= aaaReq,
          aaReq: `${aaReq}:1`,
          aaaReq: `${aaaReq}:1`,
        })
      }
    }
    return sizes
  }, [ratioNum, validRatio])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Font Size Calculator</h1>
        <p className="mt-2 text-gray-600">Find minimum font sizes for WCAG compliance based on your contrast ratio.</p>
      </div>

      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contrast Ratio</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="21"
                step="0.1"
                value={ratio}
                onChange={e => setRatio(e.target.value)}
                className="input-field w-32 font-mono"
              />
              <span className="text-gray-500">: 1</span>
            </div>
          </div>
          {validRatio && <ShareButton params={{ ratio }} />}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[3, 4.5, 7, 10, 15, 21].map(r => (
            <button
              key={r}
              onClick={() => setRatio(String(r))}
              className={`px-3 py-1 rounded-full text-sm ${
                parseFloat(ratio) === r ? 'bg-gold-400 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {r}:1
            </button>
          ))}
        </div>
      </div>

      {validRatio && (
        <>
          <div className="card mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Summary</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${ratioNum >= 4.5 ? 'bg-green-50 border border-green-200' : ratioNum >= 3 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="font-semibold text-gray-900">WCAG AA</div>
                {ratioNum >= 4.5 ? (
                  <p className="text-sm text-green-700 mt-1">Passes for all text sizes</p>
                ) : ratioNum >= 3 ? (
                  <p className="text-sm text-yellow-700 mt-1">Passes for large text only (18pt / 14pt bold)</p>
                ) : (
                  <p className="text-sm text-red-700 mt-1">Does not pass for any text size</p>
                )}
              </div>
              <div className={`p-4 rounded-lg ${ratioNum >= 7 ? 'bg-green-50 border border-green-200' : ratioNum >= 4.5 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="font-semibold text-gray-900">WCAG AAA</div>
                {ratioNum >= 7 ? (
                  <p className="text-sm text-green-700 mt-1">Passes for all text sizes</p>
                ) : ratioNum >= 4.5 ? (
                  <p className="text-sm text-yellow-700 mt-1">Passes for large text only (18pt / 14pt bold)</p>
                ) : (
                  <p className="text-sm text-red-700 mt-1">Does not pass for any text size</p>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <strong>Large text</strong> is defined as 18pt (24px) regular weight or 14pt (18.66px) bold weight and above.
            </div>
          </div>

          <div className="card overflow-x-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Detailed Size Chart</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Size</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Weight</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Category</th>
                  <th className="text-center py-2 px-2 text-gray-600 font-medium">AA</th>
                  <th className="text-center py-2 px-2 text-gray-600 font-medium">AAA</th>
                </tr>
              </thead>
              <tbody>
                {recommendations?.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 px-2 font-mono">{r.px}px / {r.pt}pt</td>
                    <td className="py-2 px-2">{r.weightLabel}</td>
                    <td className="py-2 px-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.isLarge ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {r.isLarge ? 'Large' : 'Normal'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={r.aaPass ? 'badge-pass' : 'badge-fail'}>{r.aaPass ? 'PASS' : 'FAIL'}</span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={r.aaaPass ? 'badge-pass' : 'badge-fail'}>{r.aaaPass ? 'PASS' : 'FAIL'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
