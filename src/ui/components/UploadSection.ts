export interface UploadSectionCallbacks {
  onImageSelected: (base64: string) => void;
  onImageCleared: () => void;
  onStartGrading: () => void;
}

export class UploadSection {
  private element: HTMLElement;
  private currentBase64: string | null = null;
  private callbacks: UploadSectionCallbacks;

  constructor(callbacks: UploadSectionCallbacks) {
    this.callbacks = callbacks;
    this.element = this.createElement();
    this.bindEvents();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private createElement(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="dropzone" id="dropArea">
        <div id="previewWrapper" class="preview-container hidden">
          <img id="imagePreview" alt="Folha de respostas" />
          <button id="btnRemovePreview" class="btn-close" title="Remover imagem">✕</button>
        </div>

        <div id="dropPrompt">
          <div style="font-size: 2.25rem; margin-bottom: 0.5rem;">📸</div>
          <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem;">Capturar ou Enviar Imagem do Gabarito</h3>
          <p style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem;">
            Aceita fotos da câmera ou arquivos JPG, PNG e WEBP. Garanta boa iluminação e nitidez.
          </p>
        </div>

        <input type="file" id="fileUploadInput" accept="image/*" capture="environment" class="hidden" />

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
          <label for="fileUploadInput" class="btn btn-primary">
            <span>📷 Tirar Foto / Selecionar Arquivo</span>
          </label>
          <button id="btnTriggerGrading" class="btn btn-success hidden">
            <span>⚡ Iniciar Correção</span>
          </button>
        </div>
      </div>

      <div id="gradingLoader" class="hidden" style="text-align: center; padding: 1.5rem 0;">
        <div class="spinner"></div>
        <p id="loaderMessage" style="font-size: 0.875rem; font-weight: 600; color: var(--text);">
          Iniciando leitura óptica...
        </p>
      </div>
    `;

    return card;
  }

  private bindEvents(): void {
    const fileInput = this.element.querySelector<HTMLInputElement>('#fileUploadInput');
    const previewWrapper = this.element.querySelector<HTMLElement>('#previewWrapper');
    const imagePreview = this.element.querySelector<HTMLImageElement>('#imagePreview');
    const btnRemove = this.element.querySelector('#btnRemovePreview');
    const dropPrompt = this.element.querySelector<HTMLElement>('#dropPrompt');
    const btnGrading = this.element.querySelector<HTMLElement>('#btnTriggerGrading');

    fileInput?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        this.currentBase64 = result;
        if (imagePreview) imagePreview.src = result;
        previewWrapper?.classList.remove('hidden');
        dropPrompt?.classList.add('hidden');
        btnGrading?.classList.remove('hidden');
        this.callbacks.onImageSelected(result);
      };
      reader.readAsDataURL(file);
    });

    btnRemove?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clearImage();
    });

    btnGrading?.addEventListener('click', () => {
      if (this.currentBase64) {
        this.callbacks.onStartGrading();
      }
    });
  }

  public clearImage(): void {
    this.currentBase64 = null;
    const fileInput = this.element.querySelector<HTMLInputElement>('#fileUploadInput');
    const previewWrapper = this.element.querySelector<HTMLElement>('#previewWrapper');
    const dropPrompt = this.element.querySelector<HTMLElement>('#dropPrompt');
    const btnGrading = this.element.querySelector<HTMLElement>('#btnTriggerGrading');

    if (fileInput) fileInput.value = '';
    previewWrapper?.classList.add('hidden');
    dropPrompt?.classList.remove('hidden');
    btnGrading?.classList.add('hidden');
    this.callbacks.onImageCleared();
  }

  public setProcessing(isProcessing: boolean, statusText?: string): void {
    const loader = this.element.querySelector<HTMLElement>('#gradingLoader');
    const loaderMsg = this.element.querySelector<HTMLElement>('#loaderMessage');
    const btnGrading = this.element.querySelector<HTMLElement>('#btnTriggerGrading');

    if (isProcessing) {
      loader?.classList.remove('hidden');
      btnGrading?.classList.add('hidden');
      if (loaderMsg && statusText) loaderMsg.textContent = statusText;
    } else {
      loader?.classList.add('hidden');
      if (this.currentBase64) btnGrading?.classList.remove('hidden');
    }
  }

  public updateStatusMessage(statusText: string): void {
    const loaderMsg = this.element.querySelector<HTMLElement>('#loaderMessage');
    if (loaderMsg) loaderMsg.textContent = statusText;
  }
}
