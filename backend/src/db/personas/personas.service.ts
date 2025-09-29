import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Personas } from './personas.entity';
import { Repository } from 'typeorm';
import { CreatePersonasDto } from './dto/create_personas.dto';

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Personas)
    private personasRepository: Repository<Personas>,
  ) {}

  async createPersona(createPersonasDto: CreatePersonasDto): Promise<Personas> {
    const newPersona = this.personasRepository.create({
      ...createPersonasDto,
      description: createPersonasDto.description ?? undefined,
      api_key_id: createPersonasDto.api_key_id
        ? { id: createPersonasDto.api_key_id }
        : undefined,
    });
    return this.personasRepository.save(newPersona);
  }

  async getAllPersonas(): Promise<Personas[]> {
    return this.personasRepository.find();
  }

  async getPersonaById(id: string): Promise<Personas | null> {
    return this.personasRepository.findOne({ where: { id } });
  }

  async deletePersona(id: string): Promise<void> {
    await this.personasRepository.delete(id);
  }

  async updatePersona(
    id: string,
    updateData: Partial<Personas>,
  ): Promise<Personas> {
    const updatePersona = await this.getPersonaById(id);
    if (!updatePersona) {
      throw new Error(`Persona with id ${id} not found`);
    }
    await this.personasRepository.update(id, updateData);
    return updatePersona;
  }
}
