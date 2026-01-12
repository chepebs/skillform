import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Loader2, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

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

  const exportToPDF = async () => {
    setExporting(true);

    try {
      const dashboardElement = document.getElementById(targetId);

      if (!dashboardElement) {
        throw new Error('Dashboard element not found');
      }

      // Add a temporary class to optimize for PDF
      dashboardElement.classList.add('pdf-export-mode');

      // Convert to canvas with higher quality
      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: dashboardElement.scrollWidth,
        windowHeight: dashboardElement.scrollHeight,
      });

      // Remove temporary class
      dashboardElement.classList.remove('pdf-export-mode');

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set PDF metadata
      pdf.setProperties({
        title: 'Grupo Garnier Analytics Dashboard',
        subject: 'Analytics Report',
        author: 'Grupo Garnier Talent Map',
        keywords: 'analytics, dashboard, report',
        creator: 'Grupo Garnier',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add header to first page
      pdf.setFontSize(16);
      pdf.setTextColor(102, 51, 153); // Purple color
      pdf.text('Grupo Garnier - Analytics Dashboard', 10, 15);
      
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      const date = new Date().toLocaleDateString();
      pdf.text(`${t('admin.master.export.generatedOn')}: ${date}`, 10, 22);

      // Add first page image (with offset for header)
      const headerOffset = 30;
      pdf.addImage(imgData, 'PNG', 0, headerOffset, imgWidth, imgHeight);
      heightLeft -= (pageHeight - headerOffset);

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename with date
      const dateStr = new Date().toISOString().split('T')[0];
      const fullFilename = `${filename}-${dateStr}.pdf`;

      // Download PDF
      pdf.save(fullFilename);

      toast.success(t('admin.master.export.pdfSuccess'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('admin.master.export.pdfError'));
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    // Get data from stats cards and tables
    const statsData: Record<string, string | number>[] = [];
    
    // Extract visible data from the dashboard
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

    // Convert to CSV
    const headers = Object.keys(statsData[0]).join(',');
    const rows = statsData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    // Download
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
