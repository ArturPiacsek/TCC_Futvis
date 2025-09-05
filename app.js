// app.js

const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Chamar todas as funções de carregamento de dados
    fetchAndDrawChart(`${API_BASE_URL}/artilheiros`, "#artilheiros-chart", "Gols", "nome_jogador", "total");
    fetchAndDrawChart(`${API_BASE_URL}/assistencias`, "#assistencias-chart", "Assistências", "nome_jogador", "total");
    fetchAndDrawChart(`${API_BASE_URL}/participacoes-gol`, "#participacoes-chart", "Participações", "nome_jogador", "total");
    
    fetchAndDrawTable(`${API_BASE_URL}/eficiencia-minutos-gol`, "#eficiencia-table", 
        ["Jogador", "Gols", "Minutos", "Minutos / Gol"], 
        ["nome_jogador", "total_gols", "total_minutos", "minutos_por_gol"]
    );
    
    fetchAndDrawTable(`${API_BASE_URL}/disciplina`, "#disciplina-table", 
        ["Jogador", "Amarelos 🟨", "Vermelhos 🟥"], 
        ["nome_jogador", "amarelos", "vermelhos"]
    );
});

// Função genérica para buscar dados e desenhar um GRÁFICO DE BARRAS
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

// Função genérica para buscar dados e desenhar uma TABELA
function fetchAndDrawTable(apiUrl, selector, headers, keys) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            createTable(data, selector, headers, keys);
        })
        .catch(error => {
            console.error(`Erro ao carregar dados de ${apiUrl}:`, error);
            document.querySelector(selector).innerHTML = `<p class="error-message">Não foi possível carregar os dados.</p>`;
        });
}


// Função de D3 para criar um gráfico de barras genérico
function createBarChart(data, selector, yAxisLabel, xKey, yKey) {
    const container = d3.select(selector);
    container.html(""); // Limpa o container antes de desenhar

    const margin = { top: 20, right: 30, bottom: 100, left: 50 };
    const width = 450 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(data.map(d => d[xKey]))
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yKey])])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(5));

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d[xKey]))
        .attr("y", d => yScale(d[yKey]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d[yKey]));
}

// Função de D3 para criar uma tabela genérica
function createTable(data, selector, headers, keys) {
    const container = d3.select(selector);
    container.html(""); // Limpa o container

    const table = container.append("table");
    const thead = table.append("thead");
    const tbody = table.append("tbody");

    thead.append("tr")
        .selectAll("th")
        .data(headers)
        .enter()
        .append("th")
        .text(d => d);

    const rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    rows.selectAll("td")
        .data(d => keys.map(key => d[key]))
        .enter()
        .append("td")
        .text(d => d);
}