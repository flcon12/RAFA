import { ChangeDetectionStrategy, Component, signal, OnInit, inject } from '@angular/core';
import { ProductsComponent } from './components/products/products.component';
import { ChatComponent } from './components/chat/chat.component';
import { ImageGeneratorComponent } from './components/image-generator/image-generator.component';
import { ImageEditorComponent } from './components/image-editor/image-editor.component';
import { GeminiService } from './services/gemini.service';
import { PRODUCTS } from './data/products';

type View = 'catalog' | 'ai_suite';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductsComponent, ChatComponent, ImageGeneratorComponent, ImageEditorComponent]
})
export class AppComponent implements OnInit {
  private geminiService = inject(GeminiService);

  activeView = signal<View>('catalog');

  ngOnInit(): void {
    this.geminiService.initialize(PRODUCTS);
  }

  setActiveView(view: View): void {
    this.activeView.set(view);
  }
}
