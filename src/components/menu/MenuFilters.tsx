import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";

interface MenuFiltersProps {
  selectedAllergens: string[];
  selectedTags: string[];
  availableAllergens: string[];
  availableTags: string[];
  onAllergensChange: (allergens: string[]) => void;
  onTagsChange: (tags: string[]) => void;
}

export const MenuFilters = ({
  selectedAllergens,
  selectedTags,
  availableAllergens,
  availableTags,
  onAllergensChange,
  onTagsChange
}: MenuFiltersProps) => {
  const toggleAllergen = (allergen: string) => {
    if (selectedAllergens.includes(allergen)) {
      onAllergensChange(selectedAllergens.filter(a => a !== allergen));
    } else {
      onAllergensChange([...selectedAllergens, allergen]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const getAllergenLabel = (allergen: string) => {
    const labels: Record<string, string> = {
      gluten: 'Gluten',
      lactose: 'Laktose',
      nuts: 'Nøtter',
      egg: 'Egg',
      shellfish: 'Skalldyr',
      fish: 'Fisk',
      soy: 'Soya',
      sesame: 'Sesam',
      celery: 'Selleri',
      mustard: 'Sennep',
      sulphites: 'Sulfitter',
      lupin: 'Lupin',
      molluscs: 'Bløtdyr'
    };
    return labels[allergen] || allergen;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Allergen Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Allergener
            {selectedAllergens.length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                {selectedAllergens.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">
                Skjul retter med disse allergenene:
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {availableAllergens.map(allergen => (
                  <label key={allergen} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedAllergens.includes(allergen)}
                      onChange={() => toggleAllergen(allergen)}
                      className="rounded border-border"
                    />
                    <span>{getAllergenLabel(allergen)}</span>
                  </label>
                ))}
              </div>
            </div>
            {selectedAllergens.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onAllergensChange([])}
                className="w-full"
              >
                Fjern alle allergener
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Tags
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">
                  Vis kun retter med disse tags:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              {selectedTags.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onTagsChange([])}
                  className="w-full"
                >
                  Fjern alle tags
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};