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
}

export class ExecuteCodeDTO {
  @IsString()
  @IsNotEmpty()
  submissionId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @IsEnum(CodeLanguage)
  language: CodeLanguage;
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

export class CodeExecutionResponse {
  @IsString()
  @IsEnum(['execution success', 'execution error'])
  type: 'execution success' | 'execution error';

  @IsString()
  stdout: string;

  @IsString()
  stderr: string;

  @IsNumber()
  exitCode: number;

  @IsNumber()
  wallTime: number;

  @IsBoolean()
  timedOut: boolean;

  @IsString()
  message: string;

  @IsString()
  token: string;

  @ValidateNested()
  @Type(() => TestResult)
  result: TestResult;
}

export class FileData {
  @IsString()
  id: string;
  @IsString()
  filename: string;
  @IsString()
  extension: string;
  @IsString()
  content: string;
}
