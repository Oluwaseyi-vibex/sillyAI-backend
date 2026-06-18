import { Request, Response, NextFunction } from "express";
import { getOrGenerateLearningPath, getOrGenerateLessonDetail, getAllTopics } from "./learn.service";
import { catchAsync } from "../../utils/catchAsync";
import { successResponse } from "../../utils/response";
export const generatePath = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { topic, level } = req.body;
    const userId = req.user!.userId;

    const path = await getOrGenerateLearningPath({ topic, level, userId });

    res.status(200).json(successResponse({
        message: "Path generated successfully",
        data: path
    }));
});

export const getLessonDetail = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { topic, level, lessonTitle, previousLessonsSummary } = req.body;
    const userId = req.user!.userId;

    const detail = await getOrGenerateLessonDetail({
        topic,
        level,
        lessonTitle,
        userId,
        previousLessonsSummary
    });

    res.status(200).json(successResponse({
        message: "Lesson detail generated successfully",
        data: detail
    }));
});

export const getAllTopicsController = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const lessons = await getAllTopics(userId);
    res.status(200).json(successResponse({
        message: "Topics fetched successfully",
        data: lessons
    }));
});
