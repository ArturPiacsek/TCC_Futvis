const API_BASE_URL = 'http://localhost:3000/api';

const coresTimes = {
    '1': { primary: '#006CB5', secondary: '#ED3237' },  // Bahia
    '2': { primary: '#E5050F', secondary: '#DCDCDC' },  // Internacional
    '3': { primary: '#BC8422', secondary: '#000000' },  // Botafogo - Cor de apoio institucional
    '4': { primary: '#006437', secondary: '#DCDCDC' },  // Palmeiras
    '5': { primary: '#CC001A', secondary: '#000000' },  // Sport
    '6': { primary: '#870A28', secondary: '#00613C' },  // Fluminense
    '7': { primary: '#007F4E', secondary: '#000000' },  // América MG
    '8': { primary: '#FE0000', secondary: '#000000' },  // São Paulo
    '9': { primary: '#C52613', secondary: '#000000' },  // Flamengo
    '10': { primary: '#C69F0F', secondary: '#DCDCDC' },  // Santos - Cor da coroa em homenagem ao Pelé
    '11': { primary: '#4D2E6F', secondary: '#DCDCDC' },  // Ceará - Roxo por conta da campanha "Roxo pelo Vozão"
    '12': { primary: '#0D80BF', secondary: '#000000' },  // Grêmio
    '13': { primary: '#CC2031', secondary: '#DCDCDC' },  // Corinthians
    '14': { primary: '#0E8E3A', secondary: '#DCDCDC' },  // Chapecoense
    '15': { primary: '#E2231A', secondary: '#DCDCDC' },  // Vasco
    '16': { primary: '#CE181E', secondary: '#000000' },  // Athletico Paranaense
    '17': { primary: '#2F529E', secondary: '#DCDCDC' },  // Cruzeiro
    '18': { primary: '#DC1212', secondary: '#000000' },  // Atletico GO
    '19': { primary: '#00679A', secondary: '#DCDCDC' },  // Avaí
    '20': { primary: '#00544D', secondary: '#DCDCDC' },  // Coritiba
    '21': { primary: '#00491E', secondary: '#DCDCDC' },  // Goiás
    '22': { primary: '#009035', secondary: '#DCDCDC' },  // Juventude
    '23': { primary: '#006CB5', secondary: '#ED3237' },  // Fortaleza
    '24': { primary: '#D2003C', secondary: '#001D46' },  // Bragantino
    '25': { primary: '#FFD503', secondary: '#000000' },  // Atlético MG
    '26': { primary: '#FFD200', secondary: '#066334' }, // Cuiabá
}

//Função que é chamada QUANDO QUALQUER FILTRO MUDA. 
function updateAllVisualizations() {
    hidePlayerDetails();
    hideTeamComparisonPanel();
    hideTeamDefenseComparisonPanel();
    hideTeamGoalsComparisonPanel();
    hideNationalityDetails();

    const faltasBtn = document.getElementById('heatmap-faltas-btn');
    const cartoesBtn = document.getElementById('heatmap-cartoes-btn');
    if (faltasBtn && cartoesBtn) {
        faltasBtn.classList.add('active');
        cartoesBtn.classList.remove('active');
    }
    updateHighlightColor(); 
    updatePlayerCharts();
    fetchTabelaCampeonato();
    loadTemporalAnalysisCharts();
    updateKpis();
    loadBubbleMap();
    loadHistogram();
    loadScatterPlot();
    loadGoalkeeperAnalysis();
    loadChordDiagram();
    loadHeatmap();
    loadConversionRateChart();
    loadCleanSheetChart();
    loadHomeAwayChart();      
}

// Atualiza todos os gráficos de jogadores com base nos filtros selecionados. 
function updatePlayerCharts() {
    const selectedTeamId = document.querySelector('#time-filter').value;
    const selectedTempoId = document.querySelector('#temporada-filter').value;

    const queryParams = [];
    if (selectedTeamId) queryParams.push(`id_time=${selectedTeamId}`);
    if (selectedTempoId) queryParams.push(`id_tempo=${selectedTempoId}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    console.log(`Atualizando gráficos de jogadores com: ${queryString}`);

    fetchAndDrawChart(`${API_BASE_URL}/artilheiros${queryString}`, "#artilheiros-tab", "Gols", "nome_jogador", "total");
    fetchAndDrawChart(`${API_BASE_URL}/assistencias${queryString}`, "#assistencias-tab", "Assistências", "nome_jogador", "total");
    fetchAndDrawChart(`${API_BASE_URL}/participacoes-gol${queryString}`, "#participacoes-tab", "Participações", "nome_jogador", "total");    
    fetch(`${API_BASE_URL}/disciplina${queryString}`)
        .then(res => res.json())
        .then(data => {
            if (data && !data.error) {                
                createStackedBarChart(data, "#disciplina-tab", "Total de Cartões");
        }
    })
    .catch(error => console.error('Erro ao carregar dados de disciplina:', error));
}


// Busca e desenha a tabela do campeonato com base no filtro de temporada.
 
function fetchTabelaCampeonato() {
    // Agora lê do filtro global. Se nenhum for selecionado, usa o ID padrão (549 - 2023).
    const selectedIdTempo = document.querySelector('#temporada-filter').value || '549';
    
    console.log(`Atualizando tabela do campeonato para id_tempo: ${selectedIdTempo}`);
    
    const headers = ["#", "Time", "Pts", "PJ", "V", "E", "D", "GP", "GC", "SG"];
    const keys = ["posicao", "nome", "Pts", "PJ", "V", "E", "D", "GP", "GC", "SG"];
    const apiUrl = `${API_BASE_URL}/tabela-campeonato?id_tempo=${selectedIdTempo}`;
    fetchAndDrawTable(apiUrl, "#tabela-campeonato-table", headers, keys);
}


//Popula os menus de filtro buscando os dados da API.
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

    // Popula filtro de temporadas
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

// ----- Função para carregar os dados do Scatter Plot -----
function loadScatterPlot() {
    // Este gráfico depende apenas do filtro de temporada
    const selectedTempoId = document.querySelector('#temporada-filter').value;
    const tempoQueryParam = selectedTempoId ? `?id_tempo=${selectedTempoId}` : '';

    fetch(`${API_BASE_URL}/estilos-de-jogo${tempoQueryParam}`)
        .then(res => res.json())
        .then(data => {
            createScatterPlot(data);
        })
        .catch(error => console.error('Erro ao carregar dados do scatter plot:', error));
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

// ----- FUNÇÕES GENÉRICAS -----
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

//Função principal para carregar os dados da análise de goleiros. 
function loadGoalkeeperAnalysis() {
    // Lê ambos os filtros
    const selectedTeamId = document.querySelector('#time-filter').value;
    const selectedTempoId = document.querySelector('#temporada-filter').value;

    const queryParams = [];
    if (selectedTeamId) queryParams.push(`id_time=${selectedTeamId}`);
    if (selectedTempoId) queryParams.push(`id_tempo=${selectedTempoId}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    fetch(`${API_BASE_URL}/analise-goleiros${queryString}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                createGoalkeeperBarChart(data);
                createGoalkeeperScatterPlot(data, "#goleiros-scatter-tab");
            } else {
                d3.select("#goleiro-barras").html("<p>Nenhum dado de goleiro encontrado para esta combinação de filtros.</p>");
                d3.select("#goleiro-dispersao").html("<p>Nenhum dado de goleiro encontrado para esta combinação de filtros.</p>");
            }
        })
        .catch(error => console.error('Erro ao carregar análise de goleiros:', error));
}

// ----- Função para carregar os dados do Gráfico de Acordes -----
function loadChordDiagram() {
    const selectElement = document.querySelector('#temporada-filter');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    
    // Pega o ANO (texto da opção) em vez do ID (valor da opção)
    // Se a opção selecionada for a default ("Todos os Anos"), o valor é "", então o texto não é pego.
    const selectedYear = selectedOption.value ? selectedOption.text : '';

    const tempoQueryParam = selectedYear ? `?ano=${selectedYear}` : '';

    fetch(`${API_BASE_URL}/fluxo-vitorias${tempoQueryParam}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                createChordDiagram(data);
            } else {
                d3.select("#chord-diagram-chart").html("<p>Nenhum dado de confronto encontrado para este período.</p>");
            }
        })
        .catch(error => console.error('Erro ao carregar dados para o gráfico de acordes:', error));
}

/** Função principal para carregar os dados do Heatmap e configurar os controles. */
function loadHeatmap() {
    const selectedTeamId = document.querySelector('#time-filter').value;
    const selectElement = document.querySelector('#temporada-filter');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const selectedYear = selectedOption.value ? selectedOption.text : '';
    
    const queryParams = [];
    if (selectedTeamId) queryParams.push(`id_time=${selectedTeamId}`);
    if (selectedYear) queryParams.push(`ano=${selectedYear}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    fetch(`${API_BASE_URL}/disciplina-heatmap${queryString}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                let currentMetric = 'total_faltas';

                // Desenha o gráfico inicial
                createHeatmap(data, currentMetric);

                // Configura os botões de controle
                d3.select("#heatmap-faltas-btn").on("click", () => {
                    currentMetric = 'total_faltas';
                    d3.select("#heatmap-faltas-btn").classed("active", true);
                    d3.select("#heatmap-cartoes-btn").classed("active", false);
                    createHeatmap(data, currentMetric);
                });

                d3.select("#heatmap-cartoes-btn").on("click", () => {
                    currentMetric = 'total_cartoes';
                    d3.select("#heatmap-faltas-btn").classed("active", false);
                    d3.select("#heatmap-cartoes-btn").classed("active", true);
                    createHeatmap(data, currentMetric);
                });
            } else {
                d3.select("#heatmap-chart").html("<p>Nenhum dado de disciplina encontrado para esta combinação de filtros.</p>");
            }
        })
        .catch(error => console.error('Erro ao carregar dados do heatmap:', error));
}

