import { promises as fs } from 'fs';
import * as path from 'path';
import { FileData } from 'src/execute/interfaces';

export async function createFile(
  file: FileData,
  basePath: string,
): Promise<void> {
  // Remove any path traversal components
  const sanitizedFilename = path.basename(`${file.name}.${file.extension}`);
  const filePath = path.join(basePath, sanitizedFilename);

  if (file.name === '' && file.extension === '') {
    // This is a directory creation request
    await fs.mkdir(basePath, { recursive: true });
    return;
  }

  await fs.writeFile(filePath, file.content);
}

export async function setupTemplateSymlinks(
  templateDir: string,
  targetDir: string,
): Promise<void> {
  // Create target directory if it doesn't exist
  await fs.mkdir(targetDir, { recursive: true });

  // Get all entries in the template directory
  const entries = await fs.readdir(templateDir, { withFileTypes: true });

  // Create symlinks for each entry except src directory
  for (const entry of entries) {
    const srcPath = path.join(templateDir, entry.name);
    const destPath = path.join(targetDir, entry.name);

    // Skip if it's the src directory
    if (entry.name === 'src') continue;

    // Create symlink
    await fs.symlink(srcPath, destPath, entry.isDirectory() ? 'dir' : 'file');
  }

  // Create src directory for user code
  await fs.mkdir(path.join(targetDir, 'src'), { recursive: true });
}
