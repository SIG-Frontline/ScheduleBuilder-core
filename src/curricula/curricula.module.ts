import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Curricula, CurriculaSchema } from 'schemas/curricula.schema';
import { CurriculaController } from './curricula.controller';
import { CurriculaService } from './curricula.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Curricula.name, schema: CurriculaSchema },
    ]),
  ],
  controllers: [CurriculaController],
  providers: [CurriculaService],
})
export class CurriculaModule {}
