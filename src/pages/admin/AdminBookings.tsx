import { useState, useEffect } from "react";
import { format, startOfDay, isSameDay, getWeek, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { nb } from "date-fns/locale";
import { Calendar as CalendarIcon, Plus, Filter, Search, Users, Clock, MapPin, Phone, Mail, ChevronDown, ChevronUp, UtensilsCrossed, Calendar as CalendarDayIcon, Building } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  booking_reference: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  number_of_people: number;
  status: string;
  table_id?: string;
  special_requests?: string;
  allergies?: string;
  dietary_preferences: string[];
  booking_type: string;
  created_at: string;
  route?: {
    name: string;
    location: string;
  };
  schedule?: {
    available_date: string;
    start_time: string;
  };
  table?: {
    table_number: string;
    capacity: number;
  };
  restaurant_bookings?: RestaurantBooking[];
}

interface RestaurantBooking {
  id: string;
  restaurant_id: string;
  stop_number: number;
  estimated_arrival_time: string;
  estimated_departure_time: string;
  status: string;
  restaurant: {
    name: string;
  };
}

interface RestaurantTable {
  id: string;
  table_number: string;
  capacity: number;
  status: string;
  restaurant_id: string;
}

const statusColumns = [
  { key: 'no_table', title: 'Uten bord', color: 'bg-orange-50 border-orange-200' },
  { key: 'confirmed', title: 'Bekreftet', color: 'bg-blue-50 border-blue-200' },
  { key: 'ongoing', title: 'Pågående', color: 'bg-green-50 border-green-200' },
  { key: 'completed', title: 'Fullført', color: 'bg-gray-50 border-gray-200' },
  { key: 'cancelled', title: 'Avbrutt', color: 'bg-red-50 border-red-200' }
];

const statusColors = {
  'no_table': 'bg-orange-500',
  'confirmed': 'bg-blue-500',
  'ongoing': 'bg-green-500',
  'completed': 'bg-gray-500',
  'cancelled': 'bg-red-500'
};

