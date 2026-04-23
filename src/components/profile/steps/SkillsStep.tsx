import React, { useState, useMemo } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, MagnifyingGlass as Search, Star, Check, Sparkle as Sparkles } from '@phosphor-icons/react';
import { SkillsData, Skill, SKILL_CATEGORIES, SKILLS_BY_CATEGORY, CATEGORY_COLORS } from '../types';
import { cn } from '@/lib/utils';

interface SkillsStepProps {
  form: UseFormReturn<SkillsData>;
}

const StarRating: React.FC<{ 
  value: number; 
  onChange: (value: number) => void;
  readonly?: boolean;
}> = ({ value, onChange, readonly = false }) => {
  const { t } = useTranslation();
  const levels = [
    { level: 1, label: t('profile.skills.proficiencyLevels.1') },
    { level: 2, label: t('profile.skills.proficiencyLevels.2') },
    { level: 3, label: t('profile.skills.proficiencyLevels.3') },
    { level: 4, label: t('profile.skills.proficiencyLevels.4') },
    { level: 5, label: t('profile.skills.proficiencyLevels.5') },
  ];

  const currentLabel = levels.find(l => l.level === value)?.label || '';

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onChange(star)}
            disabled={readonly}
            className={cn(
              'transition-all',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            )}
            aria-label={`${star} stars`}
          >
            <Star 
              className={cn(
                'h-5 w-5 transition-colors',
                star <= value 
                  ? 'fill-primary text-primary' 
                  : 'fill-transparent text-muted-foreground'
              )} 
            />
          </button>
        ))}
      </div>
      {currentLabel && (
        <span className="text-xs text-muted-foreground">{currentLabel}</span>
      )}
    </div>
  );
};

