import React, { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Phone, Upload, X, Loader2 } from 'lucide-react';
import { BasicInfoData } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ImageCropper from '../ImageCropper';
import { cn } from '@/lib/utils';

interface BasicInfoStepProps {
  form: UseFormReturn<BasicInfoData>;
  userId: string;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ form, userId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(form.getValues('avatar_url') || null);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Only JPG and PNG files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropperImage(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true);
    try {
      const fileName = `${userId}/avatar.jpg`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, croppedBlob, {
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      setPreviewUrl(publicUrl);
      form.setValue('avatar_url', publicUrl);
      toast.success('Photo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    form.setValue('avatar_url', '');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      // Create synthetic event
      const event = {
        target: { files: dataTransfer.files }
      } as React.ChangeEvent<HTMLInputElement>;
      
      handleFileSelect(event);
    }
  }, [handleFileSelect]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
        <p className="text-muted-foreground">Let's start with your basic details</p>
      </div>

      {/* Photo Upload */}
      <div className="flex flex-col items-center mb-8">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            'relative w-32 h-32 rounded-full border-2 border-dashed transition-all cursor-pointer group',
            'border-muted hover:border-primary',
            previewUrl && 'border-solid border-primary'
          )}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground text-center px-2">
                    Drag or click
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Max 5MB, JPG or PNG</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <Label>First Name <span className="text-destructive">*</span></Label>
              <FormControl>
                <Input
                  {...field}
                  placeholder="John"
                  className="bg-dark-elevated border-dark-border focus:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <Label>Last Name <span className="text-destructive">*</span></Label>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Doe"
                  className="bg-dark-elevated border-dark-border focus:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <Label>Email</Label>
            <FormControl>
              <Input
                {...field}
                readOnly
                disabled
                className="bg-dark-elevated border-dark-border opacity-50"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <Label>Phone <span className="text-destructive">*</span></Label>
            <FormControl>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...field}
                  placeholder="+1234567890"
                  className="pl-10 bg-dark-elevated border-dark-border focus:border-primary"
                />
              </div>
            </FormControl>
            <p className="text-xs text-muted-foreground">International format (e.g., +1234567890)</p>
            <FormMessage />
          </FormItem>
        )}
      />

      <ImageCropper
        image={cropperImage || ''}
        open={showCropper}
        onClose={() => setShowCropper(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default BasicInfoStep;
