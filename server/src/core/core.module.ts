// src/core/core.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule} from './prisma/prisma.module'; // your custom Prisma module
import { getGraphQLConfig } from './config/graphql.config'; // your custom GraphQL config function

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: getGraphQLConfig,
      inject: [ConfigService],
    }),
    PrismaModule,
  ],
  exports: [GraphQLModule, PrismaModule], // Export so others can use them too
})
export class CoreModule {}
