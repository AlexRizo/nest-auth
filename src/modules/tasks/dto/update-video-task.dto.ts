import { PartialType } from '@nestjs/mapped-types';
import { CreateVideoTaskDto } from './create-video-task.dto';

// videoType sigue siendo obligatorio para que las validaciones @ValidateIf
// de CreateVideoTaskDto sepan qué payload (g1/m1/g2/n3/n4) validar; debe
// coincidir con el videoType ya guardado (VideoTaskService.update lo
// rechaza si no). No se puede migrar una tarea de video entre subtipos.
export class UpdateVideoTaskDto extends PartialType(CreateVideoTaskDto) {}
