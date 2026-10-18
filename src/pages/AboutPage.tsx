import { ABOUT_COPY, DEVELOPER_NAME, INDEPENDENCE_DISCLAIMER, PROFILE_URL, TRAINING_DISCLAIMER } from '../app/copy'
import { usePageTitle } from '../app/usePageTitle'

export function AboutPage() {
  usePageTitle('About')

  return (
    <article className="wrap prose-page about-page">
      <p className="eyebrow">About</p>
      <h1>{DEVELOPER_NAME}</h1>
      <p className="lede">{ABOUT_COPY}</p>
      <p>
        <a href={PROFILE_URL}>GitHub profile · {PROFILE_URL.replace('https://', '')}</a>
      </p>

      <h2>This project demonstrates</h2>
      <ul>
        <li>An interactive interface in React and TypeScript</li>
        <li>A deterministic assessment with unit tests</li>
        <li>A keyboard-accessible 2D scene</li>
        <li>A static site prepared for GitHub Pages</li>
      </ul>
      <p>Those are properties of the repository, not a work history.</p>

      <h2>Ownership</h2>
      <p>{INDEPENDENCE_DISCLAIMER}</p>
      <p>{TRAINING_DISCLAIMER}</p>
      <p>No contact email is published, because none was supplied for this project.</p>
    </article>
  )
}
