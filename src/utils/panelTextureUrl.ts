/**
 * Build URL for a panel image under public/Panels/.
 * Folder is used as-is (e.g. stone&marbles) — do not encode whole folder or Vite/static
 * servers may not resolve %26 back to & on disk. Use quoted url() in CSS when applying.
 */
export function getPanelTextureUrl(panel: { folder: string; fileId: string }): string {
  return `/Panels/${panel.folder}/${panel.fileId}.png`
}
