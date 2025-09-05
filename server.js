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
    host: 'localhost',       // ou o IP do seu servidor de banco de dados
    user: 'root',            // seu usuário do MySQL
    password: '123456',   // sua senha do MySQL
    database: 'dw_futvis'
};

// Rota da API para buscar os dados de jogadores
app.get('/api/jogador', async (req, res) => {
    try {
        // Cria uma conexão com o banco de dados
        const connection = await mysql.createConnection(dbConfig);
        
        // Executa a query para buscar os dados
        const [rows] = await connection.execute('Select * FROM dim_jogador order by idade desc limit 20');
        
        // Fecha a conexão
        await connection.end();

        // Retorna os dados como JSON
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar dados do MySQL:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor da API rodando em http://localhost:${port}`);
});