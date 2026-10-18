import { DEVELOPER_NAME, PROFILE_URL, REPO_URL } from '../app/copy'
import { usePageTitle } from '../app/usePageTitle'

export function ProjectPage() {
  usePageTitle('Project Story')

  return (
    <article className="wrap prose-page">
      <p className="eyebrow">Project Story</p>
      <h1>Practise the decision, then show the working</h1>
      <p className="lede">
        Passive safety briefings ask people to remember slides. This prototype asks them to notice a condition and
        choose a response, then shows exactly how the score was built.
      </p>

      <h2>Challenge</h2>
      <p>
        A lot of training is watch-and-recall. The useful moment is the decision in context: an exit with boxes in
        front of it, a spill on the walking route, a leaning stack, a forklift beside people. XR SkillLab is a short,
        independent demonstration of that loop. It is not a product of, or a brief from, any employer.
      </p>

      <h2>Design</h2>
      <p>
        One scenario. Four hazards, three choices each, and two decoys so the scene is not only the answers. The score
        is published in the interface: 15 plus 10, once. The coach talks about missed items in plain language. The
        exercise is meant to take a few minutes, which is a design target, not a measured average.
      </p>

      <h2>Architecture</h2>
      <p>
        The React site, the 2D inspector, the rubric, the scoring functions, and the Scenario Coach all live in the
        static bundle. Session state stays in the tab. A later A-Frame scene and an optional AI Worker are drawn on
        the How It Works page as future layers. They are not part of this build.
      </p>

      <h2>Engineering choices</h2>
      <ul>
        <li>Static first, because GitHub Pages can host the demo without a server or a secret.</li>
        <li>2D before 3D, so the assessment works even when WebGL does not.</li>
        <li>Hash routing, so project-site refreshes do not 404.</li>
        <li>The model does not mark the work. Rules do, and tests check the arithmetic.</li>
      </ul>

      <h2>Evidence</h2>
      <p>
        Unit tests cover the scoring cases for this scenario: no answers, one incorrect, one correct, all incorrect,
        mixed results, a perfect score, duplicate submissions, unknown ids, a fresh retry, a stable result, and an
        offline coach that cannot praise a hazard the visitor did not answer correctly. A browser pass of this
        milestone is recorded in IMPLEMENTATION_STATUS.md. There has been no volunteer user study, and no performance
        number is claimed beyond what that file records.
      </p>

      <h2>Known limitations</h2>
      <ul>
        <li>Not a WHS training package and not a certificate.</li>
        <li>The scene is a drawn illustration, with a 3D warehouse still to come.</li>
        <li>No LMS, no accounts, and no verified learning-effectiveness claim.</li>
        <li>Source notes are placeholders for expert review. They are not citations of a standard.</li>
      </ul>

      <h2>Roadmap</h2>
      <p>Marked as future, not as work already done:</p>
      <ul>
        <li>Future: A-Frame warehouse wired to the same scoring functions.</li>
        <li>Future: optional AI Worker that rephrases the coach text and cannot change points.</li>
        <li>Future: a second scenario only after this one has been used and tightened.</li>
      </ul>

      <h2>What this milestone establishes</h2>
      <p>
        A visitor can start, assess the four hazards, finish, read a real score and the offline coach, and try again
        from an empty attempt. {DEVELOPER_NAME} is building it as an independent learning project.
      </p>
      <p>
        <a href={PROFILE_URL}>GitHub profile · {PROFILE_URL.replace('https://', '')}</a>
      </p>
      <p>
        <a href={REPO_URL}>Repository · {REPO_URL.replace('https://', '')}</a>
      </p>
    </article>
  )
}
