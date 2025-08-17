import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, ArrowLeft, ArrowRight } from "lucide-react";

import { DateTimePicker } from "./DateTimePicker";
import { ParticipantForm } from "./ParticipantForm";
import { PaymentStep } from "./PaymentStep";
import { ConfirmationStep } from "./ConfirmationStep";
import { Route } from "@/data/mockRoutes";

interface BookingDialogProps {
  route: Route | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BookingStep = 'datetime' | 'participants' | 'payment' | 'confirmation';

interface BookingData {
  userType?: 'guest' | 'registered';
  userData?: any;
  selectedDate: Date | null;
  selectedTimeSlot: any;
  participantInfo: any;
  paymentData: any;
}

const STEPS: { key: BookingStep; label: string; description: string }[] = [
  { key: 'datetime', label: 'Date & Time', description: 'Choose your preferred slot' },
  { key: 'participants', label: 'Details', description: 'Participants and preferences' },
  { key: 'payment', label: 'Payment', description: 'Secure checkout' },
  { key: 'confirmation', label: 'Confirmed', description: 'Booking confirmed' }
];

export const BookingDialog = ({ route, open, onOpenChange }: BookingDialogProps) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('datetime');
  const [bookingData, setBookingData] = useState<BookingData>({
    selectedDate: null,
    selectedTimeSlot: null,
    participantInfo: null,
    paymentData: null
  });

  const currentStepIndex = STEPS.findIndex(step => step.key === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 'datetime':
        return bookingData.selectedDate && bookingData.selectedTimeSlot;
      case 'participants':
        return bookingData.participantInfo !== null;
      case 'payment':
        return bookingData.paymentData !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].key);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key);
    }
  };

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const resetBooking = () => {
    setCurrentStep('datetime');
    setBookingData({
      selectedDate: null,
      selectedTimeSlot: null,
      participantInfo: null,
      paymentData: null
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after dialog closes to prevent flash
    setTimeout(resetBooking, 300);
  };

  if (!route) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-center">
              Book: {route.name}
            </DialogTitle>
            
            {/* Progress Bar */}
            <div className="space-y-3 pt-4">
              <Progress value={progress} className="h-2" />
              
              {/* Step Indicators */}
              <div className="flex justify-between items-center">
                {STEPS.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center space-y-1">
                    <div className="flex items-center">
                      {index < currentStepIndex ? (
                        <CheckCircle className="w-6 h-6 text-primary" />
                      ) : index === currentStepIndex ? (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-white" />
                        </div>
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${
                        index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogHeader>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto px-1">
            {currentStep === 'datetime' && (
              <DateTimePicker
                routeId={route.id}
                maxCapacity={route.maxCapacity}
                onSelectionChange={(date, timeSlot) => 
                  updateBookingData({ selectedDate: date, selectedTimeSlot: timeSlot })
                }
              />
            )}

            {currentStep === 'participants' && bookingData.selectedTimeSlot && (
              <ParticipantForm
                maxCapacity={route.maxCapacity}
                availableSpots={bookingData.selectedTimeSlot.available_spots}
                onInfoChange={(info) => updateBookingData({ participantInfo: info })}
              />
            )}

            {currentStep === 'payment' && (
              <PaymentStep
                route={route}
                bookingData={bookingData}
                onPaymentComplete={(paymentData, userType, userData) => {
                  updateBookingData({ 
                    paymentData, 
                    userType, 
                    userData 
                  });
                  setCurrentStep('confirmation');
                }}
              />
            )}

            {currentStep === 'confirmation' && (
              <ConfirmationStep
                route={route}
                bookingData={bookingData}
                onClose={handleClose}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          {currentStep !== 'confirmation' && (
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm">
                  Step {currentStepIndex + 1} of {STEPS.length}
                </Badge>
                
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2"
                >
                  {currentStep === 'payment' ? 'Process Payment' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </>
  );
};