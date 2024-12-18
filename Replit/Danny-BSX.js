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

//Senhas online 
//const TOKEN = process.env.TOKEN;
//const CLIENT_SECRET = process.env.CLIENT_SECRET;
//const WEBHOOK_URL = process.env.WEBHOOK_URL;

// Carregue suas variáveis de ambiente
//config();
const TOKEN = ;
const CLIENT_SECRET = ;
const WEBHOOK_URL = `';`;
const OWNER_ID = '1067849662347878401'; // Coloque o seu ID de usuário aqui

// Estruturas de armazenamento
let channelConnections = {};
let globalConnections = [];
let bannedServers = [];
let mutedUsers = [];

// Crie uma nova instância do cliente Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Função para verificar se um canal existe e se o bot tem acesso
async function checkChannelAccess(channelId) {
    try {
        const channel = await client.channels.fetch(channelId);
        return channel && channel.permissionsFor(client.user).has('SEND_MESSAGES');
    } catch (error) {
        console.error(`Erro ao acessar canal ${channelId}: ${error.message}`);
        return false;
    }
}

// Função para carregar conexões
async function loadConnections() {
    if (fs.existsSync('Salvamento.json')) {
        try {
            const data = fs.readFileSync('Salvamento.json', 'utf8');
            if (data.trim().length === 0) {
                channelConnections = {};
                globalConnections = [];
                bannedServers = [];
                mutedUsers = [];
            } else {
                const parsedData = JSON.parse(data);
                channelConnections = parsedData.channelConnections || {};
                globalConnections = parsedData.globalConnections || [];
                bannedServers = parsedData.bannedServers || [];
                mutedUsers = parsedData.mutedUsers || [];

                // Verifica cada canal e remove os que não são acessíveis
                for (const channelId of Object.keys(channelConnections)) {
                    const hasAccess = await checkChannelAccess(channelId);
                    if (!hasAccess) {
                        console.log(`Canal removido (sem acesso): ${channelId}`);
                        delete channelConnections[channelId]; // Remove o canal das conexões
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao carregar conexões: ", error);
            channelConnections = {};
            globalConnections = [];
            bannedServers = [];
            mutedUsers = [];
        }
    }
}

// Função para salvar conexões
function saveConnections() {
    fs.writeFileSync('Salvamento.json', JSON.stringify({
        channelConnections,
        globalConnections,
        bannedServers,
        mutedUsers 
    }, null, 4));
}

// Evento ao sair de um servidor
client.on('guildDelete', async (guild) => {
    // Limpa as informações do servidor ao sair
    delete channelConnections[guild.id]; // Remove conexões específicas do servidor
    globalConnections = globalConnections.filter(id => id !== guild.id); // Remove o ID do servidor das conexões globais

    // Salva alterações após sair do servidor
    saveConnections();
    console.log(`Bot saiu do servidor: ${guild.name}`); // Log para referência
});

// Carrega as conexões ao iniciar o bot
loadConnections();

//parte 3 Funções utilitárias, como formatação de data e regras do servidor

// Limite de palavras
const MAX_WARNINGS = 3; // Número máximo de avisos permitidos por servidor
const MAX_WORDS = 50; // Limite de palavras
const cooldowns = new Map(); // Mapa para gerenciar cooldowns
const warnedServers = new Map(); // Mapa para rastrear avisos por servidor

// Função que formata a data e hora corretamente
function formatDateTime() {
const now = new Date();
const hours = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
const date = now.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
return `🕘 ${date} | 🗓️ ${hours}`;
}
// Regras do Danny-Chat
const mensagemRegras = `
1. **Use o bom senso:** Seja considerado com os outros e suas opiniões. Sem ofensas, linguagem extrema ou qualquer ação que possa perturbar o conforto do chat.
2. **Sem spam ou flooding:** Evite mensagens repetidas, sem sentido ou excessivamente longas.
3. **Mantenha assuntos privados:** Evite compartilhar informações pessoais na rede.
4. **Sem assédio:** Trolling, insultos ou assédio de qualquer tipo não serão tolerados.
5. **Sem conteúdo NSFW/NSFL:** Postar conteúdo NSFW/NSFL explícito resultará em banimento imediato.
6. **Respeite tópicos sensíveis:** Não trivialize automutilação, suicídio, violência ou outros tópicos ofensivos.
7. **Reporte preocupações:** Se você observar uma violação dessas regras, reporte ao moderador do hub apropriado ou à equipe do Danny-Chat para ação adicional.

Qualquer dúvida? Junte-se ao nosso [servidor de suporte](https://discord.gg/8GWFWNmjTa).
`;

const mensagemInfos = `
O Danny Chat é um bot que conecta servidores, permitindo que as mensagens enviadas em um canal sejam visíveis em todos os servidores conectados.

**Como Funciona:**
- Ao enviar uma mensagem neste canal, ela será replicada em todos os canais que estão conectados globalmente.
- Para que o bot consiga enviar sua mensagem, ele transforma você em "app". Isso é necessário, pois sem essa transformação, a mensagem não poderia ser enviada para os outros servidores.

**Conectando Canais:**
- Você pode conectar seu canal a outros servidores utilizando o comando \`!global\`.
- Uma vez conectado, todas as mensagens enviadas aqui serão compartilhadas com os servidores que fazem parte da conexão.
`;

// Lista de palavrões (incluindo os fornecidos)
const palavrasProibidas = [
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
            palavrasProibidasWarnings: 0,
            repeatedMessageWarnings: 0,
            wordLimitWarnings: 0,
            messageHistory: []
        });
    }
    const serverWarnings = warnedServers.get(message.guild.id);

    // Verificar se a mensagem contém alguma palavra proibida
    const containsPalavraProibida = palavrasProibidas.some(word => message.content.toLowerCase().includes(word));

    if (containsPalavraProibida) {
        const remainingWarnings = 5 - serverWarnings.palavrasProibidasWarnings;
        const warningEmbed = new EmbedBuilder()
            .setColor('#FF0000') // Cor do embed para aviso (vermelho)
            .setTitle('🚫 Aviso')
            .setDescription(`Palavras proibidas não são permitidas. \n Você só tem mais ${remainingWarnings} avisos antes de desconectar.`)
            .setFooter({ text: `Mensagem enviada por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await message.channel.send({ embeds: [warningEmbed] });

        // Incrementa o contador de avisos por palavrões
        serverWarnings.palavrasProibidasWarnings += 1;

        // Verifica se o número de avisos por palavrões ultrapassa o limite
        if (serverWarnings.palavrasProibidasWarnings >= 5) { // Limite de 5 avisos
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
            .setTitle('🚫 Aviso')
            .setDescription(`Mensagens repetidas não são permitidas.\nVocê só tem mais ${remainingWarnings} avisos antes de desconectar.`)
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

    const MAX_WORDS = 100; // Defina o limite de palavras

    const messageWordCount = message.content.split(/\s+/).length;

    if (messageWordCount > MAX_WORDS) {
        const remainingWarnings = 5 - serverWarnings.wordLimitWarnings;

        const wordLimitEmbed = new EmbedBuilder()
            .setColor('#FFFF00') // Cor do embed para limite de palavras (amarelo)
            .setTitle('⚠️ Aviso')
            .setDescription(`Sua mensagem excede o limite de ${MAX_WORDS} palavras. \nVocê só tem mais ${remainingWarnings} avisos antes de desconectar.`)
            .setFooter({ text: `Mensagem enviada por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await message.channel.send({ embeds: [wordLimitEmbed] });

        // Incrementa o contador de avisos por limite de palavras
        serverWarnings.wordLimitWarnings += 1;

        // Verifica se o número de avisos por limite de palavras ultrapassa o limite
        if (serverWarnings.wordLimitWarnings >= 5) { // Limite de 5 avisos
            await disconnectServer(message); // Desconecta o servidor se atingir o limite
            return; // Retorna após desconectar
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

    // Log da desconexão
    console.log(`O servidor **${message.guild.name}** foi desconectado da conexão global.`);
};

//parte 4 Definição dos comandos do bot, com suas respectivas funcionalidades
const commands = {
    
 criador: {
    description: 'Mostra quem é o criador do bot',
    execute: (message) => {
        const embed = new EmbedBuilder()
            .setColor('#800080')
            .setTitle('🌠 Danny Barbosa')
            .setThumbnail("https://avatars.githubusercontent.com/u/132908376?v=4")
            .setDescription('🌟 Criado por <@1067849662347878401> ! \n\n' + 
                '-----\n' +
                '🔍 Para mais informações, use o comando `!info`.\n' +
                '📚 Para ajuda, utilize o comando `!ajuda`.\n' +
                '-----\n' +
                '[Acesse o Github do projeto!](https://github.com/DannyBarbosaBR/Cross-Chat-Bot-Discord-BR/)')
            .setFooter({
                text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
            })
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
    },
},
    
buscar: {
    description: 'Busca informações em fontes confiáveis.',
    async execute(message, ...args) {
        // Verifica se o primeiro argumento existe e não é vazio
        const query = args.join(' ').trim(); // Junte todos os argumentos e remova espaços

        // Se a query estiver vazia, mostra instruções
        if (!query) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')  // Amarelo
                .setTitle("⚠️ Instruções")
                .setDescription("Por favor, forneça uma palavra para que eu possa buscar informações.\nTente usar palavras-chave específicas.")
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4'
                })
                .setTimestamp();

            return message.reply({ embeds: [embed] }); // Retorna aqui se não houver query
        }

        try {
            // Primeira tentativa na Wikipédia (em português)
            const wikiResponse = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}?redirects=true&origin=*`);
            const wikiData = await wikiResponse.json();

            if (wikiData.type === 'standard') {
                const embed = new EmbedBuilder()
                    .setColor('#00FFFF')  // Ciano
                    .setTitle(`📖 ${wikiData.title}`)
                    .setThumbnail(wikiData.thumbnail ? wikiData.thumbnail.source : 'https://pt.wikipedia.org/static/images/project-logos/ptwiki.png')
                    .setDescription(`${wikiData.extract}\n[Saiba mais no Wikipédia](https://pt.wikipedia.org/wiki/${encodeURIComponent(query)})`)
                    .setFooter({
                        text: `📖 Wikipédia | ${formatDateTime()}`,
                        iconURL: 'https://pt.wikipedia.org/static/images/project-logos/ptwiki.png'
                    })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Se não encontrar na Wikipédia, busca no DuckDuckGo
            const duckDuckGoResponse = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
            const duckData = await duckDuckGoResponse.json();

            if (duckData.Abstract) {
                const embed = new EmbedBuilder()
                    .setColor('#00FFFF')  // Ciano
                    .setTitle(`🔍 ${duckData.Heading}`)
                    .setThumbnail('https://duckduckgo.com/assets/logo_homepage.normal.v108.svg')
                    .setDescription(`${duckData.Abstract}\n[Saiba mais no DuckDuckGo](${duckData.AbstractURL})`)
                    .setFooter({
                        text: `🌐 DuckDuckGo | ${formatDateTime()}`,
                        iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4'
                    })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Busca na Open Library se as outras fontes falharem
            const openLibraryResponse = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
            const libraryData = await openLibraryResponse.json();

            if (libraryData.docs && libraryData.docs.length > 0) {
                const book = libraryData.docs[0];
                const embed = new EmbedBuilder()
                    .setColor('#00FFFF')  // Ciano
                    .setTitle(`📚 ${book.title}`)
                    .setThumbnail(`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`)
                    .setDescription(`Autor: ${book.author_name ? book.author_name.join(", ") : "Desconhecido"}\nAno: ${book.first_publish_year || "Desconhecido"}\n[Saiba mais no Open Library](https://openlibrary.org${book.key})`)
                    .setFooter({
                        text: `📖 Open Library | ${formatDateTime()}`,
                        iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4'
                    })
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Mensagem de nenhuma informação encontrada
            const embedNenhumaInfo = new EmbedBuilder()
                .setColor('#FF0000')  // Vermelho
                .setTitle("❌ Nenhuma Informação Encontrada")
                .setDescription("Nenhuma informação encontrada para sua pesquisa. \nPor favor, tente ser mais específico ou forneça mais detalhes:\n- Use palavras-chave mais específicas.\n- Verifique a ortografia.\n- Experimente outros termos relacionados.")
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4'
                })
                .setTimestamp();

            return message.reply({ embeds: [embedNenhumaInfo] });

        } catch (error) {
            console.error(error);
            // Mensagem de erro ao executar o comando
            const embedErro = new EmbedBuilder()
                .setColor('#FF0000')  // Vermelho
                .setTitle("❌ Erro Ao Executar Comando")
                .setDescription("Ocorreu um erro ao tentar buscar a informação. \nPor favor, tente novamente mais tarde!")
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4'
                })
                .setTimestamp();

            return message.reply({ embeds: [embedErro] });
        }
    },
},
    
