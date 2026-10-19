const LAYERS = [
  {
    name: 'Experience',
    cards: [
      { title: 'React site', text: 'Pages, navigation, and the results view.', state: 'Live' },
      { title: '2D inspector', text: 'Illustrated warehouse, keyboard access, same hazards.', state: 'Live' },
      { title: '3D scene', text: 'A-Frame warehouse. Same hazards and the same score as 2D.', state: 'Live' },
    ],
  },
  {
    name: 'Assessment',
    cards: [
      { title: 'Scenario rubric', text: 'Typed hazard content, choices, and source notes.', state: 'Live' },
      { title: 'Scoring engine', text: 'Pure functions. 15 points to identify, 10 for the preferred action.', state: 'Live' },
    ],
  },
  {
    name: 'Coaching',
    cards: [
      { title: 'Scenario Coach', text: 'Offline rules. Restates the score. No network call.', state: 'Live' },
      { title: 'AI Worker', text: 'Implemented and switched off. This site does not call it. It cannot change the score.', state: 'Off' },
    ],
  },
]

export function ArchitectureMap() {
  return (
    <div className="arch">
      <p className="arch-legend">
        <span className="badge badge-live">Live</span> is running on this site.
        <span className="badge badge-off">Off</span> is in the project and this site does not call it.
      </p>
      {LAYERS.map((layer, index) => (
        <div key={layer.name} className="arch-layer">
          {index > 0 ? <p className="arch-then">Feeds the next layer</p> : null}
          <h3>{layer.name}</h3>
          <div className="arch-cards">
            {layer.cards.map((card) => (
              <article key={card.title} className={card.state === 'Off' ? 'arch-card is-off' : 'arch-card'}>
                <span className={card.state === 'Off' ? 'badge badge-off' : 'badge badge-live'}>{card.state}</span>
                <h4>{card.title}</h4>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      ))}
      <p className="arch-host">GitHub Pages will host the static files only. This version has no database and no API key.</p>
    </div>
  )
}
