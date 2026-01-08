import React, { useState } from 'react';
import { Grid, List, Download, Users, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

import { DirectorySearch } from '@/components/directory/DirectorySearch';
import { DirectoryFiltersPanel, ActiveFiltersDisplay } from '@/components/directory/DirectoryFilters';
import { ProfileCard } from '@/components/directory/ProfileCard';
import { ProfileTable } from '@/components/directory/ProfileTable';
import { DirectoryPagination } from '@/components/directory/DirectoryPagination';
import { SkeletonCard, SkeletonRow } from '@/components/directory/SkeletonCard';
import { useDirectoryData, useExportCSV } from '@/hooks/useDirectoryData';
import {
  DirectoryFilters,
  SortOption,
  ViewMode,
  SORT_OPTIONS,
} from '@/components/directory/types';

const DEFAULT_FILTERS: DirectoryFilters = {
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
};

const Directory: React.FC = () => {
  const { role } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<DirectoryFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    profiles,
    totalCount,
    totalPages,
    isLoading,
    error,
    countries,
    agencies,
    allLanguages,
    filterCounts,
  } = useDirectoryData(searchQuery, filters, sortBy, viewMode, currentPage);

  const isAdmin = role === 'master_admin' || role === 'organizer_admin';
  const { exportToCSV } = useExportCSV(profiles, isAdmin);

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: DirectoryFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleRemoveFilter = (filterType: keyof DirectoryFilters, value?: string) => {
    const newFilters = { ...filters };

    switch (filterType) {
      case 'departments':
        newFilters.departments = filters.departments.filter((d) => d !== value);
        break;
      case 'countries':
        newFilters.countries = filters.countries.filter((c) => c !== value);
        break;
      case 'agencies':
        newFilters.agencies = filters.agencies.filter((a) => a !== value);
        break;
      case 'experienceLevel':
        newFilters.experienceLevel = null;
        break;
      case 'languages':
        newFilters.languages = filters.languages.filter((l) => l !== value);
        break;
      case 'minPitchWinRatio':
        newFilters.minPitchWinRatio = null;
        newFilters.maxPitchWinRatio = null;
        break;
      case 'hasEffieAwards':
        newFilters.hasEffieAwards = false;
        break;
      case 'hasCannesAwards':
        newFilters.hasCannesAwards = false;
        break;
      case 'hasAnyAwards':
        newFilters.hasAnyAwards = false;
        break;
      case 'completedOnly':
        newFilters.completedOnly = true;
        break;
    }

    handleFiltersChange(newFilters);
  };

  const handleExport = () => {
    exportToCSV();
    toast({
      title: 'Export Complete',
      description: 'The CSV file is downloading...',
    });
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Talent Directory</h1>
          <p className="text-muted-foreground mt-1">
            Browse and find talent across the organization
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
        )}
      </div>

      {/* Search Bar - Sticky on scroll */}
      <div className="sticky top-0 z-20 py-4 -mx-4 px-4 bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <DirectorySearch
            value={searchQuery}
            onChange={handleSearchChange}
            className="flex-1"
          />
          
          <div className="flex gap-2">
            {/* Mobile filters button */}
            <div className="lg:hidden">
              <DirectoryFiltersPanel
                filters={filters}
                onChange={handleFiltersChange}
                countries={countries}
                agencies={agencies}
                languages={allLanguages}
                filterCounts={filterCounts}
                isMobile
              />
            </div>

            {/* Sort dropdown */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px] bg-dark-elevated border-dark-border">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View mode toggle - hidden on mobile */}
            <div className="hidden sm:flex rounded-lg border border-dark-border overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={cn('rounded-none', viewMode === 'grid' && 'bg-dark-elevated')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={cn('rounded-none', viewMode === 'list' && 'bg-dark-elevated')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filters Sidebar */}
        <DirectoryFiltersPanel
          filters={filters}
          onChange={handleFiltersChange}
          countries={countries}
          agencies={agencies}
          languages={allLanguages}
          filterCounts={filterCounts}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Active Filters */}
          <ActiveFiltersDisplay
            filters={filters}
            countries={countries}
            agencies={agencies}
            onRemove={handleRemoveFilter}
          />

          {/* Results Counter */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {profiles.length} of {totalCount} employees
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !error && (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl overflow-hidden">
                {[...Array(10)].map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            )
          )}

          {/* Empty State */}
          {!isLoading && !error && profiles.length === 0 && (
            <div className="glass-card rounded-xl p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No employees found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery || Object.values(filters).some((v) => 
                  Array.isArray(v) ? v.length > 0 : v !== null && v !== true && v !== 0
                )
                  ? 'Try different search terms or remove some filters'
                  : 'No profiles have been created yet'}
              </p>
              {(searchQuery || filters !== DEFAULT_FILTERS) && (
                <Button onClick={handleClearFilters} variant="outline">
                  Clear All Filters
                </Button>
              )}
            </div>
          )}

          {/* Results Grid/List */}
          {!isLoading && !error && profiles.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {profiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      searchQuery={searchQuery}
                    />
                  ))}
                </div>
              ) : (
                <ProfileTable
                  profiles={profiles}
                  sortBy={sortBy}
                  onSort={setSortBy}
                  searchQuery={searchQuery}
                />
              )}

              {/* Pagination */}
              <DirectoryPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={viewMode === 'grid' ? 24 : 50}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Directory;
