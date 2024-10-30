//parte 1 Inicialização e configuração do cliente.
import { Client, GatewayIntentBits, Events, EmbedBuilder } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';

// Manter o bot ativo no Replit
//import express from 'express';
//const app = express();

// Cria uma rota simples para manter o bot online
//app.get('/', (req, res) => res.send('O bot está rodando!'));

//const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => {
//    console.log(`Servidor HTTP rodando na porta ${PORT}`);
//});

// Carregue suas variáveis de ambiente
//config();
const TOKEN = ;
const CLIENT_SECRET = ;
const WEBHOOK_URL = `https://discord.com/api/webhooks/1292800072379011072/MILo8fEE3rB7fKErdIM5CbYObHtGCYQ8fOGhrQfLboeoUcB_pMmLQWqQlvSUQgHHOwSn';`;
const OWNER_ID = '1067849662347878401'; // Coloque o seu ID de usuário aqui

// Limite de palavras
const MAX_WARNINGS = 3; // Número máximo de avisos permitidos por servidor
const MAX_WORDS = 50; // Limite de palavras
const cooldowns = new Map(); // Mapa para gerenciar cooldowns
const warnedServers = new Map(); // Mapa para rastrear avisos por servidor

//const TOKEN = process.env.TOKEN;
//const CLIENT_SECRET = process.env.CLIENT_SECRET;
//const WEBHOOK_URL = process.env.WEBHOOK_URL;

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

