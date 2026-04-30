import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  UsersThree as DeptIcon,
  Plus,
  PencilSimpleLine as Edit2,
  Trash as Trash2,
  CircleNotch as Loader2,
  FloppyDisk as Save,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  sort_order: number | null;
  created_at: string | null;
}

// Standard list of advertising / marketing agency departments suggested when adding new ones.
const STANDARD_DEPARTMENTS: { name: string; description: string }[] = [
  { name: 'Account Management', description: 'Client relationships and account servicing' },
  { name: 'Strategy & Planning', description: 'Brand strategy, planning and insights' },
  { name: 'Creative', description: 'Art direction, copywriting and design' },
  { name: 'Production', description: 'Content production, video and post-production' },
  { name: 'Media', description: 'Media planning, buying and analytics' },
  { name: 'Digital & Performance', description: 'Digital marketing, paid media and performance' },
  { name: 'Social Media', description: 'Social content, community management and influencers' },
  { name: 'Public Relations', description: 'PR, communications and reputation' },
  { name: 'Data & Analytics', description: 'Analytics, measurement and data science' },
  { name: 'Technology', description: 'Web, development and martech' },
  { name: 'Operations', description: 'Project management, traffic and operations' },
  { name: 'Finance', description: 'Finance, billing and procurement' },
  { name: 'People & Culture', description: 'HR, talent and culture' },
  { name: 'Business Development', description: 'New business, pitches and growth' },
];

export const DepartmentManagement: React.FC = () => {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState<Department | null>(null);
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      setDepartments((data as Department[]) || []);
    } catch (e) {
      console.error('Error loading departments:', e);
      toast.error(t('common.messages.error'));
    } finally {
      setLoading(false);
    }
  };

  const existingNames = new Set(departments.map((d) => d.name.toLowerCase()));
  const availablePresets = STANDARD_DEPARTMENTS.filter(
    (d) => !existingNames.has(d.name.toLowerCase()),
  );

  const openAddModal = () => {
    setEditing(null);
    setFormData({ name: '', description: '' });
    setMode(availablePresets.length > 0 ? 'preset' : 'custom');
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditing(dept);
    setFormData({ name: dept.name, description: dept.description || '' });
    setMode('custom');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const name = formData.name.trim();
    if (!name) {
      toast.error(t('admin.departments.nameRequired'));
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from('departments')
          .update({ name, description: formData.description.trim() || null })
          .eq('id', editing.id);
        if (error) throw error;
        toast.success(t('admin.departments.updated'));
      } else {
        const { error } = await supabase
          .from('departments')
          .insert({ name, description: formData.description.trim() || null });
        if (error) throw error;
        toast.success(t('admin.departments.created'));
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Save error:', error);
      if (error.code === '23505') {
        toast.error(t('admin.departments.duplicateName'));
      } else {
        toast.error(t('admin.departments.saveFailed'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddPreset = async (preset: { name: string; description: string }) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('departments')
        .insert({ name: preset.name, description: preset.description });
      if (error) throw error;
      toast.success(t('admin.departments.created'));
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Preset add error:', error);
      if (error.code === '23505') {
        toast.error(t('admin.departments.duplicateName'));
      } else {
        toast.error(t('admin.departments.saveFailed'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const { error } = await supabase.from('departments').delete().eq('id', deleting.id);
      if (error) throw error;
      toast.success(t('admin.departments.deleted'));
      setDeleteDialogOpen(false);
      setDeleting(null);
      loadData();
    } catch (e) {
      console.error('Delete error:', e);
      toast.error(t('admin.departments.deleteFailed'));
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <DeptIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {t('admin.departments.title')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('admin.departments.subtitle')}</p>
          </div>
        </div>
        <Button onClick={openAddModal} className="bg-primary hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.departments.addNew')}
        </Button>
      </div>

      <div className="space-y-2">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-200 group"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">{dept.name}</h3>
              {dept.description && (
                <p className="text-sm text-muted-foreground truncate">{dept.description}</p>
              )}
            </div>
            <Badge
              variant="outline"
              className={
                dept.is_active
                  ? 'bg-green-500/10 text-green-500 border-green-500/30'
                  : 'bg-muted text-muted-foreground'
              }
            >
              {dept.is_active ? t('common.active') : t('common.inactive')}
            </Badge>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => openEditModal(dept)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDeleting(dept);
                  setDeleteDialogOpen(true);
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {departments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <DeptIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('admin.departments.noDepartments')}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? t('admin.departments.edit') : t('admin.departments.addNew')}
            </DialogTitle>
          </DialogHeader>

          {!editing && availablePresets.length > 0 && (
            <div className="flex gap-2 border-b border-border pb-3">
              <Button
                type="button"
                variant={mode === 'preset' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('preset')}
              >
                {t('admin.departments.fromList')}
              </Button>
              <Button
                type="button"
                variant={mode === 'custom' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('custom')}
              >
                {t('admin.departments.custom')}
              </Button>
            </div>
          )}

          {!editing && mode === 'preset' && availablePresets.length > 0 ? (
            <div className="py-2 max-h-96 overflow-y-auto space-y-1">
              {availablePresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  disabled={saving}
                  onClick={() => handleAddPreset(preset)}
                  className="w-full text-left p-3 rounded-md border border-border hover:border-primary/40 hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <div className="font-medium text-foreground">{preset.name}</div>
                  <div className="text-sm text-muted-foreground">{preset.description}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="dept-name">{t('admin.departments.name')} *</Label>
                <Input
                  id="dept-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('admin.departments.namePlaceholder')}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept-desc">{t('admin.departments.description')}</Label>
                <Textarea
                  id="dept-desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('admin.departments.descriptionPlaceholder')}
                  className="bg-background"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            {(editing || mode === 'custom') && (
              <Button onClick={handleSave} disabled={saving} className="bg-primary">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('common.save')}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.departments.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.departments.deleteConfirm', { name: deleting?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepartmentManagement;
