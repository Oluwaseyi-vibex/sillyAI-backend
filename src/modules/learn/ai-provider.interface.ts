// src/modules/learn/ai-provider.interface.ts
export interface AIProvider {
    generateLearningPath(prompt: string, userId?: string): Promise<any>;
    generateLessonDetail(prompt: string, userId?: string): Promise<any>;
}