import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Shield, Apple, Smartphone } from "lucide-react";
import { Route } from "@/data/mockRoutes";
import { useToast } from "@/hooks/use-toast";
import { BookingService, BookingData } from "@/services/BookingService";

interface PaymentStepProps {
  route: Route;
  bookingData: any;
  onPaymentComplete: (paymentData: any) => void;
}

export const PaymentStep = ({ route, bookingData, onPaymentComplete }: PaymentStepProps) => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const calculateTotal = () => {
    const pricePerPerson = route.price;
    const numberOfPeople = bookingData.participantInfo?.numberOfPeople || 1;
    return pricePerPerson * numberOfPeople;
  };

  const handleStripeCheckout = async () => {
    setProcessing(true);
    try {
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
        userType: bookingData.userType,
        userData: bookingData.userData,
        participantInfo: bookingData.participantInfo,
        totalAmount: calculateTotal(),
        paymentData
      });

      if (bookingResult.success) {
        onPaymentComplete({
          ...paymentData,
          bookingId: bookingResult.bookingId,
          bookingReference: bookingResult.bookingReference
        });
        
        toast({
          title: "Payment Successful!",
          description: "Your booking has been confirmed."
        });
      } else {
        throw new Error(bookingResult.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Payment/booking error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "There was an issue processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const total = calculateTotal();
  const numberOfPeople = bookingData.participantInfo?.numberOfPeople || 1;

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