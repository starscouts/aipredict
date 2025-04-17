const fs = require('fs');

let list = fs.readdirSync("./data/discord");
let list2 = fs.readdirSync("./data/signal");
let text = "";

for (let file of list.filter(i => !i.startsWith("."))) {
    let lastMessageAuthor = null;
    let firstMessage = false;

    console.log(file);
    let data = require('./data/discord/' + file);

    for (let message of data.messages.filter(i => i.content.trim() !== "" && i.type === "Default")) {
        if (!lastMessageAuthor && firstMessage) lastMessageAuthor = message.author.id;

        if (lastMessageAuthor === message.author.id || message.author.id !== "493845599469174794") {
            text += (message.author.id !== "493845599469174794" ? "---\nInput: " : "Output: ") + message.content.trim() + "\n";
            if (message.author.id !== "493845599469174794") lastMessageAuthor = null;
            firstMessage = true;
        }
    }
}

for (let file of list2.filter(i => !i.startsWith("."))) {
    let lastMessageAuthor = null;
    let firstMessage = false;

    console.log(file);
    let data = require('./data/signal/' + file);

    for (let message of data) {
        if (!message['body']) continue;
        if (!lastMessageAuthor && firstMessage) lastMessageAuthor = message.source;

        if (lastMessageAuthor === message.source || message.source !== 33783284607) {
            text += (message.source !== 33783284607 ? "---\nInput: " : "Output: ") + message.body.trim() + "\n";
            if (message.source !== 33783284607) lastMessageAuthor = null;
            firstMessage = true;
        }
    }
}

fs.writeFileSync("./data/messages.txt", text.split("\n---\n").filter(i => i.split("\n").filter(i => i.startsWith("Output: ")).length > 0 && !i.includes("https://") && !i.includes("http://")).join("\n---\n"));