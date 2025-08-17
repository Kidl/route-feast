import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Copy, 
  QrCode, 
  Check,
  Facebook,
  Twitter,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
}

interface MenuShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant;
}

export const MenuShareDialog = ({ open, onOpenChange, restaurant }: MenuShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const menuUrl = `${window.location.origin}/restaurants/${restaurant.id}/menu`;
  const shareText = `Sjekk ut menyen til ${restaurant.name} på GastroRoute!`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      toast({
        title: "Lenke kopiert!",
        description: "Menulenken er kopiert til utklippstavlen.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Kunne ikke kopiere",
        description: "Prøv å kopiere lenken manuelt.",
        variant: "destructive"
      });
    }
  };

  const shareOnPlatform = (platform: string) => {
    const encodedUrl = encodeURIComponent(menuUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const generateQRCode = () => {
    // In a real implementation, you would use a QR code library like qrcode
    // For now, we'll show a placeholder
    toast({
      title: "QR-kode",
      description: "QR-kode funksjonalitet kommer snart!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Del meny
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Restaurant Info */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-foreground">{restaurant.name}</h3>
            <p className="text-sm text-muted-foreground">{restaurant.address}, {restaurant.city}</p>
            <Badge variant="outline" className="mt-2">Digital meny</Badge>
          </div>

          {/* Copy Link */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Del lenke
            </label>
            <div className="flex gap-2">
              <Input
                value={menuUrl}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="px-3"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Social Sharing */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Del på sosiale medier
            </label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2 justify-center"
                onClick={() => shareOnPlatform('facebook')}
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 justify-center"
                onClick={() => shareOnPlatform('twitter')}
              >
                <Twitter className="w-4 h-4 text-blue-400" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 justify-center"
                onClick={() => shareOnPlatform('whatsapp')}
              >
                <MessageCircle className="w-4 h-4 text-green-600" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div>
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-center"
              onClick={generateQRCode}
            >
              <QrCode className="w-4 h-4" />
              Generer QR-kode for meny
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              QR-koden kan skannes for direkte tilgang til menyen
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};