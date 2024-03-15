import { Test, TestingModule } from '@nestjs/testing';
import { ExecuteController } from './execute.controller';

describe('ExecuteController', () => {
  let controller: ExecuteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExecuteController],
    }).compile();

    controller = module.get<ExecuteController>(ExecuteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return "execute"', () => {
    expect(
      controller.runCode({
        userId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        userCode: {
          file: {
            id: 'e76faca5-3b50-470e-a1ef-338d16a2567f',
            filename: 'fibonacci.js',
            extension: 'js',
            content:
              '// Recursive Fibonacci implementation\nfunction fibonacci(n) {\n  if (n <= 1) {\n    return n;\n  } else {\n    return fibonacci(n - 1) + fibonacci(n - 2);\n  }\n}',
          },
          functionName: 'fibonacci',
        },
        test: {
          id: '8849b9e0-54e9-466d-a716-05df334d4f55',
          args: [
            {
              id: '0',
              arg: '0',
              expected: '0',
            },
            {
              id: '1',
              arg: '1',
              expected: '1',
            },
            {
              id: '2',
              arg: '10',
              expected: '55',
            },
            {
              id: '3',
              arg: '20',
              expected: '6765',
            },
          ],
        },
        language: 'javascript',
      }),
    ).toBe('execute');
  });
});
