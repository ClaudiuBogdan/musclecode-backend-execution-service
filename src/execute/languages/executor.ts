import { CodeExecutionResponse } from '../interfaces';
import { CodeExecutionStrategy } from './interfaces';
import { JavaScriptExecutor } from './javascript';
import { PythonExecutor } from './python';
import { TypeScriptExecutor } from './typescript';
import { GoExecutor } from './go';
import { StructuredLogger } from 'src/logger/structured-logger.service';

const logger = new StructuredLogger('LanguageExecutor');

export async function executeCode(
  codePath: string,
  language: string,
  options?: any,
): Promise<CodeExecutionResponse> {
  logger.debug('Initializing language execution', {
    language,
    codePath,
    hasOptions: !!options,
  });

  let strategy: CodeExecutionStrategy;

  try {
    switch (language.toLowerCase()) {
      case 'python':
        logger.debug('Selected Python execution strategy');
        strategy = new PythonExecutor();
        break;
      case 'javascript':
        logger.debug('Selected JavaScript execution strategy');
        strategy = new JavaScriptExecutor();
        break;
      case 'typescript':
        logger.debug('Selected TypeScript execution strategy');
        strategy = new TypeScriptExecutor();
        break;
      case 'go':
        logger.debug('Selected Go execution strategy');
        strategy = new GoExecutor();
        break;
      default:
        logger.error(`Unsupported programming language: ${language}`);
        throw new Error('Unsupported programming language');
    }

    logger.debug('Executing code with selected strategy', {
      language,
      strategy: strategy.constructor.name,
    });

    const result = await strategy.execute(codePath, options);

    logger.debug('Code execution completed', {
      language,
      exitCode: result.exitCode,
      hasOutput: !!result.stdout,
      hasErrors: !!result.stderr,
    });

    return result;
  } catch (error) {
    logger.debug('Code execution failed', {
      language,
      errorName: error.name,
      errorMessage: error.message,
      stackTrace: error.stack,
    });
    throw error;
  }
}
