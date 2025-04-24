import { ConfigService } from '@nestjs/config'
import * as dotenv from 'dotenv'

dotenv.config() // Loads environment variables from .env

// Determines if we're running in development based on config service
export function isDev(configService: ConfigService) {
  return configService.getOrThrow<string>('NODE_ENV') === 'development'
}

// A direct check for use outside Nest lifecycle
export const IS_DEV_ENV = process.env.NODE_ENV === 'development'
