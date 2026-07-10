import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // ConfigModule is loaded first so all subsequent modules can read env vars.
    // isGlobal: true — ConfigService is injectable everywhere without re-importing.
    // envFilePath: '.env' — explicit path; avoids relying on NODE_ENV conventions.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // PrismaModule is @Global() — provides PrismaService to all feature modules.
    PrismaModule,

    // Feature modules
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
