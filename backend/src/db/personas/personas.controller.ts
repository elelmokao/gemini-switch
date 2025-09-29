import { Controller, Delete, Get, Post, Logger, Body } from '@nestjs/common';
import { PersonasService } from './personas.service';
import type { CreatePersonasDto } from './dto/create_personas.dto';
import { Personas } from './personas.entity';

@Controller('personas')
export class PersonasController {
  private logger: Logger = new Logger(PersonasController.name);
  constructor(private readonly personaService: PersonasService) {}

  @Post()
  create(@Body() createPersonasDto: CreatePersonasDto): Promise<Personas> {
    this.logger.log('Creating a new persona');
    const fullDto = { ...createPersonasDto };
    return this.personaService.createPersona(fullDto);
  }

  @Get()
  findAll() {
    return this.personaService.getAllPersonas();
  }

  @Delete(':id')
  remove(id: string) {
    return this.personaService.deletePersona(id);
  }
}
