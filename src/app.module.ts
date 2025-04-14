import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SectionModule } from './section/section.module';
import { CurriculaModule } from './curricula/curricula.module';
import { SubjectsModule } from './subjects/subjects.module';
import { UserPlansModule } from './userPlans/userPlans.module';
import { CourseStaticModule } from './courseStatic/courseStatic.module';
import { AuthzModule } from './authz/authz.module';
import { OrganizerModule } from './organizer/organizer.module';
import { RecommenderModule } from './recommender/recommender.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.SCHEDULEBUILDER_DB_URI || '', {
      dbName: process.env.BUILDER_NS,
    }),
    SectionModule,
    CurriculaModule,
    SubjectsModule,
    UserPlansModule,
    CourseStaticModule,
    AuthzModule,
    OrganizerModule,
    RecommenderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
