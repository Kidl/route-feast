import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TimeSlot {
  id: string;
  start_time: string;
  available_spots: number;
  available_date: string;
}

interface DateTimePickerProps {
  routeId: string;
  maxCapacity: number;
  onSelectionChange: (date: Date | null, timeSlot: TimeSlot | null) => void;
}

export const DateTimePicker = ({ routeId, maxCapacity, onSelectionChange }: DateTimePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [dateOffset, setDateOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const today = startOfToday();
  const visibleDates = Array.from({ length: 7 }, (_, i) => addDays(today, i + dateOffset));

  // Fetch all available dates for this route
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const { data, error } = await supabase
          .from('route_schedules')
          .select('available_date')
          .eq('route_id', routeId)
          .eq('is_active', true)
          .gt('available_spots', 0)
          .gte('available_date', format(today, 'yyyy-MM-dd'))
          .order('available_date');

        if (error) throw error;
        
        const dates = [...new Set(data?.map(slot => new Date(slot.available_date)) || [])];
        setAvailableDates(dates);
      } catch (error) {
        console.error('Error fetching available dates:', error);
      }
    };

    fetchAvailableDates();
  }, [routeId]);

  const fetchTimeSlots = async (date: Date) => {
    setLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('route_schedules')
        .select('id, start_time, available_spots, available_date')
        .eq('route_id', routeId)
        .eq('available_date', formattedDate)
        .eq('is_active', true)
        .gt('available_spots', 0)
        .order('start_time');

      if (error) throw error;
      
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: "Error",
        description: "Could not load available time slots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    fetchTimeSlots(date);
    onSelectionChange(date, null);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    onSelectionChange(selectedDate, slot);
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => isSameDay(availableDate, date));
  };

  const canNavigateLeft = dateOffset > 0;
  const canNavigateRight = dateOffset < 30; // Limit to 30 days ahead

  return (
    <div className="space-y-6">
      {/* Date Selection - Airbnb Style */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Select dates</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDateOffset(Math.max(0, dateOffset - 7))}
              disabled={!canNavigateLeft}
              className="h-8 w-8 p-0 rounded-full hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDateOffset(dateOffset + 7)}
              disabled={!canNavigateRight}
              className="h-8 w-8 p-0 rounded-full hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {visibleDates.map((date, index) => {
            const isAvailable = isDateAvailable(date);
            const isSelected = selectedDate && isSameDay(selectedDate, date);
            
            return (
              <button
                key={index}
                disabled={!isAvailable}
                onClick={() => handleDateSelect(date)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[48px] h-[48px] p-2 rounded-xl border transition-all duration-200 flex-shrink-0",
                  isSelected 
                    ? "bg-foreground text-background border-foreground" 
                    : isAvailable 
                      ? "bg-background text-foreground border-border hover:border-foreground/40" 
                      : "bg-muted/30 text-muted-foreground border-border cursor-not-allowed opacity-50"
                )}
              >
                <div className="text-[10px] font-medium leading-none">
                  {format(date, 'EEE').toUpperCase()}
                </div>
                <div className="text-sm font-semibold leading-none mt-1">
                  {format(date, 'd')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Selection - Airbnb Style */}
      {selectedDate && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Select time for {format(selectedDate, 'EEEE, MMMM d')}
          </h3>
          
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading available times...
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No available times for this date.</p>
              <p className="text-sm mt-1">Please select another date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableSlots.map((slot) => {
                const isSelected = selectedTimeSlot?.id === slot.id;
                const isLowAvailability = slot.available_spots <= 3;
                
                return (
                  <button
                    key={slot.id}
                    onClick={() => handleTimeSlotSelect(slot)}
                    className={cn(
                      "w-full p-4 rounded-xl border transition-all duration-200 text-left",
                      isSelected 
                        ? "bg-foreground text-background border-foreground" 
                        : "bg-background text-foreground border-border hover:border-foreground/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">
                            {format(new Date(`2000-01-01T${slot.start_time}`), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm",
                          isSelected ? "text-background/80" : "text-muted-foreground"
                        )}>
                          {slot.available_spots} {slot.available_spots === 1 ? 'spot' : 'spots'} left
                        </span>
                        {isLowAvailability && !isSelected && (
                          <div className="w-2 h-2 bg-destructive rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};