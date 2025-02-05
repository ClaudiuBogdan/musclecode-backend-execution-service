import {
  IsNumber,
  IsString,
  IsOptional,
  IsUrl,
  IsEnum,
  validateSync,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';
import { LogLevel } from 'src/logger/interfaces';

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

  @IsEnum(LogLevel)
  @IsOptional()
  LOG_LEVEL: LogLevel = LogLevel.Info;

  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;

  // New fields for Kubernetes and host metadata
  @IsString()
  @IsOptional()
  HOSTNAME?: string;

  @IsString()
  @IsOptional()
  K8S_CLUSTER_NAME?: string;

  @IsString()
  @IsOptional()
  K8S_DEPLOYMENT_NAME?: string;

  @IsString()
  @IsOptional()
  K8S_NAMESPACE?: string;

  @IsString()
  @IsOptional()
  K8S_POD_NAME?: string;
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
