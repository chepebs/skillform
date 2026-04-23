import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import jsPDF from 'jspdf/dist/jspdf.umd.min.js';
import html2canvas from 'html2canvas/dist/html2canvas.min.js';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DownloadSimple as Download, FileText, CircleNotch as Loader2, FileXls as FileSpreadsheet } from '@phosphor-icons/react';
import { toast } from 'sonner';
import garnierLogo from '@/assets/logo-garnier-small.png';

interface ExportPDFButtonProps {
  targetId: string;
  filename?: string;
}

export const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({
  targetId,
  filename = 'Grupo-Garnier-Analytics',
}) => {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);

  const loadLogo = (): Promise<{ base64: string; w: number; h: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve({ base64: c.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight });
      };
      img.onerror = () => resolve({ base64: '', w: 0, h: 0 });
      img.src = garnierLogo;
    });
  };

  const exportToPDF = async () => {
    setExporting(true);

    try {
      const dashboardElement = document.getElementById(targetId);

      if (!dashboardElement) {
        throw new Error('Dashboard element not found');
      }

      dashboardElement.classList.add('pdf-export-mode');

      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
      });

      dashboardElement.classList.remove('pdf-export-mode');

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      pdf.setProperties({
        title: 'Grupo Garnier Analytics Dashboard',
        subject: 'Analytics Report',
        author: 'Grupo Garnier Skill*form',
        creator: 'Grupo Garnier',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const headerHeight = 20;

      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      // Load logo
      const logo = await loadLogo();

      // --- First page header ---
      if (logo.base64) {
        const logoW = 30;
        const logoH = (logo.h / logo.w) * logoW;
        pdf.addImage(logo.base64, 'PNG', pageWidth - margin - logoW, margin, logoW, logoH);
      }

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Analytics Dashboard', margin, margin + 8);
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      const date = new Date().toLocaleDateString();
      pdf.text(`SKILL*FORM  •  ${t('admin.master.export.generatedOn')}: ${date}`, margin, margin + 14);

      // Content
      const firstPageStart = margin + headerHeight;
      pdf.addImage(imgData, 'PNG', margin, firstPageStart, contentWidth, imgHeight, undefined, 'FAST', 0);

      let remainingHeight = imgHeight - (pageHeight - firstPageStart);

      while (remainingHeight > 0) {
        pdf.addPage();
        const yOffset = -(imgHeight - remainingHeight) + 5;
        pdf.addImage(imgData, 'PNG', margin, yOffset, contentWidth, imgHeight, undefined, 'FAST', 0);
        remainingHeight -= (pageHeight - 10);
      }

      // Footer logo on last page
      const totalPages = pdf.getNumberOfPages();
      if (logo.base64) {
        pdf.setPage(totalPages);
        const footerLogoW = 20;
        const footerLogoH = (logo.h / logo.w) * footerLogoW;
        pdf.addImage(logo.base64, 'PNG', (pageWidth - footerLogoW) / 2, pageHeight - margin - footerLogoH, footerLogoW, footerLogoH);
      }

      // Page numbers
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 180);
        pdf.text(`${i} / ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
      }

      const dateStr = new Date().toISOString().split('T')[0];
      pdf.save(`${filename}-${dateStr}.pdf`);

      toast.success(t('admin.master.export.pdfSuccess'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('admin.master.export.pdfError'));
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    const statsData: Record<string, string | number>[] = [];
    
    const statCards = document.querySelectorAll('[data-stat-card]');
    statCards.forEach((card) => {
      const title = card.querySelector('[data-stat-title]')?.textContent || '';
      const value = card.querySelector('[data-stat-value]')?.textContent || '';
      if (title && value) {
        statsData.push({ metric: title, value });
      }
    });

    if (statsData.length === 0) {
      toast.error(t('admin.master.export.noData'));
      return;
    }

    const headers = Object.keys(statsData[0]).join(',');
    const rows = statsData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${dateStr}.csv`;
    link.click();

    toast.success(t('admin.master.export.csvSuccess'));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting}>
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('admin.master.export.exporting')}
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              {t('common.buttons.export')}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF} disabled={exporting}>
          <FileText className="h-4 w-4 mr-2" />
          {t('admin.master.export.exportPDF')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV} disabled={exporting}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {t('admin.master.export.exportCSV')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};