tempo: {
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
            // Log no terminal
            console.log(`[${new Date().toISOString()}] O bot está fora do ar: ${message.guild.name}`);
            
            // Mensagem de parada embutida
            const shutdownEmbed = new EmbedBuilder()
                .setTitle("📡 Bot Fora do Ar!")
                .setDescription("🚫 O Danny-Chat está **desligado**. Voltaremos depois!")
                .setColor(0xFF0000)
                .setThumbnail("https://avatars.githubusercontent.com/u/132908376?v=4")
                .setTimestamp()
                .setFooter({ text: `${message.guild.name} - Conectando Comunidades` });

            message.channel.send({ embeds: [shutdownEmbed] });
            return; // Encerra a execução para evitar mais envios
        }

        // Verifica se o horário atual ultrapassou o último horário
        if (ultimoHorario && hoje.toTimeString().split(' ')[0] > ultimoHorario) {
            // Log no terminal
            console.log(`[${new Date().toISOString()}] O bot está fora do ar: ${message.guild.name}`);
            
            // Mensagem de parada embutida
            const shutdownEmbed = new EmbedBuilder()
                .setTitle("📡 Bot Fora do Ar!")
                .setDescription("🚫 O Danny-Chat está **desligado**. Voltaremos depois!")
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
.setDescription(`Conectado em ${serverCount} servidores:\n\n${serverList}\n\n [Acesse o Github do projeto!](https://github.com/DannyBarbosaBR/Cross-Chat-Bot-Discord-BR/)
`)
.setFooter({
text: `🌠 Danny Barbosa | ${formatDateTime()}`,
iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
})
.setTimestamp();
message.channel.send({ embeds: [embed] });
}, // Corrigido: removeu o ponto e vírgula aqui
},

