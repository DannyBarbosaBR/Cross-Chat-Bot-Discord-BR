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

let channelConnections = {}; // Estrutura para armazenar conexões de canais
let globalConnections = []; // Estrutura para armazenar conexões globais

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
        const data = fs.readFileSync('Salvamento.json');
        const parsedData = JSON.parse(data);
        channelConnections = parsedData.channelConnections || {}; // Permite reatribuição
        globalConnections = parsedData.globalConnections || []; // Permite reatribuição
    }
}

// Comandos que podem ser usados com "!"
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
            const serverCount = client.guilds.cache.size;
            const serverList = client.guilds.cache.map(guild => guild.name).join('\n');

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setDescription(`🌠 Danny Barbosa | Conectado em ${serverCount} servidores:\n\n${serverList}\n\nServidor de suporte: [Danny Barbosa](https://discord.gg/c8a7Q45ddd)`)
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
};

// Quando o bot estiver online
client.once(Events.ClientReady, () => {
    console.log(`🌠 ${client.user.tag} está online`);
    loadConnections(); // Carrega conexões ao iniciar
});

// Ouve mensagens para verificar comandos e Cross-Chat
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    // Envio de mensagens para canais globais
    if (globalConnections.includes(message.channel.id)) {
        for (const targetChannelId of globalConnections) {
            if (targetChannelId !== message.channel.id) {
                const targetChannel = await client.channels.fetch(targetChannelId);
                if (targetChannel) {
                    const embedDescription = message.content || "Mensagem sem conteúdo."; // Previne string vazia
                    const embed = new EmbedBuilder()
                        .setColor('#3498db')
                        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                        .setDescription(embedDescription) // Use a descrição verificada
                        .setFooter({
                            text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                            iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                        })
                        .setTimestamp();
                    
                    await targetChannel.send({ embeds: [embed] });

                    if (message.attachments.size > 0) {
                        message.attachments.forEach(async (attachment) => {
                            await targetChannel.send(`Arquivo compartilhado: ${attachment.url}`);
                        });
                    }
                }
            }
        }
    }

    // Verificação de comandos
    if (message.content.startsWith('!')) {
        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = commands[commandName];

        if (command) {
            try {
                await command.execute(message, args);
            } catch (error) {
                console.error(`Erro ao executar o comando: ${error}`);
                message.channel.send('Houve um erro ao executar esse comando.');
            }
        } else {
            message.channel.send('Comando não encontrado.');
        }
    }
});

// Iniciar o bot
client.login(TOKEN);
