import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  BarChart3,
  Route,
  Calendar,
  Settings,
  FileText,
  Download,
  Plus,
  Search,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const commands = [
  // Navigation
  { id: "nav-dashboard", title: "Gå til Dashboard", icon: BarChart3, action: "/admin" },
  { id: "nav-routes", title: "Gå til Ruter", icon: Route, action: "/admin/routes" },
  { id: "nav-bookings", title: "Gå til Bookinger", icon: Calendar, action: "/admin/bookings" },
  { id: "nav-notifications", title: "Gå til Meldinger", icon: FileText, action: "/admin/notifications" },
  { id: "nav-export", title: "Gå til Eksporter", icon: Download, action: "/admin/export" },
  { id: "nav-settings", title: "Gå til Innstillinger", icon: Settings, action: "/admin/settings" },
  
  // Actions
  { id: "action-new-route", title: "Opprett ny rute", icon: Plus, action: "new-route" },
  { id: "action-search-booking", title: "Søk i bookinger", icon: Search, action: "search-bookings" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "/" && !open) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = (command: typeof commands[0]) => {
    onOpenChange(false);
    
    if (command.action.startsWith("/")) {
      navigate(command.action);
    } else {
      // Handle custom actions
      console.log("Executing action:", command.action);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Søk kommandoer..." />
      <CommandList>
        <CommandEmpty>Ingen kommandoer funnet.</CommandEmpty>
        <CommandGroup heading="Navigasjon">
          {commands.filter(cmd => cmd.id.startsWith("nav-")).map((command) => (
            <CommandItem
              key={command.id}
              onSelect={() => handleSelect(command)}
            >
              <command.icon className="mr-2 h-4 w-4" />
              <span>{command.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Handlinger">
          {commands.filter(cmd => cmd.id.startsWith("action-")).map((command) => (
            <CommandItem
              key={command.id}
              onSelect={() => handleSelect(command)}
            >
              <command.icon className="mr-2 h-4 w-4" />
              <span>{command.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}