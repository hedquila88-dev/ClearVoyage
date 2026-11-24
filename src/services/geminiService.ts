import { compressBase64Image } from '../utils/imageOptimization';

export interface ApiKeysConfig {
  primaryKey: string;
  backupKey: string;
  backupProvider: 'gemini' | 'grok' | 'openrouter';
}

export function getClientApiKeys(): ApiKeysConfig {
  try {
    const primaryKey = localStorage.getItem('GEMINI_API_KEY') || '';
    const backupKey = localStorage.getItem('BACKUP_API_KEY') || '';
    const backupProvider = (localStorage.getItem('BACKUP_API_PROVIDER') as any) || 'gemini';
    return { primaryKey, backupKey, backupProvider };
  } catch {
    return { primaryKey: '', backupKey: '', backupProvider: 'gemini' };
  }
}

// In-memory client-side response cache to save tokens on repeated queries
const routeCache = new Map<string, { data: string; timestamp: number }>();
const destinationCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCached(cache: Map<string, { data: string; timestamp: number }>, key: string): string | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(cache: Map<string, { data: string; timestamp: number }>, key: string, data: string) {
  if (cache.size > 50) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

function getAuthHeaders(): Record<string, string> {
  const { primaryKey, backupKey, backupProvider } = getClientApiKeys();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (primaryKey) headers['x-gemini-key'] = primaryKey;
  if (backupKey) {
    headers['x-backup-key'] = backupKey;
    headers['x-backup-provider'] = backupProvider;
  }
  return headers;
}

export async function analyzeRoute(
  from: string, to: string, period: string, currency: string, days: number, language: string,
  estimatedCosts?: { flights: number; accommodation: number; food: number; transport: number; extras: number; }
): Promise<string> {
  const cacheKey = `${from.toLowerCase()}_${to.toLowerCase()}_${period}_${currency}_${days}_${language}_${JSON.stringify(estimatedCosts || {})}`;
  const cached = getCached(routeCache, cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch('/api/analyze-route', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ from, to, period, currency, days, language, estimatedCosts })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to analyze route');
  }

  const data = await response.json();
  if (data.result) {
    setCache(routeCache, cacheKey, data.result);
  }
  return data.result;
}

export async function findDestinations(
  from: string, budget: number, currency: string, period: string, days: number, language: string,
  mode: 'strict' | 'flexible' | 'inspirational' = 'strict'
): Promise<string> {
  const cacheKey = `${from.toLowerCase()}_${budget}_${currency}_${period}_${days}_${language}_${mode}`;
  const cached = getCached(destinationCache, cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch('/api/find-destinations', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ from, budget, currency, period, days, language, mode })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to find destinations');
  }

  const data = await response.json();
  if (data.result) {
    setCache(destinationCache, cacheKey, data.result);
  }
  return data.result;
}

export async function analyzeImage(
  base64Image: string, prompt: string, language: string
): Promise<string> {
  // Compress image to save upload bandwidth and Gemini vision tokens
  const optimizedImage = await compressBase64Image(base64Image);

  const response = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ base64Image: optimizedImage, prompt, language })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to analyze image');
  }

  const data = await response.json();
  return data.result;
}

export async function* createChatStream(
  history: { role: string; parts: { text: string }[] }[], message: string
): AsyncGenerator<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ history, message })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Chat request failed');
  }

  const data = await response.json();
  yield data.result || '';
}
