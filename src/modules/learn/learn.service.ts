// learn.service.ts
import { PrismaClient } from '@prisma/client';
import { getAIProvider } from './ai-provider.factory';
import { LearningPathJson, LessonDetailJson, GeneratePathRequest, LessonDetailRequest } from './learn.types';

const prisma = new PrismaClient();
const aiProvider = getAIProvider();

function getLevelInstruction(level: string): string {
    switch (level) {
        case 'Complete Beginner':
            return 'Explain like the user has zero prior knowledge. Use very simple words, frequent analogies, and avoid jargon.';
        case 'Student':
            return 'Assume the user is a high school or college student with some basic understanding. Provide clear definitions, structured explanations.';
        case 'Professional':
            return 'Assume the user works in a related field. Focus on practical applications, advanced concepts, and nuanced insights.';
        default:
            return '';
    }
}

export async function getOrGenerateLearningPath(req: GeneratePathRequest): Promise<LearningPathJson> {
    const { userId, topic, level } = req;

    // Check DB cache
    const existing = await prisma.learningPath.findUnique({
        where: { userId_topic_level: { userId, topic, level } },
    });
    if (existing) return existing.pathJson as unknown as LearningPathJson;

    const levelInstruction = getLevelInstruction(level);
    const prompt = `
You are an expert curriculum designer.
Generate a learning path for the topic: "${topic}".
User level: "${level}".
${levelInstruction}

Return ONLY valid JSON with this exact structure:
{
  "lessons": [
    {
      "id": 1,
      "title": "...",
      "content": {
        "simpleExplanation": "...",
        "analogy": "...",
        "realLifeExample": "...",
        "keyTakeaways": ["...","...","..."]
      },
      "resources": []
    },
    ... exactly 6 lessons. Last lesson MUST be "Resources" with external links.
  ]
}

Titles sequence: 1) what is ${topic}? 2) why ${topic}? 3) how does ${topic} work? 4) core concepts explained 5) real-world applications 6) resources.
`;

    const pathJson = await aiProvider.generateLearningPath(prompt, userId);
    if (!pathJson.lessons || pathJson.lessons.length !== 6) {
        throw new Error('Generated path does not contain exactly 6 lessons');
    }

    await prisma.learningPath.create({
        data: { userId, topic, level, pathJson: pathJson as any },
    });

    return pathJson;
}

export async function getOrGenerateLessonDetail(req: LessonDetailRequest): Promise<LessonDetailJson> {
    const { userId, topic, level, lessonTitle, previousLessonsSummary } = req;

    let learningPath = await prisma.learningPath.findUnique({
        where: { userId_topic_level: { userId, topic, level } },
    });

    if (!learningPath) {
        await getOrGenerateLearningPath({ userId, topic, level });
        learningPath = await prisma.learningPath.findUnique({
            where: { userId_topic_level: { userId, topic, level } },
        })!;

        if (!learningPath) {
            throw new Error("Failed to retrieve learning path after generating it");
        }
    }

    const path = learningPath.pathJson as unknown as LearningPathJson;
    const lesson = path.lessons.find(l => l.title.toLowerCase() === lessonTitle.toLowerCase());
    if (!lesson) throw new Error(`Lesson "${lessonTitle}" not found`);

    const lessonId = lesson.id;
    const existingDetail = await prisma.lessonDetail.findUnique({
        where: { learningPathId_lessonId: { learningPathId: learningPath.id, lessonId } },
    });
    if (existingDetail) return existingDetail.contentJson as unknown as LessonDetailJson;

    const levelInstruction = getLevelInstruction(level);
    const context = previousLessonsSummary ? `Previous: ${previousLessonsSummary}\n` : '';

    const prompt = `
You are a patient tutor.
Topic: "${topic}"
User level: "${level}"
Lesson: "${lessonTitle}"
${context}
${levelInstruction}

Generate a complete lesson with:
- Clear explanation
- Analogy
- Real-life example
- Three key takeaways
- Interactive exercise

Return JSON:
{
  "explanation": "...",
  "analogy": "...",
  "realLifeExample": "...",
  "keyTakeaways": ["...","...","..."],
  "exercise": "..."
}
`;

    const detailJson = await aiProvider.generateLessonDetail(prompt, userId);
    if (!detailJson.explanation) throw new Error('Generated lesson missing required fields');

    await prisma.lessonDetail.create({
        data: { learningPathId: learningPath.id, lessonId, contentJson: detailJson as any },
    });

    return detailJson;
}

export async function getAllTopics(userId: string) {
    const topics = await prisma.learningPath.findMany({
        where: { userId },
        select: { topic: true, level: true, lessons: true, createdAt: true, pathJson: true }
    });
    return topics;
}
