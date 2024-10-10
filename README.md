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

### Vídeos Que me ajudarem!
- [Como configurar um bot no Discord](https://youtu.be/f9Mr6_k8KRI?si=7pftL5mxuWA8qYrD): Este vídeo oferece um passo a passo sobre como configurar um bot no Discord, desde a criação até a execução.
- [Tutorial de instalação e execução de bots no Discord](https://youtu.be/4-aVu1_w18Y?si=uaQSjhGAJS1KrAWM): Aqui você encontrará informações detalhadas sobre como instalar e executar bots no Discord, ideal para iniciantes.
   

Se precisar de ajuda com as configurações, sinta-se à vontade para me contatar no Discord: **@dannybarbosabr**.
