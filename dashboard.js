// dashboard.js
// A chave do localStorage que guardará nosso layout completo
const LAYOUT_KEY = 'dashboardLayout';
let sortableInstance = null;

/**
 * Função principal para carregar o dashboard.
 * Agora ela sincroniza os gráficos do servidor com o layout salvo localmente.
 */
async function loadDashboard() {
    const container = document.getElementById('charts-container');
    container.innerHTML = ''; // Limpa o container

    // 1. Busca os gráficos "oficiais" do servidor
    let serverCharts = [];
    try {
        const res = await fetch('/api/list-charts');
        serverCharts = await res.json();
    } catch (error) {
        console.error("Erro ao buscar gráficos do servidor:", error);
    }

    // 2. Carrega o layout salvo (se existir)
    const savedLayout = JSON.parse(localStorage.getItem(LAYOUT_KEY)) || [];

    // 3. Sincroniza o layout (função crucial!)
    const finalLayout = syncLayout(serverCharts, savedLayout);

    // 4. Renderiza o dashboard com base no layout final
    renderDashboard(finalLayout);

    // 5. Salva o layout sincronizado (caso novos gráficos tenham sido adicionados)
    saveLayout(finalLayout);    
}

/**
 * Sincroniza os gráficos do servidor com o layout salvo no localStorage.
 * Garante que novos gráficos sejam adicionados e gráficos excluídos sejam removidos.
 */
function syncLayout(serverCharts, localLayout) {
    const serverChartFiles = new Set(serverCharts);
    const layoutChartFiles = new Set(localLayout.filter(item => item.type === 'chart').map(item => item.file));

    // 1. Filtra o layout local, removendo comentários e gráficos que não existem mais no servidor
    const syncedLayout = localLayout.filter(item => {
        if (item.type === 'comment') return true; // Sempre mantém comentários
        if (item.type === 'chart') return serverChartFiles.has(item.file); // Mantém se ainda existir
        return false;
    });

    // 2. Encontra os gráficos que estão no servidor mas NÃO estão no layout salvo
    const newCharts = serverCharts.filter(file => !layoutChartFiles.has(file));

    // 3. Adiciona os novos gráficos ao final do layout
    newCharts.forEach(file => {
        syncedLayout.push({ type: 'chart', file: file });
    });

    return syncedLayout;
}

/**
 * Renderiza o HTML de todo o dashboard com base em um array de layout.
 */
function renderDashboard(layout) {
    const container = document.getElementById('charts-container');
    container.innerHTML = ''; // Limpa antes de renderizar

    if (layout.length === 0) {
        container.innerHTML = `<div class="empty-dashboard-message">
                                  <p>Nenhum gráfico ou anotação foi salvo ainda.</p>
                                  <p>Use o botão '+' para adicionar uma anotação.</p>
                               </div>`;
        container.style.gridTemplateColumns = '1fr';
        return;
    }

    container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(400px, 1fr))';
    let html = '';
    layout.forEach((item, index) => {
        // Adiciona um 'data-id' para rastrear a ordem
        if (item.type === 'chart') {
            html += createChartCardHTML(item.file, index);
        } else if (item.type === 'comment') {
            html += createCommentCardHTML(item.text, index);
        }
    });
    container.innerHTML = html;
    initializeDragAndDrop(container);
}

/**
 * Salva o layout ATUAL do DOM no localStorage.
 * Esta é a função principal de salvamento.
 */
function saveLayout() {
    // ... (o conteúdo da sua função de salvar layout continua o mesmo) ...
    const container = document.getElementById('charts-container');
    const items = container.children;
    const layoutToSave = [];

    Array.from(items).forEach(element => {
        if (element.classList.contains('chart-card')) {
            layoutToSave.push({
                type: 'chart',
                file: element.dataset.file
            });
        }
        else if (element.classList.contains('comment-card')) {
            layoutToSave.push({
                type: 'comment',
                text: element.querySelector('textarea').value
            });
        }
    });

    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layoutToSave));
}

/**
 * Inicializa a biblioteca Sortable.js no contêiner do grid.
 * Destroi qualquer instância anterior para garantir a sincronização.
 */
