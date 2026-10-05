/**
 * ConsoleVault - Lógica da Aplicação Frontend
 * JavaScript Puro (Vanilla JS) consumindo a API REST de Consoles.
 */

// Configuração da URL Base da API
// Se estiver rodando na mesma origem (ex: Vercel), usa relativo '/api'; senão 'http://localhost:3000/api'
const API_BASE_URL = window.location.hostname === 'localhost' && window.location.port !== '3000'
  ? 'http://localhost:3000/api'
  : (window.location.origin.includes('localhost') ? 'http://localhost:3000/api' : '/api');

// Estado Global da Aplicação
let consolesState = [];
let deleteTargetId = null;

// Elementos do DOM
const dom = {
  // Estados
  loadingState: document.getElementById('loadingState'),
  errorState: document.getElementById('errorState'),
  emptyState: document.getElementById('emptyState'),
  consolesGrid: document.getElementById('consolesGrid'),
  errorMessageDesc: document.getElementById('errorMessageDesc'),
  btnRetry: document.getElementById('btnRetry'),
  btnReload: document.getElementById('btnReload'),

  // Busca e Filtros
  searchInput: document.getElementById('searchInput'),

  // Métricas
  metricTotal: document.getElementById('metricTotal'),
  metricAverage: document.getElementById('metricAverage'),
  metricApiStatus: document.getElementById('metricApiStatus'),

  // Modal de Formulário
  consoleModal: document.getElementById('consoleModal'),
  consoleForm: document.getElementById('consoleForm'),
  modalTitle: document.getElementById('modalTitle'),
  modalSubtitle: document.getElementById('modalSubtitle'),
  btnOpenAddModal: document.getElementById('btnOpenAddModal'),
  btnEmptyAdd: document.getElementById('btnEmptyAdd'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  btnCancelModal: document.getElementById('btnCancelModal'),
  btnSubmitModal: document.getElementById('btnSubmitModal'),
  btnSubmitText: document.getElementById('btnSubmitText'),
  btnSubmitSpinner: document.getElementById('btnSubmitSpinner'),

  // Campos do Formulário
  consoleId: document.getElementById('consoleId'),
  empresaInput: document.getElementById('empresaInput'),
  modeloInput: document.getElementById('modeloInput'),
  precoInput: document.getElementById('precoInput'),
  fotoInput: document.getElementById('fotoInput'),
  dataLancamentoInput: document.getElementById('dataLancamentoInput'),
  previewContainer: document.getElementById('previewContainer'),
  photoPreview: document.getElementById('photoPreview'),

  // Erros dos Campos
  empresaError: document.getElementById('empresaError'),
  modeloError: document.getElementById('modeloError'),
  precoError: document.getElementById('precoError'),
  fotoError: document.getElementById('fotoError'),
  dataLancamentoError: document.getElementById('dataLancamentoError'),

  // Modal de Exclusão
  confirmDeleteModal: document.getElementById('confirmDeleteModal'),
  confirmDeleteText: document.getElementById('confirmDeleteText'),
  btnCancelDelete: document.getElementById('btnCancelDelete'),
  btnConfirmDelete: document.getElementById('btnConfirmDelete'),
  btnDeleteText: document.getElementById('btnDeleteText'),
  btnDeleteSpinner: document.getElementById('btnDeleteSpinner'),

  // Toasts
  toastContainer: document.getElementById('toastContainer'),
};

// ==========================================================================
// Funções Auxiliares de Formatação e Feedback
// ==========================================================================

/**
 * Formata um valor numérico para Moeda Brasileira (R$ 1.234,56).
 */
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
}

/**
 * Formata uma data para o padrão amigável brasileiro (DD/MM/AAAA).
 */
function formatarData(dataString) {
  if (!dataString) return 'Data não informada';
  try {
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return 'Data inválida';
    // Utiliza UTC para evitar desvios de fuso horário na data de lançamento
    return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch (e) {
    return 'Data inválida';
  }
}

/**
 * Exibe notificação flutuante (Toast).
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success'
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================================================
// Comunicação com a API (Fetch)
// ==========================================================================

/**
 * Verifica a saúde da API.
 */
async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    if (res.ok) {
      dom.metricApiStatus.innerHTML = '<span class="dot dot-online"></span> Conectada';
      return true;
    } else {
      dom.metricApiStatus.innerHTML = '<span class="dot dot-offline"></span> Indisponível';
      return false;
    }
  } catch (err) {
    dom.metricApiStatus.innerHTML = '<span class="dot dot-offline"></span> Offline';
    return false;
  }
}

