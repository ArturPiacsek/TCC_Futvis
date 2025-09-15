const API_BASE_URL = 'http://localhost:3000/api';

function fetchTabelaCampeonato() {
    const selectElement = document.querySelector('#temporada-select');
    const selectedIdTempo = selectElement.value; // A variável agora tem um nome mais claro
    
    const headers = ["#", "Time", "Pts", "PJ", "V", "E", "D", "GP", "GC", "SG"];
    const keys = ["posicao", "nome", "Pts", "PJ", "V", "E", "D", "GP", "GC", "SG"];

    const apiUrl = `${API_BASE_URL}/tabela-campeonato?id_tempo=${selectedIdTempo}`;
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);

            const dataComPosicao = data.map((time, index) => ({
                ...time,
                posicao: index + 1
            }));

            createTable(dataComPosicao, "#tabela-campeonato-table", headers, keys);
        })
        .catch(error => {
            console.error(`Erro ao carregar dados de ${apiUrl}:`, error);
            document.querySelector("#tabela-campeonato-table").innerHTML = `<p class="error-message">Não foi possível carregar os dados.</p>`;
        });
}

function carregarTimes() {
    const selectElement = document.querySelector('#clube-select');

    fetch(`${API_BASE_URL}/times`)
        .then(response => response.json())
        .then(data => {
            data.forEach(time => {
                const option = document.createElement('option');
                option.value = time.id_time;
                option.innerText = time.nome;
                selectElement.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar os times:", error);
        });
}

// Função para carregar as estatísticas de jogadores por time e temporada
function carregarEstatisticasPorTime(id_time, id_tempo) {
    const headers = ["Jogador", "Gols", "Assistências", "Cartões Amarelos", "Cartões Vermelhos"];
    const keys = ["nome_jogador", "total_gols", "total_assistencias", "total_amarelos", "total_vermelhos"];

    const apiUrl = `${API_BASE_URL}/estatisticas-jogador?time_id=${id_time}&id_tempo=${id_tempo}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            createTable(data, "#estatisticas-jogadores-table", headers, keys);
        })
        .catch(error => {
            console.error("Erro ao carregar as estatísticas dos jogadores:", error);
            document.querySelector("#estatisticas-jogadores-table").innerHTML = `<p class="error-message">Não foi possível carregar os dados.</p>`;
        })
}

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
    container.html(""); // Limpa o container antes de desenhar

    const table = container.append("table");
    const thead = table.append("thead");
    const tbody = table.append("tbody");

    // Cria o cabeçalho
    thead.append("tr")
        .selectAll("th")
        .data(headers)
        .enter()
        .append("th")
        .text(d => d);

    // Cria as linhas de dados
    const rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    // Cria as células para cada linha
    rows.selectAll("td")
        .data(rowData => {
            // Para cada linha de dados, criamos um array de objetos para as células,
            // mantendo a chave e o valor. Isso nos dá mais controle.
            return keys.map(key => ({ key: key, value: rowData[key], fullData: rowData }));
        })
        .enter()
        .append("td")
        .html(cellData => {
            // Agora, para cada célula, verificamos qual é a sua "chave" (key)
            if (cellData.key === 'nome') {
                // Se for a célula do nome do time, inserimos o HTML com a imagem e o nome
                return `<img src="${cellData.fullData.logo_url_time}" class="team-logo" referrerpolicy="no-referrer"> ${cellData.value}`;
            } else {
                // Para todas as outras células, apenas inserimos o texto do valor
                return cellData.value;
            }
        });
}

document.addEventListener('DOMContentLoaded', () => {
    carregarTimes();

    // Tabela padrão é a de 2023
    fetchTabelaCampeonato();

    // Adiciona um "ouvinte de eventos" para a mudança de temporada
    document.querySelector('#temporada-select').addEventListener('change', () => {
        fetchTabelaCampeonato();  // Recarrega a tabela com a nova temporada
        
        const id_time = document.querySelector('#clube-select').value;
        const id_tempo = document.querySelector('#temporada-select').value;
        carregarEstatisticasPorTime(id_time, id_tempo); // Recarrega as estatísticas com o time e a temporada atual
    });

    // Adiciona um "ouvinte de eventos" para a mudança de time
    document.querySelector('#clube-select').addEventListener('change', () => {
        const id_time = document.querySelector('#clube-select').value;
        const id_tempo = document.querySelector('#temporada-select').value;
        carregarEstatisticasPorTime(id_time, id_tempo); // Recarregar as estatísticas com o time e a temporada atual
    });

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
