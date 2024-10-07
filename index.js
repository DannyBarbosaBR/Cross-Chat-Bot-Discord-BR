
const { Client, GatewayIntentBits, Events, EmbedBuilder, REST, Routes } = require('discord.js');
const fs = require('fs');
const express = require('express');
const app = express();

const TOKEN = ' '; // Substitua pelo seu token
const CLIENT_ID = 'YOUR_CLIENT_ID'; // Substitua pelo seu Client ID
const GUILD_ID = 'YOUR_GUILD_ID'; // Substitua pelo seu Guild ID

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
client.blacklistedUsers = [];
client.moderators = [];
client.channelList = [];

// Função para ler arquivos JSON
function readJSON(filename) {
    try {
        const data = fs.readFileSync(`${filename}.json`);
        return JSON.parse(data);
    } catch (err) {
        console.error(`Erro ao ler o arquivo ${filename}.json:`, err);
        return {};
    }
}

// Função para escrever dados em arquivos JSON
function writeJSON(data, filename) {
    fs.writeFileSync(`${filename}.json`, JSON.stringify(data, null, 4));
}

// Função para registrar comandos
async function registerCommands() {
    const commands = [
        {
            name: 'setchannel',
            description: 'Configura o canal para cross-chat.',
        },
        {
            name: 'mod',
            description: 'Adiciona um usuário como moderador.',
            options: [{
                type: 6, // USER
                name: 'user',
                description: 'O usuário a ser adicionado como moderador.',
                required: true,
            }],
        },
        {
            name: 'unmod',
            description: 'Remove um usuário como moderador.',
            options: [{
                type: 6, // USER
                name: 'user',
                description: 'O usuário a ser removido como moderador.',
                required: true,
            }],
        },
        {
            name: 'blacklist',
            description: 'Coloca um membro na blacklist.',
            options: [{
                type: 6, // USER
                name: 'user',
                description: 'O usuário a ser blacklistado.',
                required: true,
            }],
        },
        {
            name: 'unblacklist',
            description: 'Remove um membro da blacklist.',
            options: [{
                type: 6, // USER
                name: 'user',
                description: 'O usuário a ser desblacklistado.',
                required: true,
            }],
        },
    ];

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
        console.log('Começando o registro de comandos...');
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands,
        });
        console.log('Comandos registrados com sucesso!');
    } catch (error) {
        console.error(error);
    }
}

client.once(Events.ClientReady, () => {
    const data = readJSON("blacklist");
    const dataMod = readJSON("moderators");
    const dataChannel = readJSON("channels");
    client.blacklistedUsers = data.blacklistedUsers || [];
    client.moderators = dataMod.modUsers || [];
    client.channelList = dataChannel.channelList || [];
    console.log('Bot está pronto');
});

// Mantenha o bot ativo
app.get('/', (req, res) => {
    res.send('Bot está ativo!');
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

client.on(Events.MessageCreate, async (message) => {
    if (message.content.startsWith("/") || message.author.id === client.user.id) return;

    const findChannelId = message.channel.id;

    if (client.channelList.includes(findChannelId)) {
        let chatColor;
        let chatName;

        if (client.moderators.includes(message.author.id)) {
            chatColor = '#1E90FF'; // Azul escuro
            chatName = `[mod] ${message.author.username}`;
        } else {
            chatColor = '#00BFFF'; // Azul
            chatName = message.author.username;
        }

        if (client.blacklistedUsers.includes(message.author.id)) {
            await message.channel.send("Você está na blacklist");
        } else {
            const embed = new EmbedBuilder()
                .setColor(chatColor)
                .setDescription(message.content)
                .setTimestamp()
                .setAuthor({ name: chatName, iconURL: message.author.displayAvatarURL() })
                .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() });

            if (message.attachments.size > 0) {
                message.attachments.forEach(attachment => {
                    embed.addFields({ name: "Arquivo Enviado", value: attachment.url });
                });
            } else {
                await message.delete(); // Deleta a mensagem se não houver anexo
            }

            client.channelList.forEach(async (channelId) => {
                const channel = client.channels.cache.get(channelId);
                if (channel) await channel.send({ embeds: [embed] });
            });

            if (message.attachments.size > 0) {
                await message.delete(); // Deleta a mensagem se houver anexo
            }
        }
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'setchannel') {
        client.channelList.push(interaction.channel.id);
        const data = readJSON("channels");
        data.channelList.push(interaction.channel.id);
        writeJSON(data, "channels");
        await interaction.reply("Canal configurado! Escreva neste canal para cross-chat.");
    }

    if (commandName === 'mod') {
        const user = interaction.options.getMember('user');
        client.moderators.push(user.id);
        const data = readJSON("moderators");
        data.modUsers.push(user.id);
        writeJSON(data, "moderators");
        const embed = new EmbedBuilder()
            .setTitle("Novo Moderador")
            .setDescription(`${user.user.username} é agora um moderador`)
            .setColor('#7289DA')
            .setThumbnail(user.displayAvatarURL());
        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'unmod') {
        const user = interaction.options.getMember('user');
        client.moderators = client.moderators.filter(id => id !== user.id);
        const data = readJSON("moderators");
        data.modUsers = data.modUsers.filter(id => id !== user.id);
        writeJSON(data, "moderators");
        const embed = new EmbedBuilder()
            .setTitle("Moderador Removido")
            .setDescription(`${user.user.username} foi removido como moderador`)
            .setColor('#FF0000')
            .setThumbnail(user.displayAvatarURL());
        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'blacklist') {
        const user = interaction.options.getMember('user');
        if (client.moderators.includes(interaction.user.id)) {
            client.blacklistedUsers.push(user.id);
            const data = readJSON("blacklist");
            data.blacklistedUsers.push(user.id);
            writeJSON(data, "blacklist");
            const embed = new EmbedBuilder()
                .setTitle("Membro Blacklistado")
                .setDescription(`${user.user.username} foi blacklistado`)
                .setColor('#FF0000')
                .setThumbnail(user.displayAvatarURL());
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply("Você não tem permissão para fazer isso.");
        }
    }

    if (commandName === 'unblacklist') {
        const user = interaction.options.getMember('user');
        if (client.moderators.includes(interaction.user.id)) {
            client.blacklistedUsers = client.blacklistedUsers.filter(id => id !== user.id);
            const data = readJSON("blacklist");
            data.blacklistedUsers = data.blacklistedUsers.filter(id => id !== user.id);
            writeJSON(data, "blacklist");
            const embed = new EmbedBuilder()
                .setTitle("Membro Desblacklistado")
                .setDescription(`${user.user.username} foi desblacklistado`)
                .setColor('#00FF00')
                .setThumbnail(user.displayAvatarURL());
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply("Você não tem permissão para fazer isso.");
        }
    }
});

// Inicia o registro de comandos
registerCommands();
client.login(TOKEN);
