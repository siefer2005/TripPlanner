import { OPENROUTER_API_KEY as ENV_OPENROUTER_API_KEY } from '@env';

export const OPENROUTER_API_KEY = ENV_OPENROUTER_API_KEY;

export type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
};

export const getOptimizedTripContext = (details: any) => {
    if (!details) return 'No details available';


    const simplifiedItinerary = details.itinerary?.map((day: any) => ({
        date: day.date,
        activities: day.activities?.map((act: any) => `${act.title || act.name || 'Activity'} (${act.startTime || ''})`)
    }));

    const placesOfInterest = (details.placesToVisit || []).slice(0, 10).map((p: any) =>
        `${p.name} (${p.types?.[0] || 'Place'})`
    ).join(', ');

    const travelerCount = details.travelers ? details.travelers.length : 1;

    const essentialData = {
        tripName: details.tripName,
        dates: `${details.startDate} to ${details.endDate} (${details.duration || '?'} days)`,
        travelers: `${travelerCount} person(s)`,
        budget: details.budget ? `${details.budget} (Total Limit)` : 'Not set',
        itinerary: simplifiedItinerary,
        placesToVisit: placesOfInterest,
        // expenses: details.expenses // Could add summary here if needed
    };

    return JSON.stringify(essentialData, null, 2);
};

export const generateSystemPrompt = (name: string, userDetails: any, tripDetails: any) => {
    return `You are an expert AI Travel Guide and Trip Planner assisting with a trip named "${name}".

    CONTEXT:
    1. USER PROFILE: 
       - Name: ${userDetails?.name || 'Traveler'}
       - Email: ${userDetails?.email || 'N/A'}
    
    2. TRIP DETAILS (JSON):
       ${getOptimizedTripContext(tripDetails)}

    ROLE & GOAL:
    - Act as a knowledgeable local guide and financial planner.
    - Your goal is to help the user request personalized advice based on their specific itinerary, budget, dates, and group size.

    INSTRUCTIONS:
    instructions:
    1. **Personalization**: Address the user by name. Consider the group size (e.g., recommend family spots if > 2 people).
    2. **Detailed Itineraries**: When planning, break down days by Morning, Afternoon, and Evening.
    3. **Budget Breakdown**: ALWAYS estimate costs for:
       - Food (per meal)
       - Transport (best options for ${tripDetails?.travelers?.length || 1} people)
       - Entry Fees
    4. **Style**: FAIL-SAFE RULE: Do NOT use ANY emojis. Do NOT use special symbols like hashtags or asterisks. Keep text strictly professional, clean, and simple.
    5. **Speech Optimized**: Do NOT include any behavioral descriptions or narration (like *thinking*, *smiling*, *pausing*). Output ONLY the spoken words.
    Help the user visualize their trip and manage their budget effectively.`;
};

export const sendChatRequest = async (messages: Message[]) => {
    // Log key usage for debugging (masked)
    const keyUsed = OPENROUTER_API_KEY;
    console.log(`[AI Service] Key loaded: ${keyUsed ? keyUsed.substring(0, 15) + '...' : 'Undefined'}`);
    console.log(`[AI Service] Sending request using Key: ${keyUsed ? '...' + keyUsed.slice(-6) : 'None'}`);

    const headers = {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://travelplanner.app',
        'X-Title': 'TravelPlanner',
    };

    const attemptFetch = async (model: string) => {
        console.log(`[AI Service] Attempting model: ${model}`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
            }),
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                const textBody = await response.text().catch(() => "No readable response body");
                errorData = { message: `API Error (${response.status}): ${textBody.substring(0, 100)}` };
            }
            console.warn(`[AI Service] Warn with ${model}:`, errorData);
            throw { status: response.status, data: errorData };
        }
        return response.json();
    };

    if (!OPENROUTER_API_KEY) {
        return { error: { message: "API Key is missing. Please check your .env file." } };
    }

    // Prioritize Standard models (require credits/auth) then Free models
    const models = [
        'google/gemini-2.0-flash-exp:free',
        'meta-llama/llama-3.2-3b-instruct:free', // Reliable fallback
    ];

    let lastError: any = null;

    for (const model of models) {
        let retries = 0;
        const MAX_RETRIES = 5;

        while (retries <= MAX_RETRIES) {
            try {
                const data = await attemptFetch(model);

                // Success! Cleanup content
                if (data.choices && data.choices[0]?.message?.content) {
                    data.choices[0].message.content = data.choices[0].message.content.replace(/^(\s*|\s+)/i, '');
                }
                return data;
            } catch (error: any) {
                lastError = error;
                const isRateLimit = error.status === 429;

                if (isRateLimit && retries < MAX_RETRIES) {
                    retries++;
                    const delay = retries * 3000 + Math.random() * 1000; // Average 3.5s, 7s, 10.5s...
                    console.warn(`[AI Service] Rate limited (${model}). Retrying in ${(delay / 1000).toFixed(1)}s... (${retries}/${MAX_RETRIES})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                // If not rate limit or max retries reached, handle logging and break to next model
                const isServerErr = error.status >= 500;
                if (isRateLimit || isServerErr) {
                    console.warn(`[AI Service] Model ${model} failed (${error.status}). Switching or giving up...`);
                } else {
                    console.warn(`[AI Service] Model ${model} error (${error.status}). Unexpected error.`);
                }
                break; // Break retry loop, try next model
            }
        }
    }

    // If we get here, all models failed
    console.warn('[AI Service] All models failed. Last error:', lastError);

    // Provide specific message for Rate Limits
    let finalError = lastError?.data?.error || lastError?.data || { message: "AI Service Unavailable. Please check your internet or API limits." };

    if (lastError?.status === 429) {
        finalError = {
            code: 429,
            message: "Rate limit exceeded. The free AI model is busy or you have hit your limit. Please try again in a moment."
        };
    }

    return {
        error: finalError
    };
};
