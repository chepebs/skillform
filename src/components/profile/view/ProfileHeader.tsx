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
  Share2,
  Printer,
  Loader2,
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

  const shareProfile = async () => {
    try {
      // Generate public profile URL
      const publicUrl = `${window.location.origin}/profile/${profile.user_id}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(publicUrl);
      
      toast.success(t('profile.linkCopied', 'Profile link copied to clipboard'));
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = `${window.location.origin}/profile/${profile.user_id}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast.success(t('profile.linkCopied', 'Profile link copied to clipboard'));
    }
  };

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

      // Add class to optimize for PDF
      profileElement.classList.add('pdf-export-mode');

      // Convert to canvas with higher quality
      const canvas = await html2canvas(profileElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: profileElement.scrollWidth,
        windowHeight: profileElement.scrollHeight,
      });

      // Remove temporary class
      profileElement.classList.remove('pdf-export-mode');

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
        title: `${fullName} - Profile`,
        subject: 'Employee Profile',
        author: 'Grupo Garnier Talent Map',
        keywords: 'profile, employee, garnier',
        creator: 'Grupo Garnier',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add header to first page
      pdf.setFontSize(16);
      pdf.setTextColor(193, 37, 31); // Brand red
      pdf.text(`${fullName} - Profile`, 10, 15);
      
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      const date = new Date().toLocaleDateString();
      pdf.text(`Generated: ${date}`, 10, 22);

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

      // Generate filename
      const safeName = fullName.replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `${safeName}_Profile_${dateStr}.pdf`;

      // Download PDF
      pdf.save(fileName);

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
              <DropdownMenuItem onClick={shareProfile}>
                <Share2 className="mr-2 h-4 w-4" />
                {t('profile.shareLink', 'Share Profile Link')}
              </DropdownMenuItem>
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
          </div>

          {/* Social Media Links */}
          <SocialMediaLinks
            linkedinUrl={(profile as any).linkedin_url}
            instagramUrl={(profile as any).instagram_url}
            behanceUrl={(profile as any).behance_url}
            className="mb-4"
            size="md"
          />

          {/* Contact buttons - simplified without copy buttons */}
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