/** Função principal para carregar os dados da Taxa de Conversão. */
function loadConversionRateChart() {
    const selectedTempoId = document.querySelector('#temporada-filter').value;
    const tempoQueryParam = selectedTempoId ? `?id_tempo=${selectedTempoId}` : '';

    // Pega o nome do time selecionado no filtro
    const timeSelect = document.querySelector('#time-filter');
    const selectedTeamName = timeSelect.value ? timeSelect.options[timeSelect.selectedIndex].text : null;

    fetch(`${API_BASE_URL}/taxa-conversao${tempoQueryParam}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                // Passa o nome do time selecionado como um novo argumento
                createHorizontalBarChart(data, selectedTeamName);
            } else {
                d3.select("#conversion-rate-chart").html("<p>Nenhum dado encontrado para este período.</p>");
            }
        })
        .catch(error => console.error('Erro ao carregar dados da taxa de conversão:', error));
}

// Esconde o painel de comparação de times.
function hideTeamComparisonPanel() {
    d3.select("#team-comparison-panel").style("display", "none");
}

/** Esconde o painel de comparação defensiva. */
function hideTeamDefenseComparisonPanel() {
    d3.select("#team-defense-comparison-panel").style("display", "none");
}
/** Esconde o painel de comparação de gols. */
function hideTeamGoalsComparisonPanel() {
    d3.select("#team-goals-comparison-panel").style("display", "none");
}

/** Esconde o painel de detalhes de nacionalidade. */
function hideNationalityDetails() {
    d3.select("#nationality-details-panel").style("display", "none");
}

/**
 * Orquestra a exibição do painel de comparação.
 * @param {object} clickedTeamData - Os dados do time que foi clicado no gráfico de barras.
 */
function showTeamComparisonPanel(clickedTeamData) {
    const panel = d3.select("#team-comparison-panel");
    const baseContainer = d3.select("#pie-chart-base");
    const comparisonContainer = d3.select("#pie-chart-comparison");

    const timeSelect = document.querySelector('#time-filter');
    const selectedTeamId = timeSelect.value;
    const selectedTempoId = document.querySelector('#temporada-filter').value;
    const tempoQueryParam = selectedTempoId ? `&id_tempo=${selectedTempoId}` : '';

    panel.style("display", "block"); // Mostra o painel
    baseContainer.html("Carregando...");
    comparisonContainer.html(""); // Limpa o container de comparação

    // CASO 1: Um time já está selecionado no filtro principal (MODO COMPARAÇÃO)
    if (selectedTeamId && selectedTeamId != clickedTeamData.id_time) {
        comparisonContainer.style("display", "block");

        Promise.all([
            fetch(`${API_BASE_URL}/time-detalhes-ofensivos?id_time=${selectedTeamId}${tempoQueryParam}`),
            fetch(`${API_BASE_URL}/time-detalhes-ofensivos?id_time=${clickedTeamData.id_time}${tempoQueryParam}`)
        ])
        .then(responses => Promise.all(responses.map(res => res.json())))
        .then(([baseData, comparisonData]) => {
            createPieChart(baseData, "#pie-chart-base");
            createPieChart(comparisonData, "#pie-chart-comparison");
        });
    } 
    // CASO 2: Nenhum time no filtro, ou clicou no mesmo time do filtro (MODO VISUALIZAÇÃO SIMPLES)
    else {
        comparisonContainer.style("display", "none"); // Esconde o segundo container
        fetch(`${API_BASE_URL}/time-detalhes-ofensivos?id_time=${clickedTeamData.id_time}${tempoQueryParam}`)
            .then(res => res.json())
            .then(data => {
                createPieChart(data, "#pie-chart-base");
            });
    }
}

/** Função principal para carregar e desenhar o gráfico de Clean Sheets. */
function loadCleanSheetChart() {
    const selectElement = document.querySelector('#temporada-filter');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const selectedYear = selectedOption.value ? selectedOption.text : '';
    const anoQueryParam = selectedYear ? `?ano=${selectedYear}` : '';
    
    const timeSelect = document.querySelector('#time-filter');
    const selectedTeamName = timeSelect.value ? timeSelect.options[timeSelect.selectedIndex].text : null;

    fetch(`${API_BASE_URL}/clean-sheets${anoQueryParam}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                const container = d3.select("#clean-sheet-chart");
                container.html("");

                const computedStyle = getComputedStyle(document.documentElement);
                const primaryColor = computedStyle.getPropertyValue('--cor-destaque').trim();
                const secondaryColor = computedStyle.getPropertyValue('--cor-secundaria').trim();
                
                const margin = { top: 20, right: 50, bottom: 80, left: 150 };
                const width = 700 - margin.left - margin.right;
                const height = 600 - margin.top - margin.bottom;

                const svg = container.append("svg")
                    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
                  .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);
                
                const tooltip = d3.select('.tooltip');
                
                const xScale = d3.scaleLinear().domain([0, d3.max(data, d => +d.clean_sheets) * 1.1]).range([0, width]);
                const yScale = d3.scaleBand().domain(data.map(d => d.nome).reverse()).range([height, 0]).padding(0.1);

                svg.append("g").call(d3.axisLeft(yScale));
                svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale));

                svg.append("text").attr("x", width / 2).attr("y", height + 40).text("Número de Jogos").style("text-anchor", "middle");

                svg.selectAll(".bar-label")
                    .data(data)
                    .enter()
                    .append("text")
                    .attr("class", "bar-label")
                    .attr("y", d => yScale(d.nome) + yScale.bandwidth() / 2 + 4)
                    .attr("x", d => xScale(+d.clean_sheets) + 10)
                    .text(d => `${parseInt(d.clean_sheets).toFixed(0)}`)
                    .style("font-size", "12px")
                    .style("font-weight", "bold")
                    .style("fill", "#333");

                svg.selectAll(".barra")
                    .data(data)
                    .enter()
                    .append("rect")
                    .attr("class", "barra")
                    .attr("y", d => yScale(d.nome))
                    .attr("x", 0)
                    .attr("height", yScale.bandwidth())
                    .attr("width", 0) // Estado inicial para a animação
                    .attr("fill", d => d.nome === selectedTeamName ? secondaryColor: primaryColor)
                    .style("cursor", "pointer")                    
                    .on("click", (event, d) => showTeamDefenseComparisonPanel(d))
                    .on("mouseover", (event, d) => {
                        tooltip.style("opacity", 1).html(`
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <img src="${d.logo_url_time}" style="width: 25px;" referrerpolicy="no-referrer">
                            <div>
                            <strong>${d.nome}</strong><br/>
                            Jogos s/ sofrer gols: ${d.clean_sheets}<br/>
                            Gols Sofridos: ${d.gols_sofridos}<br/>
                            Média Gols Sofridos: ${parseFloat(d.media_gols_sofridos).toFixed(2)}
                        `);                        
                        tooltip.style("left", (event.pageX + 15) + "px")
                               .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", () => tooltip.style("opacity", 0))                    
                    .transition()
                    .duration(800)
                    .attr("width", d => xScale(+d.clean_sheets));
            } else {
                d3.select("#clean-sheet-chart").html("<p>Nenhum dado encontrado.</p>");
            }
        });
}
/** Orquestra a exibição do painel de comparação defensiva. */
function showTeamDefenseComparisonPanel(clickedTeamData) {
    const panel = d3.select("#team-defense-comparison-panel");
    const baseContainer = d3.select("#defense-detail-base");
    const comparisonContainer = d3.select("#defense-detail-comparison");

    const timeSelect = document.querySelector('#time-filter');
    const selectedTeamId = timeSelect.value;
    const selectElement = document.querySelector('#temporada-filter');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const selectedYear = selectedOption.value ? selectedOption.text : '';
    const anoQueryParam = selectedYear ? `&ano=${selectedYear}` : '';

    panel.style("display", "block");
    baseContainer.html("Carregando...");
    comparisonContainer.html("").style("display", "none");

    if (selectedTeamId && selectedTeamId != clickedTeamData.id_time) {
        comparisonContainer.style("display", "block");
        Promise.all([
            fetch(`${API_BASE_URL}/time-detalhes-defensivos?id_time=${selectedTeamId}${anoQueryParam}`),
            fetch(`${API_BASE_URL}/time-detalhes-defensivos?id_time=${clickedTeamData.id_time}${anoQueryParam}`)
        ])
        .then(responses => Promise.all(responses.map(res => res.json())))
        .then(([baseData, comparisonData]) => {
            createDefenseDetailChart(baseData, "#defense-detail-base");
            createDefenseDetailChart(comparisonData, "#defense-detail-comparison");
        });
    } else {
        fetch(`${API_BASE_URL}/time-detalhes-defensivos?id_time=${clickedTeamData.id_time}${anoQueryParam}`)
            .then(res => res.json())
            .then(data => {
                createDefenseDetailChart(data, "#defense-detail-base");
            });
    }
}

