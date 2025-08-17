import michelinImage from "@/assets/route-michelin.jpg";
import asianImage from "@/assets/route-asian.jpg";
import mediterraneanImage from "@/assets/route-mediterranean.jpg";

export interface Restaurant {
  name: string;
  cuisine: string;
  description: string;
  specialties?: string[];
  michelinMentioned?: boolean;
}

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
  restaurants: Restaurant[];
  location: string;
  highlights: string[];
}

export const pedersgataRestaurants: Restaurant[] = [
  {
    name: "Restaurant K2",
    cuisine: "Modern Nordic",
    description: "Michelin-starred restaurant focusing on ecological, local and sustainable ingredients. Awarded both Michelin star and sustainability clover.",
    specialties: ["Sustainable Nordic cuisine", "Local ingredients", "Eco-friendly practices"],
    michelinMentioned: true
  },
  {
    name: "Sabi Omakase", 
    cuisine: "Japanese Sushi",
    description: "Michelin-starred sushi restaurant led by chef Roger Asakil Joya. Offering traditional omakase experience with highest quality ingredients.",
    specialties: ["Omakase experience", "Premium sushi", "Traditional techniques"],
    michelinMentioned: true
  },
  {
    name: "Bravo",
    cuisine: "Modern European",
    description: "À la carte menu with simple small plates and snacks. Short-traveled ingredients that vary by season. Natural wine list. Mentioned in Michelin Guide.",
    specialties: ["Seasonal ingredients", "Natural wines", "Small plates"],
    michelinMentioned: true
  },
  {
    name: "Bellies",
    cuisine: "Plant-Based",
    description: "Exclusively plant-based restaurant creating fantastic dishes that satisfy both the eye and palate. Recommended in Michelin Guide.",
    specialties: ["Plant-based cuisine", "Creative presentations", "Sustainable dining"],
    michelinMentioned: true
  },
  {
    name: "An Nam",
    cuisine: "Vietnamese",
    description: "A dinner at An Nam is like a journey through Vietnam, from rice fields in the north to harbors in the south. Eastern spices and herbs combined with local Norwegian ingredients.",
    specialties: ["Vietnamese flavors", "Local Norwegian ingredients", "Regional dishes"]
  },
  {
    name: "Casa Gio",
    cuisine: "Italian",
    description: "Serves food made from quality ingredients with few combinations. Fresh pasta, soft ravioli, steaming tagliatelle, risotto and all the good things associated with Italian cuisine.",
    specialties: ["Fresh pasta", "Ravioli", "Traditional Italian"]
  },
  {
    name: "Delicatessen Tapasbar",
    cuisine: "Spanish Tapas",
    description: "Relax and enjoy a glass of wine with delicious tapas of many different kinds. Food created for sharing in pleasant company around a table or in the bar.",
    specialties: ["Spanish tapas", "Wine selection", "Sharing dishes"]
  },
  {
    name: "Kansui",
    cuisine: "Japanese Ramen",
    description: "Serves the city's best Japan-style ramen! Several varieties on the menu. Eat like a Japanese and enjoy the meal with long slurps!",
    specialties: ["Authentic ramen", "Japanese dining style", "Various ramen types"]
  },
  {
    name: "Miyako",
    cuisine: "Asian Fusion",
    description: "Asian fusion concept inspired by several eastern Asian countries. Wide selection of sushi, sashimi, tempura and hot dishes, plus vegetarian and vegan options.",
    specialties: ["Sushi & sashimi", "Tempura", "Vegetarian options"]
  },
  {
    name: "Meze Restaurant",
    cuisine: "Mediterranean",
    description: "Dinner dishes and small plates from Mediterranean countries served alone or together for a complete meal. Meze is perfect to share with friends!",
    specialties: ["Mediterranean mezze", "Sharing plates", "Regional specialties"]
  }
];

export const mockRoutes: Route[] = [
  {
    id: "1",
    name: "Michelin Experience Stavanger",
    description: "Embark on a prestigious culinary journey through Stavanger's Michelin-starred and Michelin Guide mentioned restaurants. Experience world-class dining from sustainable Nordic cuisine to innovative plant-based dishes.",
    image: michelinImage,
    price: 2199,
    duration: "5 hours",
    maxCapacity: 12,
    currentBookings: 9,
    rating: 4.9,
    restaurants: [
      pedersgataRestaurants.find(r => r.name === "Restaurant K2")!,
      pedersgataRestaurants.find(r => r.name === "Sabi Omakase")!,
      pedersgataRestaurants.find(r => r.name === "Bravo")!,
      pedersgataRestaurants.find(r => r.name === "Bellies")!
    ].filter(Boolean), // Filter out any undefined values
    location: "Stavanger Sentrum",
    highlights: ["Michelin-starred dining", "Sustainable ingredients", "Premium omakase", "Natural wines"]
  },
  {
    id: "2", 
    name: "Asian Fusion Journey",
    description: "Discover the diverse flavors of Asia in Stavanger. From authentic Vietnamese cuisine to traditional Japanese ramen and innovative Asian fusion, experience the continent's culinary diversity.",
    image: asianImage,
    price: 1299,
    duration: "4 hours",
    maxCapacity: 16,
    currentBookings: 12,
    rating: 4.7,
    restaurants: [
      pedersgataRestaurants.find(r => r.name === "An Nam")!,
      pedersgataRestaurants.find(r => r.name === "Kansui")!,
      pedersgataRestaurants.find(r => r.name === "Miyako")!
    ].filter(Boolean), // Filter out any undefined values
    location: "Pedersgata Area",
    highlights: ["Vietnamese journey", "Authentic ramen", "Asian fusion", "Traditional techniques"]
  },
  {
    id: "3",
    name: "Mediterranean Classics",
    description: "Savor the warmth of Mediterranean cuisine through Italy, Spain, and the Middle East. From handmade pasta to authentic tapas and sharing-style mezze dishes.",
    image: mediterraneanImage,
    price: 1099,
    duration: "3.5 hours", 
    maxCapacity: 18,
    currentBookings: 14,
    rating: 4.6,
    restaurants: [
      pedersgataRestaurants.find(r => r.name === "Casa Gio")!,
      pedersgataRestaurants.find(r => r.name === "Delicatessen Tapasbar")!,
      pedersgataRestaurants.find(r => r.name === "Meze Restaurant")!
    ].filter(Boolean), // Filter out any undefined values
    location: "Stavanger Old Town",
    highlights: ["Fresh pasta", "Spanish tapas", "Mediterranean mezze", "Wine pairings"]
  }
];