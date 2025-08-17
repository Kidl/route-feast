import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="space-y-4">
      {/* Horizontal Date Selector */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base font-medium">
            <span className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Select Date</span>
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateOffset(Math.max(0, dateOffset - 7))}
                disabled={!canNavigateLeft}
                className="h-7 w-7 p-0 hover:bg-muted/50"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateOffset(dateOffset + 7)}
                disabled={!canNavigateRight}
                className="h-7 w-7 p-0 hover:bg-muted/50"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {visibleDates.map((date, index) => {
              const isAvailable = isDateAvailable(date);
              const isSelected = selectedDate && isSameDay(selectedDate, date);
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  disabled={!isAvailable}
                  onClick={() => handleDateSelect(date)}
                  className={cn(
                    "flex flex-col items-center flex-shrink-0 w-[52px] h-[60px] p-1 text-xs hover:bg-muted/50",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                    !isSelected && !isAvailable && "opacity-30 cursor-not-allowed",
                    !isSelected && isAvailable && "border border-border/40"
                  )}
                >
                  <div className="text-[10px] font-medium leading-tight">
                    {format(date, 'EEE')}
                  </div>
                  <div className="text-lg font-bold leading-none mt-1">
                    {format(date, 'd')}
                  </div>
                  <div className="text-[9px] leading-tight mt-0.5">
                    {format(date, 'MMM')}
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots List */}
      {selectedDate && (
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Available Times</span>
              <span className="text-sm font-normal text-muted-foreground">
                {format(selectedDate, 'EEE, MMM d')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {loading ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Loading available times...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No available times for this date.<br />
                <span className="text-xs">Please select another date.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableSlots.map((slot) => {
                  const isSelected = selectedTimeSlot?.id === slot.id;
                  const isLowAvailability = slot.available_spots <= 3;
                  
                  return (
                    <Button
                      key={slot.id}
                      variant={isSelected ? "default" : "ghost"}
                      onClick={() => handleTimeSlotSelect(slot)}
                      className={cn(
                        "w-full h-10 px-3 py-2 flex items-center justify-between text-sm hover:bg-muted/50",
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                        !isSelected && "border border-border/40"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">
                          {format(new Date(`2000-01-01T${slot.start_time}`), 'HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {slot.available_spots} {slot.available_spots === 1 ? 'spot' : 'spots'} left
                        </span>
                        {isLowAvailability && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Low
                          </Badge>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};