// Função principal para carregar e desenhar o gráfico de barras agrupadas. 
function loadHomeAwayChart() {
    const selectElement = document.querySelector('#temporada-filter');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const selectedYear = selectedOption.value ? selectedOption.text : '';
    const anoQueryParam = selectedYear ? `?ano=${selectedYear}` : '';
    const timeSelect = document.querySelector('#time-filter');
    const selectedTeamId = timeSelect.value;

    fetch(`${API_BASE_URL}/desempenho-casa-fora${anoQueryParam}`)
        .then(res => res.json())
        .then(data => {
            const container = d3.select("#home-away-chart");
            container.html("");
            if (!data || data.length === 0) {
                container.html("<p>Nenhum dado encontrado.</p>");
                return;
            }

            const computedStyle = getComputedStyle(document.documentElement);
            const primaryColor = computedStyle.getPropertyValue('--cor-destaque').trim();
            const secondaryColor = computedStyle.getPropertyValue('--cor-secundaria').trim();

            const margin = {top: 20, right: 100, bottom: 80, left: 150};
            const width = 700 - margin.left - margin.right;
            const height = 600 - margin.top - margin.bottom;

            const svg = container.append("svg")
                .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
              .append("g").attr("transform", `translate(${margin.left},${margin.top})`);
            
            const tooltip = d3.select('.tooltip');
            const subgroups = ["pontos_casa", "pontos_fora"];
            const groups = data.map(d => d.nome);

            const yScale = d3.scaleBand().domain(groups).range([0, height]).padding([0.2]);
            const xScale = d3.scaleLinear().domain([0, d3.max(data, d => Math.max(d.pontos_casa, d.pontos_fora)) * 1.1]).range([0, width]);
            const color = d3.scaleOrdinal().domain(subgroups).range([primaryColor,secondaryColor]);

            svg.append("g").call(d3.axisLeft(yScale));
            svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale));

            const ySubgroup = d3.scaleBand().domain(subgroups).range([0, yScale.bandwidth()]).padding([0.05]);

            svg.append("text").attr("x", width / 2).attr("y", height + 40).text("Pontos Obtidos").style("text-anchor", "middle");

            const bars = svg.append("g")
              .selectAll("g")
              .data(data)
              .join("g")
              .attr("transform", d => `translate(0, ${yScale(d.nome)})`);

             bars.style("opacity", d => (selectedTeamId && d.id_time != selectedTeamId) ? 0.5 : 1.0);  

            bars.selectAll("rect")
              .data(d => subgroups.map(key => ({key: key, value: d[key], teamData: d})))
              .join("rect")
              .attr("y", d => ySubgroup(d.key))
              .attr("x", 0)
              .attr("height", ySubgroup.bandwidth())
              .attr("fill", d => color(d.key))
              .style("cursor", "pointer")
              .on("click", (event, d) => showTeamGoalsComparisonPanel(d.teamData))
              .on("mouseover", (event, d) => {
                  const label = d.key === 'pontos_casa' ? 'Casa' : 'Fora';
                  tooltip.style("opacity", 1).html(`
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <img src="${d.teamData.logo_url_time}" style="width: 25px;" referrerpolicy="no-referrer">
                        <div>
                      <strong>${d.teamData.nome} (${label})</strong><br/>
                      Pontos: ${d.value}
                  `).style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 28) + "px");
              })
              .on("mouseout", () => tooltip.style("opacity", 0))
              .transition().duration(800)
              .attr("width", d => xScale(d.value));

            const legend = svg.append("g")
                .attr("transform", `translate(${width + 30}, 0)`); // Posição da legenda (canto superior direito)

            const legendItems = legend.selectAll(".legend-item")
                .data(subgroups)
                .enter()
                .append("g")
                .attr("class", "legend-item")
                .attr("transform", (d, i) => `translate(0, ${i * 20})`); // Espaçamento vertical

            legendItems.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", d => color(d));

            legendItems.append("text")
                .attr("x", 20)
                .attr("y", 12)
                .text(d => d === 'pontos_casa' ? 'Casa' : 'Fora')
                .style("font-size", "14px");
        });
}

/** Orquestra a exibição do painel de comparação de gols. */
function showTeamGoalsComparisonPanel(clickedTeamData) {
    const panel = d3.select("#team-goals-comparison-panel");
    const baseContainer = d3.select("#goals-detail-base");
    const comparisonContainer = d3.select("#goals-detail-comparison");
    const timeSelect = document.querySelector('#time-filter');
    const selectedTeamId = timeSelect.value;
    const selectElement = document.querySelector('#temporada-filter');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const selectedYear = selectedOption.value ? selectedOption.text : '';
    const anoQueryParam = selectedYear ? `&ano=${selectedYear}` : '';
    panel.style("display", "block");
    baseContainer.html("Carregando...");
    comparisonContainer.html("").style("display", "none");

    if (selectedTeamId && selectedTeamId != clickedTeamData.id_time) {
        comparisonContainer.style("display", "block");
        Promise.all([
            fetch(`${API_BASE_URL}/time-detalhes-gols?id_time=${selectedTeamId}${anoQueryParam}`),
            fetch(`${API_BASE_URL}/time-detalhes-gols?id_time=${clickedTeamData.id_time}${anoQueryParam}`)
        ])
        .then(responses => Promise.all(responses.map(res => res.json())))
        .then(([baseData, comparisonData]) => {
            createGoalsDetailChart(baseData, "#goals-detail-base");
            createGoalsDetailChart(comparisonData, "#goals-detail-comparison");
        });
    } else {
        fetch(`${API_BASE_URL}/time-detalhes-gols?id_time=${clickedTeamData.id_time}${anoQueryParam}`)
            .then(res => res.json())
            .then(data => {
                createGoalsDetailChart(data, "#goals-detail-base");
            });
    }
}

/**
 * Busca e exibe a lista de jogadores em um carrossel.
 * @param {string} nationality - O nome da nacionalidade clicada.
 */
function showNationalityDetails(nationality) {
    const panel = d3.select("#nationality-details-panel");
    const listContainer = d3.select("#nationality-details-list");
    const title = d3.select("#nationality-details-title");
    const tooltip = d3.select('.tooltip');

    panel.style("display", "block");
    title.text(`Carregando jogadores de ${nationality}...`);
    // Limpamos o container para garantir que instâncias antigas do carrossel sejam removidas
    listContainer.html("");

    const selectedTeamId = document.querySelector('#time-filter').value;
    const selectedTempoId = document.querySelector('#temporada-filter').value;
    const queryParams = [`nacionalidade=${encodeURIComponent(nationality)}`];
    if (selectedTeamId) queryParams.push(`id_time=${selectedTeamId}`);
    if (selectedTempoId) queryParams.push(`id_tempo=${selectedTempoId}`);
    const queryString = `?${queryParams.join('&')}`;

    fetch(`${API_BASE_URL}/lista-jogadores-nacionalidade${queryString}`)
        .then(res => res.json())
        .then(players => {
            title.text(`Jogadores de ${nationality} (${players.length})`);
            
            if (players && players.length > 0) {
                // Cria o container que o Tiny Slider usará
                const carouselContainer = listContainer.append("div")
                    .attr("class", "player-carousel-container")
                    .append("div")
                    .attr("class", "player-carousel"); // O seletor para o slider

                // Popula o carrossel com os "cards" dos jogadores
                players.forEach(player => {
                    const card = carouselContainer.append("div").attr("class", "player-card");
                    
                    card.append("img")
                        .attr("class", "player-card-photo")
                        .attr("src", player.logo_url_jogador || 'placeholder.png') // Adiciona uma imagem padrão se a foto for nula
                        .attr("referrerpolicy", "no-referrer");

                    card.append("div")
                        .attr("class", "player-card-name")
                        .text(player.nome_jogador);
                        
                    card.append("img")
                        .attr("class", "player-card-team-logo")
                        .attr("src", player.logo_url_time)
                        .attr("referrerpolicy", "no-referrer")
                        .on("mouseover", (event) => {
                            tooltip.style("opacity", 1).html(`
                                <strong>${player.nome_jogador}</strong><br/>
                                Ano(s): ${player.anos}
                            `)
                            .style("left", (event.pageX + 15) + "px")
                            .style("top", (event.pageY - 28) + "px");
                        })
                        .on("mouseout", () => {
                            tooltip.style("opacity", 0);
                        });                
                });                

                //INICIA O CARROSSEL após o HTML ser criado
                tns({
                    container: '.player-carousel',
                    items: 3, // Quantos itens mostrar por vez
                    slideBy: 'page',
                    autoplay: false,                    
                    controls: false, // Esconde as setas "prev/next"
                    nav: true, // Mostra os pontinhos de navegação
                    responsive: { // Deixa responsivo para diferentes tamanhos de tela
                        640: {
                            items: 4
                        },
                        900: {
                            items: 6
                        }
                    }
                });

            } else {
                listContainer.html("<p>Nenhum jogador encontrado para esta seleção.</p>");
            }
            panel.node().scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(error => {
            title.text(`Erro ao carregar jogadores`);
            console.error('Erro:', error);
        });
}

/**
 * Abrevia um nome completo. 
 * @param {string} nomeCompleto - O nome completo do jogador.
 * @returns {string} O nome abreviado.
 */
function abreviaNome(nomeCompleto) {
    if (!nomeCompleto || typeof nomeCompleto !== 'string') return '';
    
    const parts = nomeCompleto.trim().split(' ');

    // Se o nome tem apenas uma ou duas partes, retorna como está.
    if (parts.length <= 2) {
        return nomeCompleto;
    }

    // Pega o primeiro e o último nome do array
    const nome = parts[0];
    const sobrenome = parts[parts.length - 1];

    // Retorna a combinação dos dois
    return `${nome} ${sobrenome}`;
}

// Função para criar Gráfico de Barras
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
    
    // Multiplicamos por 1.1 para dar um espaço extra no topo do gráfico
    const yMax = d3.max(data, d => +d[yKey]);
    const yScale = d3.scaleLinear()
        .domain([0, yMax * 1.1 || 10])
        .range([height, 0]);

    const xScale = d3.scaleBand()
        .domain(data.map(d => d[xKey]))
        .range([0, width])
        .padding(0.2);

    //Cria o eixo X
    const xAxis = d3.axisBottom(xScale)        
        .tickFormat(name => abreviaNome(name));    
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-60)")
        .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(yScale).ticks(5));

    //Nome do eixo Y
     svg.append("text")
        .attr("transform", "rotate(-90)") // Rotaciona o texto para ficar vertical
        .attr("y", 0 - margin.left) // Posiciona à esquerda do eixo Y
        .attr("x", 0 - (height / 2)) // Centraliza na altura do eixo
        .attr("dy", "1em") // Dá um pequeno espaçamento
        .style("text-anchor", "middle") // Garante que a rotação seja pelo centro
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("fill", "#555")
        .text(yAxisLabel); // Usa o texto passado como parâmetro

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
        .style("cursor", "pointer") // Adiciona o cursor de clique
        .on("click", (event, d) => {
            showPlayerDetails(d); // 'd' contém id_jogador, nome, etc.
        })
        
        //EVENTOS DE MOUSE (TOOLTIP)
        .on('mouseover', function(event, d) {       

            // Torna o tooltip visível
            tooltip.style('opacity', 1);

            // Define o conteúdo e a posição do tooltip
            tooltip.html(`
                <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="${d.logo_url_time}" style="width: 25px;" referrerpolicy="no-referrer">
                    <div>
                        <strong>${d[xKey]}</strong><br>
                        ${yAxisLabel}: <strong>${d[yKey]}</strong>
                    </div>
                </div>
            `)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            // Restaura a opacidade da barra
            d3.select(this).style('opacity', 1);
            // Esconde o tooltip
            tooltip.style('opacity', 0);
        });    
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

