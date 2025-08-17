import nordicImage from "@/assets/route-nordic.jpg";
import seafoodImage from "@/assets/route-seafood.jpg";
import urbanImage from "@/assets/route-urban.jpg";

export interface Route {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  maxCapacity: number;
  currentBookings: number;
  rating: number;
  restaurants: string[];
  location: string;
}

export const mockRoutes: Route[] = [
  {
    id: "1",
    name: "Nordic Heritage Experience",
    description: "Journey through Norway's culinary heritage with traditional dishes reimagined by master chefs. Experience the essence of Nordic cuisine with locally sourced ingredients and time-honored techniques.",
    image: nordicImage,
    price: 1299,
    duration: "4 hours",
    maxCapacity: 16,
    currentBookings: 12,
    rating: 4.9,
    restaurants: ["Maaemo", "Statholdergaarden", "Restaurant Schrøder", "Fru Hagen"],
    location: "Oslo City Center"
  },
  {
    id: "2", 
    name: "Coastal Seafood Trail",
    description: "Discover the freshest seafood along Oslo's waterfront. From traditional fish markets to innovative seafood restaurants, taste the ocean's bounty prepared by renowned chefs.",
    image: seafoodImage,
    price: 899,
    duration: "3.5 hours",
    maxCapacity: 20,
    currentBookings: 15,
    rating: 4.7,
    restaurants: ["Lofoten Fiskerestaurant", "Rorbua", "Tjuvholmen Sjømagasin", "Fiskeriet"],
    location: "Aker Brygge & Tjuvholmen"
  },
  {
    id: "3",
    name: "Modern Fusion Discovery",
    description: "Experience Oslo's innovative dining scene where traditional Norwegian ingredients meet international culinary techniques. A perfect blend of creativity and tradition.",
    image: urbanImage,
    price: 1099,
    duration: "4.5 hours", 
    maxCapacity: 14,
    currentBookings: 11,
    rating: 4.8,
    restaurants: ["Kontrast", "Cru", "Arakataka", "Brutus"],
    location: "Grünerløkka & Vulkan"
  }
];