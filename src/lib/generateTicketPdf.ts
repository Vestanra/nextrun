import { jsPDF } from 'jspdf';
import type { Event, Participant, Distance } from '@/types/event';
import { fmtDate } from '@/lib/formatDate';
import { COUNTRY } from '@/lib/country';

async function imgToBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext('2d')!.drawImage(img, 0, 0);
        resolve(c.toDataURL('image/jpeg', 0.82));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generateTicketPdf(
  event: Event,
  participant: Participant,
  distance: Distance
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, m = 16, cW = W - m * 2;
  const dark: [number, number, number]  = [21, 20, 15];
  const muted: [number, number, number] = [138, 134, 120];
  const yellow: [number, number, number] = [197, 168, 0];
  let y = 18;

  /* Header */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...dark);
  doc.text('NEXTRUN.', m, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...muted);
  doc.text('Ticket', W - m, y, { align: 'right' });
  y += 5;

  /* Yellow rule */
  doc.setDrawColor(...yellow);
  doc.setLineWidth(0.8);
  doc.line(m, y, W - m, y);
  y += 8;

  /* Banner photo — right column */
  const photoW = cW * 0.38;
  const photoH = photoW * (10 / 16);
  const photoX = m + cW - photoW;
  const photoY = y;
  const b64 = await imgToBase64(event.bannerImage);
  if (b64) {
    doc.addImage(b64, 'JPEG', photoX, photoY, photoW, photoH, '', 'FAST');
  } else {
    doc.setFillColor(220, 215, 205);
    doc.rect(photoX, photoY, photoW, photoH, 'F');
  }

  /* Event title */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...dark);
  const titleLines = doc.splitTextToSize(event.name, cW * 0.58) as string[];
  doc.text(titleLines, m, y);
  y += titleLines.length * 8 + 3;

  /* Meta */
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...muted);
  doc.text(event.venue + ', ' + (COUNTRY[event.country] ?? event.country), m, y);
  y += 5.5;
  doc.text(fmtDate(event.date).full, m, y);
  y += 5.5;
  doc.text(distance.label, m, y);
  y = Math.max(y + 10, photoY + photoH + 8);

  /* Participant name */
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...muted);
  doc.text('NAME OF PARTICIPANT', m, y);
  y += 5;
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text(participant.firstName + ' ' + participant.lastName, m, y);
  y += 12;

  /* KV grid */
  const kvs: [string, string][] = [
    ['PARTICIPANT ID', 'DFR-' + participant.id.slice(0, 12).toUpperCase()],
    ['PHONE', participant.phone],
    ['EMAIL', participant.email],
    ['ADDRESS', participant.address],
  ];
  const colW = cW / 3;
  kvs.forEach(([lbl, val], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const kx = m + col * colW;
    const ky = y + row * 16;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...muted);
    doc.text(lbl, kx, ky);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...dark);
    doc.text(doc.splitTextToSize(val, colW - 4) as string[], kx, ky + 4.5);
  });
  y += Math.ceil(kvs.length / 3) * 16 + 8;

  /* Payment row */
  doc.setDrawColor(...dark);
  doc.setLineWidth(0.5);
  doc.line(m, y, W - m, y);
  y += 6;
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text(distance.label + '  —  ' + event.name, m, y);
  doc.text(distance.price.toFixed(2) + ' USD', W - m, y, { align: 'right' });
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(...yellow);
  doc.text('Successfully Registered', m, y);
  y += 14;

  /* Dashed stub separator */
  doc.setDrawColor(200, 193, 180);
  doc.setLineWidth(0.3);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).setLineDash([3, 2], 0);
  doc.line(m, y, W - m, y);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).setLineDash([], 0);
  y += 8;

  /* Stub row */
  const stubItems: [string, string][] = [
    ['Name of Participant', participant.firstName + ' ' + participant.lastName],
    ['Phone', participant.phone],
    ['Participant ID', 'DFR-' + participant.id.slice(0, 12).toUpperCase()],
  ];
  stubItems.forEach(([lbl, val], i) => {
    const sx = m + i * colW;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...muted);
    doc.text(lbl, sx, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...dark);
    doc.text(val, sx, y + 5);
  });
  y += 20;

  /* Event footer */
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...muted);
  doc.text('Event', m, y);
  y += 5;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text(event.name, m, y);
  y += 6;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...muted);
  doc.text(
    [
      event.city + ', ' + (COUNTRY[event.country] ?? event.country),
      fmtDate(event.date).full,
      distance.label,
    ].join('   |   '),
    m,
    y
  );

  /* Save */
  const slug = event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  doc.save('ticket-' + slug + '-' + participant.id.slice(0, 8) + '.pdf');
}
