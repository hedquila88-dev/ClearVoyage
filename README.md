# ✈️ ClearVoyage
> Precision Travel Logistics & Budget Optimization AI
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5-4285F4.svg)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8.svg)](https://tailwindcss.com/)
ClearVoyage is an intelligent travel planning platform powered by Google Gemini. It eliminates guesswork by providing concrete budget breakdowns, crowd analysis, multimodal visual destination recognition, and survival logistics with dual-provider API failover.
View on Google AI Studio: [ClearVoyage App](https://aistudio.google.com/apps/837cfdf8-ebdb-4103-83bb-951864290fbd?showAssistant=true&showPreview=true)
---
## ⚡ Key Features
- **🗺️ Route Master**: Detailed cost modeling (flights, stay, food, transport, extras) in local and target currencies, destination warnings, and dynamic duration scaling.
- **💰 Budget Match**: Discovers curated destinations strictly matched to your financial ceiling (Strict, Flexible, or Inspirational modes).
- **📸 Visual Trip (Multimodal Vision)**: Upload or take a photo of any landmark or scenery to identify locations, best travel seasons, and interactive itinerary generation.
- **🧭 Survival Logistics**: Instant checks for power plug types, water potability, safety rating, internet quality, cash dependency, and language barriers.
- **📊 Smart Optimizer & Sweet Spot**: Algorithmic suggestions to find dates with the best compromise between lower crowd scores and cheaper pricing.
- **🔑 Dual-Provider API Failover**: In-browser API key manager supporting a primary Gemini key and automated fallback (xAI Grok, OpenRouter, or a secondary Gemini key) upon rate limit (429) errors.
---
## 🚀 Quick Start (Local Setup)
### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Google AI Studio API Key](https://aistudio.google.com/app/apikey)
### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/hedquila88-dev/ClearVoyage.git
cd ClearVoyage
npm install

  
2. Environment Configuration

  

Create a .env.local file in the root directory:


  
env
GEMINI_API_KEY=your_gemini_api_key_here

  

(You can also set or change your keys directly in the web UI using the Key icon in the top header).


  
3. Run Development Server

  
bash
npm run dev

  

Open your browser at http://localhost:3000.


  

  
🔒 Privacy & Security

  

API keys are stored exclusively in your browser's local storage or server environment and sent directly to Google Gemini and backup endpoints without intermediate telemetry.


  
