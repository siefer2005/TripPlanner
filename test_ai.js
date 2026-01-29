
const fetch = require('node-fetch');

const OPENROUTER_API_KEY = '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';

const runTest = async () => {
    try {
        const models = [
            'google/gemini-2.0-flash-exp:free',
            'meta-llama/llama-3.2-3b-instruct:free'
        ];

        for (const model of models) {
            console.log(`Testing model: ${model}`);
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://travelplanner.app',
                    'X-Title': 'TravelPlanner',
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: 'Say hello' }],
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`Success with ${model}:`, JSON.stringify(data.choices[0].message, null, 2));
                return;
            } else {
                const text = await response.text();
                console.error(`Failed with ${model}: ${response.status} - ${text}`);
            }
        }
        console.error('All models failed.');

    } catch (error) {
        console.error('Test execution error:', error);
    }
};

runTest();
