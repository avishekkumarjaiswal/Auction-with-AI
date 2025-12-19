import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    // Ensure API Key is present
    if (!process.env.API_KEY) {
        console.error("API_KEY is missing");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Search Grounding to get real-life stats for a player
 * Using Gemini 3 Flash model for better tool support.
 */
export const getPlayerAnalysis = async (playerName: string) => {
    try {
        const ai = getClient();
        if (!ai) return { text: "AI Service Unavailable", sources: [] };

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Give me a concise 2-sentence auction analysis for cricket player ${playerName}. Include their recent form.`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        // Extract grounding sources if available
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web)
            .filter((web: any) => web) || [];

        return {
            text: response.text || "Analysis currently unavailable.",
            sources: sources
        };
    } catch (error) {
        console.error("Scout Analysis Error:", error);
        return { text: "Analysis unavailable at this moment.", sources: [] };
    }
};