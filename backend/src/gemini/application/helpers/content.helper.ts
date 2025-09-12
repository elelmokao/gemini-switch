import { Content } from '@google/generative-ai';

export function createContent(text: string): Content[] {
// creates the content for the model
  return [
    {
      role: 'user',
      parts: [
        {
          text,
        },
      ],
    },
  ];
}
