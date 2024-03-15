import { promises as fs } from 'fs';
import { FileService } from './file.service';

jest.mock('fs', () => {
  return {
    promises: {
      access: jest.fn(),
      writeFile: jest.fn(),
      mkdir: jest.fn(),
      rmdir: jest.fn(),
    },
  };
});

describe('FileService', () => {
  let service: FileService;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(async () => {
    service = new FileService();
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFile', () => {
    it('should create a file with the given content', async () => {});
  });

  describe('removeDirectory', () => {
    it('should remove the specified directory', async () => {
      const userCodePath = 'testDir';
      await service.removeDirectory(userCodePath);

      expect(mockFs.rmdir).toHaveBeenCalledWith(
        expect.stringContaining('testDir'),
        { recursive: true },
      );
    });
  });
});
