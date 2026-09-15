-- CreateEnum
CREATE TYPE "TaskTypeEnum" AS ENUM ('DESIGN', 'VIDEO', 'EVENT', 'POST');

-- CreateEnum
CREATE TYPE "TaskPriorityEnum" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatusEnum" AS ENUM ('PENDING', 'IN_ATTENTION', 'IN_PROGRESS', 'FOR_REVIEW', 'DONE');

-- CreateEnum
CREATE TYPE "EventStatusEnum" AS ENUM ('PENDING', 'SCHEDULED', 'ATTENDING', 'FINISHED');

-- CreateEnum
CREATE TYPE "EventRequirementEnum" AS ENUM ('PHOTOGRAPHY', 'VIDEO', 'REEL', 'OTHER');

-- CreateEnum
CREATE TYPE "DesignTypeEnum" AS ENUM ('DIGITAL', 'PRINTED', 'VINYL', 'SHIRT', 'OTHER');

-- CreateEnum
CREATE TYPE "DesignOrientationEnum" AS ENUM ('HORIZONTAL', 'VERTICAL');

-- CreateEnum
CREATE TYPE "DesignDetailEnum" AS ENUM ('SOCIAL_MEDIA', 'INSTITUTIONAL_ADVERTISING', 'BROCHURE', 'POSTER', 'FLYER', 'PRESENTATION_CARD', 'TRIFOLD');

-- CreateEnum
CREATE TYPE "ShirtPrintTypeEnum" AS ENUM ('FLAT_INKS', 'SUBLIMATION');

-- CreateEnum
CREATE TYPE "SocialNetworkEnum" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "VideoTypeEnum" AS ENUM ('REEL_G1', 'REEL_M1', 'REEL_G2', 'VIDEO_N3', 'VIDEO_N4');

-- CreateEnum
CREATE TYPE "VideoAttachmentTypeEnum" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "VideoSceneG2KindEnum" AS ENUM ('INTRODUCTION', 'PARTICIPANTS', 'METHODOLOGY', 'RESULTS', 'EXPERIENCES', 'CLOSING');

-- CreateEnum
CREATE TYPE "VideoN4FocusEnum" AS ENUM ('PROMOTION', 'SOCIAL_MEDIA', 'INTERNAL_PROJECT', 'OTHER');

-- CreateEnum
CREATE TYPE "VideoSizePresetEnum" AS ENUM ('REEL_VERTICAL', 'FEED_HORIZONTAL', 'FHD_HORIZONTAL');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "TaskTypeEnum" NOT NULL,
    "priority" "TaskPriorityEnum" NOT NULL DEFAULT 'NORMAL',
    "status" "TaskStatusEnum" NOT NULL DEFAULT 'PENDING',
    "authorId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTask" (
    "taskId" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" "EventStatusEnum" NOT NULL DEFAULT 'PENDING',
    "requirements" "EventRequirementEnum"[],

    CONSTRAINT "EventTask_pkey" PRIMARY KEY ("taskId")
);

-- CreateTable
CREATE TABLE "DesignTask" (
    "taskId" TEXT NOT NULL,
    "designType" "DesignTypeEnum" NOT NULL,
    "orientation" "DesignOrientationEnum",
    "detail" "DesignDetailEnum",
    "size" TEXT,
    "printType" "ShirtPrintTypeEnum",
    "inkCount" INTEGER,

    CONSTRAINT "DesignTask_pkey" PRIMARY KEY ("taskId")
);

-- CreateTable
CREATE TABLE "PostTask" (
    "taskId" TEXT NOT NULL,
    "postTitle" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "socialNetworks" "SocialNetworkEnum"[],
    "referenceTaskId" TEXT,

    CONSTRAINT "PostTask_pkey" PRIMARY KEY ("taskId")
);

-- CreateTable
CREATE TABLE "VideoTask" (
    "taskId" TEXT NOT NULL,
    "videoType" "VideoTypeEnum" NOT NULL,

    CONSTRAINT "VideoTask_pkey" PRIMARY KEY ("taskId")
);

-- CreateTable
CREATE TABLE "VideoAttachment" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "VideoAttachmentTypeEnum" NOT NULL,
    "videoTaskG1Id" TEXT,
    "videoSceneM1Id" TEXT,
    "videoSceneG2Id" TEXT,
    "videoSceneN3Id" TEXT,
    "videoTaskN4Id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoTaskG1" (
    "videoTaskId" TEXT NOT NULL,
    "promptAnswers" JSONB NOT NULL,
    "script" TEXT,

    CONSTRAINT "VideoTaskG1_pkey" PRIMARY KEY ("videoTaskId")
);

-- CreateTable
CREATE TABLE "VideoTaskM1" (
    "videoTaskId" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "participants" TEXT NOT NULL,
    "subject" TEXT NOT NULL,

    CONSTRAINT "VideoTaskM1_pkey" PRIMARY KEY ("videoTaskId")
);

