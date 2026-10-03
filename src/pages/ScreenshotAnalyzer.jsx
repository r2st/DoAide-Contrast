import { useState, useRef, useCallback } from 'react'
import { hexToRgb, rgbToHex, contrastRatio, wcagResults } from '../utils/color'

function extractRegions(imageData, sampleSize = 10) {
  const { data, width, height } = imageData
  const colors = []

  for (let y = 0; y < height; y += sampleSize) {
    for (let x = 0; x < width; x += sampleSize) {
      const i = (y * width + x) * 4
      colors.push({ r: data[i], g: data[i + 1], b: data[i + 2] })
    }
  }

  const buckets = new Map()
  for (const c of colors) {
    const key = `${Math.round(c.r / 16) * 16}-${Math.round(c.g / 16) * 16}-${Math.round(c.b / 16) * 16}`
    if (!buckets.has(key)) {
      buckets.set(key, { r: 0, g: 0, b: 0, count: 0 })
    }
    const b = buckets.get(key)
    b.r += c.r
    b.g += c.g
    b.b += c.b
    b.count++
  }

  const sorted = Array.from(buckets.values())
    .map(b => ({ r: Math.round(b.r / b.count), g: Math.round(b.g / b.count), b: Math.round(b.b / b.count), count: b.count }))
    .sort((a, b) => b.count - a.count)

  return sorted.slice(0, 10)
}

function analyzeContrasts(dominantColors) {
  const pairs = []
  for (let i = 0; i < dominantColors.length; i++) {
    for (let j = i + 1; j < dominantColors.length; j++) {
      const c1 = dominantColors[i]
      const c2 = dominantColors[j]
      const ratio = contrastRatio(c1, c2)
      if (ratio > 1.2) {
        pairs.push({
          color1: c1,
          color2: c2,
          hex1: rgbToHex(c1.r, c1.g, c1.b),
          hex2: rgbToHex(c2.r, c2.g, c2.b),
          ratio,
          results: wcagResults(ratio),
        })
      }
    }
  }
  return pairs.sort((a, b) => b.ratio - a.ratio).slice(0, 15)
}

export default function ScreenshotAnalyzer() {
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [dominantColors, setDominantColors] = useState(null)
  const [pairs, setPairs] = useState(null)
  const [pickMode, setPickMode] = useState(false)
  const [pickedColors, setPickedColors] = useState([])
  const canvasRef = useRef(null)

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setDominantColors(null)
    setPairs(null)
    setPickedColors([])

    const reader = new FileReader()
    reader.onload = (ev) => {
      setImageUrl(ev.target.result)
      const img = new Image()
      img.onload = () => {
        setImage(img)
        analyze(img)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }, [])

  const analyze = (img) => {
    setAnalyzing(true)
    requestAnimationFrame(() => {
      const canvas = document.createElement('canvas')
      const maxW = 600
      const scale = Math.min(1, maxW / img.width)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      const colors = extractRegions(imageData)
      setDominantColors(colors)

      const contrastPairs = analyzeContrasts(colors)
      setPairs(contrastPairs)
      setAnalyzing(false)
    })
  }

  const handleCanvasClick = useCallback((e) => {
    if (!pickMode || !image) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)
    const ctx = canvas.getContext('2d')
    const pixel = ctx.getImageData(x, y, 1, 1).data
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2])
    setPickedColors(prev => [...prev.slice(-4), { hex, r: pixel[0], g: pixel[1], b: pixel[2] }])
  }, [pickMode, image])

  const drawImageToCanvas = useCallback(() => {
    if (!image || !canvasRef.current) return
    const canvas = canvasRef.current
    const maxW = 800
    const scale = Math.min(1, maxW / image.width)
    canvas.width = image.width * scale
    canvas.height = image.height * scale
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  }, [image])

  useState(() => {
    if (image) drawImageToCanvas()
  }, [image, drawImageToCanvas])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Screenshot Analyzer</h1>
        <p className="mt-2 text-gray-600">Upload a screenshot to auto-detect colors and check contrast compliance.</p>
      </div>

      <div className="card mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Screenshot</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0 file:text-sm file:font-semibold
                     file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100"
        />
      </div>

      {analyzing && (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500">Analyzing screenshot...</p>
        </div>
      )}

      {image && !analyzing && (
        <div className="space-y-6">
          <div className="card p-0 overflow-hidden">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Preview</span>
              <button
                onClick={() => {
                  setPickMode(!pickMode)
                  if (!pickMode) drawImageToCanvas()
                }}
                className={`text-sm px-3 py-1 rounded-lg ${pickMode ? 'bg-gold-400 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                {pickMode ? 'Picking Colors...' : 'Pick Colors'}
              </button>
            </div>
            {pickMode ? (
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full h-auto cursor-crosshair"
              />
            ) : (
              <img src={imageUrl} alt="Uploaded screenshot" className="w-full h-auto" />
            )}
          </div>

          {pickedColors.length >= 2 && (
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Picked Colors</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {pickedColors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                    <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: c.hex }} />
                    <span className="text-sm font-mono">{c.hex}</span>
                  </div>
                ))}
                <button onClick={() => setPickedColors([])} className="text-xs text-gray-400 hover:text-gray-600 px-2">Clear</button>
              </div>
              {pickedColors.length >= 2 && (() => {
                const last = pickedColors[pickedColors.length - 1]
                const prev = pickedColors[pickedColors.length - 2]
                const r = contrastRatio(last, prev)
                const res = wcagResults(r)
                return (
                  <div className="p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: prev.hex }} />
                      <span className="text-gray-400">vs</span>
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: last.hex }} />
                      <span className="text-xl font-bold">{r.toFixed(2)}:1</span>
                    </div>
                    <div className="flex gap-2">
                      <span className={res.aa.normal ? 'badge-pass' : 'badge-fail'}>AA Normal</span>
                      <span className={res.aa.large ? 'badge-pass' : 'badge-fail'}>AA Large</span>
                      <span className={res.aaa.normal ? 'badge-pass' : 'badge-fail'}>AAA Normal</span>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {dominantColors && (
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Dominant Colors</h2>
              <div className="flex flex-wrap gap-2">
                {dominantColors.map((c, i) => (
                  <div key={i} className="text-center">
                    <div
                      className="w-14 h-14 rounded-lg border border-gray-200"
                      style={{ backgroundColor: rgbToHex(c.r, c.g, c.b) }}
                    />
                    <div className="text-[10px] font-mono text-gray-500 mt-1">{rgbToHex(c.r, c.g, c.b)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pairs && pairs.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Contrast Pairs Found</h2>
              <div className="space-y-3">
                {pairs.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex gap-1">
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: p.hex1 }} title={p.hex1} />
                      <div className="w-8 h-8 rounded" style={{ backgroundColor: p.hex2 }} title={p.hex2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-mono text-gray-600">{p.hex1} / {p.hex2}</div>
                      <div className="text-xs text-gray-500">{p.ratio.toFixed(2)}:1</div>
                    </div>
                    <div className="flex gap-1.5">
                      <span className={p.results.aa.normal ? 'badge-pass' : 'badge-fail'}>AA</span>
                      <span className={p.results.aaa.normal ? 'badge-pass' : 'badge-fail'}>AAA</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!image && !analyzing && (
        <div className="card text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-lg">Upload a screenshot to analyze</p>
          <p className="text-sm text-gray-400 mt-1">We'll detect colors and check contrast ratios automatically</p>
        </div>
      )}
    </div>
  )
}
