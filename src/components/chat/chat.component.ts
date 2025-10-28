
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService, ChatMessage } from '../../services/gemini.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule]
})
export class ChatComponent {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messages = signal<ChatMessage[]>([
    { role: 'model', parts: [{ text: "Hello! How can I help you with marketing content for Falconi products today?" }] }
  ]);
  userInput = signal<string>('');
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private geminiService: GeminiService, private sanitizer: DomSanitizer) {
    effect(() => {
      if (this.messages()) {
        this.scrollToBottom();
      }
    });
  }
  
  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }, 0);
    } catch (err) { }
  }

  formatMessage(text: string): SafeHtml {
    // Basic markdown to HTML conversion
    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>')       // Italic
      .replace(/\n/g, '<br>');                      // Line breaks
    return this.sanitizer.bypassSecurityTrustHtml(formattedText);
  }

  async sendMessage(): Promise<void> {
    const prompt = this.userInput().trim();
    if (!prompt || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.messages.update(m => [...m, { role: 'user', parts: [{ text: prompt }] }]);
    this.userInput.set('');
    
    // Add a placeholder for the model's response
    this.messages.update(m => [...m, { role: 'model', parts: [{ text: '' }] }]);

    try {
      const stream = await this.geminiService.generateChatStream(prompt, this.messages());
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        this.messages.update(currentMessages => {
          const lastMessage = currentMessages[currentMessages.length - 1];
          if (lastMessage.role === 'model') {
            lastMessage.parts[0].text += chunkText;
          }
          return [...currentMessages];
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      this.error.set(errorMessage);
       this.messages.update(m => {
          const lastMessage = m[m.length - 1];
          if (lastMessage.role === 'model' && lastMessage.parts[0].text === '') {
             lastMessage.parts[0].text = `Sorry, I encountered an error: ${errorMessage}`;
          }
          return [...m];
       });
    } finally {
      this.isLoading.set(false);
      this.scrollToBottom();
    }
  }
  
  handleEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
