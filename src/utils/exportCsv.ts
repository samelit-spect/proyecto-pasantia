const escapeCsv = (value: string | number | undefined): string => {
  const str = value === undefined || value === null ? '' : String(value);
  if (/[",\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | undefined)[][]
): void {
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  // En iOS/PWA la descarga no arranca de inmediato: revocar el blob de forma
  // síncrona puede cancelarla en silencio. Se mantiene el ancla en el DOM unos
  // segundos y se revoca recién después.
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 4000);
}
