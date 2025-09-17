const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Função que é chamada QUANDO QUALQUER FILTRO MUDA.
 * Ela atualiza tanto os gráficos de jogadores quanto a tabela do campeonato.
 */
function updateAllVisualizations() {
    updatePlayerCharts();
    fetchTabelaCampeonato();
    loadTemporalAnalysisCharts();
    updateKpis();
    loadBubbleMap()
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

function loadTemporalAnalysisCharts() {
    const selectedTeamId = document.querySelector('#time-filter').value;
    const teamQueryParam = selectedTeamId ? `?id_time=${selectedTeamId}` : '';

    fetch(`${API_BASE_URL}/analise-temporal${teamQueryParam}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                createMultiLineChart(data);
                createStackedAreaChart(data);
            } else {
                // Limpa os gráficos se não houver dados
                d3.select("#multi-line-chart").html("<p>Nenhum dado encontrado para este time.</p>");
                d3.select("#stacked-area-chart").html("<p>Nenhum dado encontrado para este time.</p>");
            }
        })
        .catch(error => console.error('Erro ao carregar dados para análise temporal:', error));
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

// GRÁFICO DE LINHAS MÚLTIPLAS

function createMultiLineChart(data) {
    const isTeamSpecific = data.length > 0 && data[0].hasOwnProperty('pct_vitorias');
    const yAxisLabel = isTeamSpecific ? "Média de Gols Marcados" : "Média de Gols por Jogo (Liga)";

    const selector = "#multi-line-chart";
    const container = d3.select(selector);
    container.html("");

    const margin = { top: 20, right: 100, bottom: 50, left: 100 }; 
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);    
    
    const tooltip = d3.select('.tooltip');
    const dataAgrupada = d3.group(data, d => d.temporada);

    const xScale = d3.scaleLinear().domain([4, 12]).range([0, width]);

    // Encontra o valor mínimo e máximo antes para deixar o código mais limpo.
    const yMin = d3.min(data, d => d.media_gols_por_jogo);
    const yMax = d3.max(data, d => d.media_gols_por_jogo);
    // Defina a escala usando esses valores dinâmicos
    const yScale = d3.scaleLinear()
    .domain([yMin * 0.9, yMax * 1.1]) //Mínimo e Máximo agora são dinâmicos!
    .range([height, 0]);
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale).ticks(9).tickFormat(d3.format("d")));
    svg.append("g").call(d3.axisLeft(yScale));
    svg.append("text").attr("x", width / 2).attr("y", height + 40).text("Mês").style("text-anchor", "middle");
    // Usamos a label dinâmica aqui
    svg.append("text").attr("transform", "rotate(-90)").attr("y", -45).attr("x", -height / 2).text(yAxisLabel).style("text-anchor", "middle");

    const lineGenerator = d3.line().x(d => xScale(d.mes)).y(d => yScale(d.media_gols_por_jogo));

    svg.selectAll(".line").data(dataAgrupada).enter().append("path").attr("fill", "none").attr("stroke", d => colorScale(d[0])).attr("stroke-width", 2.5).attr("d", d => lineGenerator(d[1]));

    const legend = svg.selectAll(".legend").data(dataAgrupada.keys()).enter().append("g").attr("class", "legend").attr("transform", (d, i) => `translate(0,${i * 20})`);
    legend.append("rect").attr("x", width + 5).attr("width", 18).attr("height", 18).style("fill", d => colorScale(d));
    legend.append("text").attr("x", width + 30).attr("y", 9).attr("dy", ".35em").text(d => `${d}`).style("text-anchor", "start");

    const focusLine = svg.append("line").attr("class", "focus-line").style("stroke", "#999").style("stroke-width", 1).style("stroke-dasharray", "3,3").style("opacity", 0);
    const focusCircles = svg.append("g").selectAll(".focus-circle").data(dataAgrupada.keys()).enter().append("circle").attr("r", 5).style("fill", d => colorScale(d)).style("stroke", "white").style("opacity", 0);
    svg.append("rect").attr("class", "overlay").attr("width", width).attr("height", height).style("fill", "none").style("pointer-events", "all")
        .on("mouseover", () => { focusLine.style("opacity", 1); focusCircles.style("opacity", 1); tooltip.style('opacity', 1); })
        .on("mouseout", () => { focusLine.style("opacity", 0); focusCircles.style("opacity", 0); tooltip.style('opacity', 0); })
        .on("mousemove", (event) => {
            const mouseX = d3.pointer(event)[0];
            const xValue = Math.round(xScale.invert(mouseX));
            if (xValue >= 1 && xValue <= 12) {
                focusLine.attr("x1", xScale(xValue)).attr("x2", xScale(xValue)).attr("y1", 0).attr("y2", height);
                let tooltipContent = `<strong>Mês: ${xValue}</strong><br/>`;
                focusCircles.each(function(temporada) {
                    const d = [...dataAgrupada.get(temporada)].find(item => item.mes === xValue);
                    if (d) {
                        d3.select(this).attr("cx", xScale(d.mes)).attr("cy", yScale(d.media_gols_por_jogo)).style("opacity", 1);
                        tooltipContent += `<span style="color:${colorScale(temporada)};">●</span> ${temporada}: ${d.media_gols_por_jogo}<br/>`;
                    } else {
                        d3.select(this).style("opacity", 0);
                    }
                });
                tooltip.html(tooltipContent).style('left', (event.pageX + 15) + 'px').style('top', (event.pageY) + 'px');
            }
        });
}


function createStackedAreaChart(data) {
    const selector = "#stacked-area-chart";
    const container = d3.select(selector);
    container.html("");

    const isTeamSpecific = data.length > 0 && data[0].hasOwnProperty('pct_vitorias');

    // Define chaves, cores e legendas dinamicamente
    const keys = isTeamSpecific ?
        ["pct_vitorias", "pct_empates", "pct_derrotas"] :
        ["pct_vitorias_casa", "pct_vitorias_fora", "pct_empates"];

    const colorRange = isTeamSpecific ?
        ['#2ca02c', '#7f7f7f', '#d62728'] : // Verde (V), Cinza (E), Vermelho (D)
        ['#1f77b4', '#ff7f0e', '#2ca02c']; // Cores originais

    const legendLabels = isTeamSpecific ?
        { pct_vitorias: "Vitórias", pct_empates: "Empates", pct_derrotas: "Derrotas" } :
        { pct_vitorias_casa: "Mandante", pct_vitorias_fora: "Visitante", pct_empates: "Empates" };

    const margin = { top: 20, right: 150, bottom: 50, left: 100 }; // Aumentei a margem direita
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
        
    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
    const tooltip = d3.select('.tooltip');

    const formattedData = data.map(d => ({ date: new Date(d.temporada, d.mes - 1), ...d }));
    
    const stack = d3.stack().keys(keys);
    const stackedData = stack(formattedData);

    const xScale = d3.scaleTime().domain(d3.extent(formattedData, d => d.date)).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    const colorScale = d3.scaleOrdinal().domain(keys).range(colorRange);

    const areaGenerator = d3.area().x(d => xScale(d.data.date)).y0(d => yScale(d[0])).y1(d => yScale(d[1]));

    svg.selectAll(".area").data(stackedData).enter().append("path").attr("class", "area").style("fill", d => colorScale(d.key)).attr("d", areaGenerator);
    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale).ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat("%Y")));
    svg.append("g").call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));
    svg.append("text").attr("x", width / 2).attr("y", height + 40).text("Tempo").style("text-anchor", "middle");
    svg.append("text").attr("transform", "rotate(-90)").attr("y", -40).attr("x", -height / 2).text("% de Resultados").style("text-anchor", "middle");

    const legend = svg.selectAll(".legend").data(keys).enter().append("g").attr("class", "legend").attr("transform", (d, i) => `translate(0,${i * 20})`);
    legend.append("rect").attr("x", width + 5).attr("width", 18).attr("height", 18).style("fill", d => colorScale(d));
    legend.append("text").attr("x", width + 30).attr("y", 9).attr("dy", ".35em").text(d => legendLabels[d]).style("text-anchor", "start");

    const focusLine = svg.append("line").attr("class", "focus-line").style("stroke", "#999").style("stroke-width", 1).style("stroke-dasharray", "3,3").style("opacity", 0);
    const focusCircles = svg.append("g").selectAll(".focus-circle").data(keys).enter().append("circle").attr("r", 5).style("fill", d => colorScale(d)).style("stroke", "white").style("opacity", 0);
    const bisectDate = d3.bisector(d => d.date).left;

    svg.append("rect").attr("class", "overlay").attr("width", width).attr("height", height).style("fill", "none").style("pointer-events", "all")
        .on("mouseover", () => { focusLine.style("opacity", 1); focusCircles.style("opacity", 1); tooltip.style('opacity', 1); })
        .on("mouseout", () => { focusLine.style("opacity", 0); focusCircles.style("opacity", 0); tooltip.style('opacity', 0); })
        .on("mousemove", (event) => {
            const mouseX = d3.pointer(event)[0];
            const xDate = xScale.invert(mouseX);
            const index = bisectDate(formattedData, xDate, 1);
            const d0 = formattedData[index - 1];
            const d1 = formattedData[index];
            const d = (d1 && (xDate - d0.date > d1.date - xDate)) ? d1 : d0;
            if (d) {
                focusLine.attr("x1", xScale(d.date)).attr("x2", xScale(d.date)).attr("y1", 0).attr("y2", height);
                let tooltipContent = `<strong>${d3.timeFormat("%b %Y")(d.date)}</strong><br/>`;
                focusCircles.each(function(key) {
                    const series = stackedData.find(s => s.key === key);
                    const point = series[formattedData.indexOf(d)];
                    d3.select(this).attr("cx", xScale(d.date)).attr("cy", yScale(point[1])).style("opacity", 1);
                    tooltipContent += `<span style="color:${colorScale(key)};">●</span> ${legendLabels[key]}: ${d[key]}%<br/>`;
                });
                tooltip.html(tooltipContent).style('left', (event.pageX + 15) + 'px').style('top', (event.pageY) + 'px');
            }
        });
}

function updateKpis() {
    const selectedTeamId = document.querySelector('#time-filter').value;
    const selectedTempoId = document.querySelector('#temporada-filter').value;

    const queryParams = [];
    // Nota: O backend assume 2023 se nenhum id_tempo for passado para o comparativo
    if (selectedTeamId) queryParams.push(`id_time=${selectedTeamId}`);
    if (selectedTempoId) queryParams.push(`id_tempo=${selectedTempoId}`);
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    fetch(`${API_BASE_URL}/kpis${queryString}`)
        .then(res => res.json())
        .then(data => {
            updateKpiCard('#kpi-passes', data.passes, '%', true); // higher is better
            updateKpiCard('#kpi-defesas', data.defesas, '', true); // higher is better
            updateKpiCard('#kpi-posse', data.posse, '%', true); // higher is better
        })
        .catch(error => console.error('Erro ao carregar KPIs:', error));
}

/**
 * Função auxiliar para popular um único cartão de KPI.
 * @param {string} selector - O seletor do cartão (ex: '#kpi-posse').
 * @param {object} kpiData - O objeto com {current, previous}.
 * @param {string} suffix - O sufixo do valor (ex: '%').
 * @param {boolean} higherIsBetter - Define a cor da variação.
 */
function updateKpiCard(selector, kpiData, suffix = '', higherIsBetter = true) {
    const card = document.querySelector(selector);
    const valueEl = card.querySelector('.kpi-value');
    const compEl = card.querySelector('.kpi-comparison');

    valueEl.textContent = `${kpiData.current}${suffix}`;

    if (kpiData.previous === null) {
        compEl.textContent = 'N/A vs ano anterior';
        compEl.className = 'kpi-comparison';
        return;
    }

    const diff = kpiData.current - kpiData.previous;
    const percentageChange = (kpiData.previous > 0) ? diff : 0;

    let arrow = percentageChange > 0.01 ? '▲' : (percentageChange < -0.01 ? '▼' : '');
    let className = '';

    if (arrow === '▲') {
        className = higherIsBetter ? 'positive' : 'negative';
    } else if (arrow === '▼') {
        className = higherIsBetter ? 'negative' : 'positive';
    }

    compEl.innerHTML = `<span class="${className}">${arrow} ${percentageChange.toFixed(1)}</span> vs ano anterior`;
}

    function createBubbleMap(data, worldAtlas) {
        const selector = "#bubble-map-chart";
        const container = d3.select(selector);
        container.html("");

        const width = 1000;
        const height = 800;

        const svg = container.append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`);
            
        const tooltip = d3.select('.tooltip');

        // 1. Converter os dados do mapa (TopoJSON) para GeoJSON
        const countries = topojson.feature(worldAtlas, worldAtlas.objects.countries);

        // 2. Criar a projeção do mapa (como a esfera 3D é achatada em 2D)
         const projection = d3.geoMercator()
            .scale(300) // Aumenta o zoom. Ajuste este valor se necessário.
            .center([-25, 20]) // Centraliza no Atlântico [Longitude, Latitude]
            .translate([width / 2, height / 2]); // Garante que o ponto central fique no meio do SVG

        // 3. Criar o gerador de caminhos (desenha as fronteiras)
        const pathGenerator = d3.geoPath().projection(projection);

        // 4. Desenhar os países do mapa
        svg.selectAll(".country")
            .data(countries.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", pathGenerator)
            .style("fill", "#ccc")
            .style("stroke", "#fff");

        // 5. Preparar os dados das bolhas
        const playerCounts = new Map(data.map(d => [d.nacionalidade, d.total_jogadores]));
        const maxPlayers = d3.max(data, d => d.total_jogadores);

        // 6. Criar a escala para o raio das bolhas (sqrt para área ser proporcional)
        const radiusScale = d3.scaleSqrt()
            .domain([0, maxPlayers])
            .range([5, 40]); // Raio máximo de 40 pixels

        // 7. Criar as bolhas
        svg.selectAll(".bubble")
            // Filtra apenas os países do mapa que existem nos seus dados de jogadores
            .data(countries.features.filter(d => playerCounts.has(d.properties.name)))
            .enter()
            .append("circle")
            .attr("class", "bubble")
            // Posiciona a bolha no centroide (centro geográfico) do país
            .attr("transform", d => `translate(${pathGenerator.centroid(d)})`)
            .attr("r", d => radiusScale(playerCounts.get(d.properties.name)))
            .style("fill", "#1f77b4")
            .style("fill-opacity", 0.7)
            .style("stroke", "#fff")
            .style("stroke-width", 0.5)
            // Adiciona a interatividade de mouseover
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill-opacity", 1);
                tooltip.style("opacity", 1)
                    .html(`<strong>${d.properties.name}</strong><br>Jogadores: ${playerCounts.get(d.properties.name)}`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).style("fill-opacity", 0.7);
                tooltip.style("opacity", 0);
            });
    }

    // ----- Função para carregar os dados do mapa -----
    function loadBubbleMap() {
    // Lê ambos os filtros
    const selectedTeamId = document.querySelector('#time-filter').value;
    const selectedTempoId = document.querySelector('#temporada-filter').value;

    // Constrói a query string dinamicamente
    const queryParams = [];
    if (selectedTeamId) queryParams.push(`id_time=${selectedTeamId}`);
    if (selectedTempoId) queryParams.push(`id_tempo=${selectedTempoId}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    const worldAtlasURL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

    Promise.all([
        d3.json(`${API_BASE_URL}/jogadores-por-nacionalidade${queryString}`),
        d3.json(worldAtlasURL)
    ])
    .then(([playerData, worldData]) => {
        if (playerData && playerData.length > 0) {
            createBubbleMap(playerData, worldData);
        } else {
            d3.select("#bubble-map-chart").html("<p>Nenhum dado de nacionalidade encontrado para esta combinação de filtros.</p>");
        }
    })
    .catch(error => console.error('Erro ao carregar dados para o mapa:', error));
}

// ----- INICIALIZAÇÃO DA PÁGINA -----
document.addEventListener('DOMContentLoaded', () => {
    populateFilters();
    updateAllVisualizations(); // Esta função agora carrega TUDO

    // O evento de 'change' para o filtro de time já chama a função correta
    document.querySelector('#time-filter').addEventListener('change', updateAllVisualizations);
    
    // O evento do filtro de temporada deve atualizar tudo, exceto os gráficos de jogadores
    document.querySelector('#temporada-filter').addEventListener('change', () => {
        updatePlayerCharts(); // Mantém a lógica anterior
        fetchTabelaCampeonato();
        updateKpis();
        loadBubbleMap()
        // Não chamamos loadTemporalAnalysisCharts aqui, pois ele não usa o filtro de temporada.
    });
});