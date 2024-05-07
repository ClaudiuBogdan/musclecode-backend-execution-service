import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { FileService } from './files/file.service'; // Adjust the import path as necessary
import { executeCode } from './languages/executor';
import { ExecuteCodeDTO, ExecuteCodeResponse } from './interfaces';

@Injectable()
export class ExecuteService {
  constructor(private readonly fileService: FileService) {}

  async execute(payload: ExecuteCodeDTO): Promise<ExecuteCodeResponse> {
    const basePath = path.resolve('./dist/code'); // TODO: Ensure absolute path
    const filesPath = path.join(
      basePath,
      path.basename(payload.userId),
      path.basename(payload.userCode.file.id),
    );

    // Create files and directories
    await this.fileService.createFiles(filesPath, payload);

    // Execute code
    const { results, passed, error } = await executeCode(
      filesPath,
      payload.language,
    );

    // Delete the files and directories
    // await this.fileService.removeDirectory(filesPath); // TODO: Uncomment this line

    const response: ExecuteCodeResponse = {
      testId: payload.test.id,
      userId: payload.userId,
      results,
      passed,
      error,
    };

    return response;
  }
}
