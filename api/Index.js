const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json()); // Para interpretar JSON no corpo da requisição

// URLs dos webhooks dos servidores
const WEBHOOK_URLS = {
    server_a: 'https://discord.com/api/webhooks/1292800072379011072/MILo8fEE3rB7fKErdIM5CbYObHtGCYQ8fOGhrQfLboeoUcB_pMmLQWqQlvSUQgHHOwSn',
    server_b: 'https://discord.com/api/webhooks/1296998218772647968/LnqyXkeEsGsAmkBFy4ZibLvxfftwZ0cizyzZfw1erI9PcJOxurIy1nOPOrYJ02shkIDX',
    server_c: '',
    server_d: ''
};

// Rota para receber mensagens
app.post('/webhook/:server_id', async (req, res) => {
    const serverId = req.params.server_id;
    const message = req.body.content; // Extrai o conteúdo da mensagem
    console.log(`Mensagem recebida do ${serverId}: ${message}`);

    // Envia a mensagem para todos os outros servidores, exceto o que enviou
    for (const [key, url] of Object.entries(WEBHOOK_URLS)) {
        if (key !== serverId) {
            try {
                await axios.post(url, { content: message }); // Envia a mensagem para o servidor correspondente
            } catch (error) {
                console.error(`Erro ao enviar mensagem para ${key}:`, error.message);
            }
        }
    }

    return res.sendStatus(204); // Retorna uma resposta vazia
});

// Inicia o servidor na porta 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
