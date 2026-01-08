import React from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import {
  DirectoryFilters as Filters,
  Country,
  Agency,
  FilterCounts,
  DEPARTMENTS,
  EXPERIENCE_LEVELS,
} from './types';

interface DirectoryFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  countries: Country[];
  agencies: Agency[];
  languages: string[];
  filterCounts: FilterCounts;
  isMobile?: boolean;
}

export const DirectoryFiltersPanel: React.FC<DirectoryFiltersProps> = ({
  filters,
  onChange,
  countries,
  agencies,
  languages,
  filterCounts,
  isMobile = false,
}) => {
  const activeFilterCount = countActiveFilters(filters);

  const handleDepartmentToggle = (dept: string) => {
    const newDepts = filters.departments.includes(dept)
      ? filters.departments.filter((d) => d !== dept)
      : [...filters.departments, dept];
    onChange({ ...filters, departments: newDepts });
  };

  const handleCountryToggle = (countryId: string) => {
    const newCountries = filters.countries.includes(countryId)
      ? filters.countries.filter((c) => c !== countryId)
      : [...filters.countries, countryId];
    onChange({ ...filters, countries: newCountries });
  };

  const handleAgencyToggle = (agencyId: string) => {
    const newAgencies = filters.agencies.includes(agencyId)
      ? filters.agencies.filter((a) => a !== agencyId)
      : [...filters.agencies, agencyId];
    onChange({ ...filters, agencies: newAgencies });
  };

  const handleLanguageToggle = (lang: string) => {
    const newLangs = filters.languages.includes(lang)
      ? filters.languages.filter((l) => l !== lang)
      : [...filters.languages, lang];
    onChange({ ...filters, languages: newLangs });
  };

  const handleClearAll = () => {
    onChange({
      departments: [],
      countries: [],
      agencies: [],
      experienceLevel: null,
      languages: [],
      minLanguageProficiency: 0,
      minPitchWinRatio: null,
      maxPitchWinRatio: null,
      hasEffieAwards: false,
      hasCannesAwards: false,
      hasAnyAwards: false,
      completedOnly: true,
    });
  };

  const filteredAgencies = filters.countries.length > 0
    ? agencies.filter((a) => a.country_id && filters.countries.includes(a.country_id))
    : agencies;

  const content = (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        <Accordion type="multiple" defaultValue={['department', 'experience']} className="space-y-2">
          {/* Department Filter */}
          <AccordionItem value="department" className="border border-dark-border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-dark-elevated">
              <span className="text-sm font-medium">Department</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {DEPARTMENTS.map((dept) => (
                  <div key={dept} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`dept-${dept}`}
                        checked={filters.departments.includes(dept)}
                        onCheckedChange={() => handleDepartmentToggle(dept)}
                      />
                      <Label htmlFor={`dept-${dept}`} className="text-sm cursor-pointer">
                        {dept}
                      </Label>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({filterCounts.departments[dept] || 0})
                    </span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Country Filter */}
          <AccordionItem value="country" className="border border-dark-border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-dark-elevated">
              <span className="text-sm font-medium">Country</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {countries.map((country) => (
                  <div key={country.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`country-${country.id}`}
                        checked={filters.countries.includes(country.id)}
                        onCheckedChange={() => handleCountryToggle(country.id)}
                      />
                      <Label htmlFor={`country-${country.id}`} className="text-sm cursor-pointer flex items-center gap-1.5">
                        <span className="text-base">{getFlagEmoji(country.code)}</span>
                        {country.name}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Agency Filter */}
          <AccordionItem value="agency" className="border border-dark-border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-dark-elevated">
              <span className="text-sm font-medium">Agency</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredAgencies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No agencies available</p>
                ) : (
                  filteredAgencies.map((agency) => (
                    <div key={agency.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`agency-${agency.id}`}
                        checked={filters.agencies.includes(agency.id)}
                        onCheckedChange={() => handleAgencyToggle(agency.id)}
                      />
                      <Label htmlFor={`agency-${agency.id}`} className="text-sm cursor-pointer">
                        {agency.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Experience Level Filter */}
          <AccordionItem value="experience" className="border border-dark-border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-dark-elevated">
              <span className="text-sm font-medium">Experience Level</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <RadioGroup
                value={filters.experienceLevel || ''}
                onValueChange={(value) => onChange({ ...filters, experienceLevel: value || null })}
              >
                <div className="space-y-2">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <div key={level.value} className="flex items-center gap-2">
                      <RadioGroupItem value={level.value} id={`exp-${level.value}`} />
                      <Label htmlFor={`exp-${level.value}`} className="text-sm cursor-pointer">
                        {level.label} ({level.min}-{level.max === 100 ? '20+' : level.max} years)
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              {filters.experienceLevel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange({ ...filters, experienceLevel: null })}
                  className="mt-2 text-xs"
                >
                  Clear
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Languages Filter */}
          <AccordionItem value="languages" className="border border-dark-border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-dark-elevated">
              <span className="text-sm font-medium">Languages</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {languages.map((lang) => (
                    <div key={lang} className="flex items-center gap-2">
                      <Checkbox
                        id={`lang-${lang}`}
                        checked={filters.languages.includes(lang)}
                        onCheckedChange={() => handleLanguageToggle(lang)}
                      />
                      <Label htmlFor={`lang-${lang}`} className="text-sm cursor-pointer">
                        {lang}
                      </Label>
                    </div>
                  ))}
                </div>
                {filters.languages.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Min Proficiency: {filters.minLanguageProficiency}%
                    </Label>
                    <Slider
                      value={[filters.minLanguageProficiency]}
                      onValueChange={([value]) =>
                        onChange({ ...filters, minLanguageProficiency: value })
                      }
                      max={100}
                      step={10}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Pitch Win Ratio Filter */}
          <AccordionItem value="pitch" className="border border-dark-border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-dark-elevated">
              <span className="text-sm font-medium">Pitch Win Ratio</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '< 30%', min: 0, max: 30 },
                  { label: '30-60%', min: 30, max: 60 },
                  { label: '60%+', min: 60, max: 100 },
                ].map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (filters.minPitchWinRatio === range.min && filters.maxPitchWinRatio === range.max) {
                        onChange({ ...filters, minPitchWinRatio: null, maxPitchWinRatio: null });
                      } else {
                        onChange({ ...filters, minPitchWinRatio: range.min, maxPitchWinRatio: range.max });
                      }
                    }}
                    className={cn(
                      'text-xs',
                      filters.minPitchWinRatio === range.min &&
                        filters.maxPitchWinRatio === range.max &&
                        'border-primary bg-primary/10'
                    )}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Awards Filter */}
          <AccordionItem value="awards" className="border border-dark-border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-dark-elevated">
              <span className="text-sm font-medium">Awards</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hasEffie"
                    checked={filters.hasEffieAwards}
                    onCheckedChange={(checked) =>
                      onChange({ ...filters, hasEffieAwards: !!checked })
                    }
                  />
                  <Label htmlFor="hasEffie" className="text-sm cursor-pointer">
                    Has Effie Awards
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hasCannes"
                    checked={filters.hasCannesAwards}
                    onCheckedChange={(checked) =>
                      onChange({ ...filters, hasCannesAwards: !!checked })
                    }
                  />
                  <Label htmlFor="hasCannes" className="text-sm cursor-pointer">
                    Has Cannes Awards
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hasAnyAwards"
                    checked={filters.hasAnyAwards}
                    onCheckedChange={(checked) =>
                      onChange({ ...filters, hasAnyAwards: !!checked })
                    }
                  />
                  <Label htmlFor="hasAnyAwards" className="text-sm cursor-pointer">
                    Has any awards
                  </Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Profile Status Filter */}
          <AccordionItem value="status" className="border border-dark-border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-dark-elevated">
              <span className="text-sm font-medium">Profile Status</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="completedOnly"
                  checked={filters.completedOnly}
                  onCheckedChange={(checked) =>
                    onChange({ ...filters, completedOnly: !!checked })
                  }
                />
                <Label htmlFor="completedOnly" className="text-sm cursor-pointer">
                  Completed profiles only
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ScrollArea>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] bg-dark-card">
          <SheetHeader className="pb-4 border-b border-dark-border">
            <SheetTitle className="flex items-center justify-between">
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearAll}>
                  Clear All
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100%-120px)]">{content}</div>
          <SheetFooter className="pt-4 border-t border-dark-border">
            <SheetTrigger asChild>
              <Button className="w-full bg-gradient-primary">Apply Filters</Button>
            </SheetTrigger>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-72 flex-shrink-0 hidden lg:block">
      <div className="glass-card rounded-xl overflow-hidden sticky top-4">
        <div className="p-4 border-b border-dark-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Filters</h3>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs">
              Clear All ({activeFilterCount})
            </Button>
          )}
        </div>
        <div className="max-h-[calc(100vh-200px)]">{content}</div>
      </div>
    </div>
  );
};

