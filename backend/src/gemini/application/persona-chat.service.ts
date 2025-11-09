import { Injectable, Logger } from '@nestjs/common';
import { PersonasService } from 'src/db/personas/personas.service';
import type { ChatPayload } from '../domain/interface/response.interface';

@Injectable()
export class PersonaChatService {
  private readonly logger = new Logger(PersonaChatService.name);

  constructor(private readonly personasService: PersonasService) {}

  /**
   * Process mentioned personas and build enhanced chat payload with system prompts
   */
  async processPersonaMentions(payload: ChatPayload): Promise<{
    enhancedPayload: ChatPayload;
    personaIds: string[];
  }> {
    // If no personas mentioned, return original payload
    if (
      !payload.mentioned_persona_ids ||
      payload.mentioned_persona_ids.length === 0
    ) {
      this.logger.log('No personas mentioned in the message');
      return {
        enhancedPayload: payload,
        personaIds: [],
      };
    }

    this.logger.log(
      `Processing ${payload.mentioned_persona_ids.length} mentioned personas`,
    );

    // Fetch personas from database
    const personas = await this.personasService.getPersonasByIds(
      payload.mentioned_persona_ids,
    );

    // Validate: check if all mentioned persona IDs exist
    if (personas.length !== payload.mentioned_persona_ids.length) {
      const foundIds = personas.map((p) => p.id);
      const notFoundIds = payload.mentioned_persona_ids.filter(
        (id) => !foundIds.includes(id),
      );
      this.logger.warn(
        `Some mentioned personas not found: ${notFoundIds.join(', ')}`,
      );
    }

    if (personas.length === 0) {
      this.logger.warn('No valid personas found, using original payload');
      return {
        enhancedPayload: payload,
        personaIds: [],
      };
    }

    // Use the first persona's configuration (since we assume single persona)
    const firstPersona = personas[0];

    this.logger.log(
      `Using persona: ${firstPersona.name} (ID: ${firstPersona.id})`,
    );
    this.logger.log(`Persona model: ${firstPersona.model_used}`);
    this.logger.log(
      `Persona system prompt: ${firstPersona.system_prompt.substring(0, 100)}...`,
    );

    return {
      enhancedPayload: {
        ...payload,
        system_instruction: firstPersona.system_prompt,
        persona_model: firstPersona.model_used,
      },
      personaIds: personas.map((p) => p.id),
    };
  }
}
