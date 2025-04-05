import { RecommenderController } from './recommender.controller';
import { RecommenderService } from './recommender.service';
import { CourseStaticModule } from 'src/courseStatic/courseStatic.module';
import { CurriculaModule } from 'src/curricula/curricula.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [CourseStaticModule, CurriculaModule],
  controllers: [RecommenderController],
  providers: [RecommenderService],
})
export class RecommenderModule {}
