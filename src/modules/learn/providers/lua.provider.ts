// src/modules/learn/providers/lua.provider.ts
import { AIProvider } from '../ai-provider.interface';

export class LuaProvider implements AIProvider {
    private agentId: string;
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.agentId = process.env.LUA_AGENT_ID || '';
        this.apiKey = process.env.LUA_API_KEY || '';
        this.baseUrl = process.env.LUA_API_BASE_URL || 'https://api.heylua.ai';

        if (!this.agentId || !this.apiKey) {
            throw new Error(
                'LuaProvider: Missing LUA_AGENT_ID or LUA_API_KEY in environment variables.'
            );
        }
    }

    async generateLearningPath(prompt: string, userId?: string): Promise<any> {
        return this.callLuaAPI(prompt, userId);
    }

    async generateLessonDetail(prompt: string, userId?: string): Promise<any> {
        return this.callLuaAPI(prompt, userId);
    }

    private async callLuaAPI(prompt: string, userId?: string): Promise<any> {
        const url = `${this.baseUrl}/chat/generate/${this.agentId}`;

        const requestBody: any = {
            messages: [{ type: 'text', text: prompt }],
        };

        if (userId) {
            requestBody.runtimeContext = { userId };
        }

        let response: Response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
        } catch (err: any) {
            throw new Error(`LuaProvider network error: ${err.message}`);
        }

        if (!response.ok) {
            let errorDetail = '';
            try {
                const errorBody = await response.text();
                errorDetail = errorBody.slice(0, 300);
            } catch {
                errorDetail = '(unable to read error body)';
            }
            throw new Error(
                `Lua API error (${response.status}): ${errorDetail}`
            );
        }

        let data: any;
        try {
            data = await response.json();
        } catch (err: any) {
            throw new Error(`Invalid JSON response from Lua API: ${err.message}`);
        }

        // The response shape is { text: string, toolCalls?: any[], usage?: {...} }
        if (!data.text || typeof data.text !== 'string') {
            throw new Error('Lua API response missing "text" field or not a string');
        }

        let content = data.text;
        // Remove markdown code fences if present
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');

        try {
            return JSON.parse(content);
        } catch (err: any) {
            throw new Error(`Failed to parse JSON from Lua response: ${err.message}\nRaw content: ${content.slice(0, 200)}`);
        }
    }
}