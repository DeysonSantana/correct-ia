import { StorageService } from '../../services/storage/StorageService';
import { VisionConfig, VisionEngineType } from '../../types/vision';

export class SettingsModal {
  private element: HTMLElement;
  private onSaveCallback: (config: VisionConfig) => void;

  constructor(onSave: (config: VisionConfig) => void) {
    this.onSaveCallback = onSave;
    this.element = this.createModalElement();
    document.body.appendChild(this.element);
    this.bindEvents();
  }

  private createModalElement(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay hidden';
    overlay.id = 'settingsModal';

    const currentConfig = StorageService.getVisionConfig();

    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 style="font-weight: 700; font-size: 1.125rem;">⚙️ Configuração do Provedor de Visão</h3>
          <button id="btnCloseModal" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem;">✕</button>
        </div>
        <p style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem;">
          Escolha entre simulação offline ou chaves de IA Multimodal. As chaves são gravadas somente no LocalStorage do seu navegador.
        </p>

        <div class="form-group">
          <label class="form-label" for="selectEngine">Mecanismo de Visão:</label>
          <select id="selectEngine" class="form-control">
            <option value="simulated">⚡ Simulação Rápida (Offline / Demonstração)</option>
            <option value="gemini">✨ Google Gemini 1.5 Flash (API Oficial)</option>
            <option value="openai">🤖 OpenAI GPT-4o Vision</option>
          </select>
        </div>

        <div class="form-group ${currentConfig.engine === 'simulated' ? 'hidden' : ''}" id="apiKeyGroup">
          <label class="form-label" for="inputApiKey">Chave de API (API Key):</label>
          <input type="password" id="inputApiKey" class="form-control" placeholder="Insira sua chave de API aqui..." />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem;">
          <button id="btnCancelModal" class="btn btn-outline">Cancelar</button>
          <button id="btnSaveModal" class="btn btn-primary">Salvar Configuração</button>
        </div>
      </div>
    `;

    const select = overlay.querySelector<HTMLSelectElement>('#selectEngine');
    const input = overlay.querySelector<HTMLInputElement>('#inputApiKey');
    if (select) select.value = currentConfig.engine;
    if (input && currentConfig.apiKey) input.value = currentConfig.apiKey;

    return overlay;
  }

  private bindEvents(): void {
    const select = this.element.querySelector<HTMLSelectElement>('#selectEngine');
    const input = this.element.querySelector<HTMLInputElement>('#inputApiKey');
    const apiKeyGroup = this.element.querySelector<HTMLElement>('#apiKeyGroup');
    const btnClose = this.element.querySelector('#btnCloseModal');
    const btnCancel = this.element.querySelector('#btnCancelModal');
    const btnSave = this.element.querySelector('#btnSaveModal');

    select?.addEventListener('change', () => {
      const mode = select.value as VisionEngineType;
      if (mode === 'simulated') {
        apiKeyGroup?.classList.add('hidden');
      } else {
        apiKeyGroup?.classList.remove('hidden');
        if (input) {
          input.placeholder = mode === 'gemini' 
            ? 'Chave do Google AI Studio...' 
            : 'Chave sk-... da OpenAI';
        }
      }
    });

    const closeHandler = () => this.hide();
    btnClose?.addEventListener('click', closeHandler);
    btnCancel?.addEventListener('click', closeHandler);

    btnSave?.addEventListener('click', () => {
      const engine = (select?.value || 'simulated') as VisionEngineType;
      const apiKey = input?.value || '';

      const newConfig: VisionConfig = { engine, apiKey };
      StorageService.saveVisionConfig(newConfig);
      this.onSaveCallback(newConfig);
      this.hide();
    });
  }

  public show(): void {
    this.element.classList.remove('hidden');
  }

  public hide(): void {
    this.element.classList.add('hidden');
  }
}
