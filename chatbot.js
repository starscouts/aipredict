const start = new Date().getTime();
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const Fuse = require('fuse.js');

const messages = require('fs').readFileSync("./data/messages.txt").toString().trim().split("\n---\n");
let list = {};
let listFinal = [];

for (let message of messages) {
    let input = "";
    let output = "";

    let outputting = false;

    for (let part of message.split("\n")) {
        if (part.startsWith("Input: ")) {
            outputting = false;
            input += "\n" + part.substring(7);
        } else if (part.startsWith("Output: ")) {
            outputting = true;
            output += "\n" + part.substring(7);
        } else {
            if (outputting) {
                output += "\n" + part;
            } else {
                input += "\n" + part;
            }
        }
    }

    input = input.trim();
    output = output.trim();

    if (!list[input]) list[input] = [];
    list[input].push(output);
}

for (let item of Object.keys(list)) {
    listFinal.push({
        input: item,
        output: list[item]
    });
}

const fuse = new Fuse(listFinal, {
    keys: ['input']
});

function prompt() {
    const rl = readline.createInterface({ input, output });

    rl.question('User: ', (input) => {
        rl.close();
        process.stdout.write("Bot: ");
        let results = fuse.search(input);
        process.stdout.write(results[0]['item']['output'][Math.floor(Math.random() * results[0]['item']['output'].length)] + "\n");
        prompt();
    });
}

console.log("Loaded model in " + (new Date().getTime() - start) + "ms, " + Object.keys(list).length + " sentences known");
prompt();