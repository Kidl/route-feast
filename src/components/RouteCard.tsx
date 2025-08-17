import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Heart, MapPin } from "lucide-react";
import { Restaurant } from "@/data/mockRoutes";
import { BookingDialog } from "./booking/BookingDialog";

interface RouteCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  maxCapacity: number;
  currentBookings: number;
  rating: number;
  restaurants: Restaurant[];
  location: string;
  highlights?: string[];
}

export const RouteCard = ({
  id,
  name,
  description,
  image,
  price,
  duration,
  maxCapacity,
  currentBookings,
  rating,
  restaurants,
  location,
  highlights,
}: RouteCardProps) => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const availableSpots = maxCapacity - currentBookings;

  return (
    <div className="group cursor-pointer">
      {/* Image Container */}
      <div className="relative mb-3">
        <Link to={`/route/${id}`}>
          <img 
            src={image} 
            alt={name}
            className="w-full h-72 object-cover rounded-xl"
          />
        </Link>
        
        {/* Heart Icon */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          className="absolute top-3 right-3 p-2 hover:scale-105 transition-transform"
        >
          <Heart 
            className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'fill-black/50 text-white'}`}
          />
        </button>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white px-2 py-1 rounded-md shadow-sm">
            <span className="text-sm font-semibold">{price} NOK</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1">
        {/* Location and Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-current text-black" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/route/${id}`}>
          <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Duration and Spots */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-sm font-medium">{duration}</span>
          <span>•</span>
          <span>{availableSpots} plasser igjen</span>
        </div>

        {/* Restaurants */}
        <div className="text-sm text-gray-600">
          {restaurants.slice(0, 2).map((r, index) => (
            <span key={index}>
              <span className="hover:text-primary transition-colors cursor-pointer">
                {r.name}
              </span>
              {index < Math.min(restaurants.length, 2) - 1 && ', '}
            </span>
          ))}
          {restaurants.length > 2 && ` +${restaurants.length - 2} flere`}
        </div>

        {/* Book Button */}
        <div className="pt-2">
          <Button
            onClick={(e) => {
              e.preventDefault();
              setBookingOpen(true);
            }}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3"
          >
            Reserver
          </Button>
        </div>
      </div>

      <BookingDialog 
        route={{
          id: id,
          name: name,
          description: description,
          image: image,
          price: price,
          duration: duration,
          maxCapacity: maxCapacity,
          currentBookings: currentBookings,
          rating: rating,
          restaurants: restaurants,
          location: location,
          highlights: highlights
        }}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />
    </div>
  );
};