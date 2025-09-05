// server.js

const express = require('express');
const mysql = require('mysql2/promise'); // Usando a versão com Promises para código mais limpo
const cors = require('cors');

const app = express();
const port = 3000;

// Configuração do CORS para permitir requisições do frontend
app.use(cors());

// Configuração da conexão com o banco de dados MySQL
const dbConfig = {
    host: 'localhost',    
    user: 'root',           
    password: '123456',   
    database: 'dw_futvis'
};

// Função auxiliar para executar queries e evitar repetição de código
async function executeQuery(sql, params = []) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(sql, params);
    await connection.end();
    return rows;
}

// Rota 1: Top 10 Artilheiros
app.get('/api/artilheiros', async (req, res) => {
    try {
        const sql = `
            SELECT j.nome_jogador, SUM(f.gols) as total
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
            GROUP BY j.nome_jogador
            ORDER BY total DESC
            LIMIT 10;
        `;
        const data = await executeQuery(sql);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 2: Top 10 em Assistências
app.get('/api/assistencias', async (req, res) => {
    try {
        const sql = `
            SELECT j.nome_jogador, SUM(f.assistencias) as total
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
            GROUP BY j.nome_jogador
            ORDER BY total DESC
            LIMIT 10;
        `;
        const data = await executeQuery(sql);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 3: Eficiência (Minutos para marcar um gol)
app.get('/api/eficiencia-minutos-gol', async (req, res) => {
    try {
        // Filtramos jogadores com mais de 500 minutos e pelo menos 1 gol para a estatística ser relevante
        const sql = `
            SELECT 
                j.nome_jogador,
                SUM(f.gols) as total_gols,
                SUM(f.minutos_jogados) as total_minutos,
                ROUND(SUM(f.minutos_jogados) / SUM(f.gols)) as minutos_por_gol
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
            WHERE f.gols > 0
            GROUP BY j.nome_jogador
            HAVING SUM(f.minutos_jogados) > 500
            ORDER BY minutos_por_gol ASC
            LIMIT 10;
        `;
        const data = await executeQuery(sql);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 4: Disciplina (Mais cartões)
app.get('/api/disciplina', async (req, res) => {
    try {
        const sql = `
            SELECT 
                j.nome_jogador, 
                SUM(f.cartoes_amarelos) as amarelos, 
                SUM(f.cartoes_vermelhos) as vermelhos
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
            GROUP BY j.nome_jogador
            ORDER BY amarelos DESC, vermelhos DESC
            LIMIT 10;
        `;
        const data = await executeQuery(sql);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 5: Top 10 em Participações em Gols
app.get('/api/participacoes-gol', async (req, res) => {
    try {
        const sql = `
            SELECT j.nome_jogador, SUM(f.participacoes_em_gol) as total
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
            GROUP BY j.nome_jogador
            ORDER BY total DESC
            LIMIT 10;
        `;
        const data = await executeQuery(sql);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor da API rodando em http://localhost:${port}`);
});