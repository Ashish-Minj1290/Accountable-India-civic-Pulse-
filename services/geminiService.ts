
import { GoogleGenAI, Type } from "@google/genai";
import { NationalIntel, StateIntel, CivicNotification, LeaderLegalStanding, ElectionIntelligence } from "../types";
import { queryDeepSeekWithSerp } from "./fallbackService";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Robust wrapper to handle Gemini failures and fallback to DeepSeek+SERP
 */
async function executeWithFallback(config: {
  model: string,
  contents: string,
  responseSchema?: any,
  useSearch?: boolean
}) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: config.model,
      contents: config.contents,
      config: {
        tools: config.useSearch ? [{ googleSearch: {} }] : undefined,
        responseMimeType: config.responseSchema ? "application/json" : undefined,
        responseSchema: config.responseSchema,
      }
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title);

    return { data: text, sources, engine: "Gemini" };
  } catch (err: any) {
    console.warn("Gemini Primary Failed, attempting DeepSeek Fallback...", err.message);
    // Fallback logic
    if (config.useSearch) {
      const fallbackResult = await queryDeepSeekWithSerp(config.contents, config.responseSchema);
      return { 
        data: fallbackResult.text, 
        sources: fallbackResult.sources, 
        engine: "DeepSeek+SERP" 
      };
    }
    throw err;
  }
}

export const fetchElectionIntelligence = async (): Promise<{ data: ElectionIntelligence | null; sources: any[] }> => {
  const schema = {
    type: Type.OBJECT,
    properties: {
      records: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["Upcoming", "Ongoing", "Past"] },
            date: { type: Type.STRING },
            type: { type: Type.STRING },
            location: { type: Type.STRING },
            description: { type: Type.STRING },
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  party: { type: Type.STRING },
                  seats: { type: Type.NUMBER },
                  totalSeats: { type: Type.NUMBER },
                  color: { type: Type.STRING }
                },
                required: ["party", "seats", "totalSeats", "color"]
              }
            }
          },
          required: ["id", "title", "status", "date", "type", "location", "description"]
        }
      },
      trends: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            party: { type: Type.STRING },
            currentSentiment: { type: Type.NUMBER },
            predictedSeats: { type: Type.NUMBER },
            pastSeats: { type: Type.NUMBER }
          },
          required: ["party", "currentSentiment", "predictedSeats", "pastSeats"]
        }
      }
    },
    required: ["records", "trends"]
  };

  const result = await executeWithFallback({
    model: "gemini-3-flash-preview",
    contents: "Find real-time Indian election updates (Upcoming, Ongoing, Past) and current sentiment/seat trends for major parties. Provide details for Delhi, UP, and national level where relevant.",
    responseSchema: schema,
    useSearch: true
  });

  return { data: JSON.parse(result.data || "null"), sources: result.sources };
};

export const discoverBatchLeaders = async (excludedNames: string[]): Promise<any[]> => {
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        role: { type: Type.STRING },
        party: { type: Type.STRING },
        constituency: { type: Type.STRING },
        state: { type: Type.STRING },
        sinceYear: { type: Type.NUMBER }
      },
      required: ["name", "role", "party", "constituency", "state", "sinceYear"]
    }
  };

  const result = await executeWithFallback({
    model: "gemini-3-flash-preview",
    contents: `Find 6 prominent Indian political leaders (MPs or MLAs) who are NOT in this list: [${excludedNames.join(', ')}]. Respond with ONLY raw JSON array.`,
    responseSchema: schema,
    useSearch: true
  });

  return JSON.parse(result.data || "[]");
};

export const fetchLeaderLegalStanding = async (name: string, constituency: string): Promise<LeaderLegalStanding | null> => {
  const schema = {
    type: Type.OBJECT,
    properties: {
      totalCases: { type: Type.NUMBER },
      seriousCriminalCases: { type: Type.NUMBER },
      jailHistory: { type: Type.STRING },
      corruptionAllegations: { type: Type.ARRAY, items: { type: Type.STRING } },
      justification: { type: Type.STRING },
    },
    required: ["totalCases", "seriousCriminalCases", "jailHistory", "corruptionAllegations", "justification"]
  };

  const result = await executeWithFallback({
    model: "gemini-3-flash-preview",
    contents: `Analyze legal standing, criminal history, and corruption allegations for Indian leader: ${name} (${constituency}). Cite sources.`,
    responseSchema: schema,
    useSearch: true
  });

  const parsed = JSON.parse(result.data || "null");
  if (!parsed) return null;

  return {
    ...parsed,
    lastUpdated: new Date().toLocaleDateString(),
    verificationSources: result.sources
  };
};

