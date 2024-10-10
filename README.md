# Bot de Cross-Chat Satela-Chat! para Discord 🇧🇷

![Bot de Cross-chat](https://github.com/user-attachments/assets/20dfea0d-08ec-45b1-9528-7dd669a49aed)

Este é um bot de cross-chat para Discord, ideal para quem deseja entender como funciona e hospedar um por conta própria. 

Este projeto foi desenvolvido em JavaScript usando Node.js e a biblioteca discord.js, e é um dos meus primeiros projetos nesse ambiente com um celular Android apenas.

Os créditos vão para todas as perguntas no Chat GPT e vídeos do YouTube que me ajudaram a descobrir o que era necessário para fazê-lo funcionar de verdade!

## Comandos
Os comandos incluídos são os seguintes:
- `!criador` = Mostra quem é o criador do bot.
- `!servidores` = Mostra todos os servidores conectados.
- `!global` = Conecta o canal atual a outros canais globais.
- `!conectar #canal` = Conecta o canal atual a um canal mencionado de outro servidor.
- `!desconectar` = Desconecta o canal atual de um canal de outro servidor.

Esses comandos e outras funcionalidades estão detalhados no código do bot.

## Executando o Bot
(Os dados de conexão são salvos em um arquivo `Salvamento.json`, necessário para que o bot funcione.)

No arquivo `Danny-BOT.js`, substitua o token do bot pela sua chave de autenticação [Token, Client Id Secreto] que você obteve ao criar seu bot [aqui](https://discord.com/developers/applications).

Você pode então executar o arquivo `Danny-BOT.js` enviando `node Danny-BOT.js` em uma janela de terminal [Termux]. 

Certifique-se de que o Node.js e as dependências estão instalados, conforme indicado no Guia de Instalação, anexado aqui também..

## Termux
Para executar o bot no Termux (Android e PC), baixe em:
- [Termux para Android](https://play.google.com/store/apps/details?id=com.termux)
- [Termux para PC](https://github.com/termux/termux-app)

### Como Usar no Termux
1. **Baixe e instale o Termux** no seu dispositivo.
2. **Abra o Termux** e execute os seguintes comandos para instalar o Node.js e as dependências:
   ```bash
   pkg update && pkg upgrade
   pkg install nodejs
   pkg install git
   npm install discord.js node-fetch dotenv
3. **Inicie o BOt** e execute os seguinte comando para executar o bot
   
 node Danny-BOT.js

### Vídeos que me ajudarem!
- [Como configurar um bot no Discord](https://youtu.be/f9Mr6_k8KRI?si=7pftL5mxuWA8qYrD): Este vídeo oferece um passo a passo sobre como configurar um bot no Discord, desde a criação até a execução.
- [Tutorial de instalação e execução de bots no Discord](https://youtu.be/4-aVu1_w18Y?si=uaQSjhGAJS1KrAWM): Aqui você encontrará informações detalhadas sobre como instalar e executar bots no Discord, ideal para iniciantes.

## Editores de Código

### Visual Studio Code (PC)
Para editar o código do bot, recomendo usar o **Visual Studio Code**. É um editor de código poderoso e fácil de usar. Para baixar, visite:
- [Download Visual Studio Code](https://code.visualstudio.com/)

Com o Visual Studio Code, você pode abrir o projeto, editar os arquivos e instalar extensões úteis, como o **Prettier** para formatação de código e o **ESLint** para linting.

### Editor para Android
Se você preferir editar o código diretamente no seu dispositivo Android, recomendo o aplicativo **AIDE**. Ele é uma IDE (Ambiente de Desenvolvimento Integrado) que permite editar e compilar código diretamente no seu celular. Baixe o AIDE em:
- [AIDE para Android](https://play.google.com/store/apps/details?id=com.alif.ide)

Embora o AIDE não tenha todos os recursos de um IDE de desktop, ele oferece funcionalidades básicas para edição de código e é prático para fazer alterações rápidas.

Claro! Aqui está a seção explicando como e onde fazer as alterações necessárias no código:

## Configurando o Bot

Antes de executar o bot, você precisa configurar algumas informações essenciais no código. Abra o arquivo `Danny-BOT.js` e localize as seguintes linhas:

```javascript
// Carregue seu token e cliente secreto diretamente aqui:
const TOKEN = 'SEU_TOKEN_AQUI'; // Substitua pelo seu token do bot
const CLIENT_SECRET = 'SEU_CLIENT_SECRET_AQUI'; // Adicione o CLIENT_SECRET aqui
const WEBHOOK_URL = 'SEU_WEBHOOK_URL_AQUI'; // Coloque seu URL do Webhook aqui

O que fazer:

1. Substitua SEU_TOKEN_AQUI pelo token do seu bot que você obteve ao criá-lo na plataforma do Discord.


2. Substitua SEU_CLIENT_SECRET_AQUI pelo seu client secret, caso esteja usando.


3. Substitua SEU_WEBHOOK_URL_AQUI pelo URL do webhook que você deseja usar.



Importante: Certifique-se de fazer essas alterações antes de executar o bot no Termux. Se você não configurar essas informações corretamente, o bot não funcionará.

Após realizar essas modificações, você estará pronto para executar o bot! Se precisar de mais ajuda, sinta-se à vontade para perguntar.

Se precisar de ajuda com as configurações, sinta-se à vontade para me contatar no Discord: **@dannybarbosabr**.
