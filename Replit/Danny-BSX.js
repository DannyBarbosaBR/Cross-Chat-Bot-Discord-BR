//parte 1
//  essas linhas
import { Client, GatewayIntentBits, Events, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';

// Carregue suas variáveis de ambiente
config();

const TOKEN = process.env.TOKEN;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const OWNER_ID = '1067849662347878401'; // Coloque o seu ID de usuário aqui

let channelConnections = {};
let globalConnections = [];
let bannedServers = [];

// Crie uma nova instância do cliente Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});
//parte 2
// Função para carregar conexões
function loadConnections() {
    if (fs.existsSync('Salvamento.json')) {
        try {
            const data = fs.readFileSync('Salvamento.json', 'utf8');
            if (data.trim().length === 0) {
                channelConnections = {};
                globalConnections = [];
                bannedServers = [];
            } else {
                const parsedData = JSON.parse(data);
                channelConnections = parsedData.channelConnections || {};
                globalConnections = parsedData.globalConnections || [];
                bannedServers = parsedData.bannedServers || [];
            }
        } catch (error) {
            console.error("Erro ao carregar conexões: ", error);
            channelConnections = {};
            globalConnections = [];
            bannedServers = [];
        }
    }
}

// Função para salvar conexões
function saveConnections() {
    fs.writeFileSync('Salvamento.json', JSON.stringify({ channelConnections, globalConnections, bannedServers }));
}
//parte 3
// Função que formata a data e hora corretamente
function formatDateTime() {
    const now = new Date();
    const hours = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = now.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `🕘 ${date} | 🗓️ ${hours}`;
}
//parte 4
//parte 4
const commands = {
    criador: {
        description: 'Mostra quem é o criador do bot',
        execute: (message) => {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setDescription('🌟 Criado por Danny Barbosa! [Acesse o servidor de suporte](https://discord.gg/c8a7Q45ddd) 😎')
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
            const serverList = client.guilds.cache.map(guild => `${guild.name} (ID: ${guild.id})`).join('\n');

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setDescription(`🌍 Conectado em ${serverCount} servidores:\n\n${serverList}\n\nServidor de suporte: [Danny Barbosa](https://discord.gg/c8a7Q45ddd)`)
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
                return message.channel.send('❌ Você não tem permissão para usar este comando.');
            }

            if (globalConnections.includes(message.channel.id)) {
                return message.channel.send('🔗 Este canal já está conectado globalmente.');
            }

            globalConnections.push(message.channel.id);
            message.channel.send(`🌐 Canal <#${message.channel.id}> conectado globalmente.`);
            saveConnections();
        },
    },
    conectar: {
        description: 'Conecta o canal atual a um canal mencionado de outro servidor. Uso: !conectar #canal',
        execute: (message) => {
            if (message.author.id !== OWNER_ID && !message.member.permissions.has('ADMINISTRATOR')) {
                return message.channel.send('❌ Você não tem permissão para usar este comando.');
            }

            const targetChannel = message.mentions.channels.first();
            if (!targetChannel) {
                return message.channel.send('❗ Por favor, mencione um canal para conectar.');
            }

            if (!channelConnections[message.guild.id]) {
                channelConnections[message.guild.id] = [];
            }

            channelConnections[message.guild.id].push({
                sourceChannelId: message.channel.id,
                targetChannelId: targetChannel.id,
            });

            message.channel.send(`🔗 Canal <#${message.channel.id}> conectado ao canal <#${targetChannel.id}>.`);
            saveConnections();
        },
    },
    desconectar: {
        description: 'Desconecta o canal atual de um canal mencionado de outro servidor. Uso: !desconectar #canal',
        execute: (message) => {
            if (message.author.id !== OWNER_ID && !message.member.permissions.has('ADMINISTRATOR')) {
                return message.channel.send('❌ Você não tem permissão para usar este comando.');
            }

            const targetChannel = message.mentions.channels.first();
            if (!targetChannel) {
                return message.channel.send('❗ Por favor, mencione um canal para desconectar.');
            }

            const channelList = channelConnections[message.guild.id] || [];
            const index = channelList.findIndex(conn => conn.targetChannelId === targetChannel.id && conn.sourceChannelId === message.channel.id);

            if (index !== -1) {
                channelList.splice(index, 1);
                message.channel.send(`🔗 Canal <#${message.channel.id}> desconectado do canal <#${targetChannel.id}>.`);
                saveConnections();
            } else {
                message.channel.send('⚠️ Este canal não está conectado ao canal mencionado.');
            }
        },
    },
    ajuda: {
        description: 'Mostra todos os comandos disponíveis.',
        execute: (message) => {
            const helpText = Object.keys(commands).map(cmd => `\`!${cmd}\`: ${commands[cmd].description}`).join('\n');
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('📜 Comandos Disponíveis')
                .setDescription(helpText)
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
        },
    },
    banir: {
        description: 'Bane um servidor da lista de conexões.',
        execute: (message, args) => {
            if (message.author.id !== OWNER_ID) {
                return message.channel.send('❌ Apenas o dono do bot pode usar este comando.');
            }

            const serverId = args[0];
            if (!serverId) {
                return message.channel.send('❗ Forneça o ID do servidor para banir.');
            }

            if (!bannedServers.includes(serverId)) {
                bannedServers.push(serverId);
                message.channel.send(`🚫 Servidor ${serverId} foi banido.`);
                saveConnections();
            } else {
                message.channel.send('⚠️ Esse servidor já está banido.');
            }
        },
    },
    desbanir: {
        description: 'Remove o banimento de um servidor.',
        execute: (message, args) => {
            if (message.author.id !== OWNER_ID) {
                return message.channel.send('❌ Apenas o dono do bot pode usar este comando.');
            }

            const serverId = args[0];
            if (!serverId) {
                return message.channel.send('❗ Forneça o ID do servidor para desbanir.');
            }

            const index = bannedServers.indexOf(serverId);
            if (index !== -1) {
                bannedServers.splice(index, 1);
                message.channel.send(`✅ Servidor ${serverId} foi desbanido.`);
                saveConnections();
            } else {
                message.channel.send('⚠️ Esse servidor não está banido.');
            }
        },
    },
};

