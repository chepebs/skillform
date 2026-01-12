import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Building2,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { getCountryFlag } from '@/utils/countryFlags';

interface Agency {
  id: string;
  name: string;
  country_id: string | null;
  created_at: string | null;
  country?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

interface Country {
  id: string;
  name: string;
  code: string;
}

interface SortableAgencyItemProps {
  agency: Agency;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableAgencyItem: React.FC<SortableAgencyItemProps> = ({ agency, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: agency.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-all duration-200 group list-item"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{agency.name}</h3>
        {agency.country && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span>{getCountryFlag(agency.country.code)}</span>
            <span>{agency.country.name}</span>
          </p>
        )}
      </div>

      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
        {t('common.active')}
      </Badge>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const AgencyManagement: React.FC = () => {
  const { t } = useTranslation();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [deletingAgency, setDeletingAgency] = useState<Agency | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    country_id: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [agenciesRes, countriesRes] = await Promise.all([
        supabase
          .from('agencies')
          .select(`
            *,
            country:countries(id, name, code)
          `)
          .order('name', { ascending: true }),
        supabase
          .from('countries')
          .select('*')
          .order('name', { ascending: true }),
      ]);

      if (agenciesRes.data) setAgencies(agenciesRes.data);
      if (countriesRes.data) setCountries(countriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('common.messages.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = agencies.findIndex((a) => a.id === active.id);
      const newIndex = agencies.findIndex((a) => a.id === over.id);
      const newAgencies = arrayMove(agencies, oldIndex, newIndex);
      setAgencies(newAgencies);
    }
  };

  const openAddModal = () => {
    setEditingAgency(null);
    setFormData({ name: '', country_id: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (agency: Agency) => {
    setEditingAgency(agency);
    setFormData({
      name: agency.name,
      country_id: agency.country_id || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error(t('admin.agencies.nameRequired'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        country_id: formData.country_id || null,
      };

      if (editingAgency) {
        const { error } = await supabase
          .from('agencies')
          .update(payload)
          .eq('id', editingAgency.id);

        if (error) throw error;
        toast.success(t('admin.agencies.updated'));
      } else {
        const { error } = await supabase
          .from('agencies')
          .insert(payload);

        if (error) throw error;
        toast.success(t('admin.agencies.created'));
      }

      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Save error:', error);
      if (error.code === '23505') {
        toast.error(t('admin.agencies.duplicateName'));
      } else {
        toast.error(t('admin.agencies.saveFailed'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAgency) return;

    try {
      const { error } = await supabase
        .from('agencies')
        .delete()
        .eq('id', deletingAgency.id);

      if (error) throw error;
      
      toast.success(t('admin.agencies.deleted'));
      setDeleteDialogOpen(false);
      setDeletingAgency(null);
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('admin.agencies.deleteFailed'));
    }
  };

  const openDeleteDialog = (agency: Agency) => {
    setDeletingAgency(agency);
    setDeleteDialogOpen(true);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{t('admin.agencies.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('admin.agencies.subtitle')}</p>
          </div>
        </div>
        <Button onClick={openAddModal} className="bg-gradient-primary hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.agencies.addNew')}
        </Button>
      </div>

      {/* Agency List */}
      <div className="space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={agencies.map(a => a.id)}
            strategy={verticalListSortingStrategy}
          >
            {agencies.map((agency, index) => (
              <div key={agency.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <SortableAgencyItem
                  agency={agency}
                  onEdit={() => openEditModal(agency)}
                  onDelete={() => openDeleteDialog(agency)}
                />
              </div>
            ))}
          </SortableContext>
        </DndContext>

        {agencies.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('admin.agencies.noAgencies')}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAgency ? t('admin.agencies.edit') : t('admin.agencies.addNew')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agency-name">{t('admin.agencies.name')} *</Label>
              <Input
                id="agency-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('admin.agencies.namePlaceholder')}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agency-country">{t('admin.agencies.country')}</Label>
              <Select
                value={formData.country_id}
                onValueChange={(value) => setFormData({ ...formData, country_id: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      <span className="flex items-center gap-2">
                        <span>{getCountryFlag(country.code)}</span>
                        <span>{country.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary">
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.agencies.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.agencies.deleteConfirm', { name: deletingAgency?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
