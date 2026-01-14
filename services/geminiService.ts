import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TravelLogistics } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getCityNameFromCoords(lat: number, lon: number, lang: string = 'en'): Promise<string> {
  const prompt = `Identify the city and country for these coordinates: ${lat}, ${lon}. Return ONLY the "City, Country" string in language "${lang}" (e.g. "Rome, Italy" or "Roma, Italia"). No other text.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  } catch (error) {
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  }
}

export async function getTravelLogistics(
  destination: string, 
  departure: string, 
  period: string, 
  currency: string, 
  language: string
): Promise<TravelLogistics> {
  
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      destination: { type: Type.STRING },
      survival: {
        type: Type.OBJECT,
        properties: {
          water: { type: Type.STRING },
          money: { type: Type.STRING },
          language: { type: Type.STRING },
          laundry: { type: Type.STRING },
        },
        required: ["water", "money", "language", "laundry"],
      },
      costs: {
        type: Type.OBJECT,
        properties: {
          flights: { type: Type.NUMBER },
          accommodation: { type: Type.NUMBER },
          food: { type: Type.NUMBER },
          transport: { type: Type.NUMBER },
          extras: { type: Type.NUMBER },
          localFlights: { type: Type.NUMBER },
          localAccommodation: { type: Type.NUMBER },
          localFood: { type: Type.NUMBER },
          localTransport: { type: Type.NUMBER },
          localExtras: { type: Type.NUMBER },
        },
        required: ["flights", "accommodation", "food", "transport", "extras", "localFlights", "localAccommodation", "localFood", "localTransport", "localExtras"],
      },
      timeMatch: {
        type: Type.OBJECT,
        properties: {
          crowdScore: { type: Type.NUMBER },
          chosenPeriodAnalysis: { type: Type.STRING },
          smartOptimizer: {
             type: Type.OBJECT,
             properties: {
                period: { type: Type.STRING },
                reason: { type: Type.STRING },
                savingsPercent: { type: Type.NUMBER },
             },
             required: ["period", "reason", "savingsPercent"]
          }
        },
        required: ["crowdScore", "chosenPeriodAnalysis", "smartOptimizer"]
      },
      sweetSpot: {
         type: Type.OBJECT,
         properties: {
            bestPeriod: { type: Type.STRING },
            reason: { type: Type.STRING },
         },
         required: ["bestPeriod", "reason"]
      },
      weather: {
        type: Type.OBJECT,
        properties: {
          tempRange: { type: Type.STRING },
          condition: { type: Type.STRING }
        },
        required: ["tempRange", "condition"]
      },
      reliability: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER }
        },
        required: ["score"]
      },
      userCurrency: {
         type: Type.OBJECT,
         properties: { code: { type: Type.STRING }, symbol: { type: Type.STRING } },
         required: ["code", "symbol"]
      },
      localCurrency: {
         type: Type.OBJECT,
         properties: { code: { type: Type.STRING }, symbol: { type: Type.STRING } },
         required: ["code", "symbol"]
      },
      savingsStrategy: {
        type: Type.OBJECT,
        properties: {
          weeklySavings: { type: Type.NUMBER },
          strategies: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ["FOOD", "TRANSPORT", "LODGING", "SHOPPING", "ENTERTAINMENT", "GENERIC"] }
                },
                required: ["title", "description", "category"]
            }
          }
        },
        required: ["weeklySavings", "strategies"]
      }
    },
    required: ["destination", "survival", "costs", "timeMatch", "sweetSpot", "weather", "reliability", "userCurrency", "localCurrency", "savingsStrategy"],
  };

  const prompt = `You are "ClearVoyage", an expert assistant in meticulous travel logistics and minimalist travel.
Analyze a trip from ${departure} to ${destination} specifically for the period: "${period}". 
The user wants to see all costs in "${currency}".

Answer exclusively in the "${language}" language (for all text descriptions).

CRITICAL INSTRUCTIONS FOR ACCURACY:
1. **COST BASIS - 7 DAY BASELINE**: 
   - 'flights': Provide the average Round-Trip flight cost.
   - 'accommodation', 'food', 'transport', 'extras': Provide the cost for exactly **7 DAYS (1 WEEK)** for 1 person.
   - Even if the period implies a different duration, ALWAYS normalize costs to a 1-week baseline so the app can calculate daily rates correctly.
2. **LOCATIONS**: 
   - Departure: ${departure} (Infer the main airport/hub).
   - Destination: ${destination} (Infer the main city/center, and return this confirmed name in the 'destination' field).
3. **REALISM**: 
   - Use real-world pricing for a "Minimalist but Comfortable" traveler (e.g., 3-star hotel/Airbnb, mix of street food/restaurants, public transport).
   - If "${period}" is invalid, ambiguous, or a city name, assume "Next Month" and mention this in 'chosenPeriodAnalysis'.
4. **CURRENCY**: 
   - Output 'costs' in ${currency}.
   - Output 'local' fields in the destination's actual local currency.
5. **SAVINGS STRATEGY**:
   - Provide between 3 and 5 specific, high-impact savings strategies for this specific destination in the 'strategies' array.
   - Assign a category (FOOD, TRANSPORT, LODGING, etc.) to each.
6. **RELIABILITY SCORE (0-100)**:
   - Evaluate public transport based on: **Punctuality, Safety, Coverage, and Frequency**.
   - **90-100**: Exceptional (e.g., Tokyo, Zurich).
   - **75-89**: Reliable/Good (e.g., London, Berlin).
   - **50-74**: Mixed/Variable (e.g., Rome, NYC).
   - **<50**: Poor/Unreliable (Limited infrastructure).
7. **SURVIVAL**:
   - 'language': Primary spoken language(s) and English proficiency.
8. **RESPONSE**: strictly JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text) as TravelLogistics;
}