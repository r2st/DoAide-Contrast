import { useState, useCallback } from 'react'
import { wcagChecklist } from '../utils/wcag'

export default function AccessibilityChecklist() {
  const [checked, setChecked] = useState({})
  const [filter, setFilter] = useState('all')
  const [expandedLevel, setExpandedLevel] = useState('A')

  const toggle = useCallback((id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const totalItems = wcagChecklist.reduce((sum, g) => sum + g.items.length, 0)
  const checkedCount = Object.values(checked).filter(Boolean).length
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0

  const getGroupStats = (items) => {
    const done = items.filter(i => checked[i.id]).length
    return { done, total: items.length, pct: items.length > 0 ? (done / items.length) * 100 : 0 }
  }

  const filteredGroups = wcagChecklist.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (filter === 'done') return checked[item.id]
      if (filter === 'todo') return !checked[item.id]
      return true
    }),
  }))

  const reset = () => setChecked({})

  const exportChecklist = () => {
    const lines = ['WCAG 2.1 Accessibility Audit', '=' .repeat(40), '']
    wcagChecklist.forEach(group => {
      lines.push(`Level ${group.level}`)
      lines.push('-'.repeat(20))
      group.items.forEach(item => {
        lines.push(`[${checked[item.id] ? 'x' : ' '}] ${item.id} ${item.title}`)
        lines.push(`    ${item.desc}`)
      })
      lines.push('')
    })
    lines.push(`Progress: ${checkedCount}/${totalItems} (${progress.toFixed(0)}%)`)

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wcag-audit.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Accessibility Checklist</h1>
        <p className="mt-2 text-gray-600">Interactive WCAG 2.1 checklist for website accessibility audits.</p>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500">Overall Progress</div>
            <div className="text-2xl font-bold text-gray-900">{checkedCount} / {totalItems} <span className="text-sm font-normal text-gray-500">({progress.toFixed(0)}%)</span></div>
          </div>
          <div className="flex gap-2">
            <button onClick={exportChecklist} className="btn-secondary text-sm">Export</button>
            <button onClick={reset} className="btn-secondary text-sm text-red-600 hover:text-red-700">Reset</button>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: progress === 100 ? '#22c55e' : '#F0B429' }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'todo', 'done'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${
              filter === f ? 'bg-gold-400 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f === 'todo' ? 'To Do' : 'Done'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredGroups.map(group => {
          const stats = getGroupStats(wcagChecklist.find(g => g.level === group.level).items)
          const isExpanded = expandedLevel === group.level

          return (
            <div key={group.level} className="card p-0 overflow-hidden">
              <button
                onClick={() => setExpandedLevel(isExpanded ? null : group.level)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-sm font-bold ${
                    group.level === 'A' ? 'bg-blue-100 text-blue-700' :
                    group.level === 'AA' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    Level {group.level}
                  </span>
                  <span className="text-sm text-gray-500">{stats.done}/{stats.total} completed</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${stats.pct}%`, backgroundColor: stats.pct === 100 ? '#22c55e' : '#F0B429' }}
                    />
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && group.items.length > 0 && (
                <div className="border-t border-gray-100">
                  {group.items.map(item => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                        checked[item.id] ? 'bg-green-50/50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!checked[item.id]}
                        onChange={() => toggle(item.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-gold-500 focus:ring-gold-400"
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${checked[item.id] ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          <span className="font-mono text-xs text-gray-400 mr-2">{item.id}</span>
                          {item.title}
                        </div>
                        <div className={`text-xs mt-0.5 ${checked[item.id] ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {isExpanded && group.items.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-gray-400 border-t border-gray-100">
                  No items match the current filter.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
