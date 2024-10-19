from flask import Flask, request
import requests
import json

app = Flask(__name__)

WEBHOOK_URLS = {
    'server_a': 'https://discord.com/api/webhooks/1292800072379011072/MILo8fEE3rB7fKErdIM5CbYObHtGCYQ8fOGhrQfLboeoUcB_pMmLQWqQlvSUQgHHOwSn',
    'server_b': 'https://discord.com/api/webhooks/1296998218772647968/LnqyXkeEsGsAmkBFy4ZibLvxfftwZ0cizyzZfw1erI9PcJOxurIy1nOPOrYJ02shkIDX',
    'server_c': '',
    'server_d': ''
}

@app.route('/webhook/<server_id>', methods=['POST'])
def webhook(server_id):
    data = request.json
    message = data['content']
    print(f"Mensagem recebida do {server_id}: {message}")

    for key, url in WEBHOOK_URLS.items():
        if key != server_id:
            requests.post(url, json={"content": message})

    return '', 204

if __name__ == "__main__":
    app.run()
