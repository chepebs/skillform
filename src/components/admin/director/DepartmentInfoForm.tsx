import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Save, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DepartmentInfo } from '@/hooks/useDirectorData';

const departmentFormSchema = z.object({
  description: z.string().max(1000).optional(),
  unitCostModel: z.enum(['fee-based', 'per-project', 'overhead']).optional(),
  servicesOffered: z.array(z.string()).optional(),
  methodologies: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  hasDataDepartment: z.boolean().optional(),
  dataTeamSize: z.number().min(0).optional(),
  hasExternalPartners: z.boolean().optional(),
});

type DepartmentFormData = z.infer<typeof departmentFormSchema>;

interface DepartmentInfoFormProps {
  department: DepartmentInfo;
  onSave: (data: { id: string; description?: string }) => void;
  isSaving: boolean;
}

const SERVICES_SUGGESTIONS = [
  'Brand Strategy',
  'Market Research',
  'Campaign Planning',
  'Creative Strategy',
  'Media Planning',
  'Digital Strategy',
  'Content Strategy',
  'Analytics & Insights',
];

const METHODOLOGIES_SUGGESTIONS = [
  'Design Thinking',
  'Agile',
  'Lean',
  'Scrum',
  'Six Sigma',
  'Waterfall',
];

const TOOLS_SUGGESTIONS = [
  'Miro',
  'Figma',
  'Adobe Creative Suite',
  'Google Analytics',
  'Tableau',
  'PowerBI',
  'Canva',
  'Monday.com',
  'Asana',
  'Notion',
];