/**
 * Exibe a lista de jogadores de um "bin" (faixa) selecionado do histograma.
 * VERSÃO ATUALIZADA: Mostra logo, gols e minutos.
 * @param {Array} binData - O array de objetos de jogadores do bin.
 * @param {object} binRange - O objeto com as informações da faixa (ex: {x0: 90, x1: 100}).
 */
function displayHistogramPlayerList(binData, binRange) {
    const container = d3.select("#histogram-details");
    container.html("");

    if (binData.length === 0) return;

    container.append("h4")
        .text(`Jogadores na Faixa (${binRange.x0} a ${binRange.x1} min/gol):`);
    
    const list = container.append("ul").attr("class", "player-list");

    // Ordena os jogadores dentro da faixa pela eficiência
    binData.sort((a, b) => a.minutos_por_gol - b.minutos_por_gol);

    binData.forEach(player => {
        // Para cada jogador, cria o HTML do item da lista
        list.append("li")
            .attr("class", "player-list-item")
            .html(`
                <img src="${player.logo_url_time}" class="team-logo" referrerpolicy="no-referrer">
                <div class="player-list-info">
                    <strong>${player.nome_jogador} (${player.minutos_por_gol} min/gol)</strong>
                    <span>Gols: ${player.total_gols} | Minutos Jogados: ${player.total_minutos}</span>
                </div>
            `);
    });
}

/**
 * Cria o gráfico de histograma interativo.
 * @param {Array} data - Os dados de eficiência de todos os jogadores.
 */
function createHistogram(data) {
    const selector = "#histogram-chart";
    const container = d3.select(selector);
    container.html("");
    d3.select("#histogram-details").html(""); // Limpa também a lista de detalhes

    if (data.length === 0) {
        container.html("<p>Nenhum dado de eficiência encontrado para esta combinação de filtros.</p>");
        return;
    }

    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--cor-destaque').trim();
    const secondaryColor = computedStyle.getPropertyValue('--cor-secundaria').trim();

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const tooltip = d3.select('.tooltip');

   // 1. Escala X (fixa de 0 a 1000)
    const xScale = d3.scaleLinear()
        .domain([0, 1000])
        .range([0, width]);

    // 2. Definir thresholds de 50 em 50
    const thresholds = d3.range(0, 1000 + 50, 50);

    const histogram = d3.histogram()
        .value(d => d.minutos_por_gol)
        .domain([0, 1000])   // mesmo domínio do xScale
        .thresholds(thresholds);

    const bins = histogram(data);

    // 3. Escala Y (para a contagem de jogadores em cada faixa)
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length) * 1.1])
        .range([height, 0]);

    // 4. Desenhar os eixos
    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale));
    svg.append("g").call(d3.axisLeft(yScale));
    svg.append("text").attr("x", width / 2).attr("y", height + 40).text("Minutos por Gol").style("text-anchor", "middle");
    svg.append("text").attr("transform", "rotate(-90)").attr("y", -35).attr("x", -height / 2).text("Nº de Jogadores").style("text-anchor", "middle");

    // 5. Desenhar as barras do histograma
    const bars = svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", d => `translate(${xScale(d.x0)}, ${yScale(d.length)})`)
        .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
        .attr("height", d => height - yScale(d.length))
        .style("fill", primaryColor)
        .style("cursor", "pointer")
        // 6. Adicionar interatividade
        .on("mouseover", function(event, d) {
            d3.select(this).style("fill", secondaryColor);
            tooltip.style("opacity", 1)
                   .html(`<strong>Faixa:</strong> ${d.x0}-${d.x1} min/gol<br><strong>Jogadores:</strong> ${d.length}`)
                   .style("left", (event.pageX + 15) + "px")
                   .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            // Apenas retorna à cor normal se não estiver selecionado
            if (!d3.select(this).classed("selected")) {
                d3.select(this).style("fill", primaryColor);
            }
            tooltip.style("opacity", 0);
        })
        .on("click", function(event, d) {
            // Remove a seleção de todas as outras barras
            bars.classed("selected", false).style("fill", primaryColor);
            // Adiciona a classe e a cor de seleção à barra clicada
            d3.select(this).classed("selected", true).style("fill", secondaryColor);
            // Chama a função para exibir a lista de jogadores
            displayHistogramPlayerList(d, {x0: d.x0, x1: d.x1});
        });
}

