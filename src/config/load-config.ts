import * as dotenv from 'dotenv';
import { EnvironmentVariables, validate } from './env.validation';

// Load environment variables from .env file
dotenv.config();

let validatedConfig: EnvironmentVariables;

export function loadConfig(): EnvironmentVariables {
  if (!validatedConfig) {
    try {
      validatedConfig = validate(process.env);
    } catch (error) {
      console.error('Configuration validation failed:', error.message);
      process.exit(1);
    }
  }
  return validatedConfig;
}

// Export a singleton instance of the config
export const config = loadConfig();

// Also export the type for use in other files
export type AppConfig = EnvironmentVariables;