function countActiveFilters(filters: Filters): number {
  let count = 0;
  if (filters.departments.length > 0) count++;
  if (filters.countries.length > 0) count++;
  if (filters.agencies.length > 0) count++;
  if (filters.experienceLevel) count++;
  if (filters.languages.length > 0) count++;
  if (filters.minPitchWinRatio !== null) count++;
  if (filters.hasEffieAwards) count++;
  if (filters.hasCannesAwards) count++;
  if (filters.hasAnyAwards) count++;
  if (!filters.completedOnly) count++;
  return count;
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const ActiveFiltersDisplay: React.FC<{
  filters: Filters;
  countries: Country[];
  agencies: Agency[];
  onRemove: (filterType: keyof Filters, value?: string) => void;
}> = ({ filters, countries, agencies, onRemove }) => {
  const chips: { label: string; key: keyof Filters; value?: string }[] = [];

  filters.departments.forEach((dept) => {
    chips.push({ label: `Department: ${dept}`, key: 'departments', value: dept });
  });

  filters.countries.forEach((countryId) => {
    const country = countries.find((c) => c.id === countryId);
    if (country) {
      chips.push({ label: `Country: ${country.name}`, key: 'countries', value: countryId });
    }
  });

  filters.agencies.forEach((agencyId) => {
    const agency = agencies.find((a) => a.id === agencyId);
    if (agency) {
      chips.push({ label: `Agency: ${agency.name}`, key: 'agencies', value: agencyId });
    }
  });

  if (filters.experienceLevel) {
    const level = EXPERIENCE_LEVELS.find((l) => l.value === filters.experienceLevel);
    if (level) {
      chips.push({ label: `Experience: ${level.label}`, key: 'experienceLevel' });
    }
  }

  filters.languages.forEach((lang) => {
    chips.push({ label: `Language: ${lang}`, key: 'languages', value: lang });
  });

  if (filters.minPitchWinRatio !== null) {
    chips.push({
      label: `Pitch Win: ${filters.minPitchWinRatio}-${filters.maxPitchWinRatio}%`,
      key: 'minPitchWinRatio',
    });
  }

  if (filters.hasEffieAwards) {
    chips.push({ label: 'Has Effie Awards', key: 'hasEffieAwards' });
  }

  if (filters.hasCannesAwards) {
    chips.push({ label: 'Has Cannes Awards', key: 'hasCannesAwards' });
  }

  if (filters.hasAnyAwards) {
    chips.push({ label: 'Has Awards', key: 'hasAnyAwards' });
  }

  if (!filters.completedOnly) {
    chips.push({ label: 'Include Incomplete', key: 'completedOnly' });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip, index) => (
        <Badge
          key={index}
          variant="outline"
          className="border-primary/50 text-foreground gap-1.5 py-1 px-2"
        >
          {chip.label}
          <button
            onClick={() => onRemove(chip.key, chip.value)}
            className="hover:text-primary transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
};
