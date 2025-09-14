import { Controller, Get } from '@nestjs/common';
import { Body, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GeminiService } from '../../application/gemini.service';
import { GenAiResponse } from '../..//domain/interface/response.interface';
import { GenerateTextDto } from './dto/generate-text.dto';

@ApiTags('Gemini')
@Controller('gemini')
export class GeminiController {
  constructor(private service: GeminiService) {}
}
