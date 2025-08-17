import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RestaurantImage {
  url: string;
  alt_text: string;
  is_cover: boolean;
}

interface RestaurantGalleryProps {
  images: RestaurantImage[];
  restaurantName: string;
}

export const RestaurantGallery = ({ images, restaurantName }: RestaurantGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Sort images so cover image comes first
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1;
    if (!a.is_cover && b.is_cover) return 1;
    return 0;
  });

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % sortedImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') setIsOpen(false);
  };

  if (sortedImages.length === 0) {
    return (
      <Card className="h-64 flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Ingen bilder tilgjengelig</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold font-heading text-foreground">
        Bilder fra {restaurantName}
      </h2>
      
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedImages.slice(0, 5).map((image, index) => (
          <Dialog key={index} open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button
                onClick={() => {
                  setSelectedImage(index);
                  setIsOpen(true);
                }}
                className={`
                  relative aspect-square overflow-hidden rounded-lg bg-muted hover:opacity-90 transition-smooth focus:outline-none focus:ring-2 focus:ring-primary
                  ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
                `}
              >
                <img
                  src={image.url}
                  alt={image.alt_text || `${restaurantName} bilde ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                {image.is_cover && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Hovedbilde
                  </div>
                )}
              </button>
            </DialogTrigger>

            {/* Lightbox Modal */}
            <DialogContent 
              className="max-w-4xl max-h-[90vh] p-0 bg-black/95 border-none"
              onKeyDown={handleKeyDown}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-6 h-6" />
                </Button>

                {/* Navigation Buttons */}
                {sortedImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-8 h-8" />
                    </Button>
                  </>
                )}

                {/* Main Image */}
                <img
                  src={sortedImages[selectedImage]?.url}
                  alt={sortedImages[selectedImage]?.alt_text || `${restaurantName} bilde ${selectedImage + 1}`}
                  className="max-w-full max-h-full object-contain"
                />

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImage + 1} / {sortedImages.length}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}

        {/* Show More Button */}
        {sortedImages.length > 5 && (
          <button
            onClick={() => {
              setSelectedImage(5);
              setIsOpen(true);
            }}
            className="relative aspect-square overflow-hidden rounded-lg bg-muted/50 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-smooth flex items-center justify-center group"
          >
            <div className="text-center">
              <span className="text-muted-foreground group-hover:text-primary transition-smooth">
                +{sortedImages.length - 5}
              </span>
              <p className="text-xs text-muted-foreground group-hover:text-primary transition-smooth mt-1">
                flere bilder
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};