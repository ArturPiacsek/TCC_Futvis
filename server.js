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
            SELECT
                 j.id_jogador,
                 j.nome_jogador,
                 t.logo_url_time,   
                 SUM(f.gols) as total
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
            JOIN dim_time t ON f.id_clube = t.id_time
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
            GROUP BY j.id_jogador, j.nome_jogador, t.logo_url_time
            ORDER BY total DESC
            LIMIT 20;
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
            SELECT 
                j.id_jogador,
                j.nome_jogador,
                t.logo_url_time,
                SUM(f.assistencias) as total
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
            JOIN dim_time t ON f.id_clube = t.id_time
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
            GROUP BY j.id_jogador, j.nome_jogador, t.logo_url_time
            ORDER BY total DESC
            LIMIT 20;
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
                j.id_jogador,
                j.nome_jogador,
                t.logo_url_time, 
                SUM(f.cartoes_amarelos) as amarelos, 
                SUM(f.cartoes_vermelhos) as vermelhos
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
            JOIN dim_time t ON f.id_clube = t.id_time
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
            GROUP BY j.id_jogador, j.nome_jogador, t.logo_url_time
            ORDER BY amarelos DESC, vermelhos DESC
            LIMIT 20;
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
            SELECT 
                j.id_jogador,
                j.nome_jogador,
                t.logo_url_time, 
                SUM(f.participacoes_em_gol) as total
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
            JOIN dim_time t ON f.id_clube = t.id_time
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
            GROUP BY j.id_jogador, j.nome_jogador, t.logo_url_time
            ORDER BY total DESC
            LIMIT 20;
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

