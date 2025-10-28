import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule]
})
export class ImageEditorComponent {
  private geminiService = inject(GeminiService);
  private sanitizer = inject(DomSanitizer);

  prompt = signal<string>('');
  originalImageUrl = signal<SafeUrl | null>(null);
  originalImageBase64 = signal<string | null>(null);
  originalImageMimeType = signal<string | null>(null);

  editedImageUrl = signal<SafeUrl | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.originalImageMimeType.set(file.type);
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64String = e.target.result.split(',')[1];
        this.originalImageBase64.set(base64String);
        this.originalImageUrl.set(this.sanitizer.bypassSecurityTrustUrl(e.target.result));
        this.editedImageUrl.set(null); // Reset edited image on new upload
      };
      reader.readAsDataURL(file);
    }
  }

  async editImage(): Promise<void> {
    const currentPrompt = this.prompt().trim();
    const image = this.originalImageBase64();
    const mimeType = this.originalImageMimeType();

    if (!currentPrompt || !image || !mimeType || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.editedImageUrl.set(null);

    try {
      const base64Image = await this.geminiService.editImage(currentPrompt, image, mimeType);
      const safeUrl = this.sanitizer.bypassSecurityTrustUrl(`data:image/png;base64,${base64Image}`);
      this.editedImageUrl.set(safeUrl);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      this.error.set(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }
}