info: {
    description: 'Exibe informações sobre o Chat Global.',
    async execute(message) {
        const embedInfo = new EmbedBuilder()
            .setColor('#00FFFF')  // Cor ciano
            .setTitle("🌍 Informações do Chat Global")
            .setDescription(mensagemInfos)
            .setFooter({
                text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4'
            })
            .setTimestamp();

        return message.reply({ embeds: [embedInfo] });
    },
},

expulsos: {
    description: 'Mostra todos os expulsos da conexão.',
    execute: (message) => {
        const bannedServerCount = bannedServers.length;
        const mutedUserCount = mutedUsers.length;
        
        const bannedServerList = bannedServers.length > 0 
            ? bannedServers.map(serverId => `ID: ${serverId}`).join('\n') 
            : 'Nenhum servidor banido.';
        
        const mutedUserList = mutedUsers.length > 0 
            ? mutedUsers.map(userId => `ID: ${userId}`).join('\n') 
            : 'Nenhum usuário mutado.';
        
        const embed = new EmbedBuilder()
            .setColor('#FF4500')
            .setTitle('🚫 Expulsos')
            .setDescription(`Lista de servidores banidos e usuários mutados:`)
            .addFields(
                { name: '🛑 Servidores Banidos', value: bannedServerList, inline: false },
                { name: '🔇 Usuários Mutados', value: mutedUserList, inline: false }
            )
            .setFooter({
                text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
            })
            .setTimestamp();
        
        message.channel.send({ embeds: [embed] });
    },
},
    
