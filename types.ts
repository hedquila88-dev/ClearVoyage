
export interface TravelLogistics {
  survival: {
    water: string;
    money: string;
    language: string;
    laundry: string;
  };
  costs: {
    flights: number;
    accommodation: number;
    food: number;
    transport: number;
    extras: number;
    localFlights: number;
    localAccommodation: number;
    localFood: number;
    localTransport: number;
    localExtras: number;
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
  userCurrency: {
    code: string;
    symbol: string;
  };
  localCurrency: {
    code: string;
    symbol: string;
  };
  destination: string;
  savingsStrategy: {
    weeklySavings: number;
    strategies: Array<{
      title: string;
      description: string;
      category: 'FOOD' | 'TRANSPORT' | 'LODGING' | 'SHOPPING' | 'ENTERTAINMENT' | 'GENERIC';
    }>;
  };
}

export interface AppState {
  destination: string;
  departure: string;
  duration: number;
  loading: boolean;
  data: TravelLogistics | null;
  error: string | null;
}