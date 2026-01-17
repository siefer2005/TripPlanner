import { LIVEKIT_API_KEY as ENV_LIVEKIT_KEY, LIVEKIT_API_SECRET as ENV_LIVEKIT_SECRET, OPENROUTER_API_KEY as ENV_OPENROUTER_KEY } from '@env';

export const LIVEKIT_API_KEY = ENV_LIVEKIT_KEY;
export const LIVEKIT_API_SECRET = ENV_LIVEKIT_SECRET;
export const LIVEKIT_WS_URL = 'wss://travelplanner-wwkns8ur.livekit.cloud';

export const OPENROUTER_API_KEY = ENV_OPENROUTER_KEY || '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';

export const SYSTEM_PROMPT = `You are "TravelPlanner AI" - a smart travel assistant.
Rules:
1. **Language**: If the user speaks Hindi, reply in **Native Hindi (Devanagari script)**. If English, reply in English.
2. **Concise**: Max 2-3 sentences.
3. **Friendly**: Be helpful and polite.
4. **No Formatting**: Plain text only.
5. **Context**: Trip planning, budget, itineraries.`;

export type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
};

export const sendChatRequest = async (messages: Message[]) => {
    try {
        const finalMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content }))
        ];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://travelplanner.app',
                'X-Title': 'TravelPlanner',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: finalMessages,
                max_tokens: 150,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenRouter API Error Status:', response.status);
            console.error('OpenRouter API Error Data:', errorData);
            return { error: errorData.error || errorData };
        }

        const data = await response.json();


        if (data.choices && data.choices[0]?.message?.content) {
            data.choices[0].message.content = data.choices[0].message.content.replace(/^(\s*|\s+)/i, '');
        }

        return data;

    } catch (error) {
        console.error('Error in sendChatRequest:', error);
        throw error;
    }
};
