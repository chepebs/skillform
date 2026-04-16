import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import jsPDF from 'jspdf/dist/jspdf.umd.min.js';
import html2canvas from 'html2canvas/dist/html2canvas.min.js';
import {
  Mail,
  Phone,
  Edit,
  Building,
  MapPin,
  UserPlus,
  FileDown,
  MoreHorizontal,
  Printer,
  Loader2,
  Briefcase,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProfileData } from '@/hooks/useProfileData';
import { getCountryFlag } from '@/utils/countryFlags';
import { MessageButton } from '@/components/messaging/MessageButton';
import { SocialMediaLinks } from '@/components/profile/SocialMediaLinks';
import garnierLogo from '@/assets/logo-garnier-small.png';

interface ProfileHeaderProps {
  profile: ProfileData;
  canEdit: boolean;
  isOrganizerOrAdmin: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  canEdit,
  isOrganizerOrAdmin,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);

  const fullName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.email;

  // Get country code from country name or code field
  const countryCode = profile.country?.code || '';
  const countryFlag = getCountryFlag(countryCode);

  const printProfile = () => {
    window.print();
  };

  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      // Find the profile content element
      const profileElement = document.querySelector('.max-w-5xl') as HTMLElement;

      if (!profileElement) {
        throw new Error('Profile element not found');
      }

      // Temporarily apply PDF-friendly styles
      profileElement.classList.add('pdf-export-mode');

      // Capture the entire profile area
      const canvas = await html2canvas(profileElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: profileElement.scrollWidth,
        windowWidth: 1024,
      });

      profileElement.classList.remove('pdf-export-mode');

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      pdf.setProperties({
        title: `${fullName} - Profile`,
        subject: 'Employee Profile',
        author: 'Grupo Garnier Skill*form',
        creator: 'Grupo Garnier',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const headerHeight = 20;
      const footerHeight = 15;

      // Scale image to fit page width with margins
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      // Load logo as base64 for embedding
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      const logoLoaded = new Promise<string>((resolve) => {
        logoImg.onload = () => {
          const c = document.createElement('canvas');
          c.width = logoImg.naturalWidth;
          c.height = logoImg.naturalHeight;
          const ctx = c.getContext('2d')!;
          ctx.drawImage(logoImg, 0, 0);
          resolve(c.toDataURL('image/png'));
        };
        logoImg.onerror = () => resolve('');
        logoImg.src = garnierLogo;
      });

      const logoBase64 = await logoLoaded;

      // --- First page ---
      // Logo top-right
      if (logoBase64) {
        const logoW = 30;
        const logoH = (logoImg.naturalHeight / logoImg.naturalWidth) * logoW;
        pdf.addImage(logoBase64, 'PNG', pageWidth - margin - logoW, margin, logoW, logoH);
      }

      // Title top-left
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(fullName, margin, margin + 8);
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`SKILL*FORM  •  ${new Date().toLocaleDateString()}`, margin, margin + 14);

      // Content start after header
      const firstPageContentStart = margin + headerHeight;
      const usableFirstPage = pageHeight - firstPageContentStart - 5;
      
      // Draw content across pages
      let remainingHeight = imgHeight;
      let sourceY = 0;

      // First page content
      const firstChunk = Math.min(usableFirstPage, remainingHeight);
      if (firstChunk > 0) {
        // We add the full image but clip it via positioning
        pdf.addImage(imgData, 'PNG', margin, firstPageContentStart, contentWidth, imgHeight, undefined, 'FAST', 0);
        // The image will overflow, but jsPDF clips to page naturally
      }
      remainingHeight -= usableFirstPage;

      // Additional pages
      let pageNum = 1;
      while (remainingHeight > 0) {
        pdf.addPage();
        pageNum++;
        const yOffset = -(imgHeight - remainingHeight) + 5; // 5mm top margin on subsequent pages
        pdf.addImage(imgData, 'PNG', margin, yOffset, contentWidth, imgHeight, undefined, 'FAST', 0);
        remainingHeight -= (pageHeight - 10);
      }

      // Add footer with logo on the last page
      const totalPages = pdf.getNumberOfPages();
      if (logoBase64) {
        pdf.setPage(totalPages);
        const footerLogoW = 20;
        const footerLogoH = (logoImg.naturalHeight / logoImg.naturalWidth) * footerLogoW;
        const footerX = (pageWidth - footerLogoW) / 2;
        const footerY = pageHeight - margin - footerLogoH;
        pdf.addImage(logoBase64, 'PNG', footerX, footerY, footerLogoW, footerLogoH);
      }

      // Add page numbers
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 180);
        pdf.text(`${i} / ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
      }

      // Download
      const safeName = fullName.replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      pdf.save(`${safeName}_Profile_${dateStr}.pdf`);

      toast.success(t('profile.pdfExported', 'Profile exported to PDF'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('profile.pdfExportFailed', 'Failed to export PDF'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="profile-header" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-secondary/30 no-print">
      {/* Background pattern */}
      <div className="absolute inset-0 pattern-bg opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 p-8">
        {/* Action buttons (top right) */}
        <div className="absolute top-4 right-4 flex items-center gap-2 no-print">
          {canEdit && (
            <Button
              onClick={() => navigate(`/profile/${profile.user_id}/edit`)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              size="sm"
            >
              <Edit className="mr-2 h-4 w-4" />
              {t('common.buttons.edit')}
            </Button>
          )}
          {isOrganizerOrAdmin && (
            <Button variant="outline" size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              {t('profile.addToGroup', 'Add to Group')}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={printProfile}>
                <Printer className="mr-2 h-4 w-4" />
                {t('common.buttons.print')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF} disabled={isExporting}>
                <FileDown className="mr-2 h-4 w-4" />
                {isExporting ? t('profile.exporting', 'Exporting...') : t('profile.exportPDF', 'Export as PDF')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Profile photo and info */}
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-6">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-primary/60 p-1">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-bold text-primary">
                    {profile.first_name?.[0] || profile.email[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            {/* Country flag below avatar */}
            {countryFlag && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card rounded-full px-3 py-1 shadow-md border border-border flex items-center gap-1">
                <span className="text-xl">{countryFlag}</span>
              </div>
            )}
            
            {canEdit && (
              <button
                onClick={() => navigate(`/profile/${profile.user_id}/edit`)}
                className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors no-print"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Name and position */}
          <h1 className="text-3xl font-bold text-foreground mb-2">{fullName}</h1>
          <p className="text-xl text-muted-foreground mb-4">
            {profile.current_position || profile.position || t('profile.noPositionSet', 'No position set')}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {profile.agency && (
              <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                <Building className="mr-1 h-3 w-3" />
                {profile.agency.name}
              </Badge>
            )}
            {profile.department && (
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                {profile.department}
              </Badge>
            )}
            {profile.country && (
              <Badge variant="outline" className="border-muted-foreground/50">
                <MapPin className="mr-1 h-3 w-3" />
                {countryFlag && <span className="mr-1">{countryFlag}</span>}
                {profile.country.name}
              </Badge>
            )}
            {profile.seniority_level && (
              <Badge variant="outline" className="border-amber-500/50 text-amber-500">
                <Briefcase className="mr-1 h-3 w-3" />
                {t(`profile.seniority.${profile.seniority_level === 'c-level' ? 'cLevel' : profile.seniority_level}`,
                  profile.seniority_level === 'mid' ? 'Mid-Level'
                  : profile.seniority_level === 'vp' ? 'Vice President / VP'
                  : profile.seniority_level === 'c-level' ? 'C-Level Executive'
                  : profile.seniority_level.charAt(0).toUpperCase() + profile.seniority_level.slice(1))}
              </Badge>
            )}
          </div>

          {/* Social Media Links */}
          <SocialMediaLinks
            linkedinUrl={(profile as any).linkedin_url}
            instagramUrl={(profile as any).instagram_url}
            behanceUrl={(profile as any).behance_url}
            className="mb-4"
            size="md"
          />

          {/* Contact buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              asChild
            >
              <a href={`mailto:${profile.email}`}>
                <Mail className="mr-2 h-4 w-4" />
                {t('common.actions.sendEmail', 'Email')}
              </a>
            </Button>
            {profile.phone && (
              <Button
                variant="outline"
                asChild
              >
                <a href={`tel:${profile.phone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  {t('common.actions.makeCall', 'Call')}
                </a>
              </Button>
            )}
            <MessageButton
              recipientId={profile.user_id}
              recipientName={fullName}
              variant="outline"
            />
          </div>
        </div>
      </div>
    </div>
  );
};