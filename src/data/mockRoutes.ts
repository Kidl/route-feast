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
    cuisine: "Moderne nordisk",
    description: "Michelin-stjernet restaurant som fokuserer på økologiske, lokale og bærekraftige ingredienser. Tildelt både Michelin-stjerne og bærekraftskløver.",
    specialties: ["Bærekraftig nordisk mat", "Lokale ingredienser", "Miljøvennlige praksis"],
    michelinMentioned: true
  },
  {
    name: "Sabi Omakase", 
    cuisine: "Japansk sushi",
    description: "Michelin-stjernet sushi-restaurant ledet av kokk Roger Asakil Joya. Tilbyr tradisjonell omakase-opplevelse med ingredienser av høyeste kvalitet.",
    specialties: ["Omakase-opplevelse", "Premium sushi", "Tradisjonelle teknikker"],
    michelinMentioned: true
  },
  {
    name: "Bravo",
    cuisine: "Moderne europeisk",
    description: "À la carte-meny med enkle småretter og snacks. Korttreiste ingredienser som varierer etter sesong. Naturlig vinliste. Nevnt i Michelin Guide.",
    specialties: ["Sesongbaserte ingredienser", "Naturlige viner", "Småretter"],
    michelinMentioned: true
  },
  {
    name: "Bellies",
    cuisine: "Plantebasert",
    description: "Utelukkende plantebasert restaurant som lager fantastiske retter som tilfredsstiller både øyet og ganen. Anbefalt i Michelin Guide.",
    specialties: ["Plantebasert mat", "Kreative presentasjoner", "Bærekraftig spising"],
    michelinMentioned: true
  },
  {
    name: "An Nam",
    cuisine: "Vietnamesisk",
    description: "En middag på An Nam er som en reise gjennom Vietnam, fra rismarker i nord til havner i sør. Østlige krydder og urter kombinert med lokale norske ingredienser.",
    specialties: ["Vietnamesiske smaker", "Lokale norske ingredienser", "Regionale retter"]
  },
  {
    name: "Casa Gio",
    cuisine: "Italiensk",
    description: "Serverer mat laget av kvalitetsingredienser med få kombinasjoner. Fersk pasta, myk ravioli, dampende tagliatelle, risotto og alt det gode forbundet med italiensk mat.",
    specialties: ["Fersk pasta", "Ravioli", "Tradisjonell italiensk"]
  },
  {
    name: "Delicatessen Tapasbar",
    cuisine: "Spansk tapas",
    description: "Slapp av og nyt et glass vin med deilige tapas av mange forskjellige typer. Mat laget for deling i hyggelig selskap rundt et bord eller i baren.",
    specialties: ["Spansk tapas", "Vinutvalg", "Deleretter"]
  },
  {
    name: "Kansui",
    cuisine: "Japansk ramen",
    description: "Serverer byens beste ramen i japansk stil! Flere varianter på menyen. Spis som en japaner og nyt måltidet med lange slurk!",
    specialties: ["Autentisk ramen", "Japansk spisestil", "Ulike ramen-typer"]
  },
  {
    name: "Miyako",
    cuisine: "Asiatisk fusion",
    description: "Asiatisk fusjonskonsept inspirert av flere østasiatiske land. Bredt utvalg av sushi, sashimi, tempura og varme retter, pluss vegetariske og veganske alternativer.",
    specialties: ["Sushi og sashimi", "Tempura", "Vegetariske alternativer"]
  },
  {
    name: "Meze Restaurant",
    cuisine: "Middelhavs",
    description: "Middagsretter og småretter fra middelhavsland servert alene eller sammen for et komplett måltid. Meze er perfekt å dele med venner!",
    specialties: ["Middelhavs mezze", "Deleretter", "Regionale spesialiteter"]
  }
];

export const mockRoutes: Route[] = [
  {
    id: "1",
    name: "Michelin opplevelse Stavanger",
    description: "Legg ut på en prestisjetung kulinarisk reise gjennom Stavangers Michelin-stjernede og Michelin Guide nevnte restauranter. Opplev verdensklasse spising fra bærekraftig nordisk mat til innovative plantebaserte retter.",
    image: michelinImage,
    price: 2199,
    duration: "5 timer",
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
    highlights: ["Michelin-stjernet spising", "Bærekraftige ingredienser", "Premium omakase", "Naturlige viner"]
  },
  {
    id: "2", 
    name: "Asiatisk fusjonreise",
    description: "Oppdag de mangfoldige smakene av Asia i Stavanger. Fra autentisk vietnamesisk mat til tradisjonell japansk ramen og innovativ asiatisk fusion, opplev kontinentets kulinariske mangfold.",
    image: asianImage,
    price: 1299,
    duration: "4 timer",
    maxCapacity: 16,
    currentBookings: 12,
    rating: 4.7,
    restaurants: [
      pedersgataRestaurants.find(r => r.name === "An Nam")!,
      pedersgataRestaurants.find(r => r.name === "Kansui")!,
      pedersgataRestaurants.find(r => r.name === "Miyako")!
    ].filter(Boolean), // Filter out any undefined values
    location: "Pedersgata Area",
    highlights: ["Vietnamesisk reise", "Autentisk ramen", "Asiatisk fusion", "Tradisjonelle teknikker"]
  },
  {
    id: "3",
    name: "Middelhavs klassikere",
    description: "Nyt varmen fra middelhavs kjøkken gjennom Italia, Spania og Midtøsten. Fra håndlaget pasta til autentiske tapas og delerettsstil mezze retter.",
    image: mediterraneanImage,
    price: 1099,
    duration: "3,5 timer",
    maxCapacity: 18,
    currentBookings: 14,
    rating: 4.6,
    restaurants: [
      pedersgataRestaurants.find(r => r.name === "Casa Gio")!,
      pedersgataRestaurants.find(r => r.name === "Delicatessen Tapasbar")!,
      pedersgataRestaurants.find(r => r.name === "Meze Restaurant")!
    ].filter(Boolean), // Filter out any undefined values
    location: "Stavanger Old Town",
    highlights: ["Fersk pasta", "Spansk tapas", "Middelhavs mezze", "Vinparing"]
  }
];