// parte 5
// parte 5
client.once(Events.ClientReady, () => {
    console.log(`🌠 ${client.user.tag} está online`);
    loadConnections();
});

// Ouve mensagens e verifica compartilhamentos globais
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

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
                message.channel.send('❗ Houve um erro ao executar esse comando.');
            }
        } else {
            message.channel.send('❌ Comando não encontrado.');
        }
    }

    // Compartilhamento global de mensagens
    if (globalConnections.includes(message.channel.id)) {
        for (const targetChannelId of globalConnections) {
            if (targetChannelId !== message.channel.id) {
                const targetChannel = await client.channels.fetch(targetChannelId);
                if (targetChannel) {
                    // Conteúdo da mensagem
                    let embedDescription = message.content || "Mensagem sem conteúdo.";
                    const embed = new EmbedBuilder()
                        .setColor('#3498db')
                        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
                        .setDescription(embedDescription)
                        .setFooter({
                            text: `🌎 ${message.guild.name} | ${formatDateTime()}`, // Nome do servidor de origem
                            iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                        })
                        .setTimestamp();

                    await targetChannel.send({ embeds: [embed] });

                    // Responder a mensagem original mencionando o autor
                    if (message.reference && message.reference.messageId) {
                        const originalMessage = await message.channel.messages.fetch(message.reference.messageId);
                        if (originalMessage) {
                            const replyContent = `🔁 Resposta a ${originalMessage.author}:\n${originalMessage.content}`;
                            await targetChannel.send({ content: replyContent, messageReference: { messageId: originalMessage.id } });
                        }
                    }

                    // Compartilhar anexos como links
                    if (message.attachments.size > 0) {
                        message.attachments.forEach(async (attachment) => {
                            await targetChannel.send(`🖼️ Imagem compartilhada: ${attachment.url}`);
                        });
                    }

                    // Compartilhar áudio como link
                    if (message.attachments.some(att => att.contentType.startsWith('audio'))) {
                        message.attachments.forEach(async (attachment) => {
                            await targetChannel.send(`🎶 Áudio compartilhado: ${attachment.url}`);
                        });
                    }

                    // Compartilhar figurinhas
                    if (message.stickers.size > 0) {
                        message.stickers.forEach(async (sticker) => {
                            await targetChannel.send(`🖼️ Figurinha compartilhada: ${sticker.url}`);
                        });
                    }

                    // Emojis de outros servidores
                    if (message.content.includes('<:')) {
                        const emojis = message.content.match(/<:.+?:\d+>/g);
                        if (emojis) {
                            for (const emoji of emojis) {
                                await targetChannel.send(`😄 Emoji compartilhado: ${emoji}`);
                            }
                        }
                    }
                }
            }
        }
    }

    // Compartilhamento de imagens através de links
    if (message.attachments.size > 0) {
        message.attachments.forEach(async (attachment) => {
            if (attachment.url.match(/\.(jpeg|jpg|gif|png)$/)) {
                for (const targetChannelId of globalConnections) {
                    if (targetChannelId !== message.channel.id) {
                        const targetChannel = await client.channels.fetch(targetChannelId);
                        if (targetChannel) {
                            await targetChannel.send(`🖼️ Imagem compartilhada: ${attachment.url}`);
                        }
                    }
                }
            }
        });
    }

    // Compartilhamento de figurinhas (stickers)
    if (message.stickers.size > 0) {
        message.stickers.forEach(async (sticker) => {
            for (const targetChannelId of globalConnections) {
                if (targetChannelId !== message.channel.id) {
                    const targetChannel = await client.channels.fetch(targetChannelId);
                    if (targetChannel) {
                        await targetChannel.send(`🖼️ Figurinha compartilhada: ${sticker.url}`);
                    }
                }
            }
        });
    }
});

// Parte 6
client.login(process.env.TOKEN)
    .then(() => {
        console.log('Bot logado com sucesso!');
    })
    .catch(error => {
        console.error('Erro ao logar o bot: ', error);
    });