// ----- Função para carregar os dados do histograma -----
function loadHistogram() {
    const selectedTeamId = document.querySelector('#time-filter').value;
    const selectedTempoId = document.querySelector('#temporada-filter').value;
    const queryParams = [];
    if (selectedTeamId) queryParams.push(`id_time=${selectedTeamId}`);
    if (selectedTempoId) queryParams.push(`id_tempo=${selectedTempoId}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

    fetch(`${API_BASE_URL}/eficiencia-histograma${queryString}`)
        .then(res => res.json())
        .then(data => {
            createHistogram(data);
        })
        .catch(error => console.error('Erro ao carregar dados do histograma:', error));
}

// GRÁFICO DE LINHAS MÚLTIPLAS

function createMultiLineChart(data) {
    const isTeamSpecific = data.length > 0 && data[0].hasOwnProperty('pct_vitorias');
    const yAxisLabel = isTeamSpecific ? "Média de Gols Marcados" : "Média de Gols por Jogo";

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
    const kpiContainer = document.getElementById('kpi-container');
    const selectedTeamId = document.querySelector('#time-filter').value;

    // Verifica se um time específico foi selecionado no filtro
    if (selectedTeamId) {
        // Se sim, mostra o container de KPIs e busca os dados
        kpiContainer.style.display = 'grid';

        const selectedTempoId = document.querySelector('#temporada-filter').value;
        const queryParams = [];
        queryParams.push(`id_time=${selectedTeamId}`); // Garante que o id_time sempre será enviado
        if (selectedTempoId) queryParams.push(`id_tempo=${selectedTempoId}`);
        const queryString = `?${queryParams.join('&')}`;

        fetch(`${API_BASE_URL}/kpis${queryString}`)
            .then(res => res.json())
            .then(data => {
                updateKpiCard('#kpi-passes', data.passes, '%', true);
                updateKpiCard('#kpi-defesas', data.defesas, '', true);
                updateKpiCard('#kpi-posse', data.posse, '%', true);
            })
            .catch(error => {
                console.error('Erro ao carregar KPIs:', error);
                kpiContainer.style.display = 'none'; // Esconde se der erro
            });
    } else {
        // Se "Todos os Times" estiver selecionado, simplesmente esconde o container
        kpiContainer.style.display = 'none';
    }
}

/**
 * Função auxiliar para popular um único cartão de KPI.
 * @param {string} selector - O seletor do cartão (ex: '#kpi-posse').
 * @param {object} kpiData - O objeto com {current, average}.
 * @param {string} suffix - O sufixo do valor (ex: '%').
 * @param {boolean} higherIsBetter - Define a cor da variação.
 */
function updateKpiCard(selector, kpiData, suffix = '', higherIsBetter = true) {
    const card = document.querySelector(selector);
    const valueEl = card.querySelector('.kpi-value');
    const compEl = card.querySelector('.kpi-comparison');
    
    valueEl.textContent = `${kpiData.current}${suffix}`;
    
    if (kpiData.average === null) {        
        compEl.textContent = 'N/A vs média geral';
        compEl.className = 'kpi-comparison';
        return;
    }

    // Comparamos os valores para decidir o que exibir.
    // Usamos parseFloat e toFixed para evitar problemas com casas decimais
    const isAverageView = parseFloat(kpiData.current).toFixed(1) === parseFloat(kpiData.average).toFixed(1);

    if (isAverageView) {
        // CENÁRIO 1: Nenhuma temporada selecionada. Exibe "Média Geral".
        compEl.textContent = 'Média Geral';
        compEl.className = 'kpi-comparison'; // Reseta a classe para remover cores (vermelho/verde)
    } else {
        // CENÁRIO 2: Uma temporada específica foi selecionada. Exibe a comparação.
        const diff = kpiData.current - kpiData.average;
        const change = diff;

        let arrow = change > 0.01 ? '▲' : (change < -0.01 ? '▼' : '');
        let className = '';

        if (arrow === '▲') {
            className = higherIsBetter ? 'positive' : 'negative';
        } else if (arrow === '▼') {
            className = higherIsBetter ? 'negative' : 'positive';
        }

        compEl.innerHTML = `<span class="${className}">${arrow} ${change.toFixed(1)}</span> vs média geral`;
    }
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
            .style("cursor", "pointer")
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
            })
            .on("click", (event, d) => {
            // Chama a função para mostrar a lista de jogadores daquele país
            showNationalityDetails(d.properties.name);
        });
    }

    function createStackedBarChart(data, selector,  yAxisLabel) {    
    const container = d3.select(selector);
    container.html(""); // Limpa o container

    if (data.length === 0) {
        container.html("<p>Nenhum dado encontrado para esta combinação de filtros.</p>");
        return;
    }

    const margin = { top: 20, right: 30, bottom: 100, left: 50 };
    const width = 450 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select('.tooltip');

    // 1. Definir as chaves para empilhar e as cores
    const keys = ["amarelos", "vermelhos"];
    const colors = {
        amarelos: "#FFC300", // Amarelo
        vermelhos: "#C70039"  // Vermelho
    };
    const colorScale = d3.scaleOrdinal().domain(keys).range(Object.values(colors));

    // 2. Preparar os dados para o empilhamento
    const stack = d3.stack().keys(keys);
    const numericData = data.map(d => ({...d, amarelos: +d.amarelos, vermelhos: +d.vermelhos}));
    const stackedData = stack(numericData);

    // 3. Definir as escalas
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.nome_jogador))
        .range([0, width])
        .padding(0.2);

    // O domínio do eixo Y vai de 0 até o total de cartões (amarelos + vermelhos)
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.amarelos + +d.vermelhos) * 1.1])
        .range([height, 0]);

    // 4. Desenhar os eixos   
    const xAxis = d3.axisBottom(xScale)        
        .tickFormat(name => abreviaNome(name));    
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis) // Usa o eixo que acabamos de criar
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-60)")
        .style("text-anchor", "end");
        
    svg.append("g").call(d3.axisLeft(yScale).ticks(5));     

    //Nome do eixo Y    
    svg.append("text")
        .attr("transform", "rotate(-90)") // Rotaciona o texto para ficar vertical
        .attr("y", 0 - margin.left) // Posiciona à esquerda do eixo Y
        .attr("x", 0 - (height / 2)) // Centraliza na altura do eixo
        .attr("dy", "1em") // Dá um pequeno espaçamento
        .style("text-anchor", "middle") // Garante que a rotação seja pelo centro
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("fill", "#555")
        .text(yAxisLabel); // Usa o texto passado como parâmetro

    // 5. Desenhar as barras empilhadas
    svg.append("g")
        .selectAll("g")
        .data(stackedData) // Itera sobre as séries (uma para amarelos, uma para vermelhos)
        .enter()
        .append("g")
        .attr("fill", d => colorScale(d.key)) // Define a cor para a série
        .selectAll("rect")
        .data(d => d) // Itera sobre os jogadores dentro da série
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.data.nome_jogador))
        .attr("y", d => yScale(d[1])) // d[1] é o topo do segmento
        .attr("height", d => yScale(d[0]) - yScale(d[1])) // d[0] é a base
        .attr("width", xScale.bandwidth())
        .style("cursor", "pointer") // Adiciona o cursor de clique
        .on("click", (event, d) => {
            showPlayerDetails(d.data); // d.data contém o objeto original do jogador
        })
        // 6. Adicionar interatividade de mouseover
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1);
            // d.data contém o objeto original do jogador
            const jogadorData = d.data;
            tooltip.html(`
                <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="${jogadorData.logo_url_time}" style="width: 25px;" referrerpolicy="no-referrer">
                    <div>
                        <strong>${jogadorData.nome_jogador}</strong><br/>
                        <span style="color:${colors.amarelos};">●</span> Amarelos: ${jogadorData.amarelos}<br/>
                        <span style="color:${colors.vermelhos};">●</span> Vermelhos: ${jogadorData.vermelhos}
                    </div>
                </div>
            `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
        });
}

//Cria um gráfico de barras horizontais para o % de defesas dos goleiros.
 
function createGoalkeeperBarChart(data) {
    const selector = "#goleiro-barras";
    const container = d3.select(selector);
    container.html("");

    const top10Data = data.slice(0, 10); // Pega apenas os 10 melhores

    const margin = { top: 20, right: 30, bottom: 40, left: 150 }; // Margem maior para nomes
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const tooltip = d3.select('.tooltip');

    const xScale = d3.scaleLinear().domain([0, d3.max(top10Data, d => +d.pct_defesas)]).range([0, width]);
    const yScale = d3.scaleBand().domain(top10Data.map(d => d.nome_jogador)).range([0, height]).padding(0.1);

    svg.append("g").call(d3.axisLeft(yScale));
    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale).tickFormat(d => `${d.toFixed(1)}%`));

    svg.selectAll(".bar")
        .data(top10Data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.nome_jogador))
        .attr("x", 0)
        .attr("height", yScale.bandwidth())
        .attr("width", d => xScale(+d.pct_defesas))
        .style("cursor", "pointer")
        .on("click", (event, d) => {
            showGoalkeeperDetails(d, data); // Passa o goleiro clicado e todos os dados
        })
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1).html(`
                <div style="display: flex; align-items: center;">
                    <img src="${d.logo_url_time}" style="width: 25px; margin-right: 8px;" referrerpolicy="no-referrer">
                    <div>
                        <strong>${d.nome_jogador}</strong><br/>
                        % Defesas: ${parseFloat(d.pct_defesas).toFixed(2)}%<br/>
                        Defesas (estimado): ${d.defesas} | Gols Sofridos: ${d.gols_sofridos}
                    </div>
                </div>
            `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));
} 

//Cria o gráfico de dispersão para a análise de goleiros. 
function createGoalkeeperScatterPlot(data, selector) {    
    const container = d3.select(selector);
    container.html("");

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 650 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const tooltip = d3.select('.tooltip');

    const xScale = d3.scaleLinear().domain(d3.extent(data, d => +d.defesas_p90)).nice().range([0, width]);
    const yScale = d3.scaleLinear().domain(d3.extent(data, d => +d.pct_defesas)).nice().range([height, 0]);

    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale));
    svg.append("g").call(d3.axisLeft(yScale).tickFormat(d => `${d.toFixed(1)}%`));
    svg.append("text").attr("x", width / 2).attr("y", height + 45).text("Defesas por 90 Minutos (Volume)").style("text-anchor", "middle").style("font-weight", "bold");
    svg.append("text").attr("transform", "rotate(-90)").attr("y", -45).attr("x", -height / 2).text("% de Defesas (Eficiência)").style("text-anchor", "middle").style("font-weight", "bold");
    
    svg.append("g")
        .selectAll("image")
        .data(data)
        .enter()
        .append("image")
        .attr("x", d => xScale(+d.defesas_p90) - 15) 
        .attr("y", d => yScale(+d.pct_defesas) - 15) 
        .attr("width", 30)
        .attr("height", 30)
        .attr("href", d => d.logo_url_time)
        .attr("referrerpolicy", "no-referrer")
        .style("cursor", "pointer")
        .on("click", (event, d) => {
            showGoalkeeperDetails(d, data); // Passa o goleiro clicado e todos os dados
        })
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1).html(`
                 <div style="display: flex; align-items: center;">
                    <img src="${d.logo_url_time}" style="width: 25px; margin-right: 8px;" referrerpolicy="no-referrer">
                    <div>
                        <strong>${d.nome_jogador}</strong><br/>
                        % Defesas: ${parseFloat(d.pct_defesas).toFixed(2)}%<br/>
                        Defesas p/ 90min: ${parseFloat(d.defesas_p90).toFixed(2)}
                    </div>
                </div>
            `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));
}   

/**
 * Cria o gráfico de dispersão interativo.
 * @param {Array} data - Dados dos times com posse, gols e chutes.
 */
function createScatterPlot(data) {
    const selector = "#scatter-plot-chart";
    const container = d3.select(selector);
    container.html("");

    if (data.length === 0) {
        container.html("<p>Nenhum dado encontrado para esta combinação de filtros.</p>");
        return;
    }

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 650 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
    const tooltip = d3.select('.tooltip');

    // 1. Escalas
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.media_posse)).nice() // .nice() arredonda o domínio
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.total_gols)).nice()
        .range([height, 0]);    

    // 2. Eixos
    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale));
    svg.append("g").call(d3.axisLeft(yScale));

    // Labels dos eixos
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .text("Média de Posse de Bola (%)")
        .style("text-anchor", "middle")
        .style("font-weight", "bold");
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -45)
        .attr("x", -height / 2)
        .text("Total de Gols Marcados")
        .style("text-anchor", "middle")
        .style("font-weight", "bold");

    // 3. Desenhar os pontos (usando as logos dos times)
    svg.append("g")
        .selectAll("image")
        .data(data)
        .enter()
        .append("image")
        .attr("x", d => xScale(+d.media_posse) - 15)
        .attr("y", d => yScale(+d.total_gols) - 15)
        .attr("width", 30)
        .attr("height", 30)
        .attr("href", d => d.logo_url_time)
        .attr("referrerpolicy", "no-referrer")        
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1);
            tooltip.html(`
                <strong>${d.nome}</strong><br/>
                Posse de Bola: ${parseFloat(d.media_posse).toFixed(1)}%<br/>
                Gols Marcados: ${d.total_gols}<br/>
                Chutes no Gol: ${d.total_chutes_no_gol}
            `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
        });
}

function showPlayerDetails(playerData) {
    const selectedTempoId = document.querySelector('#temporada-filter').value;
    const tempoQueryParam = selectedTempoId ? `?id_tempo=${selectedTempoId}` : '';
    const panel = document.getElementById('player-details-panel');

    document.getElementById('player-name-details').textContent = 'Carregando...';
    document.getElementById('player-photo-details').src = '';
    document.getElementById('team-logo-details').src = '';
    d3.select("#radar-chart-details").html("");
    d3.select("#radar-stats-list").html("");
    panel.style.display = 'block';

    fetch(`${API_BASE_URL}/jogador-detalhes/${playerData.id_jogador}${tempoQueryParam}`)
        .then(res => res.json())
        .then(details => {
            if (details) {
                document.getElementById('player-name-details').textContent = details.nome_jogador;
                document.getElementById('player-photo-details').src = details.logo_url_jogador;
                document.getElementById('team-logo-details').src = details.logo_url_time;
                
                // Chama as duas funções de exibição
                createRadarChart(details, "#radar-chart-details");
                displayRadarStatsList(details);

                panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        })
        .catch(error => console.error('Erro ao buscar detalhes do jogador:', error));
}

/** Esconde o painel de detalhes. */
function hidePlayerDetails() {
    document.getElementById('player-details-panel').style.display = 'none';
}

/** Cria o Radar Chart com os dados do jogador. */
function createRadarChart(playerData, selector) {
    const container = d3.select(selector);
    container.html("");

    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${(width / 2) + margin.left}, ${(height / 2) + margin.top})`);
    
    const safeDivide = (n, d) => (d ? n / d : 0);
    const stats = [
        { axis: "Nota", value: safeDivide(playerData.nota, playerData.max_nota) },
        { axis: "Gols", value: safeDivide(playerData.gols, playerData.max_gols) },
        { axis: "Assistências", value: safeDivide(playerData.assistencias, playerData.max_assistencias) },
        { axis: "Participações", value: safeDivide(playerData.participacoes_em_gol, playerData.max_participacoes) },
        { axis: "Minutos", value: safeDivide(playerData.minutos_jogados, playerData.max_minutos) }
    ];
    
    const angleSlice = Math.PI * 2 / stats.length;
    const rScale = d3.scaleLinear().range([0, radius]).domain([0, 1]);

    // Desenha grade e eixos
    svg.append("g").selectAll("line").data(stats).enter().append("line")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", (d, i) => rScale(1) * Math.cos(angleSlice * i - Math.PI/2))
        .attr("y2", (d, i) => rScale(1) * Math.sin(angleSlice * i - Math.PI/2))
        .style("stroke", "#cdcdcd").style("stroke-width", "1px");

    svg.append("g").selectAll("text").data(stats).enter().append("text")
        .attr("x", (d, i) => rScale(1.15) * Math.cos(angleSlice * i - Math.PI/2))
        .attr("y", (d, i) => rScale(1.15) * Math.sin(angleSlice * i - Math.PI/2))
        .text(d => d.axis)
        .style("text-anchor", "middle").style("font-size", "12px");

    // Desenha área do radar
    const radarLine = d3.lineRadial().angle((d, i) => i * angleSlice).radius(d => rScale(d.value));
    svg.append("path").datum(stats)
       .attr("d", d => radarLine(d) + "Z")
       .style("fill", "#1f77b4").style("fill-opacity", 0.7);
}

