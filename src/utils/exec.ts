import { exec as execCmd } from 'child_process';
import { config } from '../config/load-config';
import { StructuredLogger } from 'src/logger/structured-logger.service';

export interface ExecOptions {
  shouldThrowError?: boolean;
  timeoutMs?: number;
}

const logger = new StructuredLogger('Exec');

export async function exec(
  codePath: string,
  command: string,
  optionsArg: ExecOptions = {},
): Promise<string> {
  const options = {
    shouldThrowError: false,
    timeoutMs: 5000, // 5 seconds default timeout
    ...optionsArg,
  };
  return new Promise((resolve, reject) => {
    execCmd(
      `cd ${codePath} && ${config.NODE_ENV === 'development' ? '' : 'firejail --config=/app/firejail.profile'} ${command}`,
      { timeout: options.timeoutMs },
      (error, stdout, stderr) => {
        if (error?.signal === 'SIGTERM') {
          const timeoutError = new Error(
            `Command timed out after ${options.timeoutMs}ms`,
          );
          return reject(timeoutError);
        }

        if (options.shouldThrowError && error) {
          reject(error);
        }
        if (options.shouldThrowError && stderr) {
          reject(stderr);
        }
        logger.debug('stdout', stdout);
        resolve(stdout);
      },
    );
  });
}
