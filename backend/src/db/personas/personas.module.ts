import { Module } from '@nestjs/common';
import { PersonasController } from './personas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personas } from './personas.entity';
import { PersonasService } from './personas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Personas])],
  providers: [PersonasService],
  exports: [PersonasService],
  controllers: [PersonasController],
})
export class PersonasModule {}
