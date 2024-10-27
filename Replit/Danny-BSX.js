//parte 1 Inicialização e configuração do cliente.
import { Client, GatewayIntentBits, Events, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';

// Manter o bot ativo no Replit
import express from 'express';
const app = express();

// Cria uma rota simples para manter o bot online
app.get('/', (req, res) => res.send('O bot está rodando!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor HTTP rodando na porta ${PORT}`);
});

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
//parte 2 Funções para carregar e salvar conexões.
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
//parte 3 Funções utilitárias, como formatação de data e regras do servidor
// Função que formata a data e hora corretamente
function formatDateTime() {
    const now = new Date();
    const hours = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = now.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `🕘 ${date} | 🗓️ ${hours}`;
}
// Regras do Danny-Chat
const dchatRules = `
1. **Use o bom senso:** Seja considerado com os outros e suas opiniões. Sem ofensas, linguagem extrema ou qualquer ação que possa perturbar o conforto do chat.
2. **Sem spam ou flooding:** Evite mensagens repetidas, sem sentido ou excessivamente longas.
3. **Mantenha assuntos privados:** Evite compartilhar informações pessoais na rede.
4. **Sem assédio:** Trolling, insultos ou assédio de qualquer tipo não serão tolerados.
5. **Sem conteúdo NSFW/NSFL:** Postar conteúdo NSFW/NSFL explícito resultará em banimento imediato.
6. **Respeite tópicos sensíveis:** Não trivialize automutilação, suicídio, violência ou outros tópicos ofensivos.
7. **Reporte preocupações:** Se você observar uma violação dessas regras, reporte ao moderador do hub apropriado ou à equipe do Danny-Chat para ação adicional.

Qualquer dúvida? Junte-se ao nosso [servidor de suporte](https://discord.gg/8GWFWNmjTa).
`;

//parte 4 Definição dos comandos do bot, com suas respectivas funcionalidades
const commands = {
    criador: {
        description: 'Mostra quem é o criador do bot',
        execute: (message) => {
            const embed = new EmbedBuilder()
                .setColor('#800080')
                .setTitle('🌠 Danny Barbosa')
                .setDescription('🌟 Criado por <@1067849662347878401> ! \n [Acesse o Github do projeto!](https://github.com/DannyBarbosaBR/Cross-Chat-Bot-Discord-BR/) 😎')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
        },
    },
    horário: {
        description: 'Mostra o horário de funcionamento atual.',
        execute: (message) => {
            const hoje = new Date();
            const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            const diaAtual = diasDaSemana[hoje.getDay()]; // Obtém o dia da semana atual

            const horarios = {
                Domingo: 'Fora de horário',
                Segunda: '19:00 - 22:00',
                Terça: '19:00 - 22:00',
                Quarta: '19:00 - 22:00',
                Quinta: '19:00 - 22:00',
                Sexta: 'Fora de horário',
                Sábado: '14:00 - 21:00',
            };

            const horarioHoje = horarios[diaAtual]; // Obtém o horário do dia atual

            const resposta = `🕘 **Horário de Atividade para Hoje: \n(${diaAtual}):** ${horarioHoje}`;

            const embed = new EmbedBuilder()
                .setColor('#FFC0CB')
                .setTitle('📅 Horário de Funcionamento')
                .setDescription(resposta)
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
                .setColor('#2E8B57')
                .setTitle('🌍 Servidores Globlais')
                .setDescription(`Conectado em ${serverCount} servidores:\n\n${serverList}\n\nServidor de suporte: [Danny Barbosa](https://discord.gg/8GWFWNmjTa)`)
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
        }, // Corrigido: removeu o ponto e vírgula aqui
    },
    global: {
    description: 'Conecta o canal atual a outros servidores.',
    execute: async (message) => {
        if (message.author.id !== OWNER_ID && !message.member.permissions.has('ADMINISTRATOR')) {
            return message.channel.send('❌ Você não tem permissão para usar este comando.');
        }

        if (globalConnections.includes(message.channel.id)) {
            return message.channel.send('🔗 Este canal já está conectado globalmente.');
        }

        globalConnections.push(message.channel.id);
        message.channel.send(`🌐 Canal <#${message.channel.id}> conectado globalmente.`);

        const embedRules = new EmbedBuilder()
            .setColor('#FFFF00')
            .setTitle('📜 Regras do Danny-Chat')
            .setDescription(dchatRules)
            .setFooter({
                text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
            })
            .setTimestamp();

        message.channel.send({ embeds: [embedRules] });

        const numberOfConnections = globalConnections.length;
        const notificationEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🌐 Novo Servidor Conectado')
            .setDescription(`O servidor **${message.guild.name}** entrou na conexão! \nAgora temos **${numberOfConnections}** servidores conectados.`)
            .setFooter({
                text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
            })
            .setTimestamp();

        // Verifica se os canais existem antes de enviar a mensagem
        const validChannels = [];
        for (const channelId of globalConnections) {
            try {
                const channel = await client.channels.fetch(channelId);
                validChannels.push(channel); // Armazena canais válidos
            } catch (error) {
                console.log(`Canal ${channelId} não encontrado, removendo da lista de conexões.`);
                globalConnections = globalConnections.filter(id => id !== channelId); // Remove o canal da lista
            }
        }

        // Envia a mensagem apenas para canais válidos
        for (const channel of validChannels) {
            try {
                await channel.send({ embeds: [notificationEmbed] });
            } catch (err) {
                console.log(`Erro ao enviar mensagem para o canal ${channel.id}: ${err.message}`);
            }
        }

        saveConnections();
    },
},

    conectar: {
        description: 'Conecta o canal a um outro do servidor',
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
    // Comando !descontar - Desconecta o canal atual da conexão ativa.
desconectar: {
    description: 'Desconecta um canal conectado.',
    async execute(message) {
        const channelId = message.channel.id;

        // Verifica se o canal está na lista de conexões globais
        if (!globalConnections.includes(channelId)) {
            return message.channel.send('❌ Este canal não está conectado globalmente.');
        }

        // Remove o canal da lista de conexões globais
        globalConnections = globalConnections.filter(id => id !== channelId);
        message.channel.send(`🔌 Canal <#${channelId}> desconectado com sucesso.`);
        
        // Salva as conexões após a desconexão
        saveConnections();

        // Notificação de desconexão para os canais conectados
        const disconnectEmbed = new EmbedBuilder()
            .setColor('#FF0000') // Vermelho para desconexão
            .setTitle('🔌 Desconectado da Conexão')
            .setDescription(`O canal <#${channelId}> do **${message.guild.name}** foi desconectado.`)
            .setFooter({
                text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
            })
            .setTimestamp();

        // Envia a notificação para todos os canais conectados
        for (const id of globalConnections) {
            try {
                const channel = await client.channels.fetch(id);
                await channel.send({ embeds: [disconnectEmbed] });
            } catch (err) {
                console.log(`Erro ao enviar mensagem para o canal ${id}: ${err.message}`);
            }
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
    //modificacao
banir: {
    description: 'Bane um servidor da lista de conexões.',
    execute: async (message, args) => {
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

            // Notificação de banimento
            const banEmbed = new EmbedBuilder()
                .setColor('#FF0000') // Vermelho para banimento
                .setTitle('🚫 Servidor Banido')
                .setDescription(`O servidor **${serverId}** foi banido da conexão.`)
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();

            // Envia a notificação para todos os canais conectados
            for (const channelId of globalConnections) {
                try {
                    const channel = await client.channels.fetch(channelId);
                    await channel.send({ embeds: [banEmbed] });
                } catch (err) {
                    console.log(`Erro ao enviar mensagem para o canal ${channelId}: ${err.message}`);
                }
            }
        } else {
            message.channel.send('⚠️ Esse servidor já está banido.');
        }
    },
},

desbanir: {
    description: 'Remove o banimento de um servidor.',
    execute: async (message, args) => {
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

            // Notificação de desbanimento
            const unbanEmbed = new EmbedBuilder()
                .setColor('#00FF00') // Verde para desbanimento
                .setTitle('✅ Servidor Desbanido')
                .setDescription(`O servidor **${serverId}** foi desbanido e pode se reconectar.`)
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();

            // Envia a notificação para todos os canais conectados
            for (const channelId of globalConnections) {
                try {
                    const channel = await client.channels.fetch(channelId);
                    await channel.send({ embeds: [unbanEmbed] });
                } catch (err) {
                    console.log(`Erro ao enviar mensagem para o canal ${channelId}: ${err.message}`);
                }
            }
        } else {
            message.channel.send('⚠️ Esse servidor não está banido.');
               }
        },
    },
};


/// Parte 5Gerenciamento de eventos e compartilhamento de mensagens
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
        
        // Criar um embed para a resposta
        const replyEmbed = new EmbedBuilder()
            .setColor('#FFA500') // Cor do embed da resposta (laranja)
            .setDescription(replyContent)
            .setFooter({ text: `Resposta de ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        // Enviar a resposta como um embed, mencionando a mensagem original
        await targetChannel.send({ embeds: [replyEmbed], messageReference: { messageId: originalMessage.id } });
    }
}
       // Compartilhar anexos como links ou imagens embutidas
if (message.attachments.size > 0) {
    message.attachments.forEach(async (attachment) => {
        const isImage = attachment.contentType && attachment.contentType.startsWith('image');
        const isAudio = attachment.contentType && attachment.contentType.startsWith('audio');
        const isVideo = attachment.contentType && attachment.contentType.startsWith('video');
        const isFile = !isImage && !isAudio && !isVideo;

        if (isImage) {
            const attachmentEmbed = new EmbedBuilder()
                .setColor('#FFA500') // Cor do embed para imagens (laranja)
                .setDescription(`🖼️ Imagem compartilhada \n[Veja a imagem aqui](${attachment.url})`) // Link da imagem incluído na descrição
                .setImage(attachment.url) // Imagem embutida no embed
                .setFooter({ text: `Imagem enviada por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            await targetChannel.send({ embeds: [attachmentEmbed] });
        } else if (isAudio) {
            const audioEmbed = new EmbedBuilder()
                .setColor('#FFA500') // Cor do embed para áudios (laranja)
                .setDescription(`🎶 Áudio compartilhado \n[Ouça o áudio aqui](${attachment.url})`) // Link do áudio incluído na descrição
                .setFooter({ text: `Áudio enviado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            await targetChannel.send({ embeds: [audioEmbed] });
        } else if (isVideo) {
            const videoEmbed = new EmbedBuilder()
                .setColor('#FFA500') // Cor do embed para vídeos (laranja)
                .setDescription(`🎥 Vídeo compartilhado \n[Assista ao vídeo aqui](${attachment.url})`) // Link do vídeo incluído na descrição
                .setFooter({ text: `Vídeo enviado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            await targetChannel.send({ embeds: [videoEmbed] });
        } else if (isFile) {
            const fileEmbed = new EmbedBuilder()
                .setColor('#FFA500') // Cor do embed para outros tipos de arquivos (laranja)
                .setDescription(`📎 Arquivo compartilhado \n[Baixe o arquivo aqui](${attachment.url})`) // Link do arquivo incluído na descrição
                .setFooter({ text: `Arquivo enviado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            await targetChannel.send({ embeds: [fileEmbed] });
        }
    });
}

// Compartilhar links compartilhados
if (message.content.includes('http')) {
    const links = message.content.match(/https?:\/\/[^\s]+/g);
    if (links) {
        for (const link of links) {
            const linkEmbed = new EmbedBuilder()
                .setColor('#FFA500') // Cor do embed para links (laranja)
                .setDescription(`🔗 Link compartilhado \n[Acesse aqui](${link})`)
                .setFooter({ text: `Link enviado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            await targetChannel.send({ embeds: [linkEmbed] });
        }
    }
}

// Compartilhar figurinhas
if (message.stickers.size > 0) {
    message.stickers.forEach(async (sticker) => {
        const stickerEmbed = new EmbedBuilder()
            .setColor('#FFA500') // Cor do embed para figurinhas (laranja)
            .setDescription(`🖼️ Figurinha compartilhada \n[Veja a figurinha aqui](${sticker.url})`) // Link da figurinha incluído na descrição
            .setFooter({ text: `Figurinha enviada por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await targetChannel.send({ embeds: [stickerEmbed] });
    });
}

// Emojis de outros servidores
if (message.content.includes('<:')) {
    const emojis = message.content.match(/<:.+?:\d+>/g);
    if (emojis) {
        for (const emoji of emojis) {
            const emojiEmbed = new EmbedBuilder()
                .setColor('#FFA500') // Cor do embed para emojis (laranja)
                .setDescription(`😄 Emoji compartilhado: ${emoji}`)
                .setFooter({ text: `Emoji enviado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

            await targetChannel.send({ embeds: [emojiEmbed] });
            
            
                                       }
                        }
                    }
                }
            }
        }
    }
});

// Parte 6 final
client.login(TOKEN)
    .then(() => {
        console.log('Bot logado com sucesso!');
    })
    .catch(error => {
        console.error('Erro ao logar o bot: ', error);
    });
