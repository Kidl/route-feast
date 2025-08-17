import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="space-y-3">
      {/* Horizontal Date Selector */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 truncate">
              <CalendarIcon className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="truncate">Select Date</span>
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateOffset(Math.max(0, dateOffset - 7))}
                disabled={!canNavigateLeft}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateOffset(dateOffset + 7)}
                disabled={!canNavigateRight}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2">
            {visibleDates.map((date, index) => {
              const isAvailable = isDateAvailable(date);
              const isSelected = selectedDate && isSameDay(selectedDate, date);
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={!isAvailable}
                  onClick={() => handleDateSelect(date)}
                  className={cn(
                    "flex flex-col items-center flex-shrink-0 w-[58px] h-12 p-1 text-xs overflow-hidden",
                    !isAvailable && "opacity-30"
                  )}
                >
                  <div className="text-[9px] font-medium leading-none truncate w-full text-center">
                    {format(date, 'EEE')}
                  </div>
                  <div className="text-sm font-bold leading-none mt-0.5 truncate w-full text-center">
                    {format(date, 'd')}
                  </div>
                  <div className="text-[9px] leading-none mt-0.5 truncate w-full text-center">
                    {format(date, 'MMM')}
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots Grid */}
      {selectedDate && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm truncate">
              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="truncate">Times - {format(selectedDate, 'EEE, MMM d')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading available times...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No available times for this date. Please select another date.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = selectedTimeSlot?.id === slot.id;
                  const isLowAvailability = slot.available_spots <= 3;
                  
                  return (
                    <Button
                      key={slot.id}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleTimeSlotSelect(slot)}
                      className={cn(
                        "flex flex-col items-center justify-center h-14 p-1.5 text-xs overflow-hidden",
                        isSelected && "ring-2 ring-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-0.5 mb-1 min-w-0">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="font-medium text-[11px] leading-none truncate">
                          {format(new Date(`2000-01-01T${slot.start_time}`), 'HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 min-w-0">
                        <Users className="w-3 h-3 flex-shrink-0" />
                        <Badge 
                          variant={isLowAvailability ? "destructive" : "secondary"}
                          className="text-[9px] px-1 py-0 leading-none min-w-0 truncate"
                        >
                          {slot.available_spots}
                        </Badge>
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