export const fetchCivicNotifications = async (context: {
  state?: string,
  mode: 'Centre' | 'State',
  followedLeaders?: string[]
}): Promise<CivicNotification[]> => {
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        message: { type: Type.STRING },
        category: { type: Type.STRING },
        urgency: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
        source: { type: Type.STRING },
        timestamp: { type: Type.STRING }
      },
      required: ["title", "message", "category", "urgency", "source", "timestamp"]
    }
  };

  const result = await executeWithFallback({
    model: "gemini-3-flash-preview",
    contents: `Generate 4-5 important civic notifications for ${context.state || 'India'}. Date: ${new Date().toLocaleDateString()}`,
    responseSchema: schema,
    useSearch: true
  });

  const notifications = JSON.parse(result.data || "[]");
  return notifications.map((n: any) => ({
    ...n,
    id: Math.random().toString(36).substr(2, 9),
    read: false
  }));
};

export const getDashboardInsights = async (userName: string) => {
  const result = await executeWithFallback({
    model: "gemini-3-flash-preview",
    contents: `Generate 3 short professional Civic Service Insights for ${userName}.`,
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { topic: { type: Type.STRING }, summary: { type: Type.STRING } },
        required: ["topic", "summary"]
      }
    }
  });
  return JSON.parse(result.data || "[]");
};

export const fetchNationalIntelligence = async (): Promise<{ data: NationalIntel | null; sources: any[] }> => {
  const schema = {
    type: Type.OBJECT,
    properties: {
      schemes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, status: { type: Type.STRING }, impact: { type: Type.STRING } }, required: ["title", "status", "impact"] } },
      parliament: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { event: { type: Type.STRING }, description: { type: Type.STRING }, date: { type: Type.STRING } }, required: ["event", "description", "date"] } },
      infrastructure: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { project: { type: Type.STRING }, progress: { type: Type.NUMBER }, details: { type: Type.STRING } }, required: ["project", "progress", "details"] } },
      decisions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { ministry: { type: Type.STRING }, decision: { type: Type.STRING } }, required: ["ministry", "decision"] } },
      impact: { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, highlights: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["summary", "highlights"] }
    },
    required: ["schemes", "parliament", "infrastructure", "decisions", "impact"]
  };

  const result = await executeWithFallback({
    model: "gemini-3-flash-preview",
    contents: "Real-time insights for Central Government of India TODAY.",
    responseSchema: schema,
    useSearch: true
  });

  return { data: JSON.parse(result.data || "null"), sources: result.sources };
};

export const fetchStateIntelligence = async (stateName: string): Promise<{ data: StateIntel | null; sources: any[] }> => {
  const schema = {
    type: Type.OBJECT,
    properties: {
      initiatives: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, status: { type: Type.STRING }, citizenImpact: { type: Type.STRING } }, required: ["title", "status", "citizenImpact"] } },
      performance: { type: Type.OBJECT, properties: { department: { type: Type.STRING }, score: { type: Type.NUMBER }, status: { type: Type.STRING }, summary: { type: Type.STRING } }, required: ["department", "score", "status", "summary"] },
      infrastructure: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { project: { type: Type.STRING }, progress: { type: Type.NUMBER }, delayReason: { type: Type.STRING }, impact: { type: Type.STRING } }, required: ["project", "progress", "impact"] } },
      safety: { type: Type.OBJECT, properties: { overview: { type: Type.STRING }, alerts: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["overview", "alerts"] },
      localIssues: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { issue: { type: Type.STRING }, ward: { type: Type.STRING }, urgency: { type: Type.STRING } }, required: ["issue", "ward", "urgency"] } }
    },
    required: ["initiatives", "performance", "infrastructure", "safety", "localIssues"]
  };

  const result = await executeWithFallback({
    model: "gemini-3-flash-preview",
    contents: `State governance updates for ${stateName} TODAY.`,
    responseSchema: schema,
    useSearch: true
  });

  return { data: JSON.parse(result.data || "null"), sources: result.sources };
};

