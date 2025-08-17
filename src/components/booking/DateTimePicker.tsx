import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TimeSlot {
  id: string;
  start_time: string;
  available_spots: number;
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTimeSlots = async (date: Date) => {
    setLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('route_schedules')
        .select('id, start_time, available_spots')
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

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    fetchTimeSlots(date);
    onSelectionChange(date, null);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    onSelectionChange(selectedDate, slot);
  };

  // Disable past dates and limit to next 60 days
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    
    return date < today || date > maxDate;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            className="rounded-md border shadow-card pointer-events-auto"
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Available Times for {format(selectedDate, 'MMMM d, yyyy')}
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
              <div className="grid gap-3">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                    onClick={() => handleTimeSlotSelect(slot)}
                    className="flex items-center justify-between p-4 h-auto"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">
                        {format(new Date(`2000-01-01T${slot.start_time}`), 'HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <Badge 
                        variant={slot.available_spots <= 3 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {slot.available_spots} spots left
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};