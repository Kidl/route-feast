import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Shield, Apple, Smartphone, User, Mail, ArrowRight } from "lucide-react";
import { Route } from "@/data/mockRoutes";
import { useToast } from "@/hooks/use-toast";
import { BookingService, BookingData } from "@/services/BookingService";

interface PaymentStepProps {
  route: Route;
  bookingData: any;
  onPaymentComplete: (paymentData: any, userType: 'guest' | 'registered', userData: any) => void;
}

export const PaymentStep = ({ route, bookingData, onPaymentComplete }: PaymentStepProps) => {
  const [processing, setProcessing] = useState(false);
  const [showAuth, setShowAuth] = useState(!bookingData.userData);
  const [authLoading, setAuthLoading] = useState(false);
  const [guestData, setGuestData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const { toast } = useToast();

  const calculateTotal = () => {
    const pricePerPerson = route.price;
    const numberOfPeople = bookingData.participantInfo?.numberOfPeople || 1;
    return pricePerPerson * numberOfPeople;
  };

  const handleGuestContinue = async () => {
    if (!guestData.name || !guestData.email) {
      toast({
        title: "Manglende informasjon",
        description: "Vennligst fyll ut navn og e-post for å fortsette",
        variant: "destructive"
      });
      return;
    }

    setAuthLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowAuth(false);
      
      toast({
        title: "Informasjon lagret!",
        description: "Du kan nå fortsette med betaling"
      });
    } catch (error) {
      toast({
        title: "Feil",
        description: "Noe gikk galt. Vennligst prøv igjen.",
        variant: "destructive"
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Manglende informasjon",
        description: "Vennligst fyll ut både e-post og passord",
        variant: "destructive"
      });
      return;
    }

    setAuthLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowAuth(false);
      
      toast({
        title: "Velkommen tilbake!",
        description: "Du er nå logget inn"
      });
    } catch (error) {
      toast({
        title: "Innlogging feilet",
        description: "Vennligst sjekk dine innloggingsopplysninger og prøv igjen.",
        variant: "destructive"
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleStripeCheckout = async () => {
    setProcessing(true);
    try {
      // Get user data from auth or guest form
      const userData = bookingData.userData || guestData;
      const userType = bookingData.userType || 'guest';
      
      // TODO: Implement Stripe integration
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentData = {
        method: 'stripe',
        amount: calculateTotal(),
        paymentId: 'pi_' + Math.random().toString(36).substr(2, 9),
        status: 'succeeded'
      };

      // Create booking in database
      const bookingResult = await BookingService.createBooking({
        routeId: route.id,
        scheduleId: bookingData.selectedTimeSlot?.id || '',
        userType,
        userData,
        participantInfo: bookingData.participantInfo,
        totalAmount: calculateTotal(),
        paymentData
      });

      if (bookingResult.success) {
        onPaymentComplete({
          ...paymentData,
          bookingId: bookingResult.bookingId,
          bookingReference: bookingResult.bookingReference
        }, userType, userData);
        
        toast({
          title: "Betaling vellykket!",
          description: "Din bestilling er bekreftet."
        });
      } else {
        throw new Error(bookingResult.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Payment/booking error:', error);
      toast({
        title: "Betaling feilet",
        description: error instanceof Error ? error.message : "Det oppstod et problem med betalingen. Vennligst prøv igjen.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const total = calculateTotal();
  const numberOfPeople = bookingData.participantInfo?.numberOfPeople || 1;

  // Show auth form if user hasn't provided info yet
  if (showAuth) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Nesten ferdig!</CardTitle>
            <p className="text-center text-muted-foreground">
              Vi trenger litt informasjon for å fullføre bestillingen din
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="guest" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="guest">Fortsett som gjest</TabsTrigger>
                <TabsTrigger value="login">Logg inn / Registrer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="guest" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="guest-name">Fullt navn *</Label>
                    <Input
                      id="guest-name"
                      placeholder="Skriv inn ditt fulle navn"
                      value={guestData.name}
                      onChange={(e) => setGuestData({...guestData, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="guest-email">E-postadresse *</Label>
                    <Input
                      id="guest-email"
                      type="email"
                      placeholder="din@epost.no"
                      value={guestData.email}
                      onChange={(e) => setGuestData({...guestData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="guest-phone">Telefonnummer (Valgfritt)</Label>
                    <Input
                      id="guest-phone"
                      type="tel"
                      placeholder="+47 xxx xx xxx"
                      value={guestData.phone}
                      onChange={(e) => setGuestData({...guestData, phone: e.target.value})}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleGuestContinue}
                    disabled={authLoading}
                    className="w-full"
                    size="lg"
                  >
                    {authLoading ? "Setter opp..." : "Fortsett til betaling"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="login" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-postadresse</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="din@epost.no"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Passord</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Skriv inn ditt passord"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleLogin}
                    disabled={authLoading}
                    className="w-full"
                    size="lg"
                  >
                    {authLoading ? "Logger inn..." : "Logg inn og fortsett"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    Har du ikke en konto? Registrering kommer snart!
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{route.name}</h3>
              <p className="text-sm text-muted-foreground">{route.location}</p>
              {bookingData.selectedDate && (
                <p className="text-sm text-muted-foreground">
                  {bookingData.selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {bookingData.selectedTimeSlot?.start_time}
                </p>
              )}
            </div>
            <Badge variant="secondary">{route.duration}</Badge>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Route price per person</span>
              <span>{route.price} NOK</span>
            </div>
            <div className="flex justify-between">
              <span>Number of people</span>
              <span>× {numberOfPeople}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{total} NOK</span>
            </div>
          </div>

          {/* Participant Info Summary */}
          {bookingData.participantInfo && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Booking Details:</h4>
                {bookingData.participantInfo.dietaryPreferences?.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Dietary preferences: </span>
                    <span>{bookingData.participantInfo.dietaryPreferences.join(', ')}</span>
                  </div>
                )}
                {bookingData.participantInfo.allergies && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Allergies: </span>
                    <span>{bookingData.participantInfo.allergies}</span>
                  </div>
                )}
                {bookingData.participantInfo.specialRequests && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Special requests: </span>
                    <span>{bookingData.participantInfo.specialRequests}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Secure Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Your payment is secured with industry-standard encryption
          </div>
          
          {/* Stripe Checkout Button */}
          <Button
            onClick={handleStripeCheckout}
            disabled={processing}
            size="lg"
            className="w-full h-14 text-base"
          >
            <CreditCard className="w-5 h-5 mr-3" />
            {processing ? 'Processing...' : `Pay ${total} NOK with Card`}
          </Button>
          
          {/* Alternative Payment Methods (Placeholder) */}
          <div className="space-y-2">
            <div className="text-center text-sm text-muted-foreground">Or pay with</div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                disabled={true}
                className="h-12 flex items-center justify-center gap-2"
              >
                <Apple className="w-5 h-5" />
                Apple Pay
                <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
              </Button>
              <Button
                variant="outline"
                disabled={true}
                className="h-12 flex items-center justify-center gap-2"
              >
                <Smartphone className="w-5 h-5" />
                Google Pay
                <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground text-center pt-4">
            By proceeding with payment, you agree to our Terms of Service and Privacy Policy.
            You will receive a confirmation email with your booking details and QR code.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};