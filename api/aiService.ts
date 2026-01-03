export const OPENROUTER_API_KEY = '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';

export type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
};

export const getOptimizedTripContext = (details: any) => {
    if (!details) return 'No details available';

    // Extract only essential information to save tokens
    const simplifiedItinerary = details.itinerary?.map((day: any) => ({
        date: day.date,
        activities: day.activities?.map((act: any) => act.title || act.name || 'Activity')
    }));

    const essentialData = {
        tripName: details.tripName,
        startDate: details.startDate,
        endDate: details.endDate,
        budget: details.budget,
        itinerary: simplifiedItinerary,
        notes: (details.placesToVisit || []).slice(0, 5).map((p: any) => p.name).join(', ')
    };

    return JSON.stringify(essentialData);
};

export const generateSystemPrompt = (name: string, userDetails: any, tripDetails: any) => {
    return `You are a helpful travel assistant for a trip named "${name}". 
                            
    CONTEXT:
    1. USER: ${userDetails?.name || 'Unknown'} (${userDetails?.email || 'N/A'})
    
    2. TRIP SUMMARY:
       ${getOptimizedTripContext(tripDetails)}
    
    INSTRUCTIONS:
    - Answer questions based on the itinerary and budget.
    - Avoid using special characters and symbols.
    - Avoid using complex language.
    - Have some space between sentences.
    - Keep responses concise.`;
};

export const sendChatRequest = async (messages: Message[]) => {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://travelplanner.app', // Required by OpenRouter
                'X-Title': 'TravelPlanner', // Required by OpenRouter
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                transforms: ["middle-out"], // Request compression from OpenRouter
                messages: messages.map(m => ({ role: m.role, content: m.content })),
            }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in sendChatRequest:', error);
        throw error;
    }
};
