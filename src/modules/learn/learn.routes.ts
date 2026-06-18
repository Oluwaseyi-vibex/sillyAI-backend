import { Router } from "express";
import { generatePath, getLessonDetail, getAllTopicsController } from "./learn.controller";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { generatePathSchema, lessonDetailSchema } from "./learn.validation";

const router = Router();

router.post("/generate-path", authenticate, validate(generatePathSchema), generatePath);
router.post("/lesson-detail", authenticate, validate(lessonDetailSchema), getLessonDetail);

router.get("/getAllLesson", authenticate, getAllTopicsController)

export default router;