/** Popula a lista de estatísticas ao lado do Radar Chart */
function displayRadarStatsList(playerData) {
    const container = d3.select("#radar-stats-list");
    container.html("");

    const safeDivide = (n, d) => {
        const num = parseFloat(n) || 0;
        const den = parseFloat(d) || 0;
        if (den === 0) return 0;
        return num / den;
    };

    // Usamos parseFloat() e '|| 0' para garantir que temos um número válido antes de continuar.
    const stats = [
        { label: "Nota", value: parseFloat(playerData.nota || 0), max: parseFloat(playerData.max_nota || 0) },
        { label: "Gols", value: parseFloat(playerData.gols || 0), max: parseFloat(playerData.max_gols || 0) },
        { label: "Assistências", value: parseFloat(playerData.assistencias || 0), max: parseFloat(playerData.max_assistencias || 0) },
        { label: "Participações", value: parseFloat(playerData.participacoes_em_gol || 0), max: parseFloat(playerData.max_participacoes || 0) },
        { label: "Minutos Jogados", value: parseFloat(playerData.minutos_jogados || 0), max: parseFloat(playerData.max_minutos || 0) }
    ];

    const list = container.append("ul").attr("class", "stats-list");

    stats.forEach(stat => {
        // O cálculo da porcentagem agora também é seguro.
        const percentage = safeDivide(stat.value, stat.max) * 100;
        const listItem = list.append("li").attr("class", "stat-item");
        
        const header = listItem.append("div").attr("class", "stat-header");
        header.append("span").attr("class", "stat-label").text(stat.label);
        // Agora stat.value é garantidamente um número, então .toFixed(0) funciona.
         const valueSpan = header.append("span").attr("class", "stat-value");
        if (stat.label === "Nota") {
            // Mostra a nota com duas casas decimais
            valueSpan.text(stat.value.toFixed(2));
        } else {
            // Mostra as outras estatísticas como números inteiros
            valueSpan.text(stat.value.toFixed(0));
        }

        const barContainer = listItem.append("div").attr("class", "stat-bar-container");
        barContainer.append("div")
            .attr("class", "stat-bar")
            .style("width", "0%")
            .transition().duration(500)
            .style("width", `${percentage}%`);
    });
}