desligar: {
    description: 'Desliga o bot do servidor de sistema.',
    execute: async (message) => {
        // Verifica se o usuário tem permissão para usar o comando
        if (message.author.id !== OWNER_ID && !message.member.permissions.has('ADMINISTRATOR')) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Permissão Negada')
                .setDescription('Você não tem permissão para usar este comando.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();

            return message.channel.send({ embeds: [noPermissionEmbed] });
        }

        // Mensagem de desligamento
        const shuttingDownEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('🔌 Desligando o Bot')
            .setDescription('O bot está sendo desligado. \nEle não estará disponível até que seja reiniciado manualmente.')
            .setFooter({
                text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
            })
            .setTimestamp();

        await message.channel.send({ embeds: [shuttingDownEmbed] });

        // Mensagem de parada embutida
        const shutdownEmbed = new EmbedBuilder()
            .setTitle("📡 Bot Fora do Ar!")
            .setDescription("🚫 O Danny-Chat está **desligado**. Voltaremos depois!")
            .setColor(0xFF0000)
            .setThumbnail("https://avatars.githubusercontent.com/u/132908376?v=4")
            .setTimestamp()
            .setFooter({ text: `${message.guild.name} - Conectando Comunidades` });

        // Enviar a mensagem de desligamento para todos os canais conectados
        for (const channelId of globalConnections) {
            try {
                const channel = await client.channels.fetch(channelId);
                await channel.send({ embeds: [shutdownEmbed] });
            } catch (error) {
                console.log(`Erro ao enviar mensagem para o canal ${channelId}: ${error.message}`);
            }
        }

        // Remove o token do bot (desconectar efetivamente)
        process.exit(); // Isso encerra o processo do bot
    },
},
    
