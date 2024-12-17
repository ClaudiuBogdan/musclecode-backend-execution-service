import { CodeExecutionResponse } from '../interfaces';
import { CodeExecutionStrategy } from './interfaces';
import { JavaScriptExecutor } from './javascript';
import { PythonExecutor } from './python';
import { TypeScriptExecutor } from './typescript';
import { GoExecutor } from './go';

export async function executeCode(
  codePath: string,
  language: string,
  options?: any,
): Promise<CodeExecutionResponse> {
  let strategy: CodeExecutionStrategy;

  switch (language.toLowerCase()) {
    case 'python':
      strategy = new PythonExecutor();
      break;
    case 'javascript':
      strategy = new JavaScriptExecutor();
      break;
    case 'typescript':
      strategy = new TypeScriptExecutor();
      break;
    case 'go':
      strategy = new GoExecutor();
      break;
    default:
      throw new Error('Unsupported programming language');
  }

  return strategy.execute(codePath, options);
}