/**
 * Carrega a lista de consoles cadastrados da API.
 */
async function fetchConsoles() {
  showState('loading');

  try {
    const res = await fetch(`${API_BASE_URL}/consoles`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.error || `Erro HTTP ${res.status}: Não foi possível carregar os consoles.`);
    }

    const json = await res.json();
    consolesState = json.data || [];

    updateMetrics(consolesState);
    renderConsoles(consolesState);
    checkApiHealth();
  } catch (err) {
    console.error('Erro ao buscar consoles:', err);
    dom.errorMessageDesc.textContent = err.message || 'Falha na conexão com a API. Certifique-se de que o backend está ativo.';
    showState('error');
    checkApiHealth();
  }
}

/**
 * Atualiza o painel de métricas (total e preço médio).
 */
function updateMetrics(consoles) {
  dom.metricTotal.textContent = consoles.length;

  if (consoles.length === 0) {
    dom.metricAverage.textContent = 'R$ 0,00';
    return;
  }

  const soma = consoles.reduce((acc, curr) => acc + (Number(curr.preco) || 0), 0);
  const media = soma / consoles.length;
  dom.metricAverage.textContent = formatarMoeda(media);
}

/**
 * Alterna visualização dos estados da interface.
 */
function showState(state) {
  dom.loadingState.style.display = state === 'loading' ? 'flex' : 'none';
  dom.errorState.style.display = state === 'error' ? 'flex' : 'none';
  dom.emptyState.style.display = state === 'empty' ? 'flex' : 'none';
  dom.consolesGrid.style.display = state === 'grid' ? 'grid' : 'none';
}

/**
 * Renderiza os cards de consoles no DOM.
 */
