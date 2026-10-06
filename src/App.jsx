import { useMemo, useState } from 'react'
import { data } from './data/data'
import './App.css'

const normalize = (value) =>
  value
    .toLocaleLowerCase('hu-HU')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const tubeColors = {
  lila: '#8b5cf6',
  piros: '#ef4444',
  sarga: '#f0b429',
  zold: '#22a06b',
  kek: '#3b82f6',
  szurke: '#64748b',
  fekete: '#1f2937',
}

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTests, setSelectedTests] = useState([])

  const filteredTests = useMemo(() => {
    const query = normalize(searchTerm.trim())
    if (!query) return []

    return data
      .filter((test) =>
        [test.vizsgalat, test.rovidites].some((field) =>
          normalize(field).includes(query),
        ),
      )
      .slice(0, 20)
  }, [searchTerm])

  const tubeSummary = useMemo(
    () =>
      selectedTests.reduce((summary, test) => {
        summary[test.cso] = (summary[test.cso] || 0) + 1
        return summary
      }, {}),
    [selectedTests],
  )

  const addTest = (test) => {
    setSelectedTests((current) =>
      current.some((selected) => selected.id === test.id)
        ? current
        : [...current, test],
    )
  }

  const removeTest = (id) => {
    setSelectedTests((current) => current.filter((test) => test.id !== id))
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-mark" aria-hidden="true">
          +
        </div>
        <div>
          <p className="eyebrow">Laboratóriumi segéd</p>
          <h1>Vizsgálatlista</h1>
        </div>
      </header>

      <section className="search-section" aria-labelledby="search-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Új vizsgálat</p>
            <h2 id="search-title">Mit szeretnél felvenni?</h2>
          </div>
          <span className="data-count">{data.length} vizsgálat</span>
        </div>
        <label className="search-box">
          <span className="search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Vizsgálat neve vagy rövidítése..."
            aria-label="Vizsgálat keresése"
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-button"
              onClick={() => setSearchTerm('')}
              aria-label="Keresés törlése"
            >
              ×
            </button>
          )}
        </label>

        <div className="results" aria-live="polite">
          {!searchTerm.trim() ? (
            <p className="empty-state">Kezdj el gépelni a vizsgálatok kereséséhez.</p>
          ) : filteredTests.length === 0 ? (
            <p className="empty-state">Nincs találat erre a keresésre.</p>
          ) : (
            filteredTests.map((test) => {
              const isSelected = selectedTests.some(
                (selected) => selected.id === test.id,
              )
              return (
                <article className="result-card" key={test.id}>
                  <div className="test-info">
                    <div className="test-title-row">
                      <h3>{test.vizsgalat}</h3>
                      <span className="abbreviation">{test.rovidites}</span>
                    </div>
                    <p>
                      {test.minta} <span className="dot">•</span> {test.adalekanyag}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`add-button ${isSelected ? 'is-added' : ''}`}
                    onClick={() => addTest(test)}
                    disabled={isSelected}
                  >
                    <span aria-hidden="true">{isSelected ? '✓' : '+'}</span>
                    {isSelected ? 'Felvéve' : 'Felvesz'}
                  </button>
                </article>
              )
            })
          )}
        </div>
      </section>

      <section className="selected-section" aria-labelledby="selected-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Összeállított lista</p>
            <h2 id="selected-title">Kiválasztott vizsgálatok</h2>
          </div>
          <span className="count-badge">{selectedTests.length}</span>
        </div>

        {selectedTests.length === 0 ? (
          <div className="selected-empty">
            <span className="clipboard-icon" aria-hidden="true">
              ✓
            </span>
            <p>A felvett vizsgálatok itt jelennek meg.</p>
          </div>
        ) : (
          <div className="selected-list">
            {selectedTests.map((test) => (
              <div className="selected-card" key={test.id}>
                <span
                  className="tube-dot"
                  style={{ backgroundColor: tubeColors[test.cso] || '#64748b' }}
                  title={`${test.cso} cső`}
                />
                <div className="test-info">
                  <h3>{test.vizsgalat}</h3>
                  <p>
                    {test.rovidites} <span className="dot">•</span> {test.cso} cső
                  </p>
                </div>
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeTest(test.id)}
                  aria-label={`${test.vizsgalat} eltávolítása`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="summary-section" aria-labelledby="summary-title">
        <div className="summary-title">
          <span className="summary-icon" aria-hidden="true">
            ▤
          </span>
          <div>
            <p className="eyebrow">Előkészítés</p>
            <h2 id="summary-title">Szükséges csövek</h2>
          </div>
        </div>
        {Object.keys(tubeSummary).length === 0 ? (
          <p className="summary-empty">A csőösszesítő a kiválasztás után jelenik meg.</p>
        ) : (
          <div className="tube-list">
            {Object.entries(tubeSummary).map(([color, amount]) => (
              <div className="tube-row" key={color}>
                <span
                  className="tube-dot"
                  style={{ backgroundColor: tubeColors[color] || '#64748b' }}
                />
                <span>{color} cső</span>
                <strong>{amount} db</strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App
