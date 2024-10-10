import { Client, GatewayIntentBits, Events, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';

// Carregue suas variáveis de ambiente
config();

const TOKEN = '';
const CLIENT_SECRET = ''; // Adicione o CLIENT_SECRET aqui
const WEBHOOK_URL = ''; // Coloque seu URL do Webhook aqui
const OWNER_ID = ''; // Coloque o seu ID de usuário aqui

cd /mnt/sdcard/documents/dannybot

let channelConnections = {}; // Estrutura para armazenar conexões de canais
let globalConnections = []; // Estrutura para armazenar conexões globais
let bannedServers = []; // Servidores banidos

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Função que formata a data e hora corretamente
function formatDateTime() {
    const now = new Date();
    const hours = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = now.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `🕘 ${date} | 🗓️ ${hours}`; // Mantém a data e a hora
}

// Função para carregar conexões
function loadConnections() {
    if (fs.existsSync('Salvamento.json')) {
        const data = fs.readFileSync('Salvamento.json', 'utf-8');
        
        // Verifica se o arquivo não está vazio antes de tentar fazer o parse
        if (data.trim()) {
            try {
                const parsedData = JSON.parse(data);
                channelConnections = parsedData.channelConnections || {}; // Permite reatribuição
                globalConnections = parsedData.globalConnections || []; // Permite reatribuição
            } catch (error) {
                console.error('Erro ao fazer o parse do JSON:', error);
            }
        }
    }
}
// Comando de ajuda
const ajudaDescription = `
**🌟 Lista de Comandos do Bot Danny Barbosa 🌟**

1️⃣ **!criador** - Mostra quem é o criador do bot.
2️⃣ **!servidores** - Mostra todos os servidores conectados, incluindo IDs.
3️⃣ **!global** - Conecta o canal atual a outros canais globais.
4️⃣ **!conectar #canal** - Conecta o canal atual a um canal mencionado de outro servidor.
5️⃣ **!desconectar** - Desconecta o canal atual de um canal de outro servidor.
6️⃣ **!banirservidor [ID do servidor]** - Bane um servidor por seu ID.
7️⃣ **!desbanirservidor [ID do servidor]** - Desbane um servidor por seu ID.
8️⃣ **!ajuda** - Mostra esta lista de comandos.

🌠 Danny Barbosa | Acesse o servidor de suporte: [Danny Barbosa](https://discord.gg/c8a7Q45ddd)
`;

const commands = {
    criador: {
        description: 'Mostra quem é o criador do bot',
        execute: (message) => {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setDescription('🌠 Danny Barbosa | Acesse o servidor de suporte: [Danny Barbosa](https://discord.gg/c8a7Q45ddd)')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
        },
    },
    servidores: {
        description: 'Mostra todos os servidores conectados',
        execute: (message) => {
            const serverList = client.guilds.cache.map((guild, index) => `${index + 1}. ${guild.name} (ID: ${guild.id})`).join('\n');

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setDescription(`🌠 Danny Barbosa | Conectado em:\n\n${serverList}\n\nServidor de suporte: [Danny Barbosa](https://discord.gg/c8a7Q45ddd)`)
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
        },
    },
    global: {
        description: 'Conecta o canal atual a outros canais globais.',
        execute: (message) => {
            if (message.author.id !== OWNER_ID && !message.member.permissions.has('ADMINISTRATOR')) {
                return message.channel.send('Você não tem permissão para usar este comando.');
            }

            if (globalConnections.includes(message.channel.id)) {
                return message.channel.send('Este canal já está conectado globalmente.');
            }

            globalConnections.push(message.channel.id);
            message.channel.send(`Canal <#${message.channel.id}> conectado globalmente. Mensagens aqui serão enviadas para outros canais globais.`);
        },
    },
    conectar: {
        description: 'Conecta o canal atual a um canal mencionado de outro servidor. Uso: !conectar #canal',
        execute: (message) => {
            if (message.author.id !== OWNER_ID && !message.member.permissions.has('ADMINISTRATOR')) {
                return message.channel.send('Você não tem permissão para usar este comando.');
            }

            const targetChannel = message.mentions.channels.first();
            if (!targetChannel) {
                return message.channel.send('Por favor, mencione um canal para conectar.');
            }

            if (!channelConnections[message.guild.id]) {
                channelConnections[message.guild.id] = [];
            }

            channelConnections[message.guild.id].push({
                sourceChannelId: message.channel.id,
                targetChannelId: targetChannel.id,
            });

            message.channel.send(`Canal <#${message.channel.id}> conectado ao canal <#${targetChannel.id}>.`);
        },
    },
    desconectar: {
        description: 'Desconecta o canal atual de um canal de outro servidor.',
        execute: (message) => {
            if (message.author.id !== OWNER_ID && !message.member.permissions.has('ADMINISTRATOR')) {
                return message.channel.send('Você não tem permissão para usar este comando.');
            }

            const channelId = message.channel.id;
            if (channelConnections[message.guild.id]) {
                channelConnections[message.guild.id] = channelConnections[message.guild.id].filter(
                    (connection) => connection.sourceChannelId !== channelId
                );
                message.channel.send(`Canal <#${channelId}> desconectado.`);
            } else {
                message.channel.send('Nenhuma conexão encontrada para este canal.');
            }
        },
    },
    banirservidor: {
        description: 'Bane um servidor pelo ID.',
        execute: (message, args) => {
            if (!args[0]) return message.channel.send('Por favor, forneça o ID do servidor.');

            const serverId = args[0];
            if (bannedServers.includes(serverId)) {
                return message.channel.send(`O servidor com ID ${serverId} já está banido.`);
            }

            bannedServers.push(serverId);
            message.channel.send(`Servidor com ID ${serverId} banido com sucesso.`);
        },
    },
    desbanirservidor: {
        description: 'Desbane um servidor pelo ID.',
        execute: (message, args) => {
            if (!args[0]) return message.channel.send('❌ Por favor, forneça o ID do servidor para desbanir.');

    const serverId = args[0];

    if (!bannedServers.includes(serverId)) {
        return message.channel.send('❌ Este servidor não está banido.');
    }

    // Remove o servidor da lista de banidos
    bannedServers = bannedServers.filter(id => id !== serverId);
    saveConnections(); // Salva as alterações

    message.channel.send(`✅ O servidor com ID ${serverId} foi desbanido com sucesso.`);
},
// Comando !ajuda que mostra todos os comandos disponíveis
commands.ajuda = {
    description: 'Mostra a lista de comandos e suas descrições.',
    execute: (message) => {
        const commandList = Object.keys(commands).map((commandName, index) => {
            return `**${index + 1}.** \`${commandName}\`: ${commands[commandName].description}`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🛠️ Lista de Comandos')
            .setDescription(commandList)
            .setFooter({
                text: `🌠 Danny Barbosa | ${formatDateTime()} | [Servidor de suporte](https://discord.gg/c8a7Q45ddd)`,
                iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
            })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};

// Comando para banir um servidor pelo ID
commands.banir = {
    description: 'Bane um servidor pelo ID.',
    execute: (message, args) => {
        if (!args[0]) return message.channel.send('❌ Por favor, forneça o ID do servidor para banir.');

        const serverId = args[0];

        if (bannedServers.includes(serverId)) {
            return message.channel.send('❌ Este servidor já está banido.');
        }

        bannedServers.push(serverId);
        saveConnections(); // Salva as alterações

        message.channel.send(`✅ O servidor com ID ${serverId} foi banido com sucesso.`);
    },
};

// Envio de notificação para todos os servidores globais quando um novo servidor se conecta
client.on(Events.GuildCreate, (guild) => {
    const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('🆕 Novo Servidor Conectado!')
        .setDescription(`O servidor **${guild.name}** acabou de se conectar ao global!`)
        .setFooter({
            text: `🌠 Danny Barbosa | ${formatDateTime()} | [Servidor de suporte](https://discord.gg/c8a7Q45ddd)`,
            iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
        })
        .setTimestamp();

    globalConnections.forEach(async (channelId) => {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            channel.send({ embeds: [embed] });
        }
    });
});

// Envio de notificação quando um servidor se desconecta
client.on(Events.GuildDelete, (guild) => {
    const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('🚪 Servidor Desconectado')
        .setDescription(`O servidor **${guild.name}** foi desconectado do global.`)
        .setFooter({
            text: `🌠 Danny Barbosa | ${formatDateTime()} | [Servidor de suporte](https://discord.gg/c8a7Q45ddd)`,
            iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
        })
        .setTimestamp();

    globalConnections.forEach(async (channelId) => {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            channel.send({ embeds: [embed] });
        }
        // Função para salvar as conexões e servidores banidos
function saveConnections() {
    const data = JSON.stringify({
        channelConnections,
        globalConnections,
        bannedServers,
    });
    fs.writeFileSync('Salvamento.json', data);
}

// Envio de notificação quando um servidor se desconecta
client.on(Events.GuildDelete, (guild) => {
    const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('🚪 Servidor Desconectado')
        .setDescription(`O servidor **${guild.name}** foi desconectado do global.`)
        .setFooter({
            text: `🌠 Danny Barbosa | ${formatDateTime()} | [Servidor de suporte](https://discord.gg/c8a7Q45ddd)`,
            iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
        })
        .setTimestamp();

    globalConnections.forEach(async (channelId) => {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            channel.send({ embeds: [embed] });
        }
    });
});

// Salva as conexões quando o bot for encerrado
client.on(Events.ClientDisconnect, () => {
    saveConnections();
});

// Inicia o bot
client.login(TOKEN);

    });
});

// Salva as conexões quando o bot for encerrado
client.on(Events.ClientDisconnect, () => {
    saveConnections();
});

// Inicia o bot
client.login(TOKEN);
