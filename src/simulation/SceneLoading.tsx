/** Shown while the 3D chunk and the A-Frame scene are still starting. */
export function SceneLoading() {
  return (
    <div className="scene-loading" role="status">
      <div className="scene-spinner" aria-hidden="true" />
      <p>Loading the 3D warehouse…</p>
    </div>
  )
}
