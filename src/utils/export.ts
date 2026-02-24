import { jsPDF } from 'jspdf'
import type { Palette } from '../types'

export function downloadSnapshot(dataUrl: string, filename = 'alubond-snapshot.png') {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export function generateSpecPdf(
  paletteName: string,
  paletteStyle: string,
  colors: Array<{ name: string; sku: string; hex: string; finish: string }>,
  selectedCount: number,
  snapshotDataUrl?: string
) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Alubond Color Studio – Specification', 20, 20)
  doc.setFontSize(11)
  doc.text(`Palette: ${paletteName} (${paletteStyle})`, 20, 32)
  doc.text(`Surfaces selected: ${selectedCount}`, 20, 40)
  doc.text('Colors applied:', 20, 50)
  let y = 58
  colors.forEach((c) => {
    doc.setFontSize(10)
    doc.text(`${c.name} (${c.sku}) – ${c.hex} – ${c.finish}`, 24, y)
    y += 7
  })
  if (snapshotDataUrl) {
    try {
      doc.addPage()
      doc.addImage(snapshotDataUrl, 'PNG', 20, 20, 170, 170 * (9 / 16))
    } catch {
      // ignore if image too large or invalid
    }
  }
  doc.save('alubond-specification.pdf')
}
