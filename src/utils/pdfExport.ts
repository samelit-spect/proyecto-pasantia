import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Attendance, News, Incident, DocenteAttendance } from '@/types';
import { novedadTipoLabel, incidentCategoriaLabel, incidentUrgenciaLabel } from '@/utils/constants';

const addHeader = (doc: jsPDF, title: string, filters?: string) => {
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SIPNAM', 14, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Sistema Integrado de Partes de Novedades y Asistencias Movil', 14, 24);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(title, 14, 36);

  if (filters) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(filters, 14, 42);
  }

  return filters ? 48 : 42;
};

const addFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text(
    `SIPNAM - Exportado ${new Date().toLocaleDateString('es-AR')} - Pagina ${pageNum}/${totalPages}`,
    14,
    pageHeight - 10
  );
};

export const exportHistorialPDF = (data: {
  attendances: Attendance[];
  docenteAttendances: DocenteAttendance[];
  news: News[];
  incidents: Incident[];
  dateFrom?: string;
  dateTo?: string;
}) => {
  const doc = new jsPDF();
  const filters = [
    data.dateFrom ? `Desde: ${data.dateFrom}` : '',
    data.dateTo ? `Hasta: ${data.dateTo}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  let y = addHeader(doc, 'Historial de Cargas', filters || undefined);
  y += 4;

  if (data.attendances.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Asistencias (${data.attendances.length})`, 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Fecha', 'Cargado por', 'Presentes', 'Ausentes']],
      body: data.attendances.map((att) => [
        att.fecha.toDate().toLocaleDateString('es-AR'),
        att.cargadoPorNombre,
        String(att.registros.filter((r) => r.presente).length),
        String(att.registros.filter((r) => !r.presente).length),
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (data.docenteAttendances.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Asistencia de Docentes (${data.docenteAttendances.length})`, 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Fecha', 'Cargado por']],
      body: data.docenteAttendances.map((att) => [
        att.fecha.toDate().toLocaleDateString('es-AR'),
        att.cargadoPorNombre,
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (data.news.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Novedades (${data.news.length})`, 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Fecha', 'Tipo', 'Hora', 'Descripcion']],
      body: data.news.map((n) => [
        n.fecha.toDate().toLocaleDateString('es-AR'),
        novedadTipoLabel(n.tipo),
        n.hora || '-',
        n.descripcion.length > 80 ? n.descripcion.slice(0, 80) + '...' : n.descripcion,
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: 14, right: 14 },
      columnStyles: { 3: { cellWidth: 70 } },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (data.incidents.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Incidentes (${data.incidents.length})`, 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [['Fecha', 'Categoria', 'Urgencia', 'Estado', 'Ubicacion', 'Descripcion']],
      body: data.incidents.map((inc) => [
        inc.fecha.toDate().toLocaleDateString('es-AR'),
        incidentCategoriaLabel(inc.categoria),
        inc.urgencia ? incidentUrgenciaLabel(inc.urgencia) : '-',
        inc.estado,
        inc.ubicacion || '-',
        inc.descripcion.length > 60 ? inc.descripcion.slice(0, 60) + '...' : inc.descripcion,
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175] },
      margin: { left: 14, right: 14 },
      columnStyles: { 5: { cellWidth: 55 } },
    });
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  doc.save(`sipnam-historial-${new Date().toISOString().slice(0, 10)}.pdf`);
};
