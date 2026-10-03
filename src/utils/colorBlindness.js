const matrices = {
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
  protanomaly: [
    [0.817, 0.183, 0],
    [0.333, 0.667, 0],
    [0, 0.125, 0.875],
  ],
  deuteranomaly: [
    [0.8, 0.2, 0],
    [0.258, 0.742, 0],
    [0, 0.142, 0.858],
  ],
  tritanomaly: [
    [0.967, 0.033, 0],
    [0, 0.733, 0.267],
    [0, 0.183, 0.817],
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
  ],
  achromatomaly: [
    [0.618, 0.320, 0.062],
    [0.163, 0.775, 0.062],
    [0.163, 0.320, 0.516],
  ],
}

export const colorBlindnessTypes = [
  { id: 'protanopia', name: 'Protanopia', desc: 'No red cones (~1% of males)' },
  { id: 'deuteranopia', name: 'Deuteranopia', desc: 'No green cones (~1% of males)' },
  { id: 'tritanopia', name: 'Tritanopia', desc: 'No blue cones (very rare)' },
  { id: 'protanomaly', name: 'Protanomaly', desc: 'Weak red cones (~1% of males)' },
  { id: 'deuteranomaly', name: 'Deuteranomaly', desc: 'Weak green cones (~5% of males)' },
  { id: 'tritanomaly', name: 'Tritanomaly', desc: 'Weak blue cones (very rare)' },
  { id: 'achromatopsia', name: 'Achromatopsia', desc: 'Total color blindness (very rare)' },
  { id: 'achromatomaly', name: 'Achromatomaly', desc: 'Partial total color blindness (very rare)' },
]

export function simulateColorBlindness(r, g, b, type) {
  const m = matrices[type]
  if (!m) return { r, g, b }
  return {
    r: Math.round(Math.min(255, Math.max(0, m[0][0] * r + m[0][1] * g + m[0][2] * b))),
    g: Math.round(Math.min(255, Math.max(0, m[1][0] * r + m[1][1] * g + m[1][2] * b))),
    b: Math.round(Math.min(255, Math.max(0, m[2][0] * r + m[2][1] * g + m[2][2] * b))),
  }
}

export function applyColorBlindnessToImageData(imageData, type) {
  const m = matrices[type]
  if (!m) return imageData
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    data[i]     = Math.round(Math.min(255, Math.max(0, m[0][0] * r + m[0][1] * g + m[0][2] * b)))
    data[i + 1] = Math.round(Math.min(255, Math.max(0, m[1][0] * r + m[1][1] * g + m[1][2] * b)))
    data[i + 2] = Math.round(Math.min(255, Math.max(0, m[2][0] * r + m[2][1] * g + m[2][2] * b)))
  }
  return imageData
}
