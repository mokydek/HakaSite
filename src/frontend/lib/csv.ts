/** Minimal CSV builder and client side download, no external library. */

// Byte order mark so spreadsheets open the UTF-8 file with the right encoding.
const BOM = String.fromCharCode(0xfeff)

function escapeCsvValue(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

/** Builds a CSV string with a header row and quoted, escaped cells. */
export function buildCsv(headers: string[], rows: Array<Array<unknown>>): string {
  const lines = [headers.map(escapeCsvValue).join(',')]
  for (const row of rows) {
    lines.push(row.map(escapeCsvValue).join(','))
  }
  return lines.join('\r\n')
}

/** Triggers a client side download of the CSV via a Blob and an anchor. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
