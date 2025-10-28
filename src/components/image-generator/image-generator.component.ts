
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-image-generator',
  templateUrl: './image-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule]
})
export class ImageGeneratorComponent {
  prompt = signal<string>('');
  imageUrl = signal<SafeUrl | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private geminiService: GeminiService, private sanitizer: DomSanitizer) {}

  async generateImage(): Promise<void> {
    const currentPrompt = this.prompt().trim();
    if (!currentPrompt || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.imageUrl.set(null);

    try {
      const base64Image = await this.geminiService.generateImage(currentPrompt);
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(base64Image);
      this.imageUrl.set(safeUrl);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      this.error.set(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }
}
