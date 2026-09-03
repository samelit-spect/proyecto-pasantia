import { zipSync, type Zippable } from 'fflate';

/**
 * Descarga todos los CSV agrupados en un único archivo .zip.
 * Usar un solo archivo evita que el navegador bloquee las descargas
 * múltiples que no ocurren dentro del gesto del usuario.
 */
export function downloadZip(filename: string, files: { name: string; content: string }[]): void {
  const archive: Zippable = {};
  const encoder = new TextEncoder();
  files.forEach((f) => {
    archive[f.name] = encoder.encode(f.content);
  });
  const compressed = zipSync(archive, { level: 6 });
  const blob = new Blob([compressed], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 4000);
}
