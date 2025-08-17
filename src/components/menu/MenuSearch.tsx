import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MenuSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const MenuSearch = ({ searchTerm, onSearchChange }: MenuSearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        type="text"
        placeholder="Søk i retter, ingredienser eller tags..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};