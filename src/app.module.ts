import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';
import { CourseModule } from './courses/courses.module';
import { CurriculaModule } from './curricula/curricula.module';
import { SubjectsModule } from './subjects/subjects.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.SCHEDULEBUILDER_DB_URI || '', {
      dbName: 'Schedule_Builder',
    }),
    CourseModule,
    CurriculaModule,
    SubjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
