import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, Search, X } from "lucide-react";

interface RouteFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  priceRange: 'all' | 'budget' | 'mid' | 'premium';
  experience: 'all' | 'michelin' | 'fusion' | 'traditional';
  duration: 'all' | 'short' | 'medium' | 'long';
  searchTerm: string;
}

const INITIAL_FILTERS: FilterState = {
  priceRange: 'all',
  experience: 'all', 
  duration: 'all',
  searchTerm: ''
};

export const RouteFilters = ({ onFilterChange }: RouteFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    onFilterChange(INITIAL_FILTERS);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== 'all' && value !== ''
  );

  return (
    <Card className="mb-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filtrer ruter
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? 'Skjul filtre' : 'Vis filtre'}
          </Button>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Søk ruter, restauranter eller kjøkken..."
              className="pl-10"
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Opplevelsesnivå</label>
              <Select value={filters.experience} onValueChange={(value) => updateFilter('experience', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle opplevelser</SelectItem>
                  <SelectItem value="michelin">Michelin stjerne</SelectItem>
                  <SelectItem value="fusion">Asiatisk fusion</SelectItem>
                  <SelectItem value="traditional">Tradisjonell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prisklasse</label>
              <Select value={filters.priceRange} onValueChange={(value) => updateFilter('priceRange', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle priser</SelectItem>
                  <SelectItem value="budget">Budsjett (Under 1200 NOK)</SelectItem>
                  <SelectItem value="mid">Mellomklasse (1200-1800 NOK)</SelectItem>
                  <SelectItem value="premium">Premium (1800+ NOK)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Varighet</label>
              <Select value={filters.duration} onValueChange={(value) => updateFilter('duration', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle varigheter</SelectItem>
                  <SelectItem value="short">Kort (2-3 timer)</SelectItem>
                  <SelectItem value="medium">Medium (3-4 timer)</SelectItem>
                  <SelectItem value="long">Lang (4+ timer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters & Clear */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Aktive filtre:</span>
              {filters.experience !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.experience}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('experience', 'all')}
                  />
                </Badge>
              )}
              {filters.priceRange !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.priceRange}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('priceRange', 'all')}
                  />
                </Badge>
              )}
              {filters.duration !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.duration}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('duration', 'all')}
                  />
                </Badge>
              )}
              {filters.searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  "{filters.searchTerm}"
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('searchTerm', '')}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                Fjern alle
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};