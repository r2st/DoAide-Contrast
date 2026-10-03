import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ColorPicker from '../components/ColorPicker'
import ShareButton from '../components/ShareButton'
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, contrastRatio, wcagResults, isValidHex, ensureHash } from '../utils/color'

function generatePalette(hex) {
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const combos = []

  const backgrounds = [
    { label: 'White', hex: '#ffffff' },
    { label: 'Light Gray', hex: '#f5f5f5' },
    { label: 'Medium Gray', hex: '#9e9e9e' },
    { label: 'Dark Gray', hex: '#424242' },
    { label: 'Black', hex: '#000000' },
  ]

  for (const bg of backgrounds) {
    const bgRgb = hexToRgb(bg.hex)
    const ratio = contrastRatio(rgb, bgRgb)
    const results = wcagResults(ratio)
    combos.push({ fg: hex, bg: bg.hex, bgLabel: bg.label, ratio, results })
  }

  const variations = []
  for (let l = 5; l <= 95; l += 5) {
    const varRgb = hslToRgb(hsl.h, hsl.s, l)
    const varHex = rgbToHex(varRgb.r, varRgb.g, varRgb.b)

    const whiteRatio = contrastRatio(varRgb, { r: 255, g: 255, b: 255 })
    const blackRatio = contrastRatio(varRgb, { r: 0, g: 0, b: 0 })

    variations.push({
      hex: varHex,
      lightness: l,
      onWhite: { ratio: whiteRatio, results: wcagResults(whiteRatio) },
      onBlack: { ratio: blackRatio, results: wcagResults(blackRatio) },
    })
  }

  const complementH = (hsl.h + 180) % 360
  const analogous1H = (hsl.h + 30) % 360
  const analogous2H = (hsl.h + 330) % 360
  const triadic1H = (hsl.h + 120) % 360
  const triadic2H = (hsl.h + 240) % 360

  const harmonies = [
    { label: 'Complementary', h: complementH },
    { label: 'Analogous +30', h: analogous1H },
    { label: 'Analogous -30', h: analogous2H },
    { label: 'Triadic +120', h: triadic1H },
    { label: 'Triadic +240', h: triadic2H },
  ].map(h => {
    const harmRgb = hslToRgb(h.h, hsl.s, hsl.l)
    const harmHex = rgbToHex(harmRgb.r, harmRgb.g, harmRgb.b)
    const whiteRatio = contrastRatio(harmRgb, { r: 255, g: 255, b: 255 })
    const blackRatio = contrastRatio(harmRgb, { r: 0, g: 0, b: 0 })
    return {
      ...h,
      hex: harmHex,
      onWhite: { ratio: whiteRatio, pass: whiteRatio >= 4.5 },
      onBlack: { ratio: blackRatio, pass: blackRatio >= 4.5 },
    }
  })

  return { combos, variations, harmonies }
}

export default function PaletteGenerator() {
  const [searchParams] = useSearchParams()
  const [color, setColor] = useState(searchParams.get('color') || '#F0B429')

  const valid = isValidHex(color)
  const palette = useMemo(() => valid ? generatePalette(ensureHash(color)) : null, [color, valid])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Accessible Palette Generator</h1>
        <p className="mt-2 text-gray-600">Generate accessible color combinations from your brand color that pass WCAG standards.</p>
      </div>

      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <ColorPicker label="Brand Color" value={color} onChange={setColor} />
          </div>
          {valid && <ShareButton params={{ color: ensureHash(color) }} />}
        </div>
      </div>

      {palette && (
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">On Standard Backgrounds</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {palette.combos.map(c => (
                <div key={c.bg} className="card p-0 overflow-hidden">
                  <div className="p-4" style={{ backgroundColor: c.bg, color: c.fg }}>
                    <div className="font-bold text-lg">Sample Text</div>
                    <div className="text-sm">on {c.bgLabel}</div>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-sm font-mono text-gray-600">{c.ratio.toFixed(2)}:1</span>
                    <div className="flex gap-1.5">
                      <span className={c.results.aa.normal ? 'badge-pass' : 'badge-fail'}>AA</span>
                      <span className={c.results.aaa.normal ? 'badge-pass' : 'badge-fail'}>AAA</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Lightness Variations</h2>
            <div className="card overflow-x-auto">
              <div className="flex gap-1 min-w-[600px]">
                {palette.variations.map(v => (
                  <div key={v.lightness} className="flex-1 text-center">
                    <div
                      className="h-12 rounded-t"
                      style={{ backgroundColor: v.hex }}
                      title={v.hex}
                    />
                    <div className="text-[10px] font-mono text-gray-500 mt-1">{v.hex}</div>
                    <div className="mt-0.5">
                      {v.onWhite.results.aa.normal && <div className="text-[9px] text-green-600">AA on white</div>}
                      {v.onBlack.results.aa.normal && <div className="text-[9px] text-green-600">AA on black</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Color Harmonies</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {palette.harmonies.map(h => (
                <div key={h.label} className="card p-0 overflow-hidden">
                  <div className="flex">
                    <div className="w-1/2 h-20" style={{ backgroundColor: ensureHash(color) }} />
                    <div className="w-1/2 h-20" style={{ backgroundColor: h.hex }} />
                  </div>
                  <div className="p-3">
                    <div className="font-medium text-sm text-gray-900">{h.label}</div>
                    <div className="text-xs font-mono text-gray-500">{h.hex}</div>
                    <div className="flex gap-2 mt-1 text-xs">
                      <span className={h.onWhite.pass ? 'text-green-600' : 'text-red-500'}>
                        {h.onWhite.ratio.toFixed(1)}:1 on white
                      </span>
                      <span className={h.onBlack.pass ? 'text-green-600' : 'text-red-500'}>
                        {h.onBlack.ratio.toFixed(1)}:1 on black
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
