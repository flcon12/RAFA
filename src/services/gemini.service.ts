import { Injectable } from '@angular/core';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { Product } from '../data/products';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;
  private chat!: Chat;
  private products: Product[] = [];

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error('API_KEY environment variable not set.');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  initialize(products: Product[]): void {
    this.products = products;
    this.initializeChat();
  }

  private initializeChat(): void {
    const productList = this.products.map(p => `- ${p.name} (${p.description})`).join('\n');

    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are an expert marketing assistant for Falconi Distribuidora, a beverage company.
        Your goal is to help users create compelling marketing content for their products.
        Here is the list of available products:
        ${productList}
        
        When a user asks for content, generate engaging and persuasive copy tailored to the product. For example, you can create:
        1. Social media posts.
        2. Short ad copy.
        3. Sales pitches for different customer types (e.g., restaurants, supermarkets).
        4. Creative product descriptions.
        
        Format your response using clear headings and markdown for emphasis.`,
      },
    });
  }

  async generateChatStream(
    prompt: string,
    history: ChatMessage[]
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    return this.chat.sendMessageStream({ message: prompt });
  }

  async generateImage(prompt: string, isEditedPrompt: boolean = false): Promise<string> {
    try {
      const finalPrompt = isEditedPrompt
        ? prompt
        : `A vibrant, high-resolution marketing image for Falconi beverages, related to: ${prompt}. Professional, clean, eye-catching, and suitable for a premium brand.`;
      
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '16:9',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
      } else {
        throw new Error('No image was generated.');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image. Please try again.');
    }
  }

  async editImage(editPrompt: string, imageBase64: string, mimeType: string): Promise<string> {
    try {
      const detailedPrompt = await this.generateImageEditPrompt(editPrompt, imageBase64, mimeType);
      if (!detailedPrompt) {
        throw new Error('Could not generate a detailed prompt for image editing.');
      }
      return this.generateImage(detailedPrompt, true);
    } catch (error) {
       console.error('Error editing image:', error);
       throw new Error('Failed to edit image. The AI may not have been able to understand the request.');
    }
  }

  private async generateImageEditPrompt(editPrompt: string, imageBase64: string, mimeType: string): Promise<string> {
    const imagePart = {
        inlineData: { data: imageBase64, mimeType },
    };
    const textPart = {
        text: `You are an AI assistant that rewrites prompts for an image generation model.
        Analyze the provided image and the user's editing instruction.
        Your task is to output a new, single, detailed text prompt that describes the *final desired image* for the image generation model.
        Do NOT add any commentary, preamble, or explanation. Only output the final, detailed prompt.

        User instruction: "${editPrompt}"`,
    };

    const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });

    return response.text.trim();
  }
}