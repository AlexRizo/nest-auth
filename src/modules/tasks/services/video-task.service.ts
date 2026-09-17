import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, VideoTypeEnum } from '@prisma/client';
import { CreateVideoTaskDto } from '../dto/create-video-task.dto';
import { UpdateVideoTaskDto } from '../dto/update-video-task.dto';

@Injectable()
export class VideoTaskService {
  async create(
    tx: Prisma.TransactionClient,
    taskId: string,
    dto: CreateVideoTaskDto,
  ) {
    await tx.videoTask.create({
      data: { taskId, videoType: dto.videoType },
    });

    switch (dto.videoType) {
      case VideoTypeEnum.REEL_G1:
        if (!dto.g1) throw new BadRequestException('Falta el payload "g1"');
        return tx.videoTaskG1.create({
          data: {
            videoTaskId: taskId,
            promptAnswers: dto.g1.promptAnswers as Prisma.InputJsonValue,
          },
        });

      case VideoTypeEnum.REEL_M1:
        if (!dto.m1) throw new BadRequestException('Falta el payload "m1"');
        return tx.videoTaskM1.create({
          data: {
            videoTaskId: taskId,
            place: dto.m1.place,
            participants: dto.m1.participants,
            subject: dto.m1.subject,
            scenes: {
              createMany: {
                data: dto.m1.scenes.map((scene) => ({
                  sceneOrder: scene.sceneOrder,
                  prompt: scene.prompt,
                })),
              },
            },
          },
        });

      case VideoTypeEnum.REEL_G2:
        if (!dto.g2) throw new BadRequestException('Falta el payload "g2"');
        return tx.videoTaskG2.create({
          data: {
            videoTaskId: taskId,
            scenes: {
              createMany: {
                data: dto.g2.scenes.map((scene) => ({
                  kind: scene.kind,
                  activity: scene.activity,
                })),
              },
            },
          },
        });

      case VideoTypeEnum.VIDEO_N3:
        if (!dto.n3) throw new BadRequestException('Falta el payload "n3"');
        return tx.videoTaskN3.create({
          data: {
            videoTaskId: taskId,
            scenes: {
              createMany: {
                data: dto.n3.scenes.map((scene) => ({
                  sceneOrder: scene.sceneOrder,
                  script: scene.script,
                })),
              },
            },
          },
        });

      case VideoTypeEnum.VIDEO_N4:
        if (!dto.n4) throw new BadRequestException('Falta el payload "n4"');
        return tx.videoTaskN4.create({
          data: {
            videoTaskId: taskId,
            idea: dto.n4.idea,
            focus: dto.n4.focus,
            sizePreset: dto.n4.sizePreset,
            customWidth: dto.n4.customWidth,
            customHeight: dto.n4.customHeight,
          },
        });
    }
  }

  async update(
    tx: Prisma.TransactionClient,
    taskId: string,
    dto: UpdateVideoTaskDto,
  ) {
    const videoTask = await tx.videoTask.findUnique({
      where: { taskId },
      select: { videoType: true },
    });

    if (!videoTask) return;

    if (dto.videoType && dto.videoType !== videoTask.videoType) {
      throw new BadRequestException(
        'No se puede cambiar el videoType de una tarea de video existente',
      );
    }

    switch (videoTask.videoType) {
      case VideoTypeEnum.REEL_G1:
        if (!dto.g1) return;
        return tx.videoTaskG1.update({
          where: { videoTaskId: taskId },
          data: {
            promptAnswers: dto.g1.promptAnswers as Prisma.InputJsonValue,
          },
        });

      case VideoTypeEnum.REEL_M1:
        if (!dto.m1) return;
        await tx.videoSceneM1.deleteMany({
          where: { videoTaskM1Id: taskId },
        });
        return tx.videoTaskM1.update({
          where: { videoTaskId: taskId },
          data: {
            place: dto.m1.place,
            participants: dto.m1.participants,
            subject: dto.m1.subject,
            scenes: {
              createMany: {
                data: dto.m1.scenes.map((scene) => ({
                  sceneOrder: scene.sceneOrder,
                  prompt: scene.prompt,
                })),
              },
            },
          },
        });

      case VideoTypeEnum.REEL_G2:
        if (!dto.g2) return;
        await tx.videoSceneG2.deleteMany({
          where: { videoTaskG2Id: taskId },
        });
        return tx.videoTaskG2.update({
          where: { videoTaskId: taskId },
          data: {
            scenes: {
              createMany: {
                data: dto.g2.scenes.map((scene) => ({
                  kind: scene.kind,
                  activity: scene.activity,
                })),
              },
            },
          },
        });

      case VideoTypeEnum.VIDEO_N3:
        if (!dto.n3) return;
        await tx.videoSceneN3.deleteMany({
          where: { videoTaskN3Id: taskId },
        });
        return tx.videoTaskN3.update({
          where: { videoTaskId: taskId },
          data: {
            scenes: {
              createMany: {
                data: dto.n3.scenes.map((scene) => ({
                  sceneOrder: scene.sceneOrder,
                  script: scene.script,
                })),
              },
            },
          },
        });

      case VideoTypeEnum.VIDEO_N4:
        if (!dto.n4) return;
        return tx.videoTaskN4.update({
          where: { videoTaskId: taskId },
          data: {
            idea: dto.n4.idea,
            focus: dto.n4.focus,
            sizePreset: dto.n4.sizePreset,
            customWidth: dto.n4.customWidth,
            customHeight: dto.n4.customHeight,
          },
        });
    }
  }
}
