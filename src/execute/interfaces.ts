import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  ValidateNested,
  IsObject,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FileData {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  extension: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UserCode {
  @IsObject()
  @ValidateNested()
  @Type(() => FileData)
  file: FileData;

  @IsString()
  @IsNotEmpty()
  functionName: string;
}

export class TestArg {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  arg: string;

  @IsString()
  expected: string;
}

export class TestData {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileData)
  @IsOptional()
  customTests?: FileData[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestArg)
  args: TestArg[];
}

export class ExecuteCodeDTO {
  @IsString()
  @IsNotEmpty()
  submissionId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => UserCode)
  userCode: UserCode;

  @IsObject()
  @ValidateNested()
  @Type(() => TestData)
  test: TestData;

  @IsString()
  @IsNotEmpty()
  language: string;
}

export class TestResult {
  @IsString()
  id: string;

  @IsBoolean()
  passed: boolean;

  @IsString()
  @IsOptional()
  error?: string;
}

export class ExecuteCodeResponse {
  @IsString()
  @IsNotEmpty()
  submissionId: string;

  @IsString()
  @IsNotEmpty()
  testId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestResult)
  results: TestResult[];

  @IsBoolean()
  passed: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TestResult)
  customResults?: TestResult[];

  @IsString()
  @IsOptional()
  error?: string;
}
