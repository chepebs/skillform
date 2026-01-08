import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  Edit,
  Copy,
  Building,
  MapPin,
  UserPlus,
  FileDown,
  MoreHorizontal,
  Share2,
  Printer,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProfileData } from '@/hooks/useProfileData';

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
  const navigate = useNavigate();
  const fullName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.email;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const shareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Profile link copied to clipboard');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-secondary/30">
      {/* Background pattern */}
      <div className="absolute inset-0 pattern-bg opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 p-8">
        {/* Action buttons (top right) */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {canEdit && (
            <Button
              onClick={() => navigate(`/profile/${profile.user_id}/edit`)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              size="sm"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
          {isOrganizerOrAdmin && (
            <Button variant="outline" size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Add to Group
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={shareProfile}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Profile Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileDown className="mr-2 h-4 w-4" />
                Export as PDF
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
            {canEdit && (
              <button
                onClick={() => navigate(`/profile/${profile.user_id}/edit`)}
                className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Name and position */}
          <h1 className="text-3xl font-bold text-foreground mb-2">{fullName}</h1>
          <p className="text-xl text-muted-foreground mb-4">
            {profile.current_position || profile.position || 'No position set'}
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
                {profile.country.name}
              </Badge>
            )}
          </div>

          {/* Contact buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.href = `mailto:${profile.email}`}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            {profile.phone && (
              <Button
                variant="outline"
                onClick={() => window.location.href = `tel:${profile.phone}`}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(profile.email, 'Email')}
            >
              <Copy className="h-4 w-4" />
            </Button>
            {profile.phone && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(profile.phone, 'Phone')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
