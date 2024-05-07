import { TestData, TestResult, UserCode } from '../interfaces';

export interface CodeExecutionStrategy {
  execute(codePath: string, options?: any): Promise<CodeExecutionResponse>;
}

export interface FileWriterStrategy {
  write(filePath: string, userCode: UserCode, tests: TestData): Promise<void>;
}

export interface CodeExecutionResponse {
  results: TestResult[];
  passed: boolean;
  error?: string;
}
