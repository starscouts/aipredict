import json

conversations = {}

with open("./data/signal.json", "r") as f:
    data = json.loads(f.read())
    for message in data:
        if message['conversationId'] not in conversations:
            conversations[message['conversationId']] = []
        conversations[message['conversationId']].append(message)

for conversation in conversations.values():
    with open("./data/signal/" + conversation[0]['conversationId'] + ".json", "w") as f:
        f.write(json.dumps(conversation))