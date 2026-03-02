import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// Note: We use the client-side key for this demo as requested by the architecture.
// In a production app, this should be proxied through a backend.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface IntelligenceReport {
  summary: string;
  alertLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  events: Array<{
    id: string;
    title: string;
    location: string;
    coordinates?: [number, number]; // Lat, Lng
    timestamp: string;
    type: 'MILITARY' | 'DIPLOMATIC' | 'CIVIL' | 'CYBER';
    description: string;
    detailedAnalysis?: string;
  }>;
  stats: Array<{
    label: string;
    value: string;
    trend: 'UP' | 'DOWN' | 'STABLE';
  }>;
  lastUpdated: string;
}

export async function fetchIntelligenceReport(): Promise<IntelligenceReport> {
  try {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Act as a military intelligence analyst. 
      Search for the very latest real-time news and updates regarding conflict, tensions, or military activities involving Iran.
      
      Analyze the search results and generate a structured JSON report.
      
      The report MUST strictly follow this JSON schema:
      {
        "summary": "A concise 2-3 sentence summary of the current situation.",
        "alertLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        "events": [
          {
            "title": "Headline of the event",
            "location": "City or Region name",
            "coordinates": [latitude, longitude], // Estimate coordinates for the location. Example: [35.6892, 51.3890] for Tehran.
            "timestamp": "YYYY-MM-DD HH:MM", // Approximate time of event
            "type": "MILITARY" | "DIPLOMATIC" | "CIVIL" | "CYBER",
            "description": "Brief details (1 sentence)",
            "detailedAnalysis": "In-depth analysis of the event, context, and potential implications (2-3 sentences)."
          }
        ],
        "stats": [
          {
            "label": "Key metric (e.g. 'Reported Casualties', 'Troop Movements', 'Sanctions')",
            "value": "Current number or status",
            "trend": "UP" | "DOWN" | "STABLE"
          }
        ]
      }

      Focus on the last 24-48 hours. If no major active conflict, report on diplomatic tensions or proxy activities.
      Ensure coordinates are provided for every event (approximate center of city/region is fine).
      Return ONLY the JSON object.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from intelligence service");

    // Clean up markdown code blocks if present
    const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();
    
    let data;
    try {
      data = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON:", text);
      throw new Error("Invalid JSON response from intelligence service");
    }

    // Generate stable IDs for events
    const eventsWithIds = data.events?.map((event: any, index: number) => ({
      ...event,
      id: `${event.timestamp?.replace(/[^a-zA-Z0-9]/g, '') || Date.now()}-${index}`
    })) || [];

    return {
      ...data,
      events: eventsWithIds,
      stats: data.stats || [],
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Intelligence gathering failed:", error);
    // Return a fallback state if the API fails (e.g. quota or network)
    return {
      summary: "Intelligence feed temporarily unavailable. Retrying...",
      alertLevel: "LOW",
      events: [],
      stats: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}
