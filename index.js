// Importa o discord.js
const { Client, GatewayIntentBits } = require('discord.js');

// Cria um novo cliente do Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Evento que ocorre quando o bot está pronto
client.once('ready', () => {
    console.log('Bot está online!');
});

// Evento que ocorre quando uma mensagem é enviada no chat
client.on('messageCreate', message => {
    if (message.content === '!ping') {
        message.channel.send('Pong!');
    }
});

// Loga no bot usando o token do ambiente
client.login(process.env.DISCORD_TOKEN);
