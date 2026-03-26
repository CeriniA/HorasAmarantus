/**
 * Exportación a PDF Profesional
 * Genera PDF con diseño corporativo
 * 
 * Instalación requerida:
 * npm install jspdf jspdf-autotable
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Exporta reporte a PDF con diseño profesional
 */
export const exportToPDF = (data, filename = 'reporte_horas') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Colores corporativos
  const primaryColor = [16, 185, 129]; // Verde
  const secondaryColor = [59, 130, 246]; // Azul
  const textColor = [31, 41, 55]; // Gris oscuro

  // === PÁGINA 1: PORTADA Y RESUMEN ===
  
  // Header con color
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Horas Trabajadas', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${data.startDate} - ${data.endDate}`, pageWidth / 2, 30, { align: 'center' });

  // Información de generación
  doc.setTextColor(...textColor);
  doc.setFontSize(9);
  doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 50);

  // Resumen en cards
  const cardY = 60;
  const cardWidth = (pageWidth - 42) / 3;
  const cardHeight = 30;
  
  // Card 1: Total Horas
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Total de Horas', 14 + cardWidth / 2, cardY + 10, { align: 'center' });
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.totalHours.toFixed(1)}h`, 14 + cardWidth / 2, cardY + 22, { align: 'center' });

  // Card 2: Registros
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(14 + cardWidth + 7, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Total Registros', 14 + cardWidth + 7 + cardWidth / 2, cardY + 10, { align: 'center' });
  doc.setFontSize(20);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.totalEntries}`, 14 + cardWidth + 7 + cardWidth / 2, cardY + 22, { align: 'center' });

  // Card 3: Promedio
  doc.setFillColor(250, 245, 255);
  doc.roundedRect(14 + (cardWidth + 7) * 2, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Promedio/Día', 14 + (cardWidth + 7) * 2 + cardWidth / 2, cardY + 10, { align: 'center' });
  doc.setFontSize(20);
  doc.setTextColor(139, 92, 246);
  doc.setFont('helvetica', 'bold');
  doc.text(`${(data.avgPerDay || 0).toFixed(1)}h`, 14 + (cardWidth + 7) * 2 + cardWidth / 2, cardY + 22, { align: 'center' });

  // Tabla de Top Empleados
  if (data.byUser && data.byUser.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...textColor);
    doc.text('Top Empleados', 14, 105);

    const topUsers = data.byUser.slice(0, 10);
    doc.autoTable({
      startY: 110,
      head: [['#', 'Empleado', 'Horas', 'Registros', '% del Total']],
      body: topUsers.map((u, index) => [
        index + 1,
        u.name || u.user_name,
        `${u.hours.toFixed(1)}h`,
        u.entries,
        `${((u.hours / data.totalHours) * 100).toFixed(1)}%`
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { left: 14, right: 14 }
    });
  }

  // === PÁGINA 2: DISTRIBUCIÓN POR UNIDAD ===
  if (data.byUnit && data.byUnit.length > 0) {
    doc.addPage();
    
    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Distribución por Unidad Organizacional', pageWidth / 2, 13, { align: 'center' });

    doc.autoTable({
      startY: 30,
      head: [['Unidad', 'Horas', 'Registros', '% del Total']],
      body: data.byUnit.map(u => [
        u.name,
        `${u.hours.toFixed(1)}h`,
        u.entries,
        `${((u.hours / data.totalHours) * 100).toFixed(1)}%`
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { left: 14, right: 14 }
    });
  }

  // === PÁGINA 3: DETALLE POR DÍA ===
  if (data.byDay && data.byDay.length > 0) {
    doc.addPage();
    
    // Header
    doc.setFillColor(...secondaryColor);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Distribución por Día', pageWidth / 2, 13, { align: 'center' });

    doc.autoTable({
      startY: 30,
      head: [['Fecha', 'Día', 'Horas', 'Registros']],
      body: data.byDay.map(d => [
        format(new Date(d.date), 'dd/MM/yyyy'),
        format(new Date(d.date), 'EEEE', { locale: es }),
        `${d.hours.toFixed(1)}h`,
        d.entries || 0
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: secondaryColor,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      margin: { left: 14, right: 14 }
    });
  }

  // Footer en todas las páginas
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Guardar PDF
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  doc.save(`${filename}_${timestamp}.pdf`);
};

/**
 * Exporta solo tabla de registros (versión simple)
 */
export const exportToPDFSimple = (entries, filename = 'registros') => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('Registros de Horas', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 28);

  const tableData = entries.map(e => {
    const start = new Date(e.start_time);
    const end = new Date(e.end_time);
    const hours = (end - start) / (1000 * 60 * 60);
    
    return [
      format(start, 'dd/MM/yyyy'),
      e.user_name || 'N/A',
      e.unit_name || e.organizational_units?.name || 'N/A',
      format(start, 'HH:mm'),
      format(end, 'HH:mm'),
      `${hours.toFixed(2)}h`
    ];
  });

  doc.autoTable({
    startY: 35,
    head: [['Fecha', 'Empleado', 'Unidad', 'Inicio', 'Fin', 'Horas']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] }
  });

  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  doc.save(`${filename}_${timestamp}.pdf`);
};

export default exportToPDF;