// Lista de palavrões (incluindo os fornecidos)
const forbiddenWords = [
'aidético', 'aidética', 'aleijado', 'aleijada', 'analfabeto', 'analfabeta',
'anus', 'anão', 'anã', 'arrombado', 'apenado', 'apenada', 'baba-ovo', 
'babaca', 'babaovo', 'bacura', 'bagos', 'baianada', 'baitola', 'barbeiro',
'barraco', 'beata', 'bebum', 'besta', 'bicha', 'bisca', 'bixa', 'boazuda',
'boceta', 'boco', 'boiola', 'bokete', 'bolagato', 'bolcat', 'boquete', 
'bosseta', 'bosta', 'bostana', 'boçal', 'branquelo', 'brecha', 'brexa',
'brioco', 'bronha', 'buca', 'buceta', 'bugre', 'bunda', 'bunduda', 'burra',
'burro', 'busseta', 'bárbaro', 'bêbado', 'bêbedo', 'caceta', 'cacete', 
'cachorra', 'cachorro', 'cadela', 'caga', 'cagado', 'cagao', 'cagão',
'cagona', 'caipira', 'canalha', 'canceroso', 'caralho', 'casseta', 
'cassete', 'ceguinho', 'checheca', 'chereca', 'chibumba', 'chibumbo', 
'chifruda', 'chifrudo', 'chochota', 'chota', 'chupada', 'chupado', 
'ciganos', 'clitoris', 'clitóris', 'cocaina', 'cocaína', 'coco', 
'cocô', 'comunista', 'corna', 'cornagem', 'cornisse', 'corno', 'cornuda', 
'cornudo', 'cornão', 'corrupta', 'corrupto', 'coxo', 'cretina', 
'cretino', 'criolo', 'crioulo', 'cruz-credo', 'cu', 'cú', 'culhao', 
'culhão', 'curalho', 'cuzao', 'cuzão', 'cuzuda', 'cuzudo', 'debil', 
'débil', 'debiloide', 'debilóide', 'deficiente', 'defunto', 'demonio', 
'demônio', 'denegrir', 'denigrir', 'detento', 'difunto', 'doida', 
'doido', 'egua', 'égua', 'elemento', 'encostado', 'esclerosado', 
'escrota', 'escroto', 'esporrada', 'esporrado', 'esporro', 'estupida', 
'estúpida', 'estupidez', 'estupido', 'estúpido', 'facista', 'fanatico', 
'fanático', 'fascista', 'fedida', 'fedido', 'fedor', 'fedorenta', 
'feia', 'feio', 'feiosa', 'feioso', 'feioza', 'feiozo', 'felacao', 
'felação', 'fenda', 'foda', 'fodao', 'fodão', 'fode', 'fodi', 
'fodida', 'fodido', 'fornica', 'fornição', 'fudendo', 'fudeção', 
'fudida', 'fudido', 'furada', 'furado', 'furnica', 'furnicar', 
'furo', 'furona', 'furão', 'gai', 'gaiata', 'gaiato', 'gay', 
'gilete', 'goianada', 'gonorrea', 'gonorreia', 'gonorréia', 
'gosmenta', 'gosmento', 'grelinho', 'grelo', 'gringo', 
'homo-sexual', 'homosexual', 'homosexualismo', 'homossexual', 
'homossexualismo', 'idiota', 'idiotice', 'imbecil', 'inculto', 
'iscrota', 'iscroto', 'japa', 'judiar', 'ladra', 'ladrao', 
'ladroeira', 'ladrona', 'ladrão', 'lalau', 'lazarento', 'leprosa', 
'leproso', 'lesbica', 'lésbica', 'louco', 'macaca', 'macaco', 
'machona', 'macumbeiro', 'malandro', 'maluco', 'maneta', 
'marginal', 'masturba', 'meleca', 'meliante', 'merda', 'mija', 
'mijada', 'mijado', 'mijo', 'minorias', 'mocrea', 'mocreia', 
'mocréia', 'moleca', 'moleque', 'mondronga', 'mondrongo', 
'mongol', 'mongoloide', 'mongolóide', 'mulata', 'mulato', 
'naba', 'nadega', 'nádega', 'nazista', 'negro', 'nhaca', 
'nojeira', 'nojenta', 'nojento', 'nojo', 'olhota', 'otaria', 
'otario', 'otária', 'otário', 'paca', 'palhaco', 'palhaço', 
'paspalha', 'paspalhao', 'paspalho', 'pau', 'peia', 'peido', 
'pemba', 'pentelha', 'pentelho', 'perereca', 'perneta', 
'peru', 'peão', 'pica', 'picao', 'picão', 'pilantra', 
'pinel', 'pinto', 'pintudo', 'pintão', 'piranha', 'piroca', 
'piroco', 'piru', 'pivete', 'porra', 'prega', 'preso', 
'prequito', 'priquito', 'prostibulo', 'prostituta', 
'prostituto', 'punheta', 'punhetao', 'punhetão', 'pus', 
'pustula', 'puta', 'puto', 'puxa-saco', 'puxasaco', 
'penis', 'pênis', 'rabao', 'rabão', 'rabo', 'rabuda', 
'rabudao', 'rabudão', 'rabudo', 'rabudona', 'racha', 
'rachada', 'rachadao', 'rachadinha', 'rachadinho', 'rachado', 
'ramela', 'remela', 'retardada', 'retardado', 'ridícula', 
'roceiro', 'rola', 'rolinha', 'rosca', 'sacana', 'safada', 
'safado', 'sapatao', 'sapatão', 'sifilis', 'sífilis', 
'siririca', 'tarada', 'tarado', 'testuda', 'tesuda', 
'tesudo', 'tezao', 'tezuda', 'tezudo', 'traveco', 
'trocha', 'trolha', 'troucha', 'trouxa', 'troxa', 
'tuberculoso', 'tupiniquim', 'turco', 'vaca', 'vadia', 
'vagal', 'vagabunda', 'vagabundo', 'vagina', 'veada', 
'veadao', 'veado', 'viada', 'viadagem', 'viadao', 
'viadão', 'viado', 'viadão', 'víado', 'xana', 
'xaninha', 'xavasca', 'xerereca', 'xexeca', 'xibiu', 
'xibumba', 'xiíta', 'xochota', 'xota', 'xoxota'
];

