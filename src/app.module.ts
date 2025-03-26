import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CourseModule } from './courses/courses.module';
import { CurriculaModule } from './curricula/curricula.module';
import { SubjectsModule } from './subjects/subjects.module';
import { UserPlansModule } from './userPlans/userPlans.module';
import { CourseStaticModule } from './courseStatic/courseStatic.module';
import { RecommenderModule } from './recommender/recommender.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.SCHEDULEBUILDER_DB_URI || '', {
      dbName: process.env.BUILDER_NS,
    }),
    CourseModule,
    CurriculaModule,
    SubjectsModule,
    UserPlansModule,
    CourseStaticModule,
    RecommenderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
