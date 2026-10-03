import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import ColorPicker from '../components/ColorPicker'
import ShareButton from '../components/ShareButton'
import { hexToRgb, rgbToHex, isValidHex, ensureHash } from '../utils/color'
import { colorBlindnessTypes, simulateColorBlindness, applyColorBlindnessToImageData } from '../utils/colorBlindness'

function ColorSwatches({ fg, bg }) {
  const fgRgb = hexToRgb(ensureHash(fg))
  const bgRgb = hexToRgb(ensureHash(bg))

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {colorBlindnessTypes.map(type => {
        const simFg = simulateColorBlindness(fgRgb.r, fgRgb.g, fgRgb.b, type.id)
        const simBg = simulateColorBlindness(bgRgb.r, bgRgb.g, bgRgb.b, type.id)
        const simFgHex = rgbToHex(simFg.r, simFg.g, simFg.b)
        const simBgHex = rgbToHex(simBg.r, simBg.g, simBg.b)

        return (
          <div key={type.id} className="card p-0 overflow-hidden">
            <div className="p-4" style={{ backgroundColor: simBgHex, color: simFgHex }}>
              <div className="font-bold">Sample Text</div>
              <div className="text-sm">Quick brown fox</div>
            </div>
            <div className="p-3">
              <div className="font-medium text-sm text-gray-900">{type.name}</div>
              <div className="text-xs text-gray-500">{type.desc}</div>
              <div className="flex gap-2 mt-1">
                <span className="text-xs font-mono" style={{ color: simFgHex }}>■</span>
                <span className="text-xs font-mono text-gray-500">{simFgHex}</span>
                <span className="text-xs font-mono" style={{ color: simBgHex }}>■</span>
                <span className="text-xs font-mono text-gray-500">{simBgHex}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ImageSimulator() {
  const [image, setImage] = useState(null)
  const [selectedType, setSelectedType] = useState('deuteranopia')
  const canvasRef = useRef(null)
  const originalDataRef = useRef(null)

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => setImage(img)
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }, [])

  useEffect(() => {
    if (!image || !canvasRef.current) return
    const canvas = canvasRef.current
    const maxW = 800
    const scale = Math.min(1, maxW / image.width)
    canvas.width = image.width * scale
    canvas.height = image.height * scale
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    originalDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
  }, [image])

  useEffect(() => {
    if (!originalDataRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const data = new ImageData(
      new Uint8ClampedArray(originalDataRef.current.data),
      originalDataRef.current.width,
      originalDataRef.current.height
    )
    applyColorBlindnessToImageData(data, selectedType)
    ctx.putImageData(data, 0, 0)
  }, [selectedType, image])

  return (
    <div className="space-y-4">
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0 file:text-sm file:font-semibold
                     file:bg-gold-50 file:text-gold-700 hover:file:bg-gold-100"
        />
      </div>

      {image && (
        <>
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">Simulation Type</label>
            <div className="flex flex-wrap gap-2">
              {colorBlindnessTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === type.id
                      ? 'bg-gold-400 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
          <div className="card overflow-hidden p-0">
            <canvas ref={canvasRef} className="w-full h-auto" />
          </div>
        </>
      )}
    </div>
  )
}

export default function ColorBlindnessSimulator() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState('colors')
  const [fg, setFg] = useState(searchParams.get('fg') || '#e53e3e')
  const [bg, setBg] = useState(searchParams.get('bg') || '#38a169')

  const fgValid = isValidHex(fg)
  const bgValid = isValidHex(bg)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Color Blindness Simulator</h1>
        <p className="mt-2 text-gray-600">See how your colors or images appear to people with different types of color vision deficiency.</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('colors')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'colors' ? 'bg-gold-400 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Color Pairs
        </button>
        <button
          onClick={() => setMode('image')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'image' ? 'bg-gold-400 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Image Upload
        </button>
      </div>

      {mode === 'colors' ? (
        <div className="space-y-6">
          <div className="card">
            <div className="grid sm:grid-cols-2 gap-4">
              <ColorPicker label="Color 1" value={fg} onChange={setFg} />
              <ColorPicker label="Color 2" value={bg} onChange={setBg} />
            </div>
            {fgValid && bgValid && (
              <div className="mt-4 flex justify-end">
                <ShareButton params={{ fg: ensureHash(fg), bg: ensureHash(bg) }} />
              </div>
            )}
          </div>

          {fgValid && bgValid && (
            <>
              <div className="card p-0 overflow-hidden">
                <div className="p-4" style={{ backgroundColor: ensureHash(bg), color: ensureHash(fg) }}>
                  <div className="font-bold text-lg">Original — Normal Vision</div>
                  <div>The quick brown fox jumps over the lazy dog</div>
                </div>
              </div>
              <ColorSwatches fg={fg} bg={bg} />
            </>
          )}
        </div>
      ) : (
        <ImageSimulator />
      )}
    </div>
  )
}
