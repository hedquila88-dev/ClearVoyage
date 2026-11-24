export enum ViewMode {
  HOME = 'HOME',
  ROUTE_MASTER = 'ROUTE_MASTER',
  CHAT = 'CHAT',
  VISION = 'VISION',
  VISION_RESULT = 'VISION_RESULT',
  HELP = 'HELP',
  TRIP_RESULT = 'TRIP_RESULT',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
  type?: 'text' | 'itinerary_button';
  itineraryData?: {
    location: string;
    period: string;
    city: string;
    currency: string;
    duration: number;
  };
}

export interface DestinationSuggestion {
  city: string;
  country: string;
  totalCost: number;
  flightCost: number;
  accommodationCost: number;
  foodCost: number;
  transportCost: number;
  extrasCost: number;
  reason: string;
  highlights: string[];
  weather: string;
}

export interface DiscoveryResult {
  currency: string;
  suggestions: DestinationSuggestion[];
}

export interface VisionAnalysis {
  locationName: string;
  country: string;
  bestPeriod: string;
  suggestedDuration: number;
  description: string;
  reasonForPeriod: string;
  candidates?: { name: string; probability: number }[];
}

export interface TravelCosts {
  flights: number;
  accommodation: number;
  food: number;
  transport: number;
  extras: number;
}

export interface TravelLogistics {
  destination: string;
  period: string;
  userCurrency: { code: string; symbol: string };
  localCurrency: { code: string; symbol: string };
  safetyWarning?: {
    level: 'CRITICAL' | 'MODERATE' | 'SAFE';
    title: string;
    description: string;
  };
  costs: TravelCosts;
  survival: {
    electricity: { status: string; details: string };
    tapWater: { status: string; details: string };
    safety: { status: string; details: string };
    cashDependency: { status: string; details: string };
    englishLevel: { status: string; details: string };
    laundry: { cost: string; details: string };
    internet: { status: string; details: string };
  };
  timeMatch: {
    crowdScore: number;
    chosenPeriodAnalysis: string;
    smartOptimizer: {
      period: string;
      reason: string;
      savingsPercent: number;
    };
  };
  sweetSpot: {
    bestPeriod: string;
    reason: string;
  };
  weather: {
    tempRange: string;
    condition: string;
  };
  reliability: {
    score: number;
  };
  savingsStrategy: {
    weeklySavings: number;
    strategies: {
      category: string;
      title: string;
      description: string;
    }[];
  };
}
