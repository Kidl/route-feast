import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (userType: 'guest' | 'registered', data: any) => void;
}

export const AuthDialog = ({ open, onOpenChange, onSuccess }: AuthDialogProps) => {
  const [loading, setLoading] = useState(false);
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

  const handleGuestContinue = async () => {
    if (!guestData.name || !guestData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email to continue",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate guest session setup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess('guest', guestData);
      onOpenChange(false);
      
      toast({
        title: "Welcome!",
        description: "You can now proceed with your booking"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in both email and password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual Supabase authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess('registered', loginData);
      onOpenChange(false);
      
      toast({
        title: "Welcome back!",
        description: "You're now logged in"
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Start Your Booking
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="guest" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guest">Continue as Guest</TabsTrigger>
            <TabsTrigger value="login">Login / Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="guest" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Guest Booking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guest-name">Full Name *</Label>
                  <Input
                    id="guest-name"
                    placeholder="Enter your full name"
                    value={guestData.name}
                    onChange={(e) => setGuestData({...guestData, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guest-email">Email Address *</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    placeholder="your@email.com"
                    value={guestData.email}
                    onChange={(e) => setGuestData({...guestData, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guest-phone">Phone Number (Optional)</Label>
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
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Setting up..." : "Continue as Guest"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Login to Your Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  />
                </div>
                
                <Button 
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Logging in..." : "Login"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  Don't have an account? Registration coming soon!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};