import { useState, useEffect } from 'react';
import { Calendar, CalendarIcon, Clock, Plus, Settings } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { RouteAvailabilityService, RouteAvailabilitySlot } from '@/services/RouteAvailabilityService';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RouteAvailabilityCalendarProps {
  routeId: string;
  routeName: string;
}

interface SlotFormData {
  start_time: string;
  end_time: string;
  max_capacity: number;
  price_override_nok?: number;
  is_available: boolean;
}

export const RouteAvailabilityCalendar = ({ routeId, routeName }: RouteAvailabilityCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<RouteAvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SlotFormData>({
    defaultValues: {
      start_time: '12:00',
      end_time: '15:00',
      max_capacity: 20,
      is_available: true
    }
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    fetchAvailability();
  }, [currentMonth, routeId]);

  const fetchAvailability = async () => {
    const result = await RouteAvailabilityService.getRouteAvailability(
      routeId,
      format(monthStart, 'yyyy-MM-dd'),
      format(monthEnd, 'yyyy-MM-dd')
    );

    if (result.success && result.data) {
      setAvailability(result.data);
    }
  };

  const getSlotsForDate = (date: Date): RouteAvailabilitySlot[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability.filter(slot => slot.available_date === dateStr);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowSlotDialog(true);
  };

  const onSubmitSlot = async (data: SlotFormData) => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      const result = await RouteAvailabilityService.setRouteAvailability({
        route_id: routeId,
        available_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: data.start_time,
        end_time: data.end_time,
        is_available: data.is_available,
        max_capacity: data.max_capacity,
        price_override_nok: data.price_override_nok ? Math.round(data.price_override_nok * 100) : undefined
      });

      if (result.success) {
        toast({
          title: 'Tilgjengelighet oppdatert',
          description: 'Tidsluke ble lagret'
        });
        fetchAvailability();
        setShowSlotDialog(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke lagre tilgjengelighet',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const bulkEnableMonth = async (enable: boolean) => {
    try {
      setLoading(true);
      const result = await RouteAvailabilityService.bulkUpdateAvailability(
        routeId,
        format(monthStart, 'yyyy-MM-dd'),
        format(monthEnd, 'yyyy-MM-dd'),
        enable
      );

      if (result.success) {
        toast({
          title: enable ? 'Måned aktivert' : 'Måned deaktivert',
          description: `Tilgjengelighet for ${format(currentMonth, 'MMMM yyyy', { locale: nb })} ble oppdatert`
        });
        fetchAvailability();
      }
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke oppdatere tilgjengelighet',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{routeName} - Tilgjengelighetskalender</h2>
          <p className="text-muted-foreground">Administrer når ruten er tilgjengelig</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => bulkEnableMonth(true)}
            disabled={loading}
          >
            Aktiver måned
          </Button>
          <Button 
            variant="outline" 
            onClick={() => bulkEnableMonth(false)}
            disabled={loading}
          >
            Deaktiver måned
          </Button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
        >
          Forrige måned
        </Button>
        <h3 className="text-lg font-medium">
          {format(currentMonth, 'MMMM yyyy', { locale: nb })}
        </h3>
        <Button
          variant="outline"
          onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
        >
          Neste måned
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date) => {
              const slots = getSlotsForDate(date);
              const hasAvailability = slots.some(slot => slot.is_available);
              const isToday = isSameDay(date, new Date());

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    "p-2 min-h-[60px] border rounded-lg text-left hover:bg-muted/50 transition-colors",
                    !isSameMonth(date, currentMonth) && "text-muted-foreground bg-muted/20",
                    isToday && "border-primary",
                    hasAvailability && "bg-green-50 border-green-200"
                  )}
                >
                  <div className="text-sm font-medium">{format(date, 'd')}</div>
                  <div className="space-y-1">
                    {slots.slice(0, 2).map((slot) => (
                      <Badge
                        key={slot.id}
                        variant={slot.is_available ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {slot.start_time}
                      </Badge>
                    ))}
                    {slots.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{slots.length - 2} mer</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Slot Dialog */}
      <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Legg til tidsluke - {selectedDate && format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: nb })}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitSlot)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starttid</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sluttid</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="max_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maks kapasitet</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_override_nok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pris overstyr (NOK - valgfritt)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="La stå tom for standard pris"
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Tilgjengelig</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Gjør denne tidsluka tilgjengelig for booking
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowSlotDialog(false)}>
                  Avbryt
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Lagrer...' : 'Lagre'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};