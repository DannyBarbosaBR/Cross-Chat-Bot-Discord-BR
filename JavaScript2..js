import { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, Events } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Coloque seu token diretamente aqui:
const TOKEN='';
const CLIENT_ID=1293622008008937533;

// Carregar variáveis de ambiente
config();



const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Quando o bot estiver online, verifica se os comandos foram registrados
client.once(Events.ClientReady, async () => {
    console.log(`🌠 ${client.user.tag} está online`);

    // Registrar comandos Slash
    const commands = [
        {
            name: 'criador',
            description: 'Mostra quem é o criador do bot',
        },
        {
            name: 'connect',
            description: 'Conecta o bot a um canal',
        },
        {
            name: 'disconnect',
            description: 'Desconecta o bot de um canal',
        },
        {
            name: 'banir',
            description: 'Bane um usuário',
            options: [
                {
                    name: 'user',
                    type: 'USER',
                    description: 'O usuário que será banido',
                    required: true,
                },
            ],
        },
        {
            name: 'desbanir',
            description: 'Desbane um usuário',
            options: [
                {
                    name: 'userId',
                    type: 'STRING',
                    description: 'O ID do usuário a ser desbanido',
                    required: true,
                },
            ],
        },
    ];

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log('⏳ Registrando comandos (Slash Commands)...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ Comandos registrados com sucesso!');
    } catch (error) {
        console.error('Erro ao registrar comandos:', error);
    }
});

// Função para criar e atribuir o cargo ao bot no servidor
async function createBotRole(guild) {
    let botRole = guild.roles.cache.find(role => role.name === 'DannyBot');
    
    if (!botRole) {
        botRole = await guild.roles.create({
            name: 'DannyBot',
            color: 'BLUE',
            permissions: ['Administrator'],
        });
        console.log('Cargo "DannyBot" criado com permissões de administrador.');
    }

    const botMember = guild.members.cache.get(client.user.id);
    if (!botMember.roles.cache.has(botRole.id)) {
        await botMember.roles.add(botRole);
        console.log('Permissões do cargo "DannyBot" atribuídas ao bot.');
    }
}

// Quando o bot entrar em um servidor, ele cria e adiciona o cargo automaticamente
client.on(Events.GuildCreate, async (guild) => {
    await createBotRole(guild);
});

// Comandos baseados em prefixo "!" e também comandos Slash
client.on(Events.MessageCreate, async (message) => {
    if (message.content.startsWith('!criador')) {
        message.channel.send('O criador do bot é @dannybarbosabr');
    } else if (message.content.startsWith('!connect')) {
        // Lógica para conectar ao canal
        message.channel.send('Bot conectado ao canal!');
    } else if (message.content.startsWith('!disconnect')) {
        // Lógica para desconectar
        message.channel.send('Bot desconectado do canal!');
    } else if (message.content.startsWith('!banir')) {
        const userToBan = message.mentions.users.first();
        if (userToBan) {
            const member = message.guild.members.cache.get(userToBan.id);
            await member.ban();
            message.channel.send(`${userToBan.tag} foi banido.`);
        } else {
            message.channel.send('Por favor, mencione um usuário para banir.');
        }
    } else if (message.content.startsWith('!desbanir')) {
        const userId = message.content.split(' ')[1];
        const user = await client.users.fetch(userId);
        if (user) {
            await message.guild.members.unban(user.id);
            message.channel.send(`${user.tag} foi desbanido.`);
        } else {
            message.channel.send('Usuário não encontrado.');
        }
    }
});

// Função para transformar arquivos (imagem, vídeo, etc.) em links
client.on(Events.MessageCreate, async (message) => {
    if (message.attachments.size > 0) {
        message.attachments.forEach((attachment) => {
            const fileLink = attachment.url;
            message.channel.send(`Aqui está o link para o arquivo: ${fileLink}`);
        });
    }
});

// Replicar mensagens em outros servidores com design estilizado (embed com cor, servidor, e hora)
client.on(Events.MessageCreate, (message) => {
    if (message.content.startsWith('!replicar')) {
        const embed = new EmbedBuilder()
            .setColor(0x3498db) // Cor azul
            .setTitle('Mensagem replicada')
            .setDescription(message.content)
            .setFooter({
                text: `Servidor: ${message.guild.name} | Enviado às ${new Date().toLocaleTimeString()}`,
                iconURL: message.guild.iconURL(),
            });
        message.channel.send({ embeds: [embed] });
    }
});

// Comandos Slash (slash commands)
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'criador') {
        await interaction.reply('O criador do bot é @dannybarbosabr');
    }

    if (commandName === 'connect') {
        // Lógica para o comando Slash de conectar
        await interaction.reply('Bot conectado ao canal (Slash)!');
    }

    if (commandName === 'disconnect') {
        // Lógica para o comando Slash de desconectar
        await interaction.reply('Bot desconectado do canal (Slash)!');
    }

    if (commandName === 'banir') {
        const userToBan = interaction.options.getUser('user');
        if (userToBan) {
            const member = interaction.guild.members.cache.get(userToBan.id);
            await member.ban();
            await interaction.reply(`${userToBan.tag} foi banido.`);
        }
    }

    if (commandName === 'desbanir') {
        const userId = interaction.options.getString('userId');
        const user = await client.users.fetch(userId);
        if (user) {
            await interaction.guild.members.unban(user.id);
            await interaction.reply(`${user.tag} foi desbanido.`);
        } else {
            await interaction.reply('Usuário não encontrado.');
        }
    }
});

// Iniciar o bot
client.login(TOKEN);
