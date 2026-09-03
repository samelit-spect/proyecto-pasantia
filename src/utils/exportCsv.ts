const escapeCsv = (value: string | number | undefined): string => {
  const str = value === undefined || value === null ? '' : String(value);
  if (/[",\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Construye el contenido de un CSV de forma asincrónica, cediendo el hilo
 * principal cada cierta cantidad de filas para que la UI no se congele
 * cuando el respaldo tiene muchos registros.
 */
export async function buildCsvString(
  headers: string[],
  rows: (string | number | undefined)[][],
  yieldEvery = 2000
): Promise<string> {
  const parts: string[] = [];
  parts.push(headers.map(escapeCsv).join(','));

  for (let i = 0; i < rows.length; i += 1) {
    parts.push(rows[i].map(escapeCsv).join(','));
    if (i > 0 && i % yieldEvery === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return `\uFEFF${parts.join('\r\n')}`;
}

export async function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | undefined)[][]
): Promise<void> {
  const content = await buildCsvString(headers, rows);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
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
