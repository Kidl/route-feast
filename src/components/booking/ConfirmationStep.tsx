import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, QrCode, Calendar, Users, MapPin, Share2, Download } from "lucide-react";
import { Route } from "@/data/mockRoutes";
import QRCodeLib from 'qrcode';

interface ConfirmationStepProps {
  route: Route;
  bookingData: any;
  onClose: () => void;
}

export const ConfirmationStep = ({ route, bookingData, onClose }: ConfirmationStepProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [bookingReference] = useState(() => 
    'GR-' + Math.random().toString(36).substr(2, 8).toUpperCase()
  );

  useEffect(() => {
    // Generate QR code for booking reference
    const generateQRCode = async () => {
      try {
        const qrData = JSON.stringify({
          bookingReference,
          routeName: route.name,
          date: bookingData.selectedDate?.toISOString(),
          time: bookingData.selectedTimeSlot?.start_time,
          people: bookingData.participantInfo?.numberOfPeople
        });
        
        const qrUrl = await QRCodeLib.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: {
            dark: '#1a1a1a',
            light: '#ffffff'
          }
        });
        
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [bookingReference, route.name, bookingData]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GastroRoute Booking Confirmation',
          text: `My booking for ${route.name} is confirmed! Reference: ${bookingReference}`,
          url: window.location.origin
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `My GastroRoute booking is confirmed!\n\nRoute: ${route.name}\nReference: ${bookingReference}\nDate: ${bookingData.selectedDate?.toLocaleDateString()}\nTime: ${bookingData.selectedTimeSlot?.start_time}`
      );
    }
  };

  const numberOfPeople = bookingData.participantInfo?.numberOfPeople || 1;
  const total = route.price * numberOfPeople;

  return (
    <div className="space-y-6 text-center">
      {/* Success Header */}
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground">
            Your culinary journey is all set. We can't wait to see you!
          </p>
        </div>
      </div>

      {/* Booking Reference */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm text-green-700">Booking Reference</p>
            <p className="text-2xl font-bold text-green-800">{bookingReference}</p>
            <p className="text-xs text-green-600">
              Save this reference number for your records
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      {qrCodeUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5" />
              Your Digital Ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <img src={qrCodeUrl} alt="Booking QR Code" className="border rounded-lg" />
            <p className="text-sm text-muted-foreground text-center">
              Show this QR code at the first restaurant to begin your route
            </p>
          </CardContent>
        </Card>
      )}

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium">{route.name}</h3>
              <p className="text-sm text-muted-foreground">{route.location}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">
                {bookingData.selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                Starting at {bookingData.selectedTimeSlot?.start_time}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">{numberOfPeople} {numberOfPeople === 1 ? 'Person' : 'People'}</p>
              <p className="text-sm text-muted-foreground">Total paid: {total} NOK</p>
            </div>
          </div>

          {/* Special Requirements */}
          {(bookingData.participantInfo?.dietaryPreferences?.length > 0 || 
            bookingData.participantInfo?.allergies || 
            bookingData.participantInfo?.specialRequests) && (
            <div className="space-y-2 pt-4 border-t">
              <h4 className="font-medium text-sm">Special Requirements:</h4>
              {bookingData.participantInfo.dietaryPreferences?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {bookingData.participantInfo.dietaryPreferences.map((pref: string) => (
                    <Badge key={pref} variant="outline" className="text-xs">{pref}</Badge>
                  ))}
                </div>
              )}
              {bookingData.participantInfo.allergies && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Allergies:</span> {bookingData.participantInfo.allergies}
                </p>
              )}
              {bookingData.participantInfo.specialRequests && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Special requests:</span> {bookingData.participantInfo.specialRequests}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="text-left">
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Check your email for detailed booking confirmation</li>
            <li>• Arrive 10 minutes early at the first restaurant</li>
            <li>• Show your QR code to begin the experience</li>
            <li>• Follow the route guide between restaurants</li>
            <li>• Enjoy your culinary journey!</li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          variant="outline"
          onClick={handleShare}
          className="flex-1"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Booking
        </Button>
        
        <Button
          onClick={onClose}
          className="flex-1"
        >
          Close
        </Button>
      </div>
    </div>
  );
};