const SkillsStep: React.FC<SkillsStepProps> = ({ form }) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('Strategy & Planning');
  const [searchQuery, setSearchQuery] = useState('');
  const [customSkillOpen, setCustomSkillOpen] = useState(false);
  const [customSkillName, setCustomSkillName] = useState('');
  const [customSkillCategory, setCustomSkillCategory] = useState('');

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'skills',
  });

  const selectedSkillNames = useMemo(() => 
    fields.map(f => f.skill_name.toLowerCase()), 
    [fields]
  );

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) {
      return SKILLS_BY_CATEGORY[activeCategory] || [];
    }
    
    const query = searchQuery.toLowerCase();
    const results: { skill: string; category: string }[] = [];
    
    Object.entries(SKILLS_BY_CATEGORY).forEach(([category, skills]) => {
      skills.forEach(skill => {
        if (skill.toLowerCase().includes(query)) {
          results.push({ skill, category });
        }
      });
    });
    
    return results;
  }, [searchQuery, activeCategory]);

  const addSkill = (skillName: string, category: string) => {
    if (selectedSkillNames.includes(skillName.toLowerCase())) return;
    if (fields.length >= 20) return;
    
    append({
      skill_name: skillName,
      skill_category: category,
      proficiency_level: 0,
      years_experience: undefined,
    });
  };

  const removeSkill = (index: number) => {
    remove(index);
  };

  const updateProficiency = (index: number, level: number) => {
    update(index, { ...fields[index], proficiency_level: level });
  };

  const updateYears = (index: number, years: number | undefined) => {
    update(index, { ...fields[index], years_experience: years });
  };

  const handleAddCustomSkill = () => {
    if (customSkillName.trim() && customSkillCategory) {
      addSkill(customSkillName.trim(), customSkillCategory);
      setCustomSkillName('');
      setCustomSkillCategory('');
      setCustomSkillOpen(false);
    }
  };

  const isSkillSelected = (skillName: string) => 
    selectedSkillNames.includes(skillName.toLowerCase());

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Strategy & Planning': '📊',
      'Creative & Design': '🎨',
      'Advertising & Media': '📺',
      'Digital Marketing': '💻',
      'Production': '🎬',
      'Technology & Development': '🔧',
      'Data & Analytics': '📈',
      'AI & Emerging Tech': '🤖',
      'Storytelling & Content': '📝',
      'Client & Project Management': '👥',
    };
    return icons[category] || '📌';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">{t('profile.skills.title')}</h2>
        <p className="text-muted-foreground">{t('profile.skills.subtitle')}</p>
        <p className="text-xs text-muted-foreground mt-1">{t('profile.skills.helper')}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('profile.skills.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary border-border"
        />
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
            {SKILL_CATEGORIES.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className={cn(
                  'text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
                  'rounded-full border border-border'
                )}
              >
                <span className="mr-1">{getCategoryIcon(category)}</span>
                <span className="hidden sm:inline">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {SKILL_CATEGORIES.map((category) => (
            <TabsContent key={category} value={category} className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {SKILLS_BY_CATEGORY[category]?.map((skill) => {
                  const selected = isSkillSelected(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => !selected && addSkill(skill, category)}
                      disabled={selected || fields.length >= 20}
                      className={cn(
                        'p-3 rounded-lg border text-left text-sm transition-all',
                        selected 
                          ? 'bg-primary/10 border-primary text-primary cursor-default' 
                          : 'bg-card border-border hover:border-primary hover:shadow-md cursor-pointer',
                        fields.length >= 20 && !selected && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{skill}</span>
                        {selected ? (
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        ) : (
                          <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Search Results */}
      {searchQuery && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {(filteredSkills as { skill: string; category: string }[]).map((item) => {
            const selected = isSkillSelected(item.skill);
            return (
              <button
                key={`${item.category}-${item.skill}`}
                type="button"
                onClick={() => !selected && addSkill(item.skill, item.category)}
                disabled={selected || fields.length >= 20}
                className={cn(
                  'p-3 rounded-lg border text-left text-sm transition-all',
                  selected 
                    ? 'bg-primary/10 border-primary text-primary cursor-default' 
                    : 'bg-card border-border hover:border-primary hover:shadow-md cursor-pointer'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="truncate">{item.skill}</span>
                  {selected ? (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                <span 
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: `${CATEGORY_COLORS[item.category]}20`,
                    color: CATEGORY_COLORS[item.category]
                  }}
                >
                  {item.category}
                </span>
              </button>
            );
          })}
          {filteredSkills.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-4">
              {t('common.messages.noResults')}
            </p>
          )}
        </div>
      )}

      {/* Add Custom Skill */}
      <Dialog open={customSkillOpen} onOpenChange={setCustomSkillOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" />
            {t('profile.skills.addCustomSkill')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('profile.skills.addCustomSkill')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t('profile.skills.customSkillName')}</Label>
              <Input
                value={customSkillName}
                onChange={(e) => setCustomSkillName(e.target.value)}
                placeholder={t('profile.skills.customSkillNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('profile.skills.customSkillCategory')}</Label>
              <Select value={customSkillCategory} onValueChange={setCustomSkillCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('profile.skills.customSkillCategoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoryIcon(cat)} {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleAddCustomSkill} 
              className="w-full bg-gradient-primary"
              disabled={!customSkillName.trim() || !customSkillCategory}
            >
              {t('profile.skills.addSkill')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Selected Skills Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <Label className="text-lg font-semibold">{t('profile.skills.selectedSkills')}</Label>
          </div>
          <span className={cn(
            'text-sm font-medium',
            fields.length < 3 ? 'text-destructive' : fields.length >= 3 ? 'text-green-500' : 'text-muted-foreground'
          )}>
            {fields.length} / 20 {t('profile.skills.skillsAdded', { defaultValue: 'skills added' })}
          </span>
        </div>

        {/* Validation Messages */}
        {form.formState.errors.skills?.root && (
          <p className="text-sm text-destructive">{form.formState.errors.skills.root.message}</p>
        )}
        {form.formState.errors.skills?.message && (
          <p className="text-sm text-destructive">{form.formState.errors.skills.message}</p>
        )}
        
        {/* Helpful validation hints */}
        {fields.length > 0 && fields.length < 3 && (
          <div className="flex items-center gap-2 text-sm text-amber-500 bg-amber-500/10 p-3 rounded-lg">
            <span>⚠️</span>
            <span>{t('profile.skills.minSkillsRequired')}</span>
          </div>
        )}

        {fields.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-lg">
            <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">{t('profile.skills.noSkillsSelected')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={cn(
                  'p-4 rounded-lg border bg-card animate-fade-in',
                  !field.proficiency_level && 'border-destructive/50'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{field.skill_name}</h4>
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
                      style={{ 
                        backgroundColor: `${CATEGORY_COLORS[field.skill_category]}20`,
                        color: CATEGORY_COLORS[field.skill_category]
                      }}
                    >
                      {field.skill_category}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {t('profile.skills.proficiencyLevel')} <span className="text-destructive">*</span>
                    </Label>
                    <StarRating
                      value={field.proficiency_level}
                      onChange={(level) => updateProficiency(index, level)}
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {t('profile.skills.yearsExperience')} <span className="text-muted-foreground">({t('profile.skills.yearsExperienceOptional')})</span>
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      value={field.years_experience ?? ''}
                      onChange={(e) => updateYears(index, e.target.value ? parseInt(e.target.value) : undefined)}
                      className="mt-1 h-8"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {fields.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fields.forEach((_, i) => remove(i))}
            className="text-muted-foreground hover:text-destructive"
          >
            {t('profile.skills.clearAllSkills')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SkillsStep;
