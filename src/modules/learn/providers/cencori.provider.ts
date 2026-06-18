// src/modules/learn/providers/cencori.provider.ts
import { Cencori } from 'cencori';
import { AIProvider } from '../ai-provider.interface';

export class CencoriProvider implements AIProvider {
    private cencori: Cencori;
    private primaryModel: string;
    private fallbackModels: string[];

    constructor() {
        this.cencori = new Cencori({ apiKey: process.env.CENCORI_API_KEY! });
        this.primaryModel = process.env.CENCORI_DEFAULT_MODEL || 'gpt-4o-mini';
        this.fallbackModels = (process.env.CENCORI_FALLBACK_MODEL || 'gpt-3.5-turbo').split(',');
    }

    private async callWithFallback(prompt: string): Promise<any> {
        const modelsToTry = [this.primaryModel, ...this.fallbackModels];
        let lastError: Error | null = null;

        for (const model of modelsToTry) {
            try {
                const response = await this.cencori.ai.chat({
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    maxTokens: 2000,
                });
                let content = response.content;
                content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
                return JSON.parse(content);
            } catch (err: any) {
                lastError = err;
                console.error(`Cencori model ${model} failed:`, err.message);
            }
        }
        throw new Error(`All Cencori models failed. Last error: ${lastError?.message}`);
    }

    async generateLearningPath(prompt: string): Promise<any> {
        return this.callWithFallback(prompt);
    }

    async generateLessonDetail(prompt: string): Promise<any> {
        return this.callWithFallback(prompt);
    }
}