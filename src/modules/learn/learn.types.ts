// learn.types.ts
export type KnowledgeLevel = 'Complete Beginner' | 'Student' | 'Professional';

export interface LessonContent {
    simpleExplanation: string;
    analogy: string;
    realLifeExample: string;
    keyTakeaways: string[];
}

export interface Lesson {
    id: number;
    title: string;
    content: LessonContent;
    resources: string[];
}

export interface LearningPathJson {
    lessons: Lesson[];
}

export interface GeneratePathRequest {
    topic: string;
    level: KnowledgeLevel;
    userId: string;
}

export interface LessonDetailRequest {
    topic: string;
    level: KnowledgeLevel;
    lessonTitle: string;
    userId: string;
    previousLessonsSummary?: string;
}

export interface LessonDetailJson {
    explanation: string;
    analogy: string;
    realLifeExample: string;
    keyTakeaways: string[];
    exercise: string;
}