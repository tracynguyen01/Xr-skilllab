/** Desktop widths where 3D is the primary way to start, when WebGL works. */
export const DESKTOP_3D_MIN_WIDTH = 1024

/**
 * Which view the intro should offer first.
 * 3D is primary on a wide screen with WebGL. Narrower screens start in 2D.
 * A missing WebGL context always starts in 2D.
 */
export function primaryView(viewportWidth: number, webgl: boolean): '3d' | '2d' {
  if (!webgl) return '2d'
  return viewportWidth >= DESKTOP_3D_MIN_WIDTH ? '3d' : '2d'
}