export function AdminBookings() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [restaurantFilter, setRestaurantFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [restaurants, setRestaurants] = useState<{ id: string; name: string }[]>([]);

  const form = useForm({
    defaultValues: {
      guest_name: "",
      guest_email: "",
      guest_phone: "",
      number_of_people: 2,
      special_requests: "",
      allergies: "",
      table_id: ""
    }
  });

  useEffect(() => {
    fetchBookings();
    fetchTables();
    fetchRestaurants();
  }, [selectedDate]);

  const fetchBookings = async () => {
    try {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          route:routes(name, location),
          schedule:route_schedules(available_date, start_time),
          table:restaurant_tables(table_number, capacity),
          restaurant_bookings(
            id,
            restaurant_id,
            stop_number,
            estimated_arrival_time,
            estimated_departure_time,
            status,
            restaurant:restaurants(name)
          )
        `)
        .gte('created_at', format(weekStart, 'yyyy-MM-dd'))
        .lte('created_at', format(weekEnd, 'yyyy-MM-dd'))
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke hente bookinger",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('status', 'available')
        .order('table_number');

      if (error) throw error;
      setTables(data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
      
      await fetchBookings();
      toast({
        title: "Status oppdatert",
        description: "Booking status ble oppdatert"
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere status",
        variant: "destructive"
      });
    }
  };

  const assignTable = async (bookingId: string, tableId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          table_id: tableId,
          status: 'confirmed'
        })
        .eq('id', bookingId);

      if (error) throw error;
      
      await fetchBookings();
      setShowTableDialog(false);
      setSelectedBooking(null);
      
      toast({
        title: "Bord tildelt",
        description: "Bord ble tildelt booking"
      });
    } catch (error) {
      console.error('Error assigning table:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke tildele bord",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          guest_name: data.guest_name,
          guest_email: data.guest_email,
          guest_phone: data.guest_phone,
          number_of_people: data.number_of_people,
          special_requests: data.special_requests,
          allergies: data.allergies,
          table_id: data.table_id || null,
          status: data.table_id ? 'confirmed' : 'no_table',
          route_id: null, // Manual bookings don't require route
          schedule_id: null,
          total_amount_nok: 0,
          payment_status: 'manual'
        });

      if (error) throw error;
      
      await fetchBookings();
      setShowAddDialog(false);
      form.reset();
      
      toast({
        title: "Booking opprettet",
        description: "Ny booking ble opprettet"
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke opprette booking",
        variant: "destructive"
      });
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    const matchesRestaurant = restaurantFilter === "all" || 
      (booking.restaurant_bookings && booking.restaurant_bookings.some(rb => rb.restaurant_id === restaurantFilter)) ||
      (booking.booking_type === 'table'); // Show table bookings when "all" is selected
    
    return matchesSearch && matchesStatus && matchesRestaurant;
  });

  const getBookingsByDate = () => {
    const bookingsByDate = new Map<string, Booking[]>();
    
    filteredBookings.forEach(booking => {
      const bookingDate = booking.schedule?.available_date || booking.created_at.split('T')[0];
      if (!bookingsByDate.has(bookingDate)) {
        bookingsByDate.set(bookingDate, []);
      }
      bookingsByDate.get(bookingDate)!.push(booking);
    });
    
    return Array.from(bookingsByDate.entries()).sort(([a], [b]) => a.localeCompare(b));
  };

  const getBookingType = (booking: Booking) => {
    if (booking.booking_type === 'route') {
      return 'Gastro Route';
    } else if (booking.schedule) {
      return 'Bordreservasjon med forhåndsbestilling';
    } else {
      return 'Bordreservasjon';
    }
  };

  const toggleDateCollapse = (date: string) => {
    const newCollapsed = new Set(collapsedDates);
    if (newCollapsed.has(date)) {
      newCollapsed.delete(date);
    } else {
      newCollapsed.add(date);
    }
    setCollapsedDates(newCollapsed);
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm truncate">{booking.guest_name || booking.guest_email}</p>
          <Badge variant="outline" className="text-xs shrink-0">
            <Users className="w-3 h-3 mr-1" />
            {booking.number_of_people}
          </Badge>
          <Badge variant="secondary" className="text-xs shrink-0">
            {getBookingType(booking) === 'Gastro Route' && <UtensilsCrossed className="w-3 h-3 mr-1" />}
            {getBookingType(booking) === 'Bordreservasjon med forhåndsbestilling' && <CalendarDayIcon className="w-3 h-3 mr-1" />}
            {getBookingType(booking)}
          </Badge>
          
          {/* Show restaurant stops for route bookings */}
          {booking.restaurant_bookings && booking.restaurant_bookings.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {booking.restaurant_bookings.slice(0, 2).map((rb) => (
                <Badge key={rb.id} variant="outline" className="text-xs">
                  <Building className="w-3 h-3 mr-1" />
                  Stopp {rb.stop_number}: {rb.restaurant.name}
                </Badge>
              ))}
              {booking.restaurant_bookings.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{booking.restaurant_bookings.length - 2} flere
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{booking.booking_reference}</span>
          {booking.table && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Bord {booking.table.table_number}
            </div>
          )}
          {booking.schedule && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {booking.schedule.start_time}
            </div>
          )}
          {booking.guest_phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {booking.guest_phone}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        {booking.status === 'no_table' && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => {
              setSelectedBooking(booking);
              setShowTableDialog(true);
            }}
          >
            Tildel bord
          </Button>
        )}
        
        <Select value={booking.status} onValueChange={(value) => updateBookingStatus(booking.id, value)}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusColumns.map(status => (
              <SelectItem key={status.key} value={status.key}>
                {status.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bookinger</h1>
            <p className="text-muted-foreground">Administrer reservasjoner og bordtildeling</p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ny reservasjon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Opprett ny reservasjon</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="guest_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Navn</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="guest_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-post</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="guest_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="number_of_people"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Antall personer</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="table_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bord (valgfritt)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Velg bord" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tables.map(table => (
                              <SelectItem key={table.id} value={table.id}>
                                Bord {table.table_number} ({table.capacity} plasser)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="special_requests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spesielle ønsker</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    Opprett reservasjon
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Calendar and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "d. MMMM yyyy", { locale: nb })} • Uke {getWeek(selectedDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              
              <div className="flex-1">
                <Input
                  placeholder="Søk etter navn, e-post eller referanse..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statuser</SelectItem>
                  {statusColumns.map(status => (
                    <SelectItem key={status.key} value={status.key}>
                      {status.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={restaurantFilter} onValueChange={setRestaurantFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Restaurant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle restauranter</SelectItem>
                  {restaurants.map(restaurant => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List Grouped by Date */}
        <div className="space-y-4">
          {getBookingsByDate().map(([date, dateBookings]) => {
            const isCollapsed = collapsedDates.has(date);
            const weekNumber = getWeek(new Date(date));
            
            return (
              <Card key={date}>
                <Collapsible open={!isCollapsed} onOpenChange={() => toggleDateCollapse(date)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                          <CardTitle className="text-lg">
                            {format(new Date(date), "EEEE d. MMMM yyyy", { locale: nb })}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            Uke {weekNumber}
                          </Badge>
                        </div>
                        <Badge variant="secondary">
                          {dateBookings.length} booking{dateBookings.length !== 1 ? 'er' : ''}
                        </Badge>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {dateBookings.map(booking => (
                          <BookingCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
          
          {getBookingsByDate().length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Ingen bookinger funnet for valgt periode
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Table Assignment Dialog */}
        <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tildel bord</DialogTitle>
            </DialogHeader>
            
            {selectedBooking && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{selectedBooking.guest_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.number_of_people} personer • {selectedBooking.booking_reference}
                  </p>
                </div>
                
                <div className="grid gap-2">
                  {tables
                    .filter(table => table.capacity >= selectedBooking.number_of_people)
                    .map(table => (
                      <Button
                        key={table.id}
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => assignTable(selectedBooking.id, table.id)}
                      >
                        <div>
                          <p className="font-medium">Bord {table.table_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {table.capacity} plasser
                          </p>
                        </div>
                      </Button>
                    ))}
                  
                  {tables.filter(table => table.capacity >= selectedBooking.number_of_people).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Ingen ledige bord med tilstrekkelig kapasitet
                    </p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}