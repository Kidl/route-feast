import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, TrendingUp, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { nb } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  upcomingBookings: number;
  capacityUtilization: number;
  cancellationsToday: number;
  cancellationsWeek: number;
  pendingApprovals: number;
  totalRevenue: number;
}

interface UpcomingBooking {
  id: string;
  booking_reference: string;
  guest_name: string;
  guest_email: string;
  number_of_people: number;
  total_amount_nok: number;
  status: string;
  route: {
    name: string;
  };
  schedule: {
    available_date: string;
    start_time: string;
  };
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    upcomingBookings: 0,
    capacityUtilization: 0,
    cancellationsToday: 0,
    cancellationsWeek: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));
      const startOfCurrentWeek = startOfWeek(new Date(), { locale: nb });
      const endOfCurrentWeek = endOfWeek(new Date(), { locale: nb });

      // Get upcoming bookings
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_reference,
          guest_name,
          guest_email,
          number_of_people,
          total_amount_nok,
          status,
          routes!inner(name),
          route_schedules!inner(available_date, start_time)
        `)
        .gte("route_schedules.available_date", format(new Date(), "yyyy-MM-dd"))
        .eq("status", "confirmed")
        .order("route_schedules.available_date", { ascending: true })
        .limit(5);

      if (bookingsData) {
        setUpcomingBookings(bookingsData.map(booking => ({
          ...booking,
          route: booking.routes,
          schedule: booking.route_schedules,
        })));
      }

      // Get cancellations today
      const { count: cancellationsToday } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "cancelled")
        .gte("cancelled_at", startOfToday.toISOString())
        .lte("cancelled_at", endOfToday.toISOString());

      // Get cancellations this week
      const { count: cancellationsWeek } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "cancelled")
        .gte("cancelled_at", startOfCurrentWeek.toISOString())
        .lte("cancelled_at", endOfCurrentWeek.toISOString());

      // Get pending approvals
      const { count: pendingApprovals } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Calculate capacity utilization for current month
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      
      const { data: monthlyBookings } = await supabase
        .from("bookings")
        .select("number_of_people")
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString())
        .eq("status", "confirmed");

      const { data: monthlyCapacity } = await supabase
        .from("route_schedules")
        .select("available_spots")
        .gte("available_date", format(monthStart, "yyyy-MM-dd"))
        .lte("available_date", format(monthEnd, "yyyy-MM-dd"));

      const totalBookedSpots = monthlyBookings?.reduce((sum, booking) => sum + booking.number_of_people, 0) || 0;
      const totalAvailableSpots = monthlyCapacity?.reduce((sum, schedule) => sum + schedule.available_spots, 0) || 1;
      const capacityUtilization = Math.round((totalBookedSpots / totalAvailableSpots) * 100);

      // Calculate total revenue for current month
      const { data: revenueData } = await supabase
        .from("bookings")
        .select("total_amount_nok")
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString())
        .eq("status", "confirmed");

      const totalRevenue = revenueData?.reduce((sum, booking) => sum + booking.total_amount_nok, 0) || 0;

      setStats({
        upcomingBookings: bookingsData?.length || 0,
        capacityUtilization,
        cancellationsToday: cancellationsToday || 0,
        cancellationsWeek: cancellationsWeek || 0,
        pendingApprovals: pendingApprovals || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3 mb-1"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Oversikt over GastroRoute admin-panelet
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kommende bookinger</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Neste 7 dager
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kapasitetsutnyttelse</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.capacityUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              Denne måneden
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kanselleringer i dag</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancellationsToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.cancellationsWeek} denne uken
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venter godkjenning</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Trenger handling
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Omsetning</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Denne måneden
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Aktiv</div>
            <p className="text-xs text-muted-foreground">
              Alle systemer operative
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kommende bookinger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">Ingen kommende bookinger</p>
            ) : (
              upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{booking.guest_name || booking.guest_email}</span>
                      <Badge variant="outline" className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {booking.route.name} • {booking.number_of_people} personer
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(booking.schedule.available_date), "d. MMMM yyyy", { locale: nb })} 
                      kl. {booking.schedule.start_time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{formatCurrency(booking.total_amount_nok)}</div>
                    <div className="text-xs text-muted-foreground">{booking.booking_reference}</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hurtighandlinger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <CheckCircle className="h-4 w-4" />
              Godkjenn ventende bookinger ({stats.pendingApprovals})
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <Calendar className="h-4 w-4" />
              Se dagens timeplan
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <Users className="h-4 w-4" />
              Eksporter månedsrapport
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <AlertCircle className="h-4 w-4" />
              Håndter refunderinger
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}