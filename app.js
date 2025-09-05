// app.js

document.addEventListener('DOMContentLoaded', () => {
    // URL da nossa API backend
    const apiUrl = 'http://localhost:3000/api/jogador';

    // Usamos a Fetch API nativa do JavaScript para buscar os dados
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede: ' + response.statusText);
            }
            return response.json(); // Converte a resposta para JSON
        })
        .then(data => {
            console.log('Dados recebidos:', data);
            createBarChart(data); // Chama a função que desenha o gráfico
        })
        .catch(error => {
            console.error('Erro ao buscar dados da API:', error);
            document.getElementById('sales-chart').innerHTML = `<p style="color:red;">Não foi possível carregar os dados.</p>`;
        });
});

function createBarChart(data) {
    // 1. Definir dimensões e margens do gráfico
    const margin = { top: 30, right: 30, bottom: 120, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // 2. Selecionar o elemento SVG e definir suas dimensões
    const svg = d3.select("#sales-chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 3. Definir as escalas (como os dados se mapeiam para pixels)
    // Eixo X (meses) - Escala de banda
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.nome_jogador)) // O domínio são os meses
        .range([0, width])
        .padding(0.2);

    // Eixo Y (total de vendas) - Escala linear
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.idade)]) // O domínio vai de 0 até o valor máximo de vendas
        .range([height, 0]); // O range é invertido porque o SVG começa a desenhar do topo

    // 4. Criar e adicionar os eixos ao gráfico
    // Eixo X
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

    // Eixo Y
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // 5. Desenhar as barras do gráfico
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
          .attr("class", "bar")
          .attr("x", d => xScale(d.nome_jogador))
          .attr("y", d => yScale(d.idade))
          .attr("width", xScale.bandwidth())
          .attr("height", d => height - yScale(d.idade));
}