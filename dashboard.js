document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('dashboard-grid');
    const clearBtn = document.getElementById('clear-dashboard-btn');
    let db;

    async function initDB() {
        db = await idb.openDB('dashboardDB', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('charts')) {
                    db.createObjectStore('charts', { autoIncrement: true });
                }
            },
        });
    }

    async function loadCharts() {
        if (!db) await initDB();
        
        grid.innerHTML = '';
        
        // Pega todas as chaves e valores do nosso banco de dados
        const keys = await db.getAllKeys('charts');
        const values = await db.getAll('charts');

        if (values.length === 0) {
            grid.innerHTML = '<p>Você ainda não salvou nenhum gráfico. Volte para a página de análises e clique no ícone de disquete &#x1F4BE; em um gráfico para salvá-lo aqui.</p>';
            return;
        }

        values.forEach((pngBase64, index) => {
            const chartKey = keys[index]; // Pega a chave primária do DB
            
            const item = document.createElement('div');
            item.className = 'dashboard-item';
            
            const img = document.createElement('img');
            img.src = `data:image/png;base64,${pngBase64}`;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.dataset.key = chartKey; // Usa a chave do DB para identificar

            deleteBtn.addEventListener('click', async (e) => {
                const keyToDelete = parseInt(e.target.dataset.key, 10);
                await db.delete('charts', keyToDelete); // Deleta o item do DB
                loadCharts(); // Recarrega a visualização
            });

            item.appendChild(img);
            item.appendChild(deleteBtn);
            grid.appendChild(item);
        });
    }

    clearBtn.addEventListener('click', async () => {
        if (confirm('Tem certeza de que deseja limpar todos os gráficos salvos?')) {
            if (!db) await initDB();
            await db.clear('charts'); // Limpa todos os itens
            loadCharts();
        }
    });

    loadCharts();
});