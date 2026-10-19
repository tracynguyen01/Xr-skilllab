const root = document.querySelector('#demo-groups')
const status = document.querySelector('#demo-status')

const groups = [
  {
    id: 'training',
    title: 'Industry training',
    lede: 'Four fictional floors. Warehouse, oil and gas, mining, and chemical processing. Each score comes from the same fixed rules.',
  },
  {
    id: 'inspection',
    title: 'Inspection',
    lede: 'A remote look at one fictional home, with the report left in the inspector’s hands.',
  },
]

function card(sample) {
  const link = document.createElement('a')
  link.className = 'demo-card'
  link.href = sample.href
  link.style.setProperty('--accent', sample.accent)

  const figure = document.createElement('span')
  figure.className = 'demo-shot'
  const image = document.createElement('img')
  image.src = sample.thumbnail
  image.alt = ''
  image.width = 1600
  image.height = 1000
  image.decoding = 'async'
  const picture = document.createElement('picture')
  if (typeof sample.thumbnail === 'string' && sample.thumbnail.endsWith('.webp')) {
    const source = document.createElement('source')
    source.type = 'image/avif'
    source.srcset = sample.thumbnail.replace(/\.webp$/, '.avif')
    picture.append(source)
  }
  picture.append(image)
  figure.append(picture)

  const body = document.createElement('span')
  body.className = 'demo-body'
  const kicker = document.createElement('span')
  kicker.className = 'eyebrow'
  kicker.textContent = sample.group === 'inspection' ? 'Inspection' : 'Industry training'
  const title = document.createElement('h3')
  title.textContent = sample.title
  const tagline = document.createElement('p')
  tagline.className = 'tagline'
  tagline.textContent = sample.tagline
  const pitch = document.createElement('p')
  pitch.className = 'pitch'
  pitch.textContent = sample.pitch || sample.tagline
  const tags = document.createElement('ul')
  tags.className = 'tags'
  for (const tag of sample.tags) {
    const item = document.createElement('li')
    item.textContent = tag
    tags.append(item)
  }
  const cta = document.createElement('span')
  cta.className = 'cta'
  cta.textContent = 'Open the demo'

  body.append(kicker, title, tagline, pitch, tags, cta)
  link.append(figure, body)
  return link
}

try {
  const response = await fetch('samples.json')
  if (!response.ok) throw new Error('missing list')
  const samples = await response.json()
  if (!Array.isArray(samples) || samples.length === 0) throw new Error('empty list')
  for (const group of groups) {
    const items = samples.filter((sample) => sample.group === group.id)
    if (items.length === 0) continue
    const section = document.createElement('div')
    section.className = 'demo-group'
    const title = document.createElement('h3')
    title.textContent = group.title
    const lede = document.createElement('p')
    lede.className = 'group-lede'
    lede.textContent = group.lede
    const grid = document.createElement('div')
    grid.className = items.length === 1 ? 'demo-grid is-single' : 'demo-grid'
    for (const sample of items) grid.append(card(sample))
    section.append(title, lede, grid)
    root.append(section)
  }
} catch {
  status.textContent = 'The demo list could not be loaded.'
}
