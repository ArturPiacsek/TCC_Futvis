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
app.get('/api/eficiencia-histograma', async (req, res) => {
    try {
        const { id_time, id_tempo } = req.query;

        let sql = `
            SELECT 
                j.nome_jogador,
                SUM(f.gols) as total_gols,
                SUM(f.minutos_jogados) as total_minutos,
                ROUND(SUM(f.minutos_jogados) / SUM(f.gols)) as minutos_por_gol,
                t.logo_url_time
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
            JOIN dim_time t ON f.id_clube = t.id_time
        `;

        const params = [];
        const whereClauses = [`f.gols > 0`];

        if (id_time) {
            whereClauses.push(`f.id_clube = ?`);
            params.push(id_time);
        }

        if (id_tempo) {
            whereClauses.push(`f.id_tempo = ?`);
            params.push(id_tempo);
        } else {
            whereClauses.push(`f.id_tempo IN (?, ?, ?)`);
            params.push(...[1, 276, 549]);
        }

        sql += ` WHERE ${whereClauses.join(' AND ')}`;

        sql += `
            GROUP BY j.nome_jogador, t.logo_url_time
            HAVING SUM(f.minutos_jogados) > 90 
            ORDER BY minutos_por_gol ASC;
        `;

        const data = await executeQuery(sql, params);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 4: Disciplina (cartões)
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

// Rota 7: analise temporal

app.get('/api/analise-temporal', async (req, res) => {
    try {
        const { id_time } = req.query; // Pega o filtro de time da URL
        let sql;
        let params = [];

        if (id_time) {
            // QUERY PARA UM TIME ESPECÍFICO
            // Usamos a tabela fato_estatisticas_clube_temporal
            sql = `
                SELECT
                    DT.temporada,
                    DT.mes,                    
                    ROUND(SUM(FCT.gols_marcados) / SUM(FCT.total_jogos), 2) AS media_gols_por_jogo,                    
                    ROUND(SUM(FCT.vitorias) * 100.0 / SUM(FCT.total_jogos), 2) AS pct_vitorias,
                    ROUND(SUM(FCT.derrotas) * 100.0 / SUM(FCT.total_jogos), 2) AS pct_derrotas,
                    ROUND(SUM(FCT.empates) * 100.0 / SUM(FCT.total_jogos), 2) AS pct_empates
                FROM
                    fato_estatisticas_clube_temporal AS FCT
                JOIN
                    dim_tempo AS DT ON FCT.id_tempo = DT.id_tempo
                WHERE
                    FCT.id_time = ? AND (DT.temporada IS NOT NULL AND DT.mes IS NOT NULL AND DT.dia_semana IS NULL)
                GROUP BY
                    DT.temporada, DT.mes
                ORDER BY
                    DT.temporada, DT.mes;
            `;
            params.push(id_time);
        } else {
            // QUERY ORIGINAL PARA A LIGA INTEIRA (sem filtro de time)
            sql = `
                SELECT
                    DT.temporada,
                    DT.mes,
                    ROUND(AVG(FTG.media_gols_por_partida), 2) AS media_gols_por_jogo,
                    ROUND(SUM(FTG.vitorias_mandante) * 100.0 / SUM(FTG.total_partidas), 2) AS pct_vitorias_casa,
                    ROUND(SUM(FTG.vitorias_visitante) * 100.0 / SUM(FTG.total_partidas), 2) AS pct_vitorias_fora,
                    ROUND(SUM(FTG.empates) * 100.0 / SUM(FTG.total_partidas), 2) AS pct_empates
                FROM
                    fato_temporal_geral AS FTG
                JOIN
                    dim_tempo AS DT ON FTG.id_tempo = DT.id_tempo
                WHERE
                    (DT.temporada IS NOT NULL and DT.mes is not null and DT.dia_semana is null)
                GROUP BY
                    DT.temporada, DT.mes
                ORDER BY
                    DT.temporada, DT.mes;
            `;
        }
        
        const data = await executeQuery(sql, params);
        // Garante que todos os valores numéricos sejam de fato números
        const numberedData = data.map(d => {
            const row = { ...d };
            for (const key in row) {
                if (key !== 'temporada' && key !== 'mes' && row[key] !== null) {
                    row[key] = parseFloat(row[key]);
                }
            }
            return row;
        });
        res.json(numberedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 8: Rota para os KPIs com comparativo anual
app.get('/api/kpis', async (req, res) => {
    try {
        const { id_time, id_tempo } = req.query;

        // Mapeamento de temporada para a temporada anterior
        const previousTempoMap = {
            '549': '276', // 2023 -> 2022
            '276': '1',   // 2022 -> 2021
            '1': null     // 2021 não tem ano anterior nos dados
        };

        // Função auxiliar para buscar os dados de um período
        const getKpiData = async (tempoFilter) => {
            if (!tempoFilter) return null; // Não busca se não houver período

            let whereClauses = [`FCT.id_tempo = ?`];
            let params = [tempoFilter];

            if (id_time) {
                whereClauses.push(`FCT.id_time = ?`);
                params.push(id_time);
            }

            const sql = `
                SELECT
                    AVG(FCT.media_pct_passes) as passes,
                    SUM(FCT.defesas_goleiro_total) / SUM(FCT.total_jogos) as defesas,
                    AVG(FCT.media_posse_bola) as posse
                FROM fato_estatisticas_clube_temporal AS FCT
                WHERE ${whereClauses.join(' AND ')};
            `;
            const result = await executeQuery(sql, params);
            // Retorna a primeira linha, ou null se não houver dados
            return result.length > 0 ? result[0] : null;
        };

        // Determina o período atual e o anterior
        const currentTempo = id_tempo || '549'; // Se nenhum ano for selecionado, assume o mais recente (2023)
        const previousTempo = previousTempoMap[currentTempo];

        // Busca os dados para ambos os períodos em paralelo
        const [currentData, previousData] = await Promise.all([
            getKpiData(currentTempo),
            getKpiData(previousTempo)
        ]);

        // Formata a resposta
        const formatResponse = (key) => ({
             // Se currentData for null, valor é 0. Usamos parseFloat para garantir que é número.
            current: currentData ? parseFloat(currentData[key] || 0).toFixed(1) : 0,
            previous: previousData ? parseFloat(previousData[key] || 0).toFixed(1) : null,
        });

        res.json({
            passes: formatResponse('passes'),
            defesas: formatResponse('defesas'),
            posse: formatResponse('posse'),
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 9: Contagem de jogadores por nacionalidade (para o mapa)
app.get('/api/jogadores-por-nacionalidade', async (req, res) => {
    try {
        const { id_time, id_tempo } = req.query;

        // O JOIN com a tabela fato_jogador_geral agora é sempre necessário
        // para podermos filtrar por time e/ou tempo.
        let sql = `
            SELECT
                j.nacionalidade,
                COUNT(DISTINCT j.id_jogador) as total_jogadores
            FROM dim_jogador j
            JOIN fato_jogador_geral f ON j.id_jogador = f.id_jogador
        `;
        
        const params = [];
        const whereClauses = [];

        // Adiciona o filtro de time, se existir
        if (id_time) {
            whereClauses.push(`f.id_clube = ?`);
            params.push(id_time);
        }

        // Adiciona a lógica de filtro para a temporada
        if (id_tempo) {
            // Se um ano específico foi selecionado
            whereClauses.push(`f.id_tempo = ?`);
            params.push(id_tempo);
        } else {
            // Se for "Acumulado", usa os 3 anos válidos
            whereClauses.push(`f.id_tempo IN (?, ?, ?)`);
            params.push(...[1, 276, 549]);
        }

        // Junta as cláusulas WHERE ao SQL
        sql += ` WHERE ${whereClauses.join(' AND ')}`;

        // Adiciona o final da query
        sql += `
            GROUP BY j.nacionalidade
            HAVING total_jogadores > 0
            ORDER BY total_jogadores DESC;
        `;

        const data = await executeQuery(sql, params);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Rota 10: Lista de times
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

// Rota 11: Listar AS TEMPORADAS VÁLIDAS para o filtro
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