function renderConsoles(consoles) {
  const filtro = dom.searchInput.value.trim().toLowerCase();
  const consolesFiltrados = filtro
    ? consoles.filter(c => 
        (c.modelo && c.modelo.toLowerCase().includes(filtro)) ||
        (c.empresa && c.empresa.toLowerCase().includes(filtro))
      )
    : consoles;

  if (consolesFiltrados.length === 0) {
    if (consoles.length === 0) {
      showState('empty');
    } else {
      // Nenhum resultado encontrado para o filtro
      dom.consolesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          Nenhum console encontrado para o termo pesquisado.
        </div>
      `;
      showState('grid');
    }
    return;
  }

  dom.consolesGrid.innerHTML = '';

  consolesFiltrados.forEach((consoleItem) => {
    const card = document.createElement('article');
    card.className = 'console-card';
    card.setAttribute('data-id', consoleItem._id);

    // Fallback de imagem caso a URL falhe
    const fotoUrl = consoleItem.foto || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f';

    card.innerHTML = `
      <div class="card-media">
        <span class="card-badge-company">${escapeHtml(consoleItem.empresa)}</span>
        <img 
          src="${escapeHtml(fotoUrl)}" 
          alt="${escapeHtml(consoleItem.modelo)}"
          loading="lazy"
          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80';"
        >
      </div>

      <div class="card-body">
        <h3 class="card-title">${escapeHtml(consoleItem.modelo)}</h3>
        
        <div class="card-details">
          <div class="detail-row">
            <span class="detail-label">Preço Sugerido:</span>
            <span class="detail-price">${formatarMoeda(consoleItem.preco)}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Lançamento:
            </span>
            <span class="detail-value">${formatarData(consoleItem.dataLancamento)}</span>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn btn-secondary btn-sm btn-edit" data-id="${consoleItem._id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Editar
          </button>
          <button class="btn btn-danger btn-sm btn-delete" data-id="${consoleItem._id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Excluir
          </button>
        </div>
      </div>
    `;

    dom.consolesGrid.appendChild(card);
  });

  showState('grid');
}

/**
 * Escapa HTML para prevenir ataques XSS
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==========================================================================
// Gerenciamento de Modal e Formulário
// ==========================================================================

function openAddModal() {
  clearForm();
  dom.modalTitle.textContent = 'Cadastrar Console';
  dom.modalSubtitle.textContent = 'Preencha os dados do novo videogame para o catálogo';
  dom.btnSubmitText.textContent = 'Salvar Console';
  dom.consoleModal.style.display = 'flex';
  dom.empresaInput.focus();
}

function openEditModal(consoleItem) {
  clearForm();
  dom.modalTitle.textContent = 'Editar Console';
  dom.modalSubtitle.textContent = `Atualizando informações de ${consoleItem.modelo}`;
  dom.btnSubmitText.textContent = 'Atualizar Console';

  dom.consoleId.value = consoleItem._id;
  dom.empresaInput.value = consoleItem.empresa || '';
  dom.modeloInput.value = consoleItem.modelo || '';
  dom.precoInput.value = consoleItem.preco || '';
  dom.fotoInput.value = consoleItem.foto || '';

  // Formata data ISO para YYYY-MM-DD aceita pelo input type="date"
  if (consoleItem.dataLancamento) {
    const d = new Date(consoleItem.dataLancamento);
    dom.dataLancamentoInput.value = d.toISOString().split('T')[0];
  }

  // Atualiza pré-visualização da foto
  updatePhotoPreview(consoleItem.foto);

  dom.consoleModal.style.display = 'flex';
}

function closeModal() {
  dom.consoleModal.style.display = 'none';
  clearForm();
}

function clearForm() {
  dom.consoleForm.reset();
  dom.consoleId.value = '';
  dom.previewContainer.style.display = 'none';
  dom.photoPreview.src = '';

  // Limpa mensagens e classes de erro
  ['empresa', 'modelo', 'preco', 'foto', 'dataLancamento'].forEach((field) => {
    const input = dom[`${field}Input`];
    const error = dom[`${field}Error`];
    if (input) input.classList.remove('is-invalid');
    if (error) error.textContent = '';
  });
}

function updatePhotoPreview(url) {
  if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))) {
    dom.photoPreview.src = url;
    dom.previewContainer.style.display = 'block';
  } else {
    dom.previewContainer.style.display = 'none';
  }
}

// Validação visual de campos no cliente
function validateForm() {
  let isValid = true;

  const empresa = dom.empresaInput.value.trim();
  const modelo = dom.modeloInput.value.trim();
  const preco = dom.precoInput.value.trim();
  const foto = dom.fotoInput.value.trim();
  const dataLancamento = dom.dataLancamentoInput.value;

  // Empresa
  if (!empresa) {
    dom.empresaInput.classList.add('is-invalid');
    dom.empresaError.textContent = 'Informe a empresa fabricante.';
    isValid = false;
  } else {
    dom.empresaInput.classList.remove('is-invalid');
    dom.empresaError.textContent = '';
  }

  // Modelo
  if (!modelo) {
    dom.modeloInput.classList.add('is-invalid');
    dom.modeloError.textContent = 'Informe o modelo do console.';
    isValid = false;
  } else {
    dom.modeloInput.classList.remove('is-invalid');
    dom.modeloError.textContent = '';
  }

  // Preço
  if (!preco || isNaN(Number(preco)) || Number(preco) < 0) {
    dom.precoInput.classList.add('is-invalid');
    dom.precoError.textContent = 'Informe um preço numérico válido maior ou igual a zero.';
    isValid = false;
  } else {
    dom.precoInput.classList.remove('is-invalid');
    dom.precoError.textContent = '';
  }

  // Foto
  if (!foto) {
    dom.fotoInput.classList.add('is-invalid');
    dom.fotoError.textContent = 'Informe a URL da foto do console.';
    isValid = false;
  } else {
    dom.fotoInput.classList.remove('is-invalid');
    dom.fotoError.textContent = '';
  }

  // Data de lançamento
  if (!dataLancamento) {
    dom.dataLancamentoInput.classList.add('is-invalid');
    dom.dataLancamentoError.textContent = 'Selecione a data de lançamento.';
    isValid = false;
  } else {
    dom.dataLancamentoInput.classList.remove('is-invalid');
    dom.dataLancamentoError.textContent = '';
  }

  return isValid;
}

// Submissão do Formulário (Cadastro / Edição)
async function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) return;

  const id = dom.consoleId.value;
  const isEditing = Boolean(id);

  const payload = {
    empresa: dom.empresaInput.value.trim(),
    modelo: dom.modeloInput.value.trim(),
    preco: parseFloat(dom.precoInput.value),
    foto: dom.fotoInput.value.trim(),
    dataLancamento: dom.dataLancamentoInput.value,
  };

  // Ativa estado de carregamento do botão
  dom.btnSubmitModal.disabled = true;
  dom.btnSubmitSpinner.style.display = 'inline-block';
  dom.btnSubmitText.textContent = isEditing ? 'Atualizando...' : 'Salvando...';

  try {
    const url = isEditing ? `${API_BASE_URL}/consoles/${id}` : `${API_BASE_URL}/consoles`;
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || (data.details ? data.details.join(', ') : 'Erro ao processar solicitação.'));
    }

    showToast(isEditing ? 'Console atualizado com sucesso!' : 'Console cadastrado com sucesso!', 'success');
    closeModal();
    fetchConsoles();
  } catch (err) {
    console.error('Erro ao salvar console:', err);
    showToast(err.message, 'error');
  } finally {
    dom.btnSubmitModal.disabled = false;
    dom.btnSubmitSpinner.style.display = 'none';
    dom.btnSubmitText.textContent = isEditing ? 'Atualizar Console' : 'Salvar Console';
  }
}

// ==========================================================================
// Exclusão com Modal de Confirmação
// ==========================================================================

function promptDelete(consoleItem) {
  deleteTargetId = consoleItem._id;
  dom.confirmDeleteText.innerHTML = `Deseja realmente remover o console <strong>${escapeHtml(consoleItem.modelo)}</strong> (${escapeHtml(consoleItem.empresa)})? Esta ação é irreversível.`;
  dom.confirmDeleteModal.style.display = 'flex';
}

function closeDeleteModal() {
  dom.confirmDeleteModal.style.display = 'none';
  deleteTargetId = null;
}

async function handleConfirmDelete() {
  if (!deleteTargetId) return;

  dom.btnConfirmDelete.disabled = true;
  dom.btnDeleteSpinner.style.display = 'inline-block';
  dom.btnDeleteText.textContent = 'Excluindo...';

  try {
    const res = await fetch(`${API_BASE_URL}/consoles/${deleteTargetId}`, {
      method: 'DELETE',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Erro ao excluir console.');
    }

    showToast('Console removido com sucesso!', 'success');
    closeDeleteModal();
    fetchConsoles();
  } catch (err) {
    console.error('Erro na exclusão:', err);
    showToast(err.message, 'error');
  } finally {
    dom.btnConfirmDelete.disabled = false;
    dom.btnDeleteSpinner.style.display = 'none';
    dom.btnDeleteText.textContent = 'Sim, Excluir';
  }
}

// ==========================================================================
// Event Listeners e Inicialização
// ==========================================================================

function initEvents() {
  // Abertura do modal de cadastro
  dom.btnOpenAddModal.addEventListener('click', openAddModal);
  dom.btnEmptyAdd.addEventListener('click', openAddModal);

  // Fechamento de modais
  dom.btnCloseModal.addEventListener('click', closeModal);
  dom.btnCancelModal.addEventListener('click', closeModal);
  dom.btnCancelDelete.addEventListener('click', closeDeleteModal);

  // Fechar ao clicar fora do modal
  window.addEventListener('click', (e) => {
    if (e.target === dom.consoleModal) closeModal();
    if (e.target === dom.confirmDeleteModal) closeDeleteModal();
  });

  // Fechar no ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeDeleteModal();
    }
  });

  // Envio do formulário
  dom.consoleForm.addEventListener('submit', handleFormSubmit);

  // Pré-visualização da foto ao digitar URL
  dom.fotoInput.addEventListener('input', (e) => {
    updatePhotoPreview(e.target.value.trim());
  });

  // Confirmação de exclusão
  dom.btnConfirmDelete.addEventListener('click', handleConfirmDelete);

  // Recarregar e Retry
  dom.btnReload.addEventListener('click', fetchConsoles);
  dom.btnRetry.addEventListener('click', fetchConsoles);

  // Filtro de busca em tempo real
  dom.searchInput.addEventListener('input', () => {
    renderConsoles(consolesState);
  });

  // Delegação de eventos para botões dinâmicos de Editar e Excluir
  dom.consolesGrid.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      const item = consolesState.find(c => c._id === id);
      if (item) openEditModal(item);
    } else if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      const item = consolesState.find(c => c._id === id);
      if (item) promptDelete(item);
    }
  });
}

// Inicializa a aplicação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  fetchConsoles();
});
