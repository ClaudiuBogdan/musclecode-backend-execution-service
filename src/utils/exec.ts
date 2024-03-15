import { exec as execCmd } from 'child_process';
import { config } from 'src/config';

export interface ExecOptions {
  shouldThrowError?: boolean;
}

export async function exec(
  codePath: string,
  command: string,
  optionsArg: ExecOptions = {},
): Promise<string> {
  const options = {
    shouldThrowError: false,
    ...optionsArg,
  };
  return new Promise((resolve, reject) => {
    execCmd(
      `cd ${codePath} && ${config.isDev ? '' : 'firejail --config=/app/firejail.profile'} ${command}`,
      (error, stdout, stderr) => {
        console.log({ codePath, command, error, stdout, stderr });
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
