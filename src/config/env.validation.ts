import {
  IsNumber,
  IsString,
  IsOptional,
  IsUrl,
  IsEnum,
  validateSync,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  APP_PORT: number = 3000;

  @IsString()
  @IsOptional()
  APP_NAME?: string;

  @IsString()
  @IsOptional()
  APP_VERSION?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  TRACE_ENDPOINT?: string;

  @IsString()
  @IsOptional()
  LOG_ENDPOINT?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  LOG_BATCH_SIZE: number = 100;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  FLUSH_INTERVAL: number = 5000;

  @IsString()
  @IsOptional()
  LOG_LEVEL: string = 'INFO';

  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
