# Bot de Cross-chat para Discord

![17283355199297686124544190477911](https://github.com/user-attachments/assets/20dfea0d-08ec-45b1-9528-7dd669a49aed)

Este é apenas um exemplo de um bot de cross-chat para quem quer saber como funciona / hospedar um por conta própria.

Este bot também é um dos meus primeiros projetos em Python, então, se algo puder ser melhorado, fique à vontade para me avisar.

Os créditos vão para as muitas perguntas no Stack Overflow que me ajudaram a descobrir o que é necessário para fazê-lo funcionar!

## Comandos
Os comandos incluídos são os seguintes:
- `.setchannel` = define o canal de cross-chat para o que o comando é enviado
- `.mod (usuário)` e `.unmod (usuário)` = modera e desmodera um usuário (moderadores têm acesso aos comandos de blacklist, apenas o proprietário do bot pode enviar `.mod` e `.unmod`)
- `.blacklist (usuário)` e `.unblacklist (usuário)` = coloca um usuário na blacklist e o remove da blacklist (bana o usuário do cross-chat)

Esses comandos (e outras funcionalidades) estão explicados no arquivo [bot.py](https://github.com/go-off-i-guess/cross-chat/blob/master/bot.py).

## Executando o bot
(Os três arquivos `.json` neste repositório são necessários para que o bot funcione.)

No arquivo [bot.py](https://github.com/go-off-i-guess/cross-chat/blob/master/bot.py), substitua [`'YOUR BOTS TOKEN HERE'`](https://github.com/go-off-i-guess/cross-chat/blob/master/bot.py#L6) pelo token do bot que você obteve ao criar seu bot [aqui](https://discord.com/developers/applications).

Você pode então executar o arquivo `bot.py` enviando `python bot.py` em uma janela de prompt de comando / terminal (você também deve instalar o Python (e quaisquer módulos ausentes indicados no início do arquivo `bot.py`) se ainda não o fez; eu usei Python 3.8).
