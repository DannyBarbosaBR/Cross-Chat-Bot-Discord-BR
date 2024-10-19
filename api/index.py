from flask import Flask, request
import requests
import json

# Inicializa a aplicação Flask
app = Flask(__name__)

# URLs dos webhooks dos servidores (substitua com seus webhooks reais)
WEBHOOK_URLS = {
    'server_a': 'https://discord.com/api/webhooks/1292800072379011072/MILo8fEE3rB7fKErdIM5CbYObHtGCYQ8fOGhrQfLboeoUcB_pMmLQWqQlvSUQgHHOwSn',  # Webhook do Servidor A
    'server_b': 'https://discord.com/api/webhooks/1296998218772647968/LnqyXkeEsGsAmkBFy4ZibLvxfftwZ0cizyzZfw1erI9PcJOxurIy1nOPOrYJ02shkIDX',  # Webhook do Servidor B
    'server_c': 'https://discord.com/api/webhooks/...',  # Substitua com seu webhook do Servidor C
    'server_d': 'https://discord.com/api/webhooks/...'   # Substitua com seu webhook do Servidor D
}

# Recebe mensagens de um servidor e as envia para os outros
@app.route('/webhook/<server_id>', methods=['POST'])
def webhook(server_id):
    data = request.json  # Recebe os dados da requisição
    message = data['content']  # Extrai o conteúdo da mensagem
    print(f"Mensagem recebida do {server_id}: {message}")  # Exibe a mensagem no console

    # Envia a mensagem para todos os outros servidores, exceto o que enviou a mensagem
    for key, url in WEBHOOK_URLS.items():
        if key != server_id:  # Não envie a mensagem de volta para o servidor que enviou
            requests.post(url, json={"content": message})  # Envia a mensagem para o servidor correspondente

    return '', 204  # Retorna uma resposta vazia

# Executa a aplicação Flask
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000)  # Inicia o servidor na porta 3000
