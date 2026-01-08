import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, AlertTriangle } from 'lucide-react';
import type { ProfileData } from '@/hooks/useProfileData';

interface AdditionalInfoTabProps {
  profile: ProfileData;
  isMasterAdmin: boolean;
}

export const AdditionalInfoTab: React.FC<AdditionalInfoTabProps> = ({
  profile,
  isMasterAdmin,
}) => {
  return (
    <div className="space-y-6">
      {/* Consulting Work */}
      {profile.consulting_work && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Consulting Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {profile.consulting_work}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Notes - Only visible to master_admin */}
      {isMasterAdmin && (
        <Card className="bg-card/50 backdrop-blur-sm border-amber-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-400" />
                Private Notes
              </CardTitle>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                Admin Only
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200">
                This section is only visible to administrators. Notes added here will not be visible to the profile owner or other users.
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 min-h-[100px]">
              <p className="text-muted-foreground text-sm italic">
                No admin notes have been added for this profile yet.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state if no content */}
      {!profile.consulting_work && !isMasterAdmin && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No additional information available</p>
        </div>
      )}
    </div>
  );
};