client.on('messageCreate', async (message) => {
    // Ignorar mensagens do bot para evitar loops
    if (message.author.bot) return;

    // Verificar se a mensagem está em um canal global
    if (!globalConnections.includes(message.channel.id)) return;

    // Inicializa contador de avisos para o servidor
    if (!warnedServers.has(message.guild.id)) {
        warnedServers.set(message.guild.id, {
            forbiddenWordWarnings: 0,
            repeatedMessageWarnings: 0,
            wordLimitWarnings: 0,
            messageHistory: []
        });
    }
    const serverWarnings = warnedServers.get(message.guild.id);

    // Verificar se a mensagem contém alguma palavra proibida
    const containsForbiddenWord = forbiddenWords.some(word => message.content.toLowerCase().includes(word));

    if (containsForbiddenWord) {
        const remainingWarnings = 5 - serverWarnings.forbiddenWordWarnings;
        const warningEmbed = new EmbedBuilder()
            .setColor('#FF0000') // Cor do embed para aviso (vermelho)
            .setDescription(`🚫 Aviso: Palavras proibidas não são permitidas. Você só tem mais ${remainingWarnings} avisos antes de desconectar.`)
            .setFooter({ text: `Mensagem enviada por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await message.channel.send({ embeds: [warningEmbed] });

        // Incrementa o contador de avisos por palavrões
        serverWarnings.forbiddenWordWarnings += 1;

        // Verifica se o número de avisos por palavrões ultrapassa o limite
        if (serverWarnings.forbiddenWordWarnings >= 5) { // Limite de 5 avisos
            await disconnectServer(message); // Desconecta o servidor se atingir o limite
            return;
        }
    }

    // Detectar mensagens repetidas
    const messageContent = message.content.toLowerCase();
    const messageHistory = serverWarnings.messageHistory;
    
    // Adiciona a nova mensagem ao histórico
    messageHistory.push(messageContent);
    
    // Verifica se a mesma mensagem foi enviada 5 vezes consecutivas
    const repeatedCount = messageHistory.filter(msg => msg === messageContent).length;

    if (repeatedCount >= 5) {
        const remainingWarnings = 5 - serverWarnings.repeatedMessageWarnings;
        const repeatWarningEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setDescription(`🚫 Aviso: Mensagens repetidas não são permitidas. Você só tem mais ${remainingWarnings} avisos antes de desconectar.`)
            .setFooter({ text: `Mensagem enviada por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await message.channel.send({ embeds: [repeatWarningEmbed] });

        // Incrementa o contador de avisos por mensagens repetidas
        serverWarnings.repeatedMessageWarnings += 1;

        // Verifica se o número de avisos por mensagens repetidas ultrapassa o limite
        if (serverWarnings.repeatedMessageWarnings >= 5) { // Limite de 5 avisos
            await disconnectServer(message); // Desconecta o servidor se atingir o limite
            return;
        }
    }

    // Limite de palavras
  //  const MAX_WORDS = 50; // Defina o número máximo de palavras permitidas
    const messageWordCount = message.content.split(/\s+/).length;
    
    if (messageWordCount > MAX_WORDS) {
        const remainingWarnings = 5 - serverWarnings.wordLimitWarnings;
        const wordLimitEmbed = new EmbedBuilder()
            .setColor('#FFFF00') // Cor do embed para limite de palavras (amarelo)
            .setDescription(`⚠️ Aviso: Sua mensagem excede o limite de ${MAX_WORDS} palavras. \n Você só tem mais ${remainingWarnings} avisos antes de desconectar.`)
            .setFooter({ text: `Mensagem enviada por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await message.channel.send({ embeds: [wordLimitEmbed] });
        
        // Incrementa o contador de avisos por limite de palavras
        serverWarnings.wordLimitWarnings += 1;

        // Verifica se o número de avisos por limite de palavras ultrapassa o limite
        if (serverWarnings.wordLimitWarnings >= 5) { // Limite de 5 avisos
            await disconnectServer(message); // Desconecta o servidor se atingir o limite
            return;
        }
    }

}); // Fechamento do evento 'messageCreate'

// Função para desconectar o servidor automaticamente
const disconnectServer = async (message) => {
    globalConnections = globalConnections.filter(id => id !== message.channel.id); // Remove o canal da lista global
    saveConnections(); // Salva o estado das conexões

    const disconnectEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🔌 Servidor Desconectado')
        .setDescription(`O servidor **${message.guild.name}** foi desconectado da conexão global por excesso de avisos.`)
        .setFooter({
            text: `🌠 Danny Barbosa | ${formatDateTime()}`,
            iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
        })
        .setTimestamp();

    // Notifica todos os canais restantes na conexão global
    for (const id of globalConnections) {
        try {
            const channel = await client.channels.fetch(id);
            await channel.send({ embeds: [disconnectEmbed] });
        } catch (err) {
            console.log(`Erro ao enviar mensagem para o canal ${id}: ${err.message}`);
        }
    }
};

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

informações: {
description: 'Mostra informações sobre o bot.',
execute: async (message) => {
const infoEmbed = new EmbedBuilder()
.setColor('#00FF00') // Cor do embed para informações (verde)
.setTitle('🌐 Informações sobre o Danny Chat')
.setDescription(`
               O Danny Chat é um bot que conecta servidores, permitindo que as mensagens enviadas em um canal sejam visíveis em todos os servidores conectados.
               
               **Como Funciona:**
               - Ao enviar uma mensagem neste canal, ela será replicada em todos os canais que estão conectados globalmente.
               - Para que o bot consiga enviar sua mensagem, ele transforma você em "app". Isso é necessário, pois sem essa transformação, a mensagem não poderia ser enviada para os outros servidores.
               
               **Conectando Canais:**
               - Você pode conectar seu canal a outros servidores utilizando o comando \`!global\`.
               - Uma vez conectado, todas as mensagens enviadas aqui serão compartilhadas com os servidores que fazem parte da conexão.
           `)
.setFooter({
text: `🌠 Danny Barbosa | ${formatDateTime()}`,
iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
})
.setTimestamp();

await message.channel.send({ embeds: [infoEmbed] });
},
},

horário: {
description: 'Mostra o horário de funcionamento atual.',
execute: async (message) => {
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
const ultimoHorario = {
Segunda: '22:00',
Terça: '22:00',
Quarta: '22:00',
Quinta: '22:00',
Sábado: '21:00',
}[diaAtual] || null; // Define o último horário

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

// Verifica se o horário está fora de horário
if (horarioHoje === 'Fora de horário') {
// Mensagem de parada embutida
const shutdownEmbed = new EmbedBuilder()
.setTitle("📡 Bot Fora do Ar!")
.setDescription("O Danny-Chat está **desligado**. Voltaremos depois! 🚫")
.setColor(0xFF0000)
.setThumbnail("https://avatars.githubusercontent.com/u/132908376?v=4")
.setTimestamp()
.setFooter({ text: `${message.guild.name} - Conectando Comunidades` });

message.channel.send({ embeds: [shutdownEmbed] });
return; // Encerra a execução para evitar mais envios
}

// Verifica se o horário atual ultrapassou o último horário
if (ultimoHorario && hoje.toTimeString().split(' ')[0] > ultimoHorario) {
// Mensagem de parada embutida
const shutdownEmbed = new EmbedBuilder()
.setTitle("📡 Bot Fora do Ar!")
.setDescription("O Danny-Chat está **desligado**. Voltaremos depois! 🚫")
.setColor(0xFF0000)
.setThumbnail("https://avatars.githubusercontent.com/u/132908376?v=4")
.setTimestamp()
.setFooter({ text: `${message.guild.name} - Conectando Comunidades` });

message.channel.send({ embeds: [shutdownEmbed] });
}
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
console.log(`Canal ${channelId} não encontrado, removendo da li
