import { exec as execCmd } from 'child_process';
import { config } from 'src/config';

export interface ExecOptions {
  shouldThrowError?: boolean;
  timeoutMs?: number;
}

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
      `cd ${codePath} && ${config.isDev ? '' : 'firejail --config=/app/firejail.profile'} ${command}`,
      { timeout: options.timeoutMs },
      (error, stdout, stderr) => {
        if (error?.signal === 'SIGTERM') {
          const timeoutError = new Error(
            `Command timed out after ${options.timeoutMs}ms`,
          );
          if (options.shouldThrowError) {
            reject(timeoutError);
          } else {
            resolve(''); // Return empty string on timeout if not throwing
          }
          return;
        }

        if (options.shouldThrowError && error) {
          reject(error);
        }
        if (options.shouldThrowError && stderr) {
          reject(stderr);
        }
        resolve(stdout);
      },
    );
  });
}
