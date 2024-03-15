import { Module } from '@nestjs/common';
import { ExecuteController } from './execute.controller';
import { ExecuteService } from './execute.service';
import { FileService } from './files/file.service';

@Module({
  controllers: [ExecuteController],
  providers: [ExecuteService, FileService],
})
export class ExecuteModule {}
