// learn.validation.ts
import { z } from 'zod';

export const generatePathSchema = z.object({
    body: z.object({
        topic: z.string().min(1, 'Topic is required'),
        level: z.enum(['Complete Beginner', 'Student', 'Professional']),
    })
});

export const lessonDetailSchema = z.object({
    body: z.object({
        topic: z.string().min(1),
        level: z.enum(['Complete Beginner', 'Student', 'Professional']),
        lessonTitle: z.string().min(1),
        previousLessonsSummary: z.string().optional(),
    })
});