juntar: {
    description: 'Junta mensagens de um canal a outro.',
    execute: async (message) => {
        // Verificação de permissões
        if (message.author.id !== OWNER_ID && !message.member.permissions.has('ADMINISTRATOR')) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Vermelho para erro
                .setTitle('❌ Permissão Negada')
                .setDescription('Apenas administradores podem usar este comando.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        const targetChannel = message.mentions.channels.first();
        if (!targetChannel) {
            const embed = new EmbedBuilder()
                .setColor('#FFA500') // Laranja para aviso
                .setTitle('❗ Canal Não Mencionado')
                .setDescription('Por favor, mencione um canal para juntar.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        if (!channelConnections[message.guild.id]) {
            channelConnections[message.guild.id] = [];
        }

        // Verifica se já existe uma conexão para o servidor
        const existingConnection = channelConnections[message.guild.id].find(conn => conn.sourceChannelId === message.channel.id);
        if (existingConnection) {
            const alreadyConnectedEmbed = new EmbedBuilder()
                .setColor('#FFA500') // Laranja para aviso
                .setTitle('🔗 Conexão Existente')
                .setDescription('Este canal já está juntado a outro canal.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            return message.channel.send({ embeds: [alreadyConnectedEmbed] });
        }

        channelConnections[message.guild.id].push({
            sourceChannelId: message.channel.id,
            targetChannelId: targetChannel.id,
        });

        const embed = new EmbedBuilder()
            .setColor('#008000') // Verde para sucesso
            .setTitle('🔗 Canal Juntado')
            .setDescription(`Canal <#${message.channel.id}> juntado ao canal <#${targetChannel.id}>.`)
            .setFooter({
                text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
            })
            .setTimestamp();
        message.channel.send({ embeds: [embed] });

        // Lógica para compartilhar mensagens do canal conectado
        const messageListener = async (msg) => {
            if (msg.channel.id === message.channel.id && msg.author.id !== client.user.id) {
                const embedMessage = new EmbedBuilder()
                    .setColor('#1E90FF') // Azul escuro
                    .setAuthor({ name: msg.author.username, iconURL: msg.author.displayAvatarURL() })
                    .setDescription(msg.content || "Mensagem sem conteúdo.")
                    .setFooter({
                        text: `🔗 ${message.guild.name} | ${formatDateTime()}`, // Nome do servidor de origem com emoji
                        iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                    })
                    .setTimestamp();

                const targetChannelId = targetChannel.id;
                const targetChannelToSend = await client.channels.fetch(targetChannelId);
                if (targetChannelToSend) {
                    // Aguarda 2 segundos antes de enviar a mensagem
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2000 ms (2 segundos)
                    await targetChannelToSend.send({ embeds: [embedMessage] }); // Envia a mensagem embed para o canal de destino
                }

                // Log da mensagem enviada
                console.log(`Mensagem de <#${message.channel.id}> enviada para <#${targetChannel.id}>: ${msg.content}`);
            }
        };

        // Adiciona o listener de mensagens
        message.client.on('messageCreate', messageListener);

        saveConnections(); // Salva as conexões
    },
},
    
global: {
    description: 'Conecta o canal atual a outros servidores.',
    execute: async (message) => {
        // Verifica se o servidor está banido
        if (bannedServers.includes(message.guild.id)) {
            const bannedServerEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Servidor Banido')
                .setDescription('Este servidor não tem permissão para usar este comando.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();

            return message.channel.send({ embeds: [bannedServerEmbed] });
        }

        // Verifica se o usuário tem permissão para usar o comando (administrador ou dono do servidor)
        if (message.author.id !== OWNER_ID && !message.member.permissions.has('ADMINISTRATOR') && message.guild.ownerId !== message.author.id) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Permissão Negada')
                .setDescription('Você precisa ser o dono do servidor ou ter permissão de administrador para usar este comando.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();

            return message.channel.send({ embeds: [noPermissionEmbed] });
        }

        // Verifica se já existe uma conexão global para o servidor
        const existingConnection = globalConnections.find(channelId => {
            const channel = client.channels.cache.get(channelId);
            return channel && channel.guild.id === message.guild.id;
        });

        if (existingConnection) {
            const alreadyConnectedEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('🔗 Conexão Global')
                .setDescription('Este servidor já possui um canal conectado globalmente. \nNão é possível conectar outro canal.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();

            return message.channel.send({ embeds: [alreadyConnectedEmbed] });
        }

        globalConnections.push(message.channel.id);
        const connectedEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🌐 Canal Conectado')
            .setThumbnail(message.guild.iconURL({ dynamic: true, format: 'png', size: 1024 }))
            .setDescription(`Canal <#${message.channel.id}> conectado globalmente. \nPara mais detalhes, use \`!informações\`.`)
            .setFooter({
                text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
            })
            .setTimestamp();

        // Envia mensagem no canal informando a conexão global
        message.channel.send({ embeds: [connectedEmbed] });

        // Adiciona uma mensagem de login no console
        console.log(`O servidor "${message.guild.name}" foi conectado na Conexão Global.`);

        const embedRules = new EmbedBuilder()
            .setColor('#FFFF00')
            .setTitle('📜 Regras do Danny-Chat')
            .setDescription(mensagemRegras)
            .setFooter({
                text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
            })
            .setTimestamp();

        message.channel.send({ embeds: [embedRules] });

        const numberOfConnections = globalConnections.length;
        const notificationEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('👋 Novo Servidor Conectado')
            .setDescription(`O servidor **${message.guild.name}** entrou na conexão!\nAgora temos **${numberOfConnections}** servidores conectados.`)
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
    
sair: {
    description: 'Desconecta um canal conectado da conexão.',
    async execute(message) {
        // Verifica se o usuário tem permissão para usar o comando
        if (message.author.id !== OWNER_ID && !message.member.permissions.has('ADMINISTRATOR')) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('#FF0000') // Vermelho para erro
                .setTitle('❌ Permissão Negada')
                .setDescription('Você não tem permissão para usar este comando.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            return message.channel.send({ embeds: [noPermissionEmbed] });
        }

        const channelId = message.channel.id;

        // Log no console
        console.log(`[LOG] O usuário ${message.author.tag} desconectou o canal ${channelId} (${message.channel.name})`);

        // Verifica se o canal está na lista de conexões locais
        if (channelConnections[message.guild.id]) {
            const connectionIndex = channelConnections[message.guild.id].findIndex(conn => conn.sourceChannelId === channelId || conn.targetChannelId === channelId);
            if (connectionIndex !== -1) {
                // Remove a conexão local
                const { targetChannelId } = channelConnections[message.guild.id][connectionIndex];
                channelConnections[message.guild.id].splice(connectionIndex, 1);

                const embed = new EmbedBuilder()
                    .setColor('#008000') // Verde claro para sucesso
                    .setTitle('🔌 Desconectado com Sucesso')
                    .setDescription(`Canal <#${channelId}> desconectado da conexão com <#${targetChannelId}>.`)
                    .setFooter({
                        text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                        iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                    })
                    .setTimestamp();
                await message.channel.send({ embeds: [embed] });

                const disconnectEmbed = new EmbedBuilder()
                    .setColor('#FF0000') // Vermelho para desconexão
                    .setTitle('🔌 Desconectado da Conexão')
                    .setDescription(`O canal <#${channelId}> foi desconectado da conexão com <#${targetChannelId}>.`)
                    .setFooter({
                        text: `🌎 ${message.guild.name} | ${formatDateTime()}`, // Nome do servidor de origem
                        iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                    })
                    .setTimestamp();

                const targetChannel = await client.channels.fetch(targetChannelId);
                if (targetChannel) {
                    await targetChannel.send({ embeds: [disconnectEmbed] });
                }

                saveConnections();
                return;
            }
        }

        // Verifica se o canal está na lista de conexões globais
        if (globalConnections.includes(channelId)) {
            globalConnections = globalConnections.filter(id => id !== channelId);
            const embed = new EmbedBuilder()
                .setColor('#008000') // Verde claro para sucesso
                .setTitle('🔌 Desconectado com Sucesso')
                .setDescription(`Canal <#${channelId}> desconectado da conexão global.`)
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            await message.channel.send({ embeds: [embed] });

            const disconnectEmbed = new EmbedBuilder()
                .setColor('#FF0000') // Vermelho para desconexão
                .setTitle('🔌 Desconectado da Conexão Global')
                .setDescription(`O canal <#${channelId}> do **${message.guild.name}** foi desconectado da conexão global.`)
                .setFooter({
                    text: `🌎 ${message.guild.name} | ${formatDateTime()}`, // Nome do servidor de origem
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();

            for (const id of globalConnections) {
                try {
                    const channel = await client.channels.fetch(id);
                    await channel.send({ embeds: [disconnectEmbed] });
                } catch (err) {
                    console.log(`Erro ao enviar mensagem para o canal ${id}: ${err.message}`);
                }
            }

            saveConnections();
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#FF0000') // Vermelho para erro
            .setTitle('❌ Canal Não Conectado')
            .setDescription('Este canal não está conectado a nenhuma conexão.')
            .setFooter({
                text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
            })
            .setTimestamp();
        await message.channel.send({ embeds: [embed] });
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
    execute: async (message, args) => {
        // Verifica se o usuário é administrador ou dono do bot
        if (!message.member.permissions.has('ADMINISTRATOR') && message.author.id !== OWNER_ID) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Vermelho para erro
                .setTitle('❌ Permissão Negada')
                .setDescription('Apenas administradores ou o dono do bot podem usar este comando.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        const serverId = args[0];
        if (!serverId) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Vermelho para erro
                .setTitle('❗ ID do Servidor Não Informado')
                .setDescription('Por favor, forneça o ID do servidor para banir.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        if (!bannedServers.includes(serverId)) {
            bannedServers.push(serverId);
            saveConnections();

            // Log da ação de banimento
            console.log(`Servidor ${serverId} banido por ${message.author.tag} (${message.author.id})`);

            // Notificação de sucesso para o usuário que baniu
            const successEmbed = new EmbedBuilder()
                .setColor('#FF0000') // Vermelho para banimento
                .setTitle('🚫 Servidor Banido')
                .setDescription(`O servidor **${serverId}** foi banido com sucesso.`)
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            message.channel.send({ embeds: [successEmbed] });

            // Remove os canais do servidor banido da lista global de conexões
            globalConnections = globalConnections.filter(channelId => {
                const channel = client.channels.cache.get(channelId);
                return channel && channel.guild.id !== serverId;
            });

            // Salva a lista de conexões atualizada
            saveConnections();

            // Notificação de banimento para todos os canais conectados restantes
            const banEmbed = new EmbedBuilder()
                .setColor('#FF0000') // Vermelho para banimento
                .setTitle('🚫 Servidor Banido da Conexão Global')
                .setDescription(`O servidor **${serverId}** foi banido e desconectado da conexão global.`)
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();

            for (const channelId of globalConnections) {
                try {
                    const channel = await client.channels.fetch(channelId);
                    await channel.send({ embeds: [banEmbed] });
                } catch (err) {
                    console.log(`Erro ao enviar mensagem para o canal ${channelId}: ${err.message}`);
                }
            }
        } else {
            const alreadyBannedEmbed = new EmbedBuilder()
                .setColor('#FF0000') // Vermelho para erro
                .setTitle('⚠️ Servidor Está Banido')
                .setDescription('Este servidor já está na lista de banidos.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();

            message.channel.send({ embeds: [alreadyBannedEmbed] });
        }
    },
},

desbanir: {
    description: 'Remove o banimento de um servidor.',
    execute: async (message, args) => {
        // Verifica se o usuário é administrador ou dono do bot
        if (!message.member.permissions.has('ADMINISTRATOR') && message.author.id !== OWNER_ID) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Vermelho para erro
                .setTitle('❌ Permissão Negada')
                .setDescription('Apenas administradores ou o dono do bot podem usar este comando.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        const serverId = args[0];
        if (!serverId) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000') // Vermelho para erro
                .setTitle('❗ ID do Servidor Não Informado')
                .setDescription('Por favor, forneça o ID do servidor para desbanir.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        const index = bannedServers.indexOf(serverId);
        if (index !== -1) {
            bannedServers.splice(index, 1);

            // Log da ação de desbanimento
            console.log(`Servidor ${serverId} desbanido por ${message.author.tag} (${message.author.id})`);

            // Salva a lista atualizada de banidos após remover o servidor
            saveConnections();

            // Notificação de desbanimento para todos os canais conectados
            const unbanEmbed = new EmbedBuilder()
                .setColor('#00FF00') // Verde para desbanimento
                .setTitle('✅ Servidor Desbanido da Conexão Global')
                .setDescription(`O servidor **${serverId}** foi desbanido e pode se reconectar.`)
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();

            for (const channelId of globalConnections) {
                try {
                    const channel = await client.channels.fetch(channelId);
                    await channel.send({ embeds: [unbanEmbed] });
                } catch (err) {
                    console.log(`Erro ao enviar mensagem para o canal ${channelId}: ${err.message}`);
                }
            }
        } else {
            const alreadyUnbannedEmbed = new EmbedBuilder()
                .setColor('#FF0000') // Vermelho para erro
                .setTitle('⚠️ Servidor Não Banido')
                .setDescription('Este servidor não está na lista de banidos.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            message.channel.send({ embeds: [alreadyUnbannedEmbed] });
        }
    },
},
    
mutar: {
    description: 'Muta um usuário em todas as conexões.',
    execute: async (message, args) => {
        // Verifica se o usuário é administrador ou dono do bot
        if (!message.member.permissions.has('ADMINISTRATOR') && message.author.id !== OWNER_ID) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Permissão Negada')
                .setDescription('Apenas administradores ou o dono do bot podem usar este comando.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        const user = message.mentions.users.first();
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❗ Usuário Não Mencionado')
                .setDescription('Por favor, mencione o usuário para mutar.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        if (!mutedUsers.includes(user.id)) {
            mutedUsers.push(user.id);
            saveConnections();

            // Log da ação de mutar
            console.log(`Usuário ${user.tag} (${user.id}) mutado por ${message.author.tag} (${message.author.id})`);

            const successEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔇 Usuário Mutado')
                .setDescription(`O usuário **${user.tag}** foi mutado com sucesso.`)
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();

            // Envia a mensagem para todos os canais conectados globalmente
            globalConnections.forEach((connection) => {
                client.channels.cache.get(connection).send({ embeds: [successEmbed] });
            });
        } else {
            const alreadyMutedEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ Usuário Está Mutado')
                .setDescription('Este usuário já está na lista de mutados.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            message.channel.send({ embeds: [alreadyMutedEmbed] });
        }
    },
},

desmutar: {
    description: 'Desmuta usuário em todas as conexões.',
    execute: async (message, args) => {
        // Verifica se o usuário é administrador ou dono do bot
        if (!message.member.permissions.has('ADMINISTRATOR') && message.author.id !== OWNER_ID) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Permissão Negada')
                .setDescription('Apenas administradores ou o dono do bot podem usar este comando.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        const user = message.mentions.users.first();
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❗ Usuário Não Mencionado')
                .setDescription('Por favor, mencione o usuário para desmutar.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        const index = mutedUsers.indexOf(user.id);
        if (index !== -1) {
            mutedUsers.splice(index, 1);
            saveConnections();

            // Log da ação de desmutar
            console.log(`Usuário ${user.tag} (${user.id}) desmutado por ${message.author.tag} (${message.author.id})`);

            const unmuteSuccessEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🔊 Usuário Desmutado')
                .setDescription(`O usuário **${user.tag}** foi desmutado com sucesso.`)
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();

            // Envia a mensagem para todos os canais conectados globalmente
            globalConnections.forEach((connection) => {
                client.channels.cache.get(connection).send({ embeds: [unmuteSuccessEmbed] });
            });
        } else {
            const notMutedEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ Usuário Não Mutado')
                .setDescription('Este usuário não está na lista de mutados.')
                .setFooter({
                    text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                    iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
                })
                .setTimestamp();
            message.channel.send({ embeds: [notMutedEmbed] });
        }
    },
},
    
}; //fechamento de comandos 

/// Parte 5 Gerenciamento de eventos e compartilhamento de mensagens

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

        // Embed de erro ao executar o comando
        const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000') // Cor vermelha para erro
            .setTitle('❗ Erro ao Executar Comando')
            .setDescription('Houve um erro ao executar esse comando.')
            .setFooter({
                text: `🌠 Danny Barbosa | ${formatDateTime()}`,
                iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
            })
            .setTimestamp();

        message.channel.send({ embeds: [errorEmbed] });
    }
} else {
    // Embed para comando não encontrado
    const notFoundEmbed = new EmbedBuilder()
        .setColor('#FFA500') // Cor laranja para aviso
        .setTitle('❌ Comando Não Encontrado')
        .setDescription('Comando não encontrado.\nFaça `!ajuda` para ver os comandos disponíveis.')
        .setFooter({
            text: `🌠 Danny Barbosa | ${formatDateTime()}`,
            iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4',
        })
        .setTimestamp();

    message.channel.send({ embeds: [notFoundEmbed] });
}
}
    
    
// Lista de prefixos comuns usados em bots
const botPrefixes = ["!", "/", ".", "-", "$", "~", "?", "+", "%", "&", "*", "#"]; // Prefixos adicionados

// Compartilhamento global de mensagens
if (globalConnections.includes(message.channel.id)) { // Verifica se o canal atual está na lista de conexões globais
    // Verifica se o autor da mensagem está na lista de usuários mutados, se o servidor não está banido,
    // e se a mensagem não começa com nenhum prefixo de bot
    if (
        !mutedUsers.includes(message.author.id) && // Verificação de usuário mutado
        !bannedServers.includes(message.guild.id) && // Verificação de servidor banido
        !botPrefixes.some(prefix => message.content.startsWith(prefix)) // Ignora mensagens com prefixos de bot
    ) {
        // Itera sobre todos os canais conectados globalmente
        for (const targetChannelId of globalConnections) {
            if (targetChannelId !== message.channel.id) { // Garante que não está enviando no mesmo canal
                const targetChannel = await client.channels.fetch(targetChannelId); // Busca o canal de destino
                if (targetChannel) { // Verifica se o canal é válido
                    // Aguarda 2 segundos antes de enviar a mensagem
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2000 ms (2 segundos)

                    // Conteúdo da mensagem
                    let embedDescription = message.content || "Mensagem sem conteúdo."; // Define conteúdo padrão se vazio
                    const embed = new EmbedBuilder()
                        .setColor('#3498db') // Cor do embed
                        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() }) // Autor da mensagem
                        .setDescription(embedDescription) // Descrição com o conteúdo da mensagem
                        .setFooter({
                            text: `🌎 ${message.guild.name} | ${formatDateTime()}`, // Nome do servidor de origem
                            iconURL: 'https://avatars.githubusercontent.com/u/132908376?v=4', // Ícone do footer
                        })
                        .setTimestamp(); // Marca de tempo da mensagem
                    
                    await targetChannel.send({ embeds: [embed] }); // Envia a mensagem embed para o canal de destino
                    
// Responder a mensagem original mencionando o autor
if (message.reference && message.reference.messageId) {
const originalMessage = await message.channel.messages.fetch(message.reference.messageId);
if (originalMessage) {
const replyContent = `🔁 **Resposta a:**${originalMessage.author}:\n${originalMessage.content}`;

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
.setDescription(`🖼️ **Imagem Compartilhada:** \n[Veja a imagem aqui](${attachment.url})`) // Link da imagem incluído na descrição
.setImage(attachment.url) // Imagem embutida no embed
.setFooter({ text: `Imagem enviada por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

await targetChannel.send({ embeds: [attachmentEmbed] });
} else if (isAudio) {
const audioEmbed = new EmbedBuilder()
.setColor('#FFA500') // Cor do embed para áudios (laranja)
.setDescription(`🎶 **Áudio Compartilhado:** \n[Ouça o áudio aqui](${attachment.url})`) // Link do áudio incluído na descrição
.setFooter({ text: `Áudio enviado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

await targetChannel.send({ embeds: [audioEmbed] });
} else if (isVideo) {
const videoEmbed = new EmbedBuilder()
.setColor('#FFA500') // Cor do embed para vídeos (laranja)
.setDescription(`🎥 **Vídeo Compartilhado:** \n[Assista ao vídeo aqui](${attachment.url})`) // Link do vídeo incluído na descrição
.setFooter({ text: `Vídeo enviado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

await targetChannel.send({ embeds: [videoEmbed] });
} else if (isFile) {
const fileEmbed = new EmbedBuilder()
.setColor('#FFA500') // Cor do embed para outros tipos de arquivos (laranja)
.setDescription(`💾 **Arquivo Compartilhado:**\n[Baixe o arquivo aqui](${attachment.url})`) // Link do arquivo incluído na descrição
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
.setDescription(`🔗 **Link Compartilhado:** \n[Acesse aqui](${link})`)
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
.setDescription(`🖼️ **Figurinha Compartilhada: ** \n[Veja a figurinha aqui](${sticker.url})`) // Link da figurinha incluído na descrição
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
.setDescription(`😄 **Emoji Compartilhado:** ${emoji}`)
.setFooter({ text: `Emoji enviado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

await targetChannel.send({ embeds: [emojiEmbed] });           

}
}
}
}
}
}
}
}
});
const sentMessages = new Set(); // Inicializa sentMessages como um Set

// Captura de mensagens de bots
client.on('messageCreate', async (message) => {
    // Verifica se a mensagem é de um bot que não é ele mesmo
    if (message.author.bot && message.author.id !== client.user.id) {
        const { content, attachments } = message;

        // Verifica se o canal atual tem uma conexão global
        if (!globalConnections.includes(message.channel.id)) {
            return; // Não faz nada se o canal não está conectado globalmente
        }

        // Verifica se a mensagem já foi enviada
        if (sentMessages.has(message.id)) {
            return; // Se já foi enviada, não faz nada
        }

        // Adiciona o ID da mensagem ao conjunto para evitar duplicação
        sentMessages.add(message.id);

        // Mensagem de texto do bot
        const botMessageEmbed = new EmbedBuilder()
            .setColor('#FFFF00') // Cor do embed (amarelo)
            .setDescription(`🤖 **Mensagem do Bot:** \n${content}`)
            .setFooter({ text: `Mensagem enviada por ${message.author.tag} | Servidor: ${message.guild.name}`, iconURL: message.author.displayAvatarURL() });

        // Enviar a mensagem embed para todos os canais globais conectados
        for (const channelId of globalConnections) {
            try {
                const channel = await client.channels.fetch(channelId);

                // Verifica se o canal é válido e se o bot já enviou mensagem
                if (channel) {
                    // Enviar a mensagem embed
                    await channel.send({ embeds: [botMessageEmbed] });

                    // Enviar anexos se existirem
                    if (attachments.size > 0) {
                        for (const attachment of attachments.values()) {
                            await channel.send({ files: [attachment.url] }); // Envia cada anexo
                        }
                    }
                }
            } catch (error) {
                console.log(`Canal ${channelId} não encontrado, removendo da lista de conexões.`);
                globalConnections = globalConnections.filter(id => id !== channelId); // Remove o canal da lista
            }
        }
    }
});

//Menssagem Editada
client.on('messageUpdate', async (oldMessage, newMessage) => {
    // Verifica se a mensagem editada está em um canal global
    if (globalConnections.includes(newMessage.channel.id)) {
        // Verifica se a mensagem foi realmente alterada
        if (oldMessage.content === newMessage.content) return;

        // Itera sobre todos os canais conectados globalmente
        for (const targetChannelId of globalConnections) {
            if (targetChannelId !== newMessage.channel.id) {
                const targetChannel = await client.channels.fetch(targetChannelId);

                if (targetChannel) {
                    // Aguarda 2 segundos antes de enviar a mensagem editada
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Cria o conteúdo da mensagem com a edição
                    const editContent = `✏️ **Mensagem Editada:**\n\n**Antes:** ${oldMessage.content}\n**Agora:** ${newMessage.content}`;

                    // Cria um embed para a mensagem editada
                    const embed = new EmbedBuilder()
                        .setColor('#FFFF00') // Amarelo para indicar edição
                        .setDescription(editContent)
                        .setFooter({ 
                            text: `Mensagem editada por ${newMessage.author.tag}`, // Rodapé com o nome da pessoa que editou
                            iconURL: newMessage.author.displayAvatarURL() // Ícone do autor da edição
                        })
                        .setTimestamp();

                    await targetChannel.send({ embeds: [embed] });
                }
            }
        }
    }
});

//parte 6 final

/// Ready Event - Quando o bot fica online
client.once('ready', () => {
    console.log(`Bot está ativo como ${client.user.tag}`);

    // Mensagem de inicialização embutida
    const embed = new EmbedBuilder()
        .setTitle("📺 Bot Sintonizado!")
        .setDescription("🌠 Danny-Chat está **no ar** e pronto para usar!")
        .setColor(0x00FF00)
        .setThumbnail("https://avatars.githubusercontent.com/u/132908376?v=4")
        .setTimestamp()
        .setFooter({ text: `${client.guilds.cache.first()?.name} - Conectando Comunidades` });

    // Envia a mensagem em todos os canais globais conectados
    globalConnections.forEach(async (channelId) => {
        const channel = await client.channels.fetch(channelId).catch(console.error);
        if (channel && channel.isTextBased()) {
            const guild = channel.guild; // Obtém o guild (servidor) do canal
            channel.send({ embeds: [embed] })
                .then(() => {
                    console.log(`Mensagem enviada no servidor: ${guild.name}`); // Log do nome do servidor
                })
                .catch(err => {
                    console.error(`Erro ao enviar mensagem no servidor ${guild.name}:`, err);
                });
        }
    });
});


/// Shutdown Event - Quando o bot é desligado

client.login(TOKEN)
.then(() => {
console.log('Bot logado com sucesso!');
})
.catch(error => {
console.error('Erro ao logar o bot: ', error);
});
