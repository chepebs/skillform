import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Globe, Star, ArrowUpDown } from 'lucide-react';
import type { EmployeeLanguage, BrandManaged } from '@/hooks/useProfileData';

interface SkillsLanguagesTabProps {
  languages: EmployeeLanguage[];
  brandsManaged: BrandManaged[];
}

type SortOption = 'alphabetical' | 'proficiency' | 'native';

export const SkillsLanguagesTab: React.FC<SkillsLanguagesTabProps> = ({
  languages,
  brandsManaged,
}) => {
  const [sortOption, setSortOption] = useState<SortOption>('native');
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);

  const getProgressColor = (level: number | null) => {
    if (!level) return 'bg-muted';
    if (level >= 80) return 'bg-emerald-500';
    if (level >= 50) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const sortedLanguages = [...languages].sort((a, b) => {
    switch (sortOption) {
      case 'alphabetical':
        return a.language.localeCompare(b.language);
      case 'proficiency':
        const avgA = ((a.speaking_level || 0) + (a.reading_level || 0) + (a.writing_level || 0)) / 3;
        const avgB = ((b.speaking_level || 0) + (b.reading_level || 0) + (b.writing_level || 0)) / 3;
        return avgB - avgA;
      case 'native':
      default:
        if (a.is_native && !b.is_native) return -1;
        if (!a.is_native && b.is_native) return 1;
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Languages */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-400" />
            Languages
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            <div className="flex gap-1">
              {[
                { value: 'native', label: 'Native First' },
                { value: 'proficiency', label: 'Proficiency' },
                { value: 'alphabetical', label: 'A-Z' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={sortOption === option.value ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortOption(option.value as SortOption)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {languages.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No languages added yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedLanguages.map((lang) => (
                <div
                  key={lang.id}
                  className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-purple-400" />
                      <h4 className="font-semibold text-foreground">{lang.language}</h4>
                    </div>
                    {lang.is_native && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Native
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Speaking</span>
                        <span className="font-medium">{lang.speaking_level || 0}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getProgressColor(lang.speaking_level)}`}
                          style={{ width: `${lang.speaking_level || 0}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Reading</span>
                        <span className="font-medium">{lang.reading_level || 0}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getProgressColor(lang.reading_level)}`}
                          style={{ width: `${lang.reading_level || 0}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Writing</span>
                        <span className="font-medium">{lang.writing_level || 0}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getProgressColor(lang.writing_level)}`}
                          style={{ width: `${lang.writing_level || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Brands Managed */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Brands Managed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {brandsManaged.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No brands listed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brandsManaged.map((brand) => (
                <div
                  key={brand.id}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setExpandedBrand(expandedBrand === brand.id ? null : brand.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground truncate">{brand.brand_name}</h4>
                    {brand.years_managed && (
                      <Badge variant="outline" className="ml-2 flex-shrink-0">
                        {brand.years_managed} yr{brand.years_managed > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  
                  {brand.description && (
                    <p className={`text-sm text-muted-foreground ${
                      expandedBrand === brand.id ? '' : 'line-clamp-2'
                    }`}>
                      {brand.description}
                    </p>
                  )}
                  
                  {brand.description && brand.description.length > 80 && (
                    <button className="text-xs text-primary mt-1">
                      {expandedBrand === brand.id ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
