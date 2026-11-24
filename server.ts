import express from "express";
import path from "path";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Helper to call OpenAI-compatible APIs (xAI Grok or OpenRouter) as fallback
  async function callOpenAICompatible(
    provider: 'grok' | 'openrouter',
    apiKey: string,
    prompt: string,
    systemPrompt?: string,
    jsonMode = false
  ): Promise<string> {
    const endpoint = provider === 'grok' 
      ? 'https://api.x.ai/v1/chat/completions' 
      : 'https://openrouter.ai/api/v1/chat/completions';
    
    const model = provider === 'grok' ? 'grok-beta' : 'google/gemini-2.0-flash-001';

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(provider === 'openrouter' ? {
          'HTTP-Referer': 'https://clearvoyage.local',
          'X-Title': 'ClearVoyage Travel AI'
        } : {})
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {})
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Fallback ${provider} error: ${response.status} - ${errText}`);
    }

    const json = await response.json();
    return json.choices?.[0]?.message?.content || "";
  }

  // Multi-tier generation with Primary Gemini and automatic Backup failover
  async function generateWithFailover(req: express.Request, options: {
    prompt: string;
    systemPrompt?: string;
    responseMimeType?: string;
    base64Image?: string;
    history?: { role: string; parts: { text: string }[] }[];
  }): Promise<string> {
    const primaryKey = (req.headers['x-gemini-key'] as string) || process.env.GEMINI_API_KEY || process.env.API_KEY || "";
    const backupKey = (req.headers['x-backup-key'] as string) || "";
    const backupProvider = ((req.headers['x-backup-provider'] as string) || "gemini") as 'gemini' | 'grok' | 'openrouter';

    if (!primaryKey && !backupKey) {
      throw new Error("No API key configured. Please set your API key in the Setup menu.");
    }

    // Try primary Gemini client first
    if (primaryKey) {
      const ai = new GoogleGenAI({
        apiKey: primaryKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const modelsToTry = ["gemini-4-hydrogen"];
      let lastGeminiErr: any = null;

      for (const model of modelsToTry) {
        try {
          const contents: any[] = [];
          if (options.history) {
            contents.push(...options.history.map((h: any) => ({
              role: h.role === 'model' ? 'model' : 'user',
              parts: h.parts
            })));
          }

          const userParts: any[] = [];
          if (options.base64Image) {
            userParts.push({
              inlineData: {
                data: options.base64Image.split(',')[1] || options.base64Image,
                mimeType: 'image/jpeg'
              }
            });
          }
          userParts.push({ text: options.prompt });
          contents.push({ role: 'user', parts: userParts });

          const resp = await ai.models.generateContent({
            model,
            contents,
            config: options.responseMimeType ? { responseMimeType: options.responseMimeType } : undefined
          });

          if (resp.text) {
            return resp.text;
          }
        } catch (err: any) {
          lastGeminiErr = err;
          console.warn(`[Gemini] Primary model ${model} failed:`, err?.message || err);
        }
      }

      console.warn("[Gemini] Primary key failed all models. Attempting backup failover...");
      if (!backupKey) {
        throw new Error(lastGeminiErr?.message || "Gemini primary key failed and no backup key was provided.");
      }
    }

    // Backup failover
    if (backupKey) {
      try {
        console.log(`[Failover] Invoking backup provider: ${backupProvider}`);
        if (backupProvider === 'gemini') {
          const backupAi = new GoogleGenAI({
            apiKey: backupKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });
          const resp = await backupAi.models.generateContent({
            model: "gemini-4-hydrogen",
            contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
            config: options.responseMimeType ? { responseMimeType: options.responseMimeType } : undefined
          });
          return resp.text || "";
        } else {
          // Grok or OpenRouter
          return await callOpenAICompatible(
            backupProvider,
            backupKey,
            options.prompt,
            options.systemPrompt,
            options.responseMimeType === 'application/json'
          );
        }
      } catch (backupErr: any) {
        console.error("[Failover] Backup provider also failed:", backupErr);
        throw new Error(`Both primary and backup AI failed. (${backupErr.message})`);
      }
    }

    throw new Error("Unable to complete request with available AI configurations.");
  }

  // API Routes
  app.post("/api/analyze-route", async (req, res) => {
    try {
      const { from, to, period, currency, days, language, estimatedCosts } = req.body;
      
      let costPrompt = `All costs in ${currency}. Be precise and realistic.`;
      if (estimatedCosts) {
        costPrompt = `CRITICAL: USE EXACTLY these costs for the 'costs' object — do not recalculate or change them: 
        flights=${estimatedCosts.flights}, 
        stay=${estimatedCosts.accommodation}, 
        food=${estimatedCosts.food}, 
        transport=${estimatedCosts.transport}, 
        extras=${estimatedCosts.extras}. 
        Total must be exactly ${estimatedCosts.flights + estimatedCosts.accommodation + estimatedCosts.food + estimatedCosts.transport + estimatedCosts.extras}.`;
      }

      const prompt = `You are ClearVoyage, a precise travel logistics AI. Analyze a trip from ${from} to ${to} during ${period} for ${days} days. Currency: ${currency}. Language: ${language}.
