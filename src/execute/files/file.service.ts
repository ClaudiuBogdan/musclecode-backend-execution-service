import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { ExecuteCodeDTO } from '../interfaces';
import { FileWriterStrategy } from '../languages/interfaces';
import { PythonFileWriter } from '../languages/python';
import { JavaScriptFileWriter } from '../languages/javascript';
import { TypeScriptFileWriter } from '../languages/typescript/test';
import { GoFileWriter } from '../languages/go';

@Injectable()
export class FileService {
  constructor() {}

  async createFiles(
    userCodePath: string,
    payload: ExecuteCodeDTO,
  ): Promise<void> {
    await this.ensureDirectoryExists(userCodePath);
    const language = payload.language;

    const languageMap: Record<string, FileWriterStrategy> = {
      python: new PythonFileWriter(),
      javascript: new JavaScriptFileWriter(),
      typescript: new TypeScriptFileWriter(),
      go: new GoFileWriter(),
    };

    const strategy: FileWriterStrategy | undefined =
      languageMap[language.toLowerCase()];

    if (!strategy) {
      throw new Error('Unsupported programming language');
    }

    // Handle code writing based on the payload
    if (payload.code) {
      await strategy.write(userCodePath, payload.code);
    } else {
      throw new Error('No code or files provided');
    }
  }

  async removeDirectory(userCodePath: string): Promise<void> {
    try {
      await fs.rm(userCodePath, { recursive: true });
    } catch (error) {
      console.error('Error removing directory:', error);
    }
  }

  private async ensureDirectoryExists(userCodePath: string): Promise<void> {
    try {
      await fs.mkdir(userCodePath, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }
  }
}
