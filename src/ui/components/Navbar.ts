export class Navbar {
  public static render(onOpenSettings: () => void): HTMLElement {
    const header = document.createElement('header');
    header.className = 'app-header';

    header.innerHTML = `
      <div>
        <div class="badge-tag">
          <span class="dot"></span>
          <span>DevCraft OMR Engine v2.5</span>
        </div>
        <h1 class="title">Corretor de Avaliação Final</h1>
        <p class="subtitle">Desenvolvimento de Sistemas &bull; Gabarito Oficial de 40 Questões</p>
      </div>
      <div>
        <button id="btnOpenSettings" class="btn btn-outline btn-sm">
          ⚙️ Provedor de Visão
        </button>
      </div>
    `;

    header.querySelector('#btnOpenSettings')?.addEventListener('click', onOpenSettings);
    return header;
  }
}