export const DepartmentInfoForm: React.FC<DepartmentInfoFormProps> = ({
  department,
  onSave,
  isSaving,
}) => {
  const [servicesInput, setServicesInput] = useState('');
  const [methodologiesInput, setMethodologiesInput] = useState('');
  const [toolsInput, setToolsInput] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      description: department.description || '',
      unitCostModel: 'fee-based',
      servicesOffered: [],
      methodologies: [],
      tools: [],
      hasDataDepartment: false,
      dataTeamSize: 0,
      hasExternalPartners: false,
    },
  });

  const servicesOffered = watch('servicesOffered') || [];
  const methodologies = watch('methodologies') || [];
  const tools = watch('tools') || [];
  const hasDataDepartment = watch('hasDataDepartment');
  const hasExternalPartners = watch('hasExternalPartners');

  const addService = (service: string) => {
    if (service && !servicesOffered.includes(service)) {
      setValue('servicesOffered', [...servicesOffered, service], { shouldDirty: true });
    }
    setServicesInput('');
  };

  const removeService = (service: string) => {
    setValue(
      'servicesOffered',
      servicesOffered.filter((s) => s !== service),
      { shouldDirty: true }
    );
  };

  const addMethodology = (methodology: string) => {
    if (methodology && !methodologies.includes(methodology)) {
      setValue('methodologies', [...methodologies, methodology], { shouldDirty: true });
    }
    setMethodologiesInput('');
  };

  const removeMethodology = (methodology: string) => {
    setValue(
      'methodologies',
      methodologies.filter((m) => m !== methodology),
      { shouldDirty: true }
    );
  };

  const addTool = (tool: string) => {
    if (tool && !tools.includes(tool)) {
      setValue('tools', [...tools, tool], { shouldDirty: true });
    }
    setToolsInput('');
  };

  const removeTool = (tool: string) => {
    setValue(
      'tools',
      tools.filter((t) => t !== tool),
      { shouldDirty: true }
    );
  };

  const onSubmit = (data: DepartmentFormData) => {
    onSave({
      id: department.id,
      description: data.description,
    });
  };

  // Calculate completion
  const completedSections = [
    !!watch('description'),
    servicesOffered.length > 0,
    methodologies.length > 0 || tools.length > 0,
  ].filter(Boolean).length;
  const totalSections = 3;
  const completionPercentage = Math.round((completedSections / totalSections) * 100);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Completion indicator */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Department Info Completion
          </span>
          <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={['description', 'services']} className="space-y-4">
        {/* Description Section */}
        <AccordionItem value="description" className="glass-card rounded-xl border-0">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-2">
              {watch('description') && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              <span>Department Description</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your department's focus, capabilities, and goals..."
                rows={4}
                {...register('description')}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {(watch('description') || '').length}/1000 characters
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Services Section */}
        <AccordionItem value="services" className="glass-card rounded-xl border-0">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-2">
              {servicesOffered.length > 0 && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              <span>Services & Pricing</span>
              {servicesOffered.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {servicesOffered.length}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 space-y-4">
            {/* Unit Cost Model */}
            <div className="space-y-2">
              <Label>Unit Cost Model</Label>
              <Select
                value={watch('unitCostModel')}
                onValueChange={(value) =>
                  setValue('unitCostModel', value as 'fee-based' | 'per-project' | 'overhead', {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cost model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fee-based">Fee-based (Retainer)</SelectItem>
                  <SelectItem value="per-project">Per Project</SelectItem>
                  <SelectItem value="overhead">Overhead (Internal Cost Center)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Services Offered */}
            <div className="space-y-2">
              <Label>Services Offered</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a service..."
                  value={servicesInput}
                  onChange={(e) => setServicesInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addService(servicesInput);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addService(servicesInput)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {SERVICES_SUGGESTIONS.filter((s) => !servicesOffered.includes(s)).map(
                  (service) => (
                    <Badge
                      key={service}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => addService(service)}
                    >
                      + {service}
                    </Badge>
                  )
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {servicesOffered.map((service) => (
                  <Badge key={service} className="bg-primary/20 text-primary">
                    {service}
                    <button
                      type="button"
                      onClick={() => removeService(service)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Methodologies & Tools Section */}
        <AccordionItem value="methodologies" className="glass-card rounded-xl border-0">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-2">
              {(methodologies.length > 0 || tools.length > 0) && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              <span>Methodologies & Tools</span>
              {(methodologies.length > 0 || tools.length > 0) && (
                <Badge variant="secondary" className="ml-2">
                  {methodologies.length + tools.length}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 space-y-6">
            {/* Methodologies */}
            <div className="space-y-2">
              <Label>Methodologies Used</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a methodology..."
                  value={methodologiesInput}
                  onChange={(e) => setMethodologiesInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addMethodology(methodologiesInput);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addMethodology(methodologiesInput)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {METHODOLOGIES_SUGGESTIONS.filter((m) => !methodologies.includes(m)).map(
                  (methodology) => (
                    <Badge
                      key={methodology}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => addMethodology(methodology)}
                    >
                      + {methodology}
                    </Badge>
                  )
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {methodologies.map((methodology) => (
                  <Badge key={methodology} className="bg-blue-500/20 text-blue-500">
                    {methodology}
                    <button
                      type="button"
                      onClick={() => removeMethodology(methodology)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="space-y-2">
              <Label>Tools Used</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tool..."
                  value={toolsInput}
                  onChange={(e) => setToolsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTool(toolsInput);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addTool(toolsInput)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {TOOLS_SUGGESTIONS.filter((t) => !tools.includes(t)).map((tool) => (
                  <Badge
                    key={tool}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => addTool(tool)}
                  >
                    + {tool}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {tools.map((tool) => (
                  <Badge key={tool} className="bg-purple-500/20 text-purple-500">
                    {tool}
                    <button
                      type="button"
                      onClick={() => removeTool(tool)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Data Department Section */}
        <AccordionItem value="data" className="glass-card rounded-xl border-0">
          <AccordionTrigger className="px-6 hover:no-underline">
            <span>Data Department (Optional)</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="hasDataDepartment">Has Data Department?</Label>
              <Switch
                id="hasDataDepartment"
                checked={hasDataDepartment}
                onCheckedChange={(checked) =>
                  setValue('hasDataDepartment', checked, { shouldDirty: true })
                }
              />
            </div>
            {hasDataDepartment && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="dataTeamSize">Data Team Size</Label>
                <Input
                  id="dataTeamSize"
                  type="number"
                  min={0}
                  {...register('dataTeamSize', { valueAsNumber: true })}
                />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* External Partners Section */}
        <AccordionItem value="partners" className="glass-card rounded-xl border-0">
          <AccordionTrigger className="px-6 hover:no-underline">
            <span>External Partnerships (Optional)</span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="hasExternalPartners">Works with External Partners?</Label>
              <Switch
                id="hasExternalPartners"
                checked={hasExternalPartners}
                onCheckedChange={(checked) =>
                  setValue('hasExternalPartners', checked, { shouldDirty: true })
                }
              />
            </div>
            {hasExternalPartners && (
              <p className="text-sm text-muted-foreground mt-4">
                Partner management functionality coming soon.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty || isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
