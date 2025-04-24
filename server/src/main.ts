import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs'
import connectRedis from 'connect-redis'
import session from 'express-session'

// Core NestJS module
import { CoreModule } from './core/core.module'

// Custom Redis service
import { RedisService } from './core/redis/redis.service'

// Utility functions
import { ms, type StringValue } from './shared/utils/ms.util'
import { parseBoolean } from './shared/utils/parse-boolean.util'

async function bootstrap() {
  const app = await NestFactory.create(CoreModule, { rawBody: true })

  const config = app.get(ConfigService)
  const redis = app.get(RedisService)

  // Middleware: cookie-parser
  app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

  // Middleware: graphql-upload
  app.use(config.getOrThrow<string>('GRAPHQL_PREFIX'), graphqlUploadExpress())

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  )

  // Get RedisStore constructor from connect-redis
  const RedisStore = connectRedis(session)

  // Session + RedisStore
  app.use(
    session({
      store: new RedisStore({
        client: redis,
        prefix: config.getOrThrow<string>('SESSION_FOLDER'),
        ttl: ms(config.getOrThrow<StringValue>('REDIS_TTL')),
      }),
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        domain: config.getOrThrow<string>('SESSION_DOMAIN'),
        maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
        sameSite: 'lax',
      },
    })
  )

  // Enable CORS
  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })

  // Start the server
  await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
  console.log(`✅ Server is running at: ${config.getOrThrow<string>('APPLICATION_URL')}`)
}

bootstrap()
