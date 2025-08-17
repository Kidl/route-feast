import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Minus, Plus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParticipantInfo {
  numberOfPeople: number;
  allergies: string;
  dietaryPreferences: string[];
  specialRequests: string;
}

interface ParticipantFormProps {
  maxCapacity: number;
  availableSpots: number;
  onInfoChange: (info: ParticipantInfo) => void;
}

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Dairy-free',
  'Nut-free',
  'Pescatarian',
  'Halal',
  'Kosher'
];

export const ParticipantForm = ({ maxCapacity, availableSpots, onInfoChange }: ParticipantFormProps) => {
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [allergies, setAllergies] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState('');
  const { toast } = useToast();

  const handlePeopleChange = (change: number) => {
    const newNumber = Math.max(1, Math.min(availableSpots, numberOfPeople + change));
    if (newNumber !== numberOfPeople) {
      setNumberOfPeople(newNumber);
      updateInfo({ numberOfPeople: newNumber });
    }
  };

  const handleDietaryPreferenceToggle = (preference: string) => {
    const newPreferences = dietaryPreferences.includes(preference)
      ? dietaryPreferences.filter(p => p !== preference)
      : [...dietaryPreferences, preference];
    
    setDietaryPreferences(newPreferences);
    updateInfo({ dietaryPreferences: newPreferences });
  };

  const updateInfo = (updates: Partial<ParticipantInfo>) => {
    const info = {
      numberOfPeople,
      allergies,
      dietaryPreferences,
      specialRequests,
      ...updates
    };
    onInfoChange(info);
  };

  const handleAllergiesChange = (value: string) => {
    setAllergies(value);
    updateInfo({ allergies: value });
  };

  const handleSpecialRequestsChange = (value: string) => {
    setSpecialRequests(value);
    updateInfo({ specialRequests: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Number of People
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePeopleChange(-1)}
              disabled={numberOfPeople <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">{numberOfPeople}</span>
              <span className="text-muted-foreground">
                {numberOfPeople === 1 ? 'person' : 'people'}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePeopleChange(1)}
              disabled={numberOfPeople >= availableSpots}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-4 text-center">
            <Badge variant="secondary" className="text-sm">
              {availableSpots - numberOfPeople} spots remaining
            </Badge>
          </div>
          
          {numberOfPeople >= availableSpots - 2 && (
            <div className="mt-4 flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Limited availability - book soon!</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dietary Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Select any dietary requirements (optional)
            </Label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((option) => (
                <Badge
                  key={option}
                  variant={dietaryPreferences.includes(option) ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform text-xs px-3 py-1"
                  onClick={() => handleDietaryPreferenceToggle(option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies & Food Restrictions</Label>
            <Textarea
              id="allergies"
              placeholder="Please list any allergies or food restrictions we should know about..."
              value={allergies}
              onChange={(e) => handleAllergiesChange(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Special Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="special-requests">Additional Information (Optional)</Label>
            <Textarea
              id="special-requests"
              placeholder="Any special occasions, accessibility needs, or other requests..."
              value={specialRequests}
              onChange={(e) => handleSpecialRequestsChange(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};