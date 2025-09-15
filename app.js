const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Função que é chamada QUANDO QUALQUER FILTRO MUDA.
 * Ela atualiza tanto os gráficos de jogadores quanto a tabela do campeonato.
 */
function updateAllVisualizations() {
    updatePlayerCharts();
    fetchTabelaCampeonato();
}

/**
 * Atualiza todos os gráficos de jogadores com base nos filtros selecionados.
 */
function updatePlayerCharts() {
    const selectedTeamId = document.querySelector('#time-filter').value;
    const selectedTempoId = document.querySelector('#temporada-filter').value;

    const queryParams = [];
    if (selectedTeamId) queryParams.push(`id_time=${selectedTeamId}`);
    if (selectedTempoId) queryParams.push(`id_tempo=${selectedTempoId}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    console.log(`Atualizando gráficos de jogadores com: ${queryString}`);

    fetchAndDrawChart(`${API_BASE_URL}/artilheiros${queryString}`, "#artilheiros-chart", "Gols", "nome_jogador", "total");
    fetchAndDrawChart(`${API_BASE_URL}/assistencias${queryString}`, "#assistencias-chart", "Assistências", "nome_jogador", "total");
    fetchAndDrawChart(`${API_BASE_URL}/participacoes-gol${queryString}`, "#participacoes-chart", "Participações", "nome_jogador", "total");
    fetchAndDrawTable(`${API_BASE_URL}/eficiencia-minutos-gol${queryString}`, "#eficiencia-table", ["Jogador", "Gols", "Minutos", "Minutos / Gol"], ["nome_jogador", "total_gols", "total_minutos", "minutos_por_gol"]);
    fetchAndDrawTable(`${API_BASE_URL}/disciplina${queryString}`, "#disciplina-table", ["Jogador", "Amarelos 🟨", "Vermelhos 🟥"], ["nome_jogador", "amarelos", "vermelhos"]);
}

/**
 * Busca e desenha a tabela do campeonato com base no filtro de temporada.
 */
function fetchTabelaCampeonato() {
    // Agora lê do filtro global. Se nenhum for selecionado, usa o ID padrão (549 - 2023).
    const selectedIdTempo = document.querySelector('#temporada-filter').value || '549';
    
    console.log(`Atualizando tabela do campeonato para id_tempo: ${selectedIdTempo}`);
    
    const headers = ["#", "Time", "Pts", "PJ", "V", "E", "D", "GP", "GC", "SG"];
    const keys = ["posicao", "nome", "Pts", "PJ", "V", "E", "D", "GP", "GC", "SG"];
    const apiUrl = `${API_BASE_URL}/tabela-campeonato?id_tempo=${selectedIdTempo}`;
    fetchAndDrawTable(apiUrl, "#tabela-campeonato-table", headers, keys);
}

/**
 * Popula os menus de filtro buscando os dados da API.
 */
function populateFilters() {
    // Popula filtro de times
    fetch(`${API_BASE_URL}/times`)
        .then(res => res.json())
        .then(teams => {
            const select = document.querySelector('#time-filter');
            teams.forEach(team => {
                select.innerHTML += `<option value="${team.id_time}">${team.nome}</option>`;
            });
        });

    // Popula filtro de temporadas (agora só com os 3 valores válidos)
    fetch(`${API_BASE_URL}/temporadas`)
        .then(res => res.json())
        .then(temporadas => {
            const select = document.querySelector('#temporada-filter');
            temporadas.forEach(temp => {
                select.innerHTML += `<option value="${temp.id_tempo}">${temp.ano}</option>`;
            });
        });
}

// ----- FUNÇÕES GENÉRICAS (Cole suas funções aqui) -----
// ... As funções fetchAndDrawChart, fetchAndDrawTable, createBarChart, createTable ...
// (As mesmas do exemplo anterior)
function fetchAndDrawChart(apiUrl, selector, yAxisLabel, xKey, yKey) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            createBarChart(data, selector, yAxisLabel, xKey, yKey);
        })
        .catch(error => {
            console.error(`Erro ao carregar dados de ${apiUrl}:`, error);
            document.querySelector(selector).innerHTML = `<p class="error-message">Não foi possível carregar os dados.</p>`;
        });
}

function fetchAndDrawTable(apiUrl, selector, headers, keys) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            if (headers.includes('#')) {
                const dataComPosicao = data.map((item, index) => ({ ...item, posicao: index + 1 }));
                createTable(dataComPosicao, selector, headers, keys);
            } else {
                createTable(data, selector, headers, keys);
            }
        })
        .catch(error => {
            console.error(`Erro ao carregar dados de ${apiUrl}:`, error);
            document.querySelector(selector).innerHTML = `<p class="error-message">Não foi possível carregar os dados.</p>`;
        });
}

// app.js

function createBarChart(data, selector, yAxisLabel, xKey, yKey) {
    const container = d3.select(selector);
    container.html(""); // Limpa o container

    // Adiciona uma mensagem se não houver dados
    if (data.length === 0) {
        container.html("<p>Nenhum dado encontrado para esta combinação de filtros.</p>");
        return;
    }

    const margin = { top: 30, right: 30, bottom: 100, left: 50 };
    const width = 450 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
    // Seleciona o nosso div de tooltip
    const tooltip = d3.select('.tooltip');

    // 1. CORREÇÃO DO EIXO Y
    // Usamos o operador '+' para garantir que o valor seja tratado como NÚMERO
    // Multiplicamos por 1.1 para dar um espaço extra no topo do gráfico
    const yMax = d3.max(data, d => +d[yKey]);
    const yScale = d3.scaleLinear()
        .domain([0, yMax * 1.1 || 10])
        .range([height, 0]);

    const xScale = d3.scaleBand()
        .domain(data.map(d => d[xKey]))
        .range([0, width])
        .padding(0.2);

    // Desenha os eixos
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(yScale).ticks(5));

    // Desenha as barras
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d[xKey]))
        .attr("y", d => yScale(+d[yKey]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(+d[yKey]))
        
        // 2. MELHORIA: ADICIONANDO EVENTOS DE MOUSE (TOOLTIP)
        .on('mouseover', function(event, d) {
            // Aumenta a opacidade da barra para dar feedback
            d3.select(this).style('opacity', 0.7);

            // Torna o tooltip visível
            tooltip.style('opacity', 1);

            // Define o conteúdo e a posição do tooltip
            tooltip.html(`${xKey.replace(/_/g, ' ')}: <strong>${d[xKey]}</strong><br>${yAxisLabel}: <strong>${d[yKey]}</strong>`)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            // Restaura a opacidade da barra
            d3.select(this).style('opacity', 1);
            // Esconde o tooltip
            tooltip.style('opacity', 0);
        });

    // 3. MELHORIA: ADICIONANDO RÓTULOS (VALOR EM CIMA DA BARRA)
    svg.selectAll(".bar-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => xScale(d[xKey]) + xScale.bandwidth() / 2) // Centraliza o texto no meio da barra
        .attr("y", d => yScale(+d[yKey]) - 5) // Posiciona um pouco acima da barra
        .text(d => d[yKey]);
}

function createTable(data, selector, headers, keys) {
    const container = d3.select(selector);
    container.html("");
    
    if (data.length === 0) {
        container.html("<p>Nenhum dado encontrado para esta combinação de filtros.</p>");
        return;
    }

    const table = container.append("table");
    const thead = table.append("thead");
    const tbody = table.append("tbody");

    thead.append("tr").selectAll("th").data(headers).enter().append("th").text(d => d);
    const rows = tbody.selectAll("tr").data(data).enter().append("tr");

    rows.selectAll("td")
        .data(rowData => keys.map(key => ({ key: key, value: rowData[key], fullData: rowData })))
        .enter().append("td")
        .html(cellData => {
            if (cellData.key === 'nome') {
                return `<img src="${cellData.fullData.logo_url_time}" class="team-logo" referrerpolicy="no-referrer"> ${cellData.value}`;
            }
            return cellData.value;
        });
}


// ----- INICIALIZAÇÃO DA PÁGINA -----

document.addEventListener('DOMContentLoaded', () => {
    // 1. Popula os filtros
    populateFilters();
    
    // 2. Carrega tudo pela primeira vez
    updateAllVisualizations();

    // 3. Adiciona os eventos que atualizam TUDO sempre que QUALQUER filtro mudar
    document.querySelector('#time-filter').addEventListener('change', updateAllVisualizations);
    document.querySelector('#temporada-filter').addEventListener('change', updateAllVisualizations);
});