-- CreateTable
CREATE TABLE "VideoSceneM1" (
    "id" TEXT NOT NULL,
    "videoTaskM1Id" TEXT NOT NULL,
    "sceneOrder" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "script" TEXT,

    CONSTRAINT "VideoSceneM1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoTaskG2" (
    "videoTaskId" TEXT NOT NULL,

    CONSTRAINT "VideoTaskG2_pkey" PRIMARY KEY ("videoTaskId")
);

-- CreateTable
CREATE TABLE "VideoSceneG2" (
    "id" TEXT NOT NULL,
    "videoTaskG2Id" TEXT NOT NULL,
    "kind" "VideoSceneG2KindEnum" NOT NULL,
    "activity" TEXT NOT NULL,
    "script" TEXT,

    CONSTRAINT "VideoSceneG2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoTaskN3" (
    "videoTaskId" TEXT NOT NULL,

    CONSTRAINT "VideoTaskN3_pkey" PRIMARY KEY ("videoTaskId")
);

-- CreateTable
CREATE TABLE "VideoSceneN3" (
    "id" TEXT NOT NULL,
    "videoTaskN3Id" TEXT NOT NULL,
    "sceneOrder" INTEGER NOT NULL,
    "script" TEXT NOT NULL,

    CONSTRAINT "VideoSceneN3_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoTaskN4" (
    "videoTaskId" TEXT NOT NULL,
    "idea" TEXT NOT NULL,
    "focus" "VideoN4FocusEnum" NOT NULL,
    "sizePreset" "VideoSizePresetEnum",
    "customWidth" INTEGER,
    "customHeight" INTEGER,

    CONSTRAINT "VideoTaskN4_pkey" PRIMARY KEY ("videoTaskId")
);

-- CreateTable
CREATE TABLE "_TaskAssignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaskAssignees_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Task_spaceId_idx" ON "Task"("spaceId");

-- CreateIndex
CREATE INDEX "Task_authorId_idx" ON "Task"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSceneM1_videoTaskM1Id_sceneOrder_key" ON "VideoSceneM1"("videoTaskM1Id", "sceneOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSceneG2_videoTaskG2Id_kind_key" ON "VideoSceneG2"("videoTaskG2Id", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSceneN3_videoTaskN3Id_sceneOrder_key" ON "VideoSceneN3"("videoTaskN3Id", "sceneOrder");

-- CreateIndex
CREATE INDEX "_TaskAssignees_B_index" ON "_TaskAssignees"("B");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTask" ADD CONSTRAINT "EventTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignTask" ADD CONSTRAINT "DesignTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTask" ADD CONSTRAINT "PostTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTask" ADD CONSTRAINT "PostTask_referenceTaskId_fkey" FOREIGN KEY ("referenceTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTask" ADD CONSTRAINT "VideoTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAttachment" ADD CONSTRAINT "VideoAttachment_videoTaskG1Id_fkey" FOREIGN KEY ("videoTaskG1Id") REFERENCES "VideoTaskG1"("videoTaskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAttachment" ADD CONSTRAINT "VideoAttachment_videoSceneM1Id_fkey" FOREIGN KEY ("videoSceneM1Id") REFERENCES "VideoSceneM1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAttachment" ADD CONSTRAINT "VideoAttachment_videoSceneG2Id_fkey" FOREIGN KEY ("videoSceneG2Id") REFERENCES "VideoSceneG2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAttachment" ADD CONSTRAINT "VideoAttachment_videoSceneN3Id_fkey" FOREIGN KEY ("videoSceneN3Id") REFERENCES "VideoSceneN3"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoAttachment" ADD CONSTRAINT "VideoAttachment_videoTaskN4Id_fkey" FOREIGN KEY ("videoTaskN4Id") REFERENCES "VideoTaskN4"("videoTaskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTaskG1" ADD CONSTRAINT "VideoTaskG1_videoTaskId_fkey" FOREIGN KEY ("videoTaskId") REFERENCES "VideoTask"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTaskM1" ADD CONSTRAINT "VideoTaskM1_videoTaskId_fkey" FOREIGN KEY ("videoTaskId") REFERENCES "VideoTask"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSceneM1" ADD CONSTRAINT "VideoSceneM1_videoTaskM1Id_fkey" FOREIGN KEY ("videoTaskM1Id") REFERENCES "VideoTaskM1"("videoTaskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTaskG2" ADD CONSTRAINT "VideoTaskG2_videoTaskId_fkey" FOREIGN KEY ("videoTaskId") REFERENCES "VideoTask"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSceneG2" ADD CONSTRAINT "VideoSceneG2_videoTaskG2Id_fkey" FOREIGN KEY ("videoTaskG2Id") REFERENCES "VideoTaskG2"("videoTaskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTaskN3" ADD CONSTRAINT "VideoTaskN3_videoTaskId_fkey" FOREIGN KEY ("videoTaskId") REFERENCES "VideoTask"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSceneN3" ADD CONSTRAINT "VideoSceneN3_videoTaskN3Id_fkey" FOREIGN KEY ("videoTaskN3Id") REFERENCES "VideoTaskN3"("videoTaskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoTaskN4" ADD CONSTRAINT "VideoTaskN4_videoTaskId_fkey" FOREIGN KEY ("videoTaskId") REFERENCES "VideoTask"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskAssignees" ADD CONSTRAINT "_TaskAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskAssignees" ADD CONSTRAINT "_TaskAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
