import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';
import { SectionsModule } from './sections/sections.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.SCHEDULEBUILDER_DB_URI || '', {
      dbName: 'Schedule_Builder',
    }),
    SectionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
