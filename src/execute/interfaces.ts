import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum CodeLanguage {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  GO = 'go',
}

export enum AlgorithmFileType {
  SOLUTION = 'solution',
  TEST = 'test',
}

export class AlgorithmFile {
  @IsString()
  id: string;
  @IsString()
  name: string;
  @IsString()
  @IsEnum(AlgorithmFileType)
  type: AlgorithmFileType;
  @IsString()
  extension: string;
  @IsString()
  content: string;
  @IsString()
  language: CodeLanguage;
  @IsBoolean()
  @IsOptional()
  readOnly?: boolean;
  @IsBoolean()
  @IsOptional()
  required?: boolean;
}

export class ExecuteCodeDTO {
  @IsString()
  algorithmId: string;

  @IsString()
  language: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlgorithmFile)
  files: AlgorithmFile[];
}

export class TestItem {
  @IsString()
  @IsEnum(['describe', 'it', 'failed', 'passed', 'completedin', 'error'])
  t: 'describe' | 'it' | 'failed' | 'passed' | 'completedin' | 'error';

  @IsString()
  @IsNotEmpty()
  v: string;

  @IsBoolean()
  p: boolean;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestItem)
  items?: TestItem[];
}

export class HiddenStats {
  @IsNumber()
  passed: number;

  @IsNumber()
  failed: number;
}

export class AssertionsStats {
  @IsNumber()
  passed: number;

  @IsNumber()
  failed: number;

  @ValidateNested()
  @Type(() => HiddenStats)
  hidden: HiddenStats;
}

export class SpecsStats {
  @IsNumber()
  passed: number;

  @IsNumber()
  failed: number;

  @ValidateNested()
  @Type(() => HiddenStats)
  hidden: HiddenStats;
}

export class UnweightedStats {
  @IsNumber()
  passed: number;

  @IsNumber()
  failed: number;
}

export class WeightedStats {
  @IsNumber()
  passed: number;

  @IsNumber()
  failed: number;
}

export class TestResult {
  @IsBoolean()
  serverError: boolean;

  @IsBoolean()
  completed: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestItem)
  output: TestItem[];

  @IsString()
  @IsEnum(['assertions'])
  successMode: 'assertions';

  @IsNumber()
  passed: number;

  @IsNumber()
  failed: number;

  @IsNumber()
  errors: number;

  @IsString()
  @IsOptional()
  error: string | null;

  @ValidateNested()
  @Type(() => AssertionsStats)
  assertions: AssertionsStats;

  @ValidateNested()
  @Type(() => SpecsStats)
  specs: SpecsStats;

  @ValidateNested()
  @Type(() => UnweightedStats)
  unweighted: UnweightedStats;

  @ValidateNested()
  @Type(() => WeightedStats)
  weighted: WeightedStats;

  @IsBoolean()
  timedOut: boolean;

  @IsNumber()
  wallTime: number;

  @IsNumber()
  testTime: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags: string[] | null;
}

export interface CodeExecutionResponse {
  type: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  wallTime: number;
  timedOut: boolean;
  message: string;
  token: string;
  result: {
    serverError: boolean;
    completed: boolean;
    output: any[];
    successMode: string;
    passed: number;
    failed: number;
    errors: number;
    error: string | null;
    assertions: {
      passed: number;
      failed: number;
      hidden: { passed: number; failed: number };
    };
    specs: {
      passed: number;
      failed: number;
      hidden: { passed: number; failed: number };
    };
    unweighted: {
      passed: number;
      failed: number;
    };
    weighted: {
      passed: number;
      failed: number;
    };
    timedOut: boolean;
    wallTime: number;
    testTime: number;
    tags: any;
  };
}

export class FileData {
  @IsString()
  id: string;
  @IsString()
  name: string;
  @IsString()
  extension: string;
  @IsString()
  content: string;
}