// Rota 10: Dados agregados por time para o Scatter Plot
app.get('/api/estilos-de-jogo', async (req, res) => {
    try {
        const { id_tempo } = req.query;

        let sql = `
            SELECT
                T.nome,
                T.logo_url_time,
                SUM(FCT.gols_marcados) AS total_gols,
                SUM(FCT.chutes_no_gol_total) AS total_chutes_no_gol,
                AVG(FCT.media_posse_bola) AS media_posse
            FROM
                fato_estatisticas_clube_temporal AS FCT
            JOIN
                dim_time AS T ON FCT.id_time = T.id_time
        `;
        
        const params = [];
        const whereClauses = [];

        // Lógica de filtro para a temporada
        if (id_tempo) {
            whereClauses.push(`FCT.id_tempo = ?`);
            params.push(id_tempo);
        } else {
            whereClauses.push(`FCT.id_tempo IN (?, ?, ?)`);
            params.push(...[1, 276, 549]);
        }

        // Adicionamos a cláusula WHERE
        sql += ` WHERE ${whereClauses.join(' AND ')}`;

        // Agrupamos por time para ter um ponto de dado por clube
        sql += `
            GROUP BY
                T.id_time, T.nome, T.logo_url_time
            HAVING 
                SUM(FCT.total_jogos) > 0;
        `;

        const data = await executeQuery(sql, params);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 11: Análise detalhada de Goleiros
app.get('/api/analise-goleiros', async (req, res) => {
    try {
        const { id_time, id_tempo } = req.query;

        let sql = `
            WITH GoleiroMinutos AS (                
                SELECT
                    f.id_jogador,
                    f.id_clube,
                    f.id_tempo,
                    SUM(f.gols_sofridos) as gols_sofridos,
                    SUM(f.minutos_jogados) as minutos_jogados,
                    SUM(f.nota) as nota
                FROM fato_jogador_geral f
                WHERE f.gols_sofridos > 0
                GROUP BY f.id_jogador, f.id_clube, f.id_tempo
            ),
            TimeDefesas AS (                
                SELECT
                    fct.id_time,
                    fct.id_tempo,
                    SUM(fct.defesas_goleiro_total) as total_defesas_time
                FROM fato_estatisticas_clube_temporal fct
                GROUP BY fct.id_time, fct.id_tempo
            ),
            TimeTotalGkMinutos AS (                
                SELECT
                    id_clube,
                    id_tempo,
                    SUM(minutos_jogados) as total_minutos_goleiros_time
                FROM GoleiroMinutos
                GROUP BY id_clube, id_tempo
            )            
            SELECT
                j.id_jogador,
                j.nome_jogador,
                j.logo_url_jogador,
                t.logo_url_time,
                gs.nota,
                gs.gols_sofridos,
                gs.minutos_jogados,                
                ROUND(td.total_defesas_time * (gs.minutos_jogados / tgk.total_minutos_goleiros_time)) AS defesas,                
                (ROUND(td.total_defesas_time * (gs.minutos_jogados / tgk.total_minutos_goleiros_time)) / (ROUND(td.total_defesas_time * (gs.minutos_jogados / tgk.total_minutos_goleiros_time)) + gs.gols_sofridos)) * 100 AS pct_defesas,
                (gs.gols_sofridos / gs.minutos_jogados) * 90 AS gols_sofridos_p90,
                (ROUND(td.total_defesas_time * (gs.minutos_jogados / tgk.total_minutos_goleiros_time)) / gs.minutos_jogados) * 90 AS defesas_p90
            FROM GoleiroMinutos gs
            JOIN TimeDefesas td ON gs.id_clube = td.id_time AND gs.id_tempo = td.id_tempo
            JOIN TimeTotalGkMinutos tgk ON gs.id_clube = tgk.id_clube AND gs.id_tempo = tgk.id_tempo
            JOIN dim_jogador j ON gs.id_jogador = j.id_jogador
            JOIN dim_time t ON gs.id_clube = t.id_time            
            WHERE (ROUND(td.total_defesas_time * (gs.minutos_jogados / tgk.total_minutos_goleiros_time)) + gs.gols_sofridos) > 0
              AND gs.minutos_jogados > 0
        `;

        const params = [];
        const whereClausesFinais = [];

        if (id_time) {
            whereClausesFinais.push(`gs.id_clube = ?`);
            params.push(id_time);
        }

        if (id_tempo) {
            whereClausesFinais.push(`gs.id_tempo = ?`);
            params.push(id_tempo);
        } else {
            whereClausesFinais.push(`gs.id_tempo IN (?, ?, ?)`);
            params.push(...[1, 276, 549]);
        }        
        
        sql += ` AND ${whereClausesFinais.join(' AND ')}`;
        sql += ` HAVING gs.minutos_jogados > 900`; 
        sql += ` ORDER BY pct_defesas DESC`;

        const data = await executeQuery(sql, params);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 12: Detalhes de um jogador para o Radar Chart
app.get('/api/jogador-detalhes/:id_jogador', async (req, res) => {
    try {
        const { id_jogador } = req.params;
        const { id_tempo } = req.query;

        // Subquery para o filtro de tempo
        let tempoFilterSubquery = '';
        const params = [];
        if (id_tempo) {
            tempoFilterSubquery = `AND f.id_tempo = ?`;
            params.push(id_tempo);
        } else {
            tempoFilterSubquery = `AND f.id_tempo IN (?, ?, ?)`;
            params.push(...[1, 276, 549]);
        }

        const sql = `
            SELECT
                j.nome_jogador,
                j.logo_url_jogador,
                t.logo_url_time,
                SUM(f.nota) AS nota,
                SUM(f.gols) AS gols,
                SUM(f.assistencias) AS assistencias,
                SUM(f.participacoes_em_gol) AS participacoes_em_gol,
                SUM(f.minutos_jogados) AS minutos_jogados,                
                (SELECT MAX(s.nota) FROM (SELECT SUM(nota) AS nota FROM fato_jogador_geral f WHERE 1=1 ${tempoFilterSubquery} GROUP BY id_jogador) s) AS max_nota,
                (SELECT MAX(s.gols) FROM (SELECT SUM(gols) AS gols FROM fato_jogador_geral f WHERE 1=1 ${tempoFilterSubquery} GROUP BY id_jogador) s) AS max_gols,
                (SELECT MAX(s.assistencias) FROM (SELECT SUM(assistencias) AS assistencias FROM fato_jogador_geral f WHERE 1=1 ${tempoFilterSubquery} GROUP BY id_jogador) s) AS max_assistencias,
                (SELECT MAX(s.participacoes) FROM (SELECT SUM(participacoes_em_gol) AS participacoes FROM fato_jogador_geral f WHERE 1=1 ${tempoFilterSubquery} GROUP BY id_jogador) s) AS max_participacoes,
                (SELECT MAX(s.minutos) FROM (SELECT SUM(minutos_jogados) AS minutos FROM fato_jogador_geral f WHERE 1=1 ${tempoFilterSubquery} GROUP BY id_jogador) s) AS max_minutos
            FROM fato_jogador_geral f
            JOIN dim_jogador j ON f.id_jogador = j.id_jogador
            JOIN dim_time t ON f.id_clube = t.id_time
            WHERE f.id_jogador = ? ${tempoFilterSubquery}
            GROUP BY j.nome_jogador, j.logo_url_jogador, t.logo_url_time;
        `;

        const finalParams = [...params, ...params, ...params, ...params, ...params, id_jogador, ...params];
        
        const data = await executeQuery(sql, finalParams);
        res.json(data[0]); // Retorna apenas o primeiro (e único) resultado
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 13: Dados para o Gráfico de Acordes (Fluxo de Vitórias)
app.get('/api/fluxo-vitorias', async (req, res) => {
    try {
        const { ano } = req.query; // Agora recebemos o 'ano'

        let sql = `
            SELECT
                vencedor.nome as source,
                perdedor.nome as target,
                COUNT(*) as value
            FROM fato_partida fp
            JOIN dim_time vencedor ON fp.id_vencedor = vencedor.id_time
            JOIN dim_time perdedor ON 
                (CASE 
                    WHEN fp.id_mandante = fp.id_vencedor THEN fp.id_visitante 
                    ELSE fp.id_mandante 
                END) = perdedor.id_time
            WHERE 
                fp.id_vencedor IS NOT NULL AND fp.id_vencedor != 0
        `;
        
        const params = [];

        // Subconsulta para encontrar todos os id_tempo diários que correspondem ao filtro de ano
        let subquery = `SELECT id_tempo FROM dim_tempo WHERE data_completa IS NOT NULL`;

        if (ano) {
            subquery += ` AND ano = ?`;
            params.push(ano);
        } else {
            // Se nenhum ano for selecionado, pega os 3 anos válidos
            subquery += ` AND ano IN (?, ?, ?)`;
            params.push(...['2021', '2022', '2023']);
        }
        
        sql += ` AND fp.id_tempo IN (${subquery})`;
        sql += ` GROUP BY source, target;`;

        const data = await executeQuery(sql, params);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota 14: Lista de times
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

// Rota 15: Listar AS TEMPORADAS VÁLIDAS para o filtro
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