function initializeDragAndDrop(container) {
    // 1. Destrói a instância anterior para evitar conflitos
    if (sortableInstance) {
        sortableInstance.destroy();
    }

    if (container) {
        // 2. Cria e armazena a nova instância
        sortableInstance = new Sortable(container, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            handle: '.drag-handle', // Apenas a alça pode iniciar o arraste
            
            onEnd: function (evt) {
                // Ao soltar, apenas salva o novo layout do DOM
                saveLayout(); 
            }
        });
    }
}

// --- Funções de Geração de HTML ---

function createChartCardHTML(file, id) {
    const name = file.replace('.png', '').replace(/_/g, ' ');
    // Adiciona 'data-file' para sabermos qual gráfico é este
    return `
        <div class="chart-card" data-file="${file}" data-id="${id}">
            
            <div class="drag-handle" title="Arrastar para reordenar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                </svg>
            </div>
            
            <img src="save_charts/${file}" alt="${name}">
            <h3>${name}</h3>
        </div>`;
}

function createCommentCardHTML(text, id) {
    // Adiciona 'data-id' para rastreamento
    return `
        <div class="comment-card" data-id="${id}">
            
            <div class="drag-handle" title="Arrastar para reordenar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                </svg>
            </div>
            
            <button class="comment-delete-btn" title="Excluir anotação">&times;</button>
            <textarea placeholder="Escreva sua análise aqui...">${text}</textarea>
        </div>
    `;
}


// --- Variáveis e Funções para o Lightbox ---
const lightboxOverlay = document.getElementById('lightbox-overlay');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCloseBtn = document.getElementById('lightbox-close-btn');

function openLightbox(imageSrc) {
    lightboxImg.src = imageSrc;
    lightboxOverlay.classList.add('active');
}

function closeLightbox() {
    lightboxOverlay.classList.remove('active');
    // Pequeno delay para a transição terminar antes de limpar a imagem
    setTimeout(() => lightboxImg.src = '', 300); 
}

// --- Event Listeners ---

// Carrega o dashboard quando a página é aberta
document.addEventListener('DOMContentLoaded', loadDashboard);

// Fechar ao clicar no botão 'x'
lightboxCloseBtn.addEventListener('click', closeLightbox);

// Fechar ao clicar na overlay (mas não na imagem dentro dela)
lightboxOverlay.addEventListener('click', (event) => {
    if (event.target === lightboxOverlay) { // Verifica se clicou diretamente na overlay
        closeLightbox();
    }
});

// Fechar ao pressionar a tecla ESC
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightboxOverlay.classList.contains('active')) {
        closeLightbox();
    }
});

// Ação do botão flutuante (+)
document.getElementById('add-comment-btn').addEventListener('click', () => {
    const container = document.getElementById('charts-container');
    const emptyMsg = container.querySelector('.empty-dashboard-message');
    if (emptyMsg) {
        emptyMsg.remove();
        container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(400px, 1fr))';
    }
    
    // Adiciona um novo card de anotação
    container.insertAdjacentHTML('beforeend', createCommentCardHTML(''));
    
    // Salva o novo layout com a anotação no final
    saveLayout();
    initializeDragAndDrop(container);
});

// Gerenciador de eventos para Salvar e Excluir anotações
document.getElementById('charts-container').addEventListener('click', (event) => {
    // Se clicou no botão de excluir (X)
    if (event.target.classList.contains('comment-delete-btn')) {
        event.target.closest('.comment-card').remove();
        saveLayout(); // Salva o novo estado (sem o card excluído)

        const container = document.getElementById('charts-container');
        initializeDragAndDrop(container); // Re-inicializa o Sortable.js
        return;
    }

    // Lógica para abrir o lightbox ao clicar na imagem
    if (event.target.tagName === 'IMG' && event.target.closest('.chart-card')) {
        const imageSrc = event.target.src;
        openLightbox(imageSrc);
    }
});

// Salva automaticamente quando o usuário para de digitar
document.getElementById('charts-container').addEventListener('blur', (event) => {
    // Se o usuário estava em um textarea
    if (event.target.tagName === 'TEXTAREA') {
        saveLayout(); // Salva todas as anotações
    }
}, true);