export const searchPlaceOnMaps = async (query: string, latitude?: number, longitude?: number) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find official Google Maps details for: ${query}.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: latitude && longitude ? { latLng: { latitude, longitude } } : undefined }
      },
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const mapsLinks = groundingChunks
      .filter((chunk: any) => chunk.maps && chunk.maps.uri)
      .map((chunk: any) => ({ uri: chunk.maps.uri, title: chunk.maps.title || 'Location' }));

    return { text, mapsLinks };
  } catch (error) {
    // Maps grounding fallback is generic text search
    return { text: "Location lookup limited.", mapsLinks: [] };
  }
};

export const findNearbyCivicServices = async (latitude: number, longitude: number) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find 5 nearest civic services near my location.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: { latLng: { latitude, longitude } } }
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return groundingChunks
      .filter((chunk: any) => chunk.maps && chunk.maps.uri)
      .map((chunk: any) => ({ name: chunk.maps.title || 'Service', link: chunk.maps.uri }));
  } catch (error) {
    return [];
  }
};

export const searchLeaderInfo = async (query: string) => {
  const result = await executeWithFallback({
    model: "gemini-3-flash-preview",
    contents: query,
    useSearch: true
  });
  return { text: result.data, sources: result.sources };
};

export const discoverLeaderProfile = async (name: string) => {
  const schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      role: { type: Type.STRING },
      party: { type: Type.STRING },
      constituency: { type: Type.STRING },
      state: { type: Type.STRING },
      attendance: { type: Type.NUMBER },
      bills: { type: Type.NUMBER },
      debates: { type: Type.NUMBER },
      questions: { type: Type.NUMBER },
      sinceYear: { type: Type.NUMBER }
    },
    required: ["name", "role", "party", "constituency", "state"]
  };

  const result = await executeWithFallback({
    model: "gemini-3-flash-preview",
    contents: `Find official political profile for ${name} in India.`,
    responseSchema: schema,
    useSearch: true
  });

  return JSON.parse(result.data || "null");
};

export const compareLeadersAI = async (leader1: string, leader2: string) => {
  const result = await executeWithFallback({
    model: "gemini-3-flash-preview",
    contents: `Side-by-side comparison of ${leader1} and ${leader2}.`,
    useSearch: true
  });
  return { text: result.data, sources: result.sources };
};

export const fetchAndVerifyPromises = async (query: string = "latest political manifestos India") => {
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        authority: { type: Type.STRING },
        party: { type: Type.STRING },
        status: { type: Type.STRING },
        category: { type: Type.STRING },
        sourceUrl: { type: Type.STRING }
      },
      required: ["title", "description", "authority", "party", "status", "category", "sourceUrl"]
    }
  };

  const result = await executeWithFallback({
    model: "gemini-3-flash-preview",
    contents: `Search authentic political promises: ${query}`,
    responseSchema: schema,
    useSearch: true
  });

  return { promises: JSON.parse(result.data || "[]"), sources: result.sources };
};

export const fetchLiveEventsAndProjects = async () => {
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING },
        status: { type: Type.STRING },
        date: { type: Type.STRING },
        time: { type: Type.STRING },
        views: { type: Type.NUMBER },
        highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["title", "description", "category", "status", "date", "time", "highlights"]
    }
  };

  const result = await executeWithFallback({
    model: "gemini-3-flash-preview",
    contents: "10 significant political events happening TODAY in India. Respond with ONLY raw JSON.",
    responseSchema: schema,
    useSearch: true
  });

  let text = result.data || "[]";
  if (text.includes('```json')) text = text.split('```json')[1].split('```')[0];
  
  return { data: JSON.parse(text.trim()), sources: result.sources };
};
