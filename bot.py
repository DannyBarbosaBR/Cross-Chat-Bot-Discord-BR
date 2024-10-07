import discord
from discord.ext import commands
import json
import datetime as dt

TOKEN = 'MTI5MjY0Mzc1MjIzNzczMTk1MA.G6ByvG.b4oG4yDn5rZfna0n8KhsYNrbUakZuMOpGE_i5o'
client = commands.Bot(command_prefix='/')
client.remove_command('help')

@client.event
async def on_ready():
    # Lê cada arquivo JSON para comandos
    data = read_json("blacklist")
    data_mod = read_json("moderators")
    data_channel = read_json("channels")
    client.blacklisted_users = data["blacklistedUsers"]
    client.moderators = data_mod["modUsers"]
    client.channel_list = data_channel["channelList"]
    print("Bot está pronto")

@client.event
async def on_message(message):
    # Ignora mensagens que são comandos
    await client.process_commands(message)
    if message.content.startswith("/"):
        return
    if message.author.id == client.user.id:
        return

    # Verifica se a mensagem foi enviada em um dos canais listados
    find_channel_id = f'{message.channel.id}'
    with open('channels.json', 'r') as read_obj:
        for line in read_obj:
            if find_channel_id in line:
                # Altera a cor da mensagem se o autor for um moderador
                if message.author.id in client.moderators:
                    chat_color = discord.Color.dark_blue()
                    chat_name = f"[mod] {message.author.name}"
                else:
                    chat_color = discord.Color.blue()
                    chat_name = message.author.name

                # Verifica se o usuário está na blacklist
                if message.author.id in client.blacklisted_users:
                    await message.channel.send("Você está na blacklist")
                else:
                    # Criação do embed com a mensagem do usuário
                    time = dt.datetime.utcnow()
                    embed = discord.Embed(
                        title="",
                        description=message.content,
                        colour=chat_color,
                        timestamp=time
                    )
                    server_name = f"{message.guild}"
                    embed.set_author(name=chat_name, icon_url=message.author.avatar_url)
                    embed.set_footer(text=server_name, icon_url=message.guild.icon_url)
                    embed.timestamp = message.created_at
                    
                    # Envia links de compartilhamento para imagens e vídeos
                    if message.attachments:
                        for attachment in message.attachments:
                            embed.add_field(name="Arquivo Enviado", value=attachment.url)
                    else:
                        await message.delete()  # Deleta a mensagem se não houver anexo

                    # Envia o embed criado para todos os canais listados
                    data = read_json("channels")
                    for item in data['channelList']:
                        channel = client.get_channel(item)
                        await channel.send(embed=embed)

                    if message.attachments:
                        await message.delete()  # Deleta a mensagem se houver anexo

@client.slash_command(name='setchannel', description='Configura o canal para cross-chat.')
async def setchannel(ctx):
    # Adiciona o ID do canal em channels.json
    await ctx.respond("Configurando canal..")
    channel_id = ctx.channel.id
    client.channel_list.append(channel_id)
    data = read_json("channels")
    data["channelList"].append(channel_id)
    write_json(data, "channels")
    await ctx.respond("Canal configurado! Escreva neste canal para cross-chat.")

@client.slash_command(name='mod', description='Adiciona um usuário como moderador.')
async def mod(ctx, user: discord.Member):
    # Adiciona o ID do usuário como moderador
    client.moderators.append(user.id)
    data = read_json("moderators")
    data["modUsers"].append(user.id)
    write_json(data, "moderators")
    embed = discord.Embed(
        title="Novo Moderador",
        description=f"{user.name} é agora um moderador",
        color=discord.Color.blurple()
    )
    embed.set_thumbnail(url=user.avatar_url)
    await ctx.respond(embed=embed)

@client.slash_command(name='unmod', description='Remove um usuário como moderador.')
async def unmod(ctx, user: discord.Member):
    # Remove o ID do usuário da lista de moderadores
    client.moderators.remove(user.id)
    data = read_json("moderators")
    data["modUsers"].remove(user.id)
    write_json(data, "moderators")
    embed = discord.Embed(
        title="Moderador Removido",
        description=f"{user.name} foi removido como moderador",
        color=discord.Color.red()
    )
    embed.set_thumbnail(url=user.avatar_url)
    await ctx.respond(embed=embed)

@client.slash_command(name='blacklist', description='Coloca um membro na blacklist.')
async def blacklist(ctx, user: discord.Member):
    # Verifica se o autor do comando é um moderador
    if ctx.author.id in client.moderators:
        # Adiciona o ID do usuário à blacklist
        client.blacklisted_users.append(user.id)
        data = read_json("blacklist")
        data["blacklistedUsers"].append(user.id)
        write_json(data, "blacklist")
        embed = discord.Embed(
            title="Membro Blacklistado",
            description=f"{user.name} foi blacklistado",
            color=discord.Color.red()
        )
        embed.set_thumbnail(url=user.avatar_url)
        await ctx.respond(embed=embed)
    else:
        await ctx.respond("Você não tem permissão para fazer isso.")

@client.slash_command(name='unblacklist', description='Remove um membro da blacklist.')
async def unblacklist(ctx, user: discord.Member):
    # Verifica se o autor do comando é um moderador
    if ctx.author.id in client.moderators:
        # Remove o ID do usuário da blacklist
        client.blacklisted_users.remove(user.id)
        data = read_json("blacklist")
        data["blacklistedUsers"].remove(user.id)
        write_json(data, "blacklist")
        embed = discord.Embed(
            title="Membro Desblacklistado",
            description=f"{user.name} foi desblacklistado",
            color=discord.Color.green()
        )
        embed.set_thumbnail(url=user.avatar_url)
        await ctx.respond(embed=embed)
    else:
        await ctx.respond("Você não tem permissão para fazer isso.")

# Funções para ler e escrever dados nos arquivos JSON
def read_json(filename):
    try:
        with open(f"{filename}.json", "r") as file:
            data = json.load(file)
        return data
    except FileNotFoundError:
        print(f"Arquivo {filename}.json não encontrado.")
        return {}
    except json.JSONDecodeError:
        print(f"Erro ao decodificar o JSON do arquivo {filename}.json.")
        return {}

def write_json(data, filename):
    with open(f"{filename}.json", "w") as file:
        json.dump(data, file, indent=4)

client.run(TOKEN)

    
