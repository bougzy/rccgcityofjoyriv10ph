/**
 * Generate a CSV string from headers and rows.
 */
export function generateCSV(headers: string[], rows: (string | number)[][]): string {
  const escape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
  return [
    headers.map(escape).join(','),
    ...rows.map(row => row.map(escape).join(',')),
  ].join('\n');
}

/**
 * Trigger a CSV download in the browser.
 */
export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
