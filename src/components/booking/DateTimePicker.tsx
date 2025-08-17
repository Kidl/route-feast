import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { nb } from "date-fns/locale";
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
    <div className="space-y-8">
      {/* Date Selection */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-medium text-gray-900">Velg datoer</h2>
            <p className="text-sm text-gray-600 mt-1">Velg din foretrukne dato</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDateOffset(Math.max(0, dateOffset - 7))}
              disabled={!canNavigateLeft}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDateOffset(dateOffset + 7)}
              disabled={!canNavigateRight}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {visibleDates.map((date, index) => {
            const isAvailable = isDateAvailable(date);
            const isSelected = selectedDate && isSameDay(selectedDate, date);
            
            return (
              <button
                key={index}
                disabled={!isAvailable}
                onClick={() => handleDateSelect(date)}
                className={cn(
                  "flex flex-col items-center justify-center h-16 border transition-all text-center",
                  isSelected 
                    ? "bg-gray-900 text-white border-gray-900" 
                    : isAvailable 
                      ? "bg-white text-gray-900 border-gray-300 hover:border-gray-900" 
                      : "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                )}
              >
                <div className="text-xs font-medium uppercase tracking-wide">
                  {format(date, 'EEE')}
                </div>
                <div className="text-lg font-semibold mt-1">
                  {format(date, 'd')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-medium text-gray-900">Velg tidspunkt</h2>
            <p className="text-sm text-gray-600 mt-1">
              Tilgjengelige tidspunkt for {format(selectedDate, 'EEEE, MMMM d, yyyy', { locale: nb })}
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-base">Laster tilgjengelige tidspunkt...</div>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-base mb-2">Ingen tidspunkt tilgjengelig</div>
              <div className="text-sm">Vennligst velg en annen dato</div>
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
                      "w-full p-4 border transition-all text-left group",
                      isSelected 
                        ? "bg-gray-900 text-white border-gray-900" 
                        : "bg-white text-gray-900 border-gray-300 hover:border-gray-900"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5" />
                        <span className="text-base font-medium">
                          {format(new Date(`2000-01-01T${slot.start_time}`), 'h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-sm",
                          isSelected ? "text-white/80" : "text-gray-600"
                        )}>
                          {slot.available_spots} igjen
                        </span>
                        {isLowAvailability && (
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            isSelected ? "bg-white" : "bg-red-500"
                          )}></div>
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