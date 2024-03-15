import { promises as fs } from 'fs';
import * as path from 'path';
import { FileData } from 'src/execute/interfaces';

export async function createFile(
  file: FileData,
  basePath: string,
): Promise<void> {
  // Remove any path traversal components
  const sanitizedFilename = path.basename(`${file.filename}.${file.extension}`);
  const filePath = path.join(basePath, sanitizedFilename);

  await fs.writeFile(filePath, file.content);
}