IMPORTANT: All text fields in the JSON response (descriptions, analysis, tips, strategies, reasons) must be written in this language: ${language}. Only the JSON keys must remain in English.
IMPORTANT: For plugType, always list ALL plug types commonly used in the destination country, separated by commas.
CRITICAL: Your response must start with { and end with }. Do not add any text, greeting, or explanation before or after the JSON object.

Return ONLY a valid JSON object with this exact structure:
{
  "destination": "${to}",
  "destinationWarning": {
    "type": "inaccessible | advisory | null",
    "message": "<explanation of warning or null>",
    "alternativeDestination": "<suggested gateway city if type is inaccessible, else null>"
  },
  "costs": {
    "flights": <number>,
    "flightsLocal": "<amount or nil if same currency>",
    "stay": <number>,
    "stayLocal": "<amount or nil if same currency>",
    "food": <number>,
    "foodLocal": "<amount or nil if same currency>",
    "transport": <number>,
    "transportLocal": "<amount or nil if same currency>",
    "extras": <number>,
    "extrasLocal": "<amount or nil if same currency>"
  },
  "logistics": {
    "weather": { "tempRange": "<min>°C - <max>°C", "description": "<brief weather description>" },
    "reliability": { "score": <0-100>, "description": "<transport reliability description>" },
    "water": { "potable": <true|false>, "description": "<water safety description>" },
    "electricity": { "plugType": "<plug types>", "voltage": "<voltage>", "frequency": "<frequency>" },
    "safety": { "level": "<level>", "description": "<description>" },
    "internet": { "quality": "<quality>", "description": "<description>" },
    "cashDependency": { "level": "<level>", "description": "<description>" },
    "language": { "local": "<lang>", "localLanguages": "<langs>", "englishLevel": "<level>", "description": "<description>" },
    "laundry": { "cost": "<cost>", "description": "<description>" },
    "timeMatch": {
      "chosenPeriodAnalysis": "<analysis>",
      "crowdScore": <1-10>,
      "smartOptimizer": { "period": "<period>", "reason": "<reason>", "savingsPercent": <number> }
    },
    "sweetSpot": { "bestPeriod": "<best>", "reason": "<reason>" },
    "savingsStrategy": {
      "weeklySavings": <number>,
      "weeklySavingsLocal": "<local>",
      "strategies": [
        { "category": "TRANSPORT", "title": "<title>", "description": "<description>" },
        { "category": "FOOD", "title": "<title>", "description": "<description>" },
        { "category": "ENTERTAINMENT", "title": "<title>", "description": "<description>" },
        { "category": "LODGING", "title": "<title>", "description": "<description>" }
      ]
    }
  }
}