/** Cria o Radar Chart específico para GOLEIROS. */
function createGoalkeeperRadarChart(gkData, maxValues) {
    const selector = "#radar-chart-details";
    const container = d3.select(selector);
    container.html("");
    
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${(width / 2) + margin.left}, ${(height / 2) + margin.top})`);
    
    const safeDivide = (n, d) => (d ? n / d : 0);

    // Métricas para goleiros
    const stats = [
        { axis: "Nota", value: safeDivide(gkData.nota, maxValues.max_nota) },
        { axis: "% Defesas", value: safeDivide(gkData.pct_defesas, maxValues.max_pct_defesas) },
        { axis: "Defesas p/ 90", value: safeDivide(gkData.defesas_p90, maxValues.max_defesas_p90) },
        { axis: "Gols Sofridos", value: safeDivide(gkData.gols_sofridos, maxValues.max_gols_sofridos)}, // Invertido: menos é melhor
        { axis: "Defesas", value: safeDivide(gkData.defesas, maxValues.max_defesas) }
    ];
    // Invertemos a escala de gols sofridos, pois um valor baixo é melhor
    const golsSofridosStat = stats.find(s => s.axis === "Gols Sofridos");
    if (golsSofridosStat) {
        golsSofridosStat.value = 1 - golsSofridosStat.value;
    }

    const angleSlice = Math.PI * 2 / stats.length;
    const rScale = d3.scaleLinear().range([0, radius]).domain([0, 1]);

    // Desenha grade e eixos
    svg.append("g").selectAll("line").data(stats).enter().append("line")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", (d, i) => rScale(1) * Math.cos(angleSlice * i - Math.PI/2))
        .attr("y2", (d, i) => rScale(1) * Math.sin(angleSlice * i - Math.PI/2))
        .style("stroke", "#cdcdcd").style("stroke-width", "1px");

    svg.append("g").selectAll("text").data(stats).enter().append("text")
        .attr("x", (d, i) => rScale(1.15) * Math.cos(angleSlice * i - Math.PI/2))
        .attr("y", (d, i) => rScale(1.15) * Math.sin(angleSlice * i - Math.PI/2))
        .text(d => d.axis)
        .style("text-anchor", "middle").style("font-size", "12px");

    // Desenha área do radar
    const radarLine = d3.lineRadial().angle((d, i) => i * angleSlice).radius(d => rScale(d.value));
    svg.append("path").datum(stats)
       .attr("d", d => radarLine(d) + "Z")
       .style("fill", "#2ca02c").style("fill-opacity", 0.7); // Cor diferente para goleiros
}

/** Popula a lista de estatísticas específica para GOLEIROS. */
function displayGoalkeeperStatsList(gkData, maxValues) {
    const container = d3.select("#radar-stats-list");
    container.html("");

    const safeDivide = (n, d) => (d ? n / d : 0);
    const stats = [
        { label: "Nota", value: parseFloat(gkData.nota || 0), max: maxValues.max_nota },
        { label: "% Defesas", value: parseFloat(gkData.pct_defesas || 0), max: maxValues.max_pct_defesas, suffix: '%' },
        { label: "Defesas p/ 90 min", value: parseFloat(gkData.defesas_p90 || 0), max: maxValues.max_defesas_p90 },
        { label: "Defesas (Estimado)", value: parseInt(gkData.defesas || 0), max: maxValues.max_defesas },
        { label: "Gols Sofridos", value: parseInt(gkData.gols_sofridos || 0), max: maxValues.max_gols_sofridos }
    ];

    const list = container.append("ul").attr("class", "stats-list");

    stats.forEach(stat => {
        const percentage = safeDivide(stat.value, stat.max) * 100;
        const listItem = list.append("li").attr("class", "stat-item");
        
        const header = listItem.append("div").attr("class", "stat-header");
        header.append("span").attr("class", "stat-label").text(stat.label);
        
        let displayValue = stat.label.includes('%') || stat.label.includes('Nota') || stat.label.includes('p/ 90') ? stat.value.toFixed(2) : stat.value.toFixed(0);
        if (stat.suffix) displayValue += stat.suffix;
        header.append("span").attr("class", "stat-value").text(displayValue);

        const barContainer = listItem.append("div").attr("class", "stat-bar-container");
        barContainer.append("div").attr("class", "stat-bar").style("width", "0%").transition().duration(500).style("width", `${percentage}%`);
    });
}

/** Prepara os dados e exibe o painel de detalhes para um goleiro. */
function showGoalkeeperDetails(clickedGkData, allGkData) {
    const panel = document.getElementById('player-details-panel');

    // Calcula os valores máximos a partir do dataset completo
    const maxValues = {
        max_nota: d3.max(allGkData, d => +d.nota),
        max_pct_defesas: d3.max(allGkData, d => +d.pct_defesas),
        max_defesas_p90: d3.max(allGkData, d => +d.defesas_p90),
        max_defesas: d3.max(allGkData, d => +d.defesas),
        max_gols_sofridos: d3.max(allGkData, d => +d.gols_sofridos)
    };

    // Popula o cabeçalho do painel
    document.getElementById('player-name-details').textContent = clickedGkData.nome_jogador;
    document.getElementById('player-photo-details').src = clickedGkData.logo_url_jogador;
    document.getElementById('team-logo-details').src = clickedGkData.logo_url_time;
    panel.style.display = 'block';

    // Chama as funções de desenho específicas para goleiros
    createGoalkeeperRadarChart(clickedGkData, maxValues);
    displayGoalkeeperStatsList(clickedGkData, maxValues);

    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function createChordDiagram(data) {
    const selector = "#chord-diagram-chart";
    const container = d3.select(selector);
    container.html("");

    const width = 800;
    const height = 800;
    const outerRadius = Math.min(width, height) * 0.5 - 100;
    const innerRadius = outerRadius - 20;

    const svg = container.append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height]);
    
    // 1. Transformar os dados: criar a matriz de adjacência
    const names = Array.from(new Set(data.flatMap(d => [d.source, d.target]))).sort();
    const nameToIndex = new Map(names.map((name, i) => [name, i]));
    const matrix = Array.from({ length: names.length }, () => new Array(names.length).fill(0));
    data.forEach(d => {
        matrix[nameToIndex.get(d.source)][nameToIndex.get(d.target)] = d.value;
    });

    // 2. Criar o layout de acordes
    const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

    const chords = chord(matrix);
    
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(names);

    // 3. Desenhar os arcos externos (grupos)
    const group = svg.append("g")
        .selectAll("g")
        .data(chords.groups)
        .join("g");

    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

    group.append("path")
        .attr("fill", d => color(names[d.index]))
        .attr("stroke", d => d3.rgb(color(names[d.index])).darker())
        .attr("d", arc)
        .on("mouseover", (event, d) => {
             const totalWins = d3.sum(matrix[d.index]);
             tooltip.style("opacity", 1).html(`<strong>${names[d.index]}</strong><br>Total de Vitórias: ${totalWins}`);
        })
        .on("mousemove", (event) => tooltip.style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 28) + "px"))
        .on("mouseout", () => tooltip.style("opacity", 0));
        
    // Adiciona os nomes dos times nos arcos
    group.append("text")
        .each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
        .attr("transform", d => `rotate(${(d.angle * 180 / Math.PI - 90)}) translate(${outerRadius + 5}) ${d.angle > Math.PI ? "rotate(180)" : ""}`)
        .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
        .text(d => names[d.index])
        .style("font-size", "12px");


    // 4. Desenhar as fitas (ribbons/acordes)
    const ribbon = d3.ribbon().radius(innerRadius);
    const ribbons = svg.append("g")
        .attr("fill-opacity", 0.67)
        .selectAll("path")
        .data(chords)
        .join("path")
        .attr("d", ribbon)
        .attr("fill", d => color(names[d.source.index]))
        .attr("stroke", d => d3.rgb(color(names[d.source.index])).darker())
        .on("mouseover", (event, d) => {
             tooltip.style("opacity", 1)
                    .html(`${names[d.source.index]} venceu ${names[d.target.index]}<br><strong>${d.source.value}</strong> vezes`);
        })
        .on("mousemove", (event) => tooltip.style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 28) + "px"))
        .on("mouseout", () => tooltip.style("opacity", 0));
        
    const tooltip = d3.select(".tooltip");
}

/**
 * Cria o gráfico de Heatmap
 * @param {Array} data - Os dados de disciplina por dia.
 * @param {string} metric - A métrica a ser exibida ('total_faltas' ou 'total_cartoes').
 */
function createHeatmap(data, metric) {
    const selector = "#heatmap-chart";
    const container = d3.select(selector);
    container.html("");

    const margin = { top: 30, right: 30, bottom: 50, left: 100 };
    const width = 1000 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
    const tooltip = d3.select('.tooltip');

    // Mapeamento de número do mês para nome
    const todosMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // Pega os números dos meses que existem nos dados, sem repetição, e os ordena.
    const numerosDosMesesComDados = [...new Set(data.map(d => d.mes))].sort((a, b) => a - b);

    // Converte esses números para os nomes correspondentes.
    const nomesDosMesesComDados = numerosDosMesesComDados.map(num => todosMeses[num - 1]);
    
    const diasSemana = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];    
    
    const xScale = d3.scaleBand().domain(nomesDosMesesComDados).range([0, width]).padding(0.05);
    const yScale = d3.scaleBand().domain(diasSemana).range([height, 0]).padding(0.05);

    const maxValue = d3.max(data, d => +d[metric]);
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, maxValue || 1]);

    // Desenha eixos
    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d => d.charAt(0).toUpperCase() + d.slice(1).replace("-feira", ""));
    svg.append("g").call(yAxis);
    
    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale));

    // Desenha as células do heatmap
    svg.selectAll()
        .data(data, d => `${d.mes}:${d.dia_semana}`)
        .enter()
        .append("rect")        
        .attr("x", d => xScale(todosMeses[d.mes - 1]))
        .attr("y", d => yScale(d.dia_semana))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", d => colorScale(+d[metric]))
        .on("mouseover", (event, d) => {
            const diaFormatado = d.dia_semana.charAt(0).toUpperCase() + d.dia_semana.slice(1);
            tooltip.style("opacity", 1).html(`
                <strong>${diaFormatado}, ${todosMeses[d.mes - 1]}</strong><br/>
                ${metric === 'total_faltas' ? 'Faltas' : 'Cartões'}: ${d[metric]}
            `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));
}

/**
 * Cria um gráfico de barras horizontais.
 * @param {Array} data - Os dados a serem plotados.
 * @param {string|null} highlightedTeam - O nome do time a ser destacado.
 */
function createHorizontalBarChart(data, highlightedTeam) {
    const selector = "#conversion-rate-chart";
    const container = d3.select(selector);
    container.html("");

    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--cor-destaque').trim();
    const secondaryColor = computedStyle.getPropertyValue('--cor-secundaria').trim();

    const margin = { top: 20, right: 50, bottom: 80, left: 150 };
    const width = 700 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
    const tooltip = d3.select('.tooltip');
    
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.taxa_conversao) * 1.1])
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(data.map(d => d.nome).reverse())
        .range([height, 0])
        .padding(0.1);

    svg.append("g").call(d3.axisLeft(yScale));
    svg.append("g").attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(xScale).tickFormat(d => `${d.toFixed(1)}%`));

    svg.append("text").attr("x", width / 2).attr("y", height + 40).text("Taxa de Conversão (%)").style("text-anchor", "middle");

    // Desenha as barras
    svg.selectAll(".barras")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "barras")
        .attr("y", d => yScale(d.nome))
        .attr("x", 0)
        .attr("height", yScale.bandwidth())
        .attr("width", 0)
        .transition().duration(800)
        .attr("width", d => xScale(+d.taxa_conversao))    
        .attr("fill", d => {
            // Se o nome do time nos dados for igual ao time destacado, pinta de laranja.
            // Senão, usa a cor padrão azul.
            return d.nome === highlightedTeam ? secondaryColor : primaryColor;
        });
        
    // Adiciona o valor no final da barra
    svg.selectAll(".bar-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("y", d => yScale(d.nome) + yScale.bandwidth() / 2 + 4)
        .attr("x", d => xScale(+d.taxa_conversao) + 20)
        .text(d => `${parseFloat(d.taxa_conversao).toFixed(1)}%`)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "#333");
        
    // Adiciona mouseover para mostrar detalhes
    svg.selectAll("rect") // Reaplica na mesma seleção para adicionar eventos
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1).html(`
                <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="${d.logo_url_time}" style="width: 25px;" referrerpolicy="no-referrer">
                    <div>
                        <strong>${d.nome}</strong><br/>
                        Taxa de Conversão: ${parseFloat(d.taxa_conversao).toFixed(2)}%<br/>
                        <em>(${d.total_gols} gols em ${d.total_chutes} chutes)</em>
                    </div>
                </div>
            `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0))
        svg.selectAll("rect")
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                showTeamComparisonPanel(d);
            });     
}

/**
 * Cria um gráfico de pizza interativo para os detalhes ofensivos de um time.
 * @param {object} data - Os dados do time.
 * @param {string} selector - O seletor do container onde o gráfico será desenhado.
 */
function createPieChart(data, selector) {
    const container = d3.select(selector);
    container.html(""); // Limpa o container

    // Adiciona o cabeçalho com logo e nome
    const header = container.append("div").attr("class", "pie-header");
    header.append("img").attr("src", data.logo_url_time).attr("referrerpolicy", "no-referrer");
    header.append("h4").text(data.nome);

    const width = 450;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);
        
    const tooltip = d3.select('.tooltip');
    
    // Prepara os dados para o gráfico de pizza
    const pieData = {
        'Chutes no Gol': parseFloat(data.chutes_no_gol || 0),
        'Chutes Fora': parseFloat(data.chutes_fora || 0),
        'Impedimentos': parseFloat(data.impedimentos || 0)
    };
    const total = Object.values(pieData).reduce((a, b) => a + b, 0);

    const color = d3.scaleOrdinal()
        .domain(Object.keys(pieData))
        .range(["#2ca02c", "#d62728", "#ff7f0e"]); // Verde, Vermelho, Laranja

    const pie = d3.pie().value(d => d[1]);
    const data_ready = pie(Object.entries(pieData));

    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    svg.selectAll('slices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', d => color(d.data[0]))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .on("mouseover", (event, d) => {
            const percentage = (d.data[1] / total * 100).toFixed(1);
            tooltip.style("opacity", 1).html(`
                <strong>${d.data[0]}</strong><br/>
                Total: ${d.data[1]}<br/>
                (${percentage}%)
            `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));
        
        svg.selectAll('allLabels')
        .data(data_ready)
        .enter()
        .append('text')
        .text(d => {
            const percentage = total > 0 ? (d.data[1] / total * 100) : 0;
            // Só mostra o texto se a porcentagem for relevante (ex: > 5%)
            return percentage > 5 ? `${percentage.toFixed(1)}%` : '';
        })
        // Posiciona o texto no centroide (centro geométrico) da fatia
        .attr('transform', d => `translate(${arcGenerator.centroid(d)})`)
        .style('text-anchor', 'middle')
        .style('font-size', '23px')
        .style('fill', 'white')
        .style('font-weight', 'bold');

         const legendContainer = container.append("div")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("margin-top", "10px");

    const legendItems = legendContainer.selectAll(".legend-item")
        .data(color.domain()) // Pega os nomes
        .enter()
        .append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("margin", "0 10px"); // Espaçamento entre os itens

    // Adiciona o quadrado de cor
    legendItems.append("div")
        .style("width", "12px")
        .style("height", "12px")
        .style("background-color", d => color(d)); // Usa a mesma escala de cor

    // Adiciona o texto da legenda
    legendItems.append("span")
        .style("margin-left", "5px")
        .style("font-size", "12px")
        .text(d => d);
}


/** Cria o gráfico de detalhes defensivos (gols sofridos em casa vs fora). */
function createDefenseDetailChart(data, selector) {
    const container = d3.select(selector);
    container.html("");

    const header = container.append("div").attr("class", "pie-header"); // Reutiliza a classe do pie header
    header.append("img").attr("src", data.logo_url_time).attr("referrerpolicy", "no-referrer");
    header.append("h4").text(data.nome);

    const detailData = [
        { label: 'Sofridos (Casa)', value: data.sofridos_mandante },
        { label: 'Sofridos (Fora)', value: data.sofridos_visitante }
    ];

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 250 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select('.tooltip');    

    const xScale = d3.scaleBand().domain(detailData.map(d => d.label)).range([0, width]).padding(0.4);
    const yScale = d3.scaleLinear().domain([0, d3.max(detailData, d => d.value) * 1.1]).range([height, 0]);

    svg.append("g").call(d3.axisLeft(yScale).ticks(5));
    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale));

    svg.selectAll(".bar")
        .data(detailData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.label))
        .attr("y", d => yScale(d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.value))        
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                   .html(`<strong>${d.label}</strong><br/>Gols Sofridos: <strong>${d.value}</strong>`)
                   .style("left", (event.pageX + 15) + "px")
                   .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });
}

/** Cria o gráfico de detalhes de gols (marcados em casa vs fora). */
function createGoalsDetailChart(data, selector) {
    // Esta função é muito parecida com a createDefenseDetailChart, adaptamos para gols marcados
    const container = d3.select(selector);
    container.html("");
    const header = container.append("div").attr("class", "pie-header");
    header.append("img").attr("src", data.logo_url_time).attr("referrerpolicy", "no-referrer");
    header.append("h4").text(data.nome);
    const detailData = [
        { label: 'Marcados (Casa)', value: data.marcados_casa },
        { label: 'Marcados (Fora)', value: data.marcados_fora }
    ];
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 250 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select('.tooltip');   
      
    const xScale = d3.scaleBand().domain(detailData.map(d => d.label)).range([0, width]).padding(0.4);
    const yScale = d3.scaleLinear().domain([0, d3.max(detailData, d => d.value) * 1.1 || 10]).range([height, 0]);

    svg.append("g").call(d3.axisLeft(yScale).ticks(5));
    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale));

    svg.selectAll(".bar").data(detailData).enter().append("rect").attr("class", "bar")
        .attr("x", d => xScale(d.label)).attr("y", d => yScale(d.value))
        .attr("width", xScale.bandwidth()).attr("height", d => height - yScale(d.value))        
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                   .html(`<strong>${d.label}</strong><br/>Gols Marcados: <strong>${d.value}</strong>`)
                   .style("left", (event.pageX + 15) + "px")
                   .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });
}

// Função que fixa o navbar na parte superior da tela
function initStickyNavbar() {
    const navbar = document.querySelector('.navbar');
    const trigger = document.querySelector('h1');

    if (!navbar || !trigger) return;

    window.addEventListener('scroll', function () {
        const triggerOffset = trigger.offsetTop + trigger.offsetHeight;

        if (window.scrollY > triggerOffset) {
            navbar.classList.add('sticky');
        } else {
            navbar.classList.remove('sticky');
        }
    });
}

// Função que atualiza a cor de destaque com base no time que está filtrado
function updateHighlightColor() {
    const selectedTeamId = document.querySelector('#time-filter').value;
    const teamColors = coresTimes[selectedTeamId]  || { primary: '#1f77b4', secondary: '#ff7f0e' };

    document.documentElement.style.setProperty('--cor-destaque', teamColors.primary);
    document.documentElement.style.setProperty('--cor-secundaria', teamColors.secondary);
}

// ----- INICIALIZAÇÃO DA PÁGINA -----
document.addEventListener('DOMContentLoaded', () => {
    populateFilters();
    initStickyNavbar(); // Carrega o navbar
    updateAllVisualizations(); // Esta função agora carrega TUDO

    document.getElementById('details-close-btn').addEventListener('click', hidePlayerDetails);

    // O evento de 'change' para o filtro de time já chama a função correta
    document.querySelector('#time-filter').addEventListener('change', updateAllVisualizations);
    
    // O evento do filtro de temporada deve atualizar tudo, exceto os gráficos de jogadores
    document.querySelector('#temporada-filter').addEventListener('change', updateAllVisualizations); 
    
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabPanes = document.querySelectorAll(".tab-pane");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            // APRIMORAMENTO: Esconde todos os painéis de detalhe ao trocar de aba
            hidePlayerDetails();
            hideTeamComparisonPanel();
            hideTeamDefenseComparisonPanel();
            hideTeamGoalsComparisonPanel();

            // Lógica original para trocar a aba ativa
            const targetContainer = button.closest('.large-chart-container');
            
            // Remove 'active' apenas dos botões e painéis dentro do mesmo container
            targetContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            targetContainer.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

            button.classList.add("active");
            const targetPaneId = button.getAttribute("data-target");
            const targetPane = document.querySelector(targetPaneId);
            if (targetPane) {
                targetPane.classList.add("active");
            }
        });
    });

    // Menu lateral colapsável dos filtros
    const toggleBtn = document.getElementById('toggle-sidebar').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
    });
    const sidebar = document.getElementById('sidebar');

    toggleBtn.addEventListener('click', () => {
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

        if (isDesktop) {
            sidebar.classList.toggle('collapsed'); // recolhe ou mostra fixo no desktop
        } else {
            sidebar.classList.toggle('active'); // mostra ou esconde sidebar sobreposta aos gráficos em telas menores
        }
    });
});