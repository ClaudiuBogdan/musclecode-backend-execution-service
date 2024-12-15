import { CodeExecutionResponse } from '../interfaces';

export interface CodeExecutionStrategy {
  execute(codePath: string, options?: any): Promise<CodeExecutionResponse>;
}

export interface FileWriterStrategy {
  write(filePath: string, code: string): Promise<void>;
}