${costPrompt}
DESTINATION WARNING RULES:
- Evaluate if ${to} is currently inaccessible or has major travel advisories.
- CRITICAL: "Standard travel" is NOT a warning. If the destination is safe and normal, set "type" and "message" to null. ONLY use "advisory" or "inaccessible" for genuine risks.
- If "inaccessible": choose the best alternative accessible gateway city.
- If "advisory": generate report for ${to} as usual. message should explain specific risks (crime, health, etc.). Do NOT use generic "standard advisory" text.

LOCAL CURRENCY RULES:
- Identify the local currency for the destination. 
- If user currency (${currency}) is DIFFERENT from local currency, provide equivalents.
- IMPORTANT: This includes the 'laundry.cost' field — always provide the equivalent in local currency in parentheses if different, e.g. "£10 (~¥2000)".

CONSISTENCY RULES:
- Round costs to nearest 50.
- Safety Level Mapping: "Very Safe", "Exercise Caution", "Stay Alert", "High Vigilance".
- crowdScore: 1-10.
Return ONLY the JSON, no markdown, no explanation.`;

      const result = await generateWithFailover(req, {
        prompt,
        responseMimeType: 'application/json'
      });

      res.json({ result });
    } catch (error: any) {
      console.error("Route Analysis Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/find-destinations", async (req, res) => {
    try {
      const { from, budget, currency, period, days, language, mode } = req.body;
      
      const budgetRule = mode === 'strict'
        ? `Total cost MUST be between ${Math.round(budget * 0.70)} and ${budget} ${currency}. Never exceed ${budget}. Results should be close to the maximum budget, not far below it.`
        : mode === 'flexible'
        ? `Total cost should be between ${Math.round(budget * 0.80)} and ${Math.round(budget * 1.15)} ${currency}.`
        : `Total cost should be between ${Math.round(budget * 0.90)} and ${Math.round(budget * 1.50)} ${currency}. Prioritize exceptional destinations even if above budget.`;

      const prompt = `You are ClearVoyage Budget Match AI. Find 10 travel destinations from ${from} for ${days} days during ${period}. Budget: ${budget} ${currency}. Mode: ${mode}. Language: ${language}.

${budgetRule}

Return ONLY a valid JSON array with exactly 10 objects:
[{
  "city": "<city name>", "country": "<country name>", "totalCost": <number>,
  "flightCost": <number>, "accommodationCost": <number>, "foodCost": <number>,
  "transportCost": <number>, "extrasCost": <number>,
  "reason": "<why this destination fits>", "weather": "<weather during period>",
  "highlights": ["<highlight 1>", "<highlight 2>", "<highlight 3>"]
}]

All costs in ${currency}. flightCost + accommodationCost + foodCost + transportCost + extrasCost MUST equal totalCost. Return ONLY the JSON array, no markdown, no explanation.`;

      const result = await generateWithFailover(req, {
        prompt,
        responseMimeType: 'application/json'
      });

      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { base64Image, prompt, language } = req.body;
      
      const systemPrompt = `You are ClearVoyage Visual Trip AI. Analyze this travel image and identify the location. Language: ${language}.
      
      RULES:
      - MAX 3-4 lines total.
      - FIRST LINE: "Possibly: [location] (X%)" (even if certain).
      - SECOND LINE: State the best period to visit. BE SPECIFIC and CONCRETE (e.g. "Best time: May-June for pleasant weather" or "Best time: January for Lunar New Year"). DO NOT use vague phrases like "during specific festivals".
      - NO bullet points, NO generic advice, NO markdown lists.
      - CONCLUSION: 1 follow-up question to help plan a trip.
      
      User input context: ${prompt || 'Identify location'}.`;

      const result = await generateWithFailover(req, {
        prompt: systemPrompt,
        base64Image
      });

      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message } = req.body;
      const result = await generateWithFailover(req, {
        prompt: message,
        history
      });
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
