-- CreateTable
CREATE TABLE "LearningPath" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "pathJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonDetail" (
    "id" TEXT NOT NULL,
    "learningPathId" TEXT NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "contentJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearningPath_userId_topic_level_key" ON "LearningPath"("userId", "topic", "level");

-- CreateIndex
CREATE UNIQUE INDEX "LessonDetail_learningPathId_lessonId_key" ON "LessonDetail"("learningPathId", "lessonId");

-- AddForeignKey
ALTER TABLE "LessonDetail" ADD CONSTRAINT "LessonDetail_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;
