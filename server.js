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

// Rota 1: Top 10 Artilheiros (MODIFICADA PARA MÚLTIPLOS FILTROS)
app.get('/api/artilheiros', async (req, res) => {
    try {
        const { id_time, id_tempo } = req.query; // Pega ambos os filtros da URL

        let sql = `
            SELECT j.nome_jogador, SUM(f.gols) as total
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
        `;
        
        const params = [];
        const whereClauses = []; // Array para guardar nossas condições

        // Adiciona a condição de time, se existir
        if (id_time) {
            whereClauses.push(`f.id_clube = ?`);
            params.push(id_time);
        }

        // Adiciona a condição de tempo, se existir
        if (id_tempo) {
            whereClauses.push(`f.id_tempo = ?`);
            params.push(id_tempo);
        }else {
        // Se NENHUM ano foi selecionado (Acumulado), filtra pelos 3 anos válidos
        whereClauses.push(`f.id_tempo IN (?, ?, ?)`);
        params.push(...[1, 276, 549]); // O operador '...' insere os 3 valores no array
        }

        // Se houver alguma condição no array, junta todas com "AND" e adiciona ao SQL
        if (whereClauses.length > 0) {
            sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        // Adiciona o final da query
        sql += `
            GROUP BY j.nome_jogador
            ORDER BY total DESC
            LIMIT 10;
        `;
        
        const data = await executeQuery(sql, params);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 2: Top 10 em Assistências
app.get('/api/assistencias', async (req, res) => {
    try {
        const { id_time, id_tempo } = req.query; // Pega ambos os filtros da URL

        let sql = `
            SELECT j.nome_jogador, SUM(f.assistencias) as total
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
        `;
        const params = [];
        const whereClauses = []; // Array para guardar nossas condições

        // Adiciona a condição de time, se existir
        if (id_time) {
            whereClauses.push(`f.id_clube = ?`);
            params.push(id_time);
        }

        // Adiciona a condição de tempo, se existir
        if (id_tempo) {
            whereClauses.push(`f.id_tempo = ?`);
            params.push(id_tempo);
        }else {
        // Se NENHUM ano foi selecionado (Acumulado), filtra pelos 3 anos válidos
        whereClauses.push(`f.id_tempo IN (?, ?, ?)`);
        params.push(...[1, 276, 549]); // O operador '...' insere os 3 valores no array
        }

        // Se houver alguma condição no array, junta todas com "AND" e adiciona ao SQL
        if (whereClauses.length > 0) {
            sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        sql += `
            GROUP BY j.nome_jogador
            ORDER BY total DESC
            LIMIT 10;
        `;

        const data = await executeQuery(sql, params);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 3: Eficiência (Minutos para marcar um gol)
app.get('/api/eficiencia-minutos-gol', async (req, res) => {
    try {
        const { id_time, id_tempo } = req.query; // Pega ambos os filtros

        // Início da query
        let sql = `
            SELECT 
                j.nome_jogador,
                SUM(f.gols) as total_gols,
                SUM(f.minutos_jogados) as total_minutos,
                ROUND(SUM(f.minutos_jogados) / SUM(f.gols)) as minutos_por_gol
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
        `;

        const params = [];
        const whereClauses = [];

        // 1. Adiciona a condição PERMANENTE desta rota
        whereClauses.push(`f.gols > 0`);

        // 2. Adiciona o filtro de time, se existir
        if (id_time) {
            whereClauses.push(`f.id_clube = ?`);
            params.push(id_time);
        }

        // 3. Adiciona a lógica de filtro para a temporada
        if (id_tempo) {
            // Se um ano específico foi selecionado
            whereClauses.push(`f.id_tempo = ?`);
            params.push(id_tempo);
        } else {
            // Se for "Acumulado", usa os 3 anos válidos
            whereClauses.push(`f.id_tempo IN (?, ?, ?)`);
            params.push(...[1, 276, 549]);
        }

        // 4. Junta todas as condições com AND e adiciona ao SQL
        sql += ` WHERE ${whereClauses.join(' AND ')}`;

        // 5. Adiciona o resto da query (GROUP BY, HAVING, etc.)
        sql += `
            GROUP BY j.nome_jogador
            HAVING SUM(f.minutos_jogados) > 500
            ORDER BY minutos_por_gol ASC
            LIMIT 10;
        `;
        
        const data = await executeQuery(sql, params);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 4: Disciplina (Mais cartões)
app.get('/api/disciplina', async (req, res) => {
    try {
        const { id_time, id_tempo } = req.query; // Pega ambos os filtros da URL

        let sql = `
            SELECT 
                j.nome_jogador, 
                SUM(f.cartoes_amarelos) as amarelos, 
                SUM(f.cartoes_vermelhos) as vermelhos
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
         `;
        const params = [];
        const whereClauses = []; // Array para guardar nossas condições

        // Adiciona a condição de time, se existir
        if (id_time) {
            whereClauses.push(`f.id_clube = ?`);
            params.push(id_time);
        }

        // Adiciona a condição de tempo, se existir
        if (id_tempo) {
            whereClauses.push(`f.id_tempo = ?`);
            params.push(id_tempo);
        }else {
        // Se NENHUM ano foi selecionado (Acumulado), filtra pelos 3 anos válidos
        whereClauses.push(`f.id_tempo IN (?, ?, ?)`);
        params.push(...[1, 276, 549]); // O operador '...' insere os 3 valores no array
        }

        // Se houver alguma condição no array, junta todas com "AND" e adiciona ao SQL
        if (whereClauses.length > 0) {
            sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        sql += `
            GROUP BY j.nome_jogador
            ORDER BY amarelos DESC, vermelhos DESC
            LIMIT 10;
        `;
        const data = await executeQuery(sql, params);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 5: Top 10 em Participações em Gols
app.get('/api/participacoes-gol', async (req, res) => {
    try {
        const { id_time, id_tempo } = req.query; // Pega ambos os filtros da URL
        

        let sql = `
            SELECT j.nome_jogador, SUM(f.participacoes_em_gol) as total
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
         `;
        const params = [];
        const whereClauses = []; // Array para guardar nossas condições

        // Adiciona a condição de time, se existir
        if (id_time) {
            whereClauses.push(`f.id_clube = ?`);
            params.push(id_time);
        }

        // Adiciona a condição de tempo, se existir
        if (id_tempo) {
            whereClauses.push(`f.id_tempo = ?`);
            params.push(id_tempo);
        }else {
        // Se NENHUM ano foi selecionado (Acumulado), filtra pelos 3 anos válidos
        whereClauses.push(`f.id_tempo IN (?, ?, ?)`);
        params.push(...[1, 276, 549]); // O operador '...' insere os 3 valores no array
        }

        // Se houver alguma condição no array, junta todas com "AND" e adiciona ao SQL
        if (whereClauses.length > 0) {
            sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        sql += `
            GROUP BY j.nome_jogador
            ORDER BY total DESC
            LIMIT 10;
        `;
        const data = await executeQuery(sql, params);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Rota 6: Tabela de Classificação por Temporada 
app.get('/api/tabela-campeonato', async (req, res) => {
    try {        
        const id_tempo = req.query.id_tempo || '549'; // Default para 2023

        const sql = `
            SELECT
                T.nome,
                SUM(FCT.total_jogos) AS PJ,
                T.logo_url_time,
                SUM(FCT.vitorias) AS V,
                SUM(FCT.empates) AS E,
                SUM(FCT.derrotas) AS D,
                (SUM(FCT.vitorias) * 3 + SUM(FCT.empates)) AS Pts,
                SUM(FCT.gols_marcados) AS GP,
                SUM(FCT.gols_sofridos) AS GC,
                (SUM(FCT.gols_marcados) - SUM(FCT.gols_sofridos)) AS SG
            FROM
                fato_estatisticas_clube_temporal AS FCT
            JOIN
                dim_time AS T ON FCT.id_time = T.id_time
            JOIN
                dim_tempo AS DT ON FCT.id_tempo = DT.id_tempo
            WHERE
                DT.id_tempo = ? 
            GROUP BY
                T.nome, T.logo_url_time
            ORDER BY
                Pts DESC, V DESC, SG DESC;
        `;
        
        const data = await executeQuery(sql, [id_tempo]);
        res.json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 7: Lista de times
app.get('/api/times', async (req, res) => {
    try {
        const sql = `
            SELECT id_time, nome, logo_url_time
            FROM dim_time
            ORDER BY nome;
        `;

        const data = await executeQuery(sql);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 8: Listar AS TEMPORADAS VÁLIDAS para o filtro
app.get('/api/temporadas', async (req, res) => {
    try {
        // A query agora busca APENAS pelos IDs válidos que você informou.
        const sql = `
            SELECT id_tempo, ano 
            FROM dim_tempo 
            WHERE id_tempo IN (?, ?, ?) 
            ORDER BY ano DESC;
        `;
        // Passamos os IDs válidos como parâmetros
        const valid_ids = [1, 276, 549];
        const data = await executeQuery(sql, valid_ids);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor da API rodando em http://localhost:${port}`);
});