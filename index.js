const start = new Date().getTime();

const messages = require('fs').readFileSync("./data/messages.txt").toString().trim().split("\n");
let wordList = {};

for (let message of messages) {
    let words = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll("œ", "oe").trim().replace(/[^a-zA-Z0-9'* ]/gm, " ").replace(/ +/gm, " ").replace(/\*/gm, "").toLowerCase().trim().split(" ");

    for (let index in words) {
        index = parseInt(index);

        if (index === 0 && words[index + 1]) {
            if (!wordList[words[index]]) wordList[words[index]] = {
                _: {},
                _pos: {}
            }

            if (!wordList[words[index]]["_"][words[index + 1]]) wordList[words[index]]["_"][words[index + 1]] = 0;
            wordList[words[index]]["_"][words[index + 1]]++;

            if (!wordList[words[index]]["_pos"][index]) wordList[words[index]]["_pos"][index] = 0;
            wordList[words[index]]["_pos"][index]++;
        } else if (index > 1 && words[index - 1] && words[index + 1]) {
            if (!wordList[words[index]]) wordList[words[index]] = {
                _: {},
                _pos: {}
            }

            if (!wordList[words[index]]["_"][words[index + 1]]) wordList[words[index]]["_"][words[index + 1]] = 0;
            wordList[words[index]]["_"][words[index + 1]]++;

            if (!wordList[words[index]]["_pos"][index]) wordList[words[index]]["_pos"][index] = 0;
            wordList[words[index]]["_pos"][index]++;

            if (!wordList[words[index]][words[index - 1]]) wordList[words[index]][words[index - 1]] = {};
            if (!wordList[words[index]][words[index - 1]][words[index + 1]]) wordList[words[index]][words[index - 1]][words[index + 1]] = 0;
            wordList[words[index]][words[index - 1]][words[index + 1]]++;
        }
    }
}

let parameters = Object.keys(wordList).length;

for (let _ in Object.values(wordList)) {
    parameters += Object.keys(wordList[_] ?? {}).length;

    for (let __ in Object.values(wordList[_] ?? {})) {
        parameters += Object.keys(wordList[_][__] ?? {}).length;
    }
}

let txt = JSON.stringify(wordList, null, 2);
require('fs').writeFileSync("data/model.json", txt);
console.log("Successfully initialised model after " + (new Date().getTime() - start) + "ms from " + messages.length + " messages, " + parameters + " parameters, " + txt.length + " bytes");

function complete(text) {
    let words = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll("œ", "oe").trim().replace(/[^a-zA-Z0-9'* ]/gm, " ").replace(/ +/gm, " ").replace(/\*/gm, "").toLowerCase().trim().split(" ");

    let lastWord1 = words[words.length - 1] ?? null;
    let lastWord1pos = words.length - 1;
    let lastWord2 = words[words.length - 2] ?? null;
    let lastWord2pos = words.length - 2;

    if (Object.keys(wordList).includes(lastWord1) && Object.keys(wordList).includes(lastWord2) && text.replace(/[^a-zA-Z0-9'* ]/gm, " ").replace(/ +/gm, " ").replace(/\*/gm, "").toLowerCase().endsWith(" ") && text.endsWith(" ")) {
        let options;

        if (wordList[lastWord1][lastWord2]) {
            options = Object.keys(wordList[lastWord1][lastWord2]).sort((a, b) => {
                return wordList[lastWord1][lastWord2][a] - wordList[lastWord1][lastWord2][b];
            }).reverse();
        } else {
            options = Object.keys(wordList[lastWord1]["_"]).sort((a, b) => {
                return wordList[lastWord1]["_"][a] - wordList[lastWord1]["_"][b];
            }).reverse();
        }

        if (options.length > 0) {
            return options[0];
        }
    } else if (Object.keys(wordList).includes(lastWord1) && text.replace(/[^a-zA-Z0-9'* ]/gm, " ").replace(/ +/gm, " ").replace(/\*/gm, "").toLowerCase().endsWith(" ") && text.endsWith(" ")) {
        let options = Object.keys(wordList[lastWord1]["_"]).sort((a, b) => {
            return wordList[lastWord1]["_"][a] - wordList[lastWord1]["_"][b];
        }).reverse();

        if (options.length > 0) {
            return options[0];
        }
    } else if (lastWord1 && (!lastWord2 || !wordList[lastWord2]) && !(text.replace(/[^a-zA-Z0-9'* ]/gm, " ").replace(/ +/gm, " ").replace(/\*/gm, "").toLowerCase().endsWith(" ") || text.endsWith(" "))) {
        let options = Object.keys(wordList).sort((a, b) => {
            let commonPosA = parseInt(Object.keys(wordList[a]['_pos']).sort((c, d) => {
                return wordList[a]['_pos'][c] - wordList[a]['_pos'][d]
            }).reverse()[0]);

            let commonPosB = parseInt(Object.keys(wordList[b]['_pos']).sort((c, d) => {
                return wordList[b]['_pos'][c] - wordList[b]['_pos'][d]
            }).reverse()[0]);

            let diffA = Math.abs(lastWord1pos - commonPosA);
            let diffB = Math.abs(lastWord1pos - commonPosB);

            if (diffA > diffB)   return 1;
            if (diffA === diffB) return 0;
            return -1;
        }).filter(i => i.startsWith(lastWord1) && i !== lastWord1);

        if (options.length > 0) {
            let option = options[0];
            return option.substring(lastWord1.length);
        }
    } else if (lastWord1 && (lastWord2 && wordList[lastWord2]) && !(text.replace(/[^a-zA-Z0-9'* ]/gm, " ").replace(/ +/gm, " ").replace(/\*/gm, "").toLowerCase().endsWith(" ") || text.endsWith(" "))) {
        let options = Object.keys(wordList).sort((a, b) => {
            let commonPosA = parseInt(Object.keys(wordList[a]['_pos']).sort((c, d) => {
                return wordList[a]['_pos'][c] - wordList[a]['_pos'][d]
            }).reverse()[0]);

            let commonPosB = parseInt(Object.keys(wordList[b]['_pos']).sort((c, d) => {
                return wordList[b]['_pos'][c] - wordList[b]['_pos'][d]
            }).reverse()[0]);

            let diffA = Math.abs(lastWord1pos - commonPosA);
            let diffB = Math.abs(lastWord1pos - commonPosB);

            if (diffA > diffB)   return 1;
            if (diffA === diffB) return 0;
            return -1;
        }).filter(i => i.startsWith(lastWord1) && Object.keys(wordList[lastWord2]["_"]).includes(i) && i !== lastWord1);

        if (options.length > 0) {
            let option = options[0];
            return option.substring(lastWord1.length);
        }

        options = Object.keys(wordList).sort((a, b) => {
            if (Object.keys(wordList[lastWord2]["_"]).includes(a)) return 1;
            if (Object.keys(wordList[lastWord2]["_"]).includes(b)) return -1;
            return 0;
        }).filter(i => i.startsWith(lastWord1) && i !== lastWord1);

        if (options.length > 0) {
            let option = options[0];
            return option.substring(lastWord1.length);
        }
    }

    return "";
}

function showcase(text) {
    let str = "";

    for (let char of text.split("")) {
        str += char;
        console.log(str + require('chalk').dim.underline(complete(str)));
    }
}

require('./keyboard');

global.buf = "";
global.ps1 = "";
global.cursor = 0;

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');

global.lastCompletion = "";

global.refreshLine = () => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(buf);
    process.stdout.cursorTo(cursor);

    setTimeout(() => {
        let maxWords = 10;
        let currentCompletion = " " + buf;
        let currentPrediction = "";

        lastCompletion = complete(" " + buf);

        for (let i = 0; i < maxWords; i++) {
            let prediction = complete(currentCompletion);

            if (prediction.length > 0) {
                currentCompletion = " " + buf + prediction + " ";
                currentPrediction = currentPrediction + prediction + " ";
            }

            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(buf + require('chalk').dim.underline(currentPrediction.trim()));
            process.stdout.cursorTo(cursor);
        }
    });
}

function prompt() {
    global.inputHandler = async (char, key) => {
        if (key.sequence === "\x03") {
            process.stdout.write("\n");
            global.buf = "";
            global.cursor = ps1.length;
            refreshLine();
        } else if (key.sequence === "\x04") {
            process.stdout.write("\n");
            process.exit();
        } else if (key.sequence === "\n" || key.sequence === "\r") {
            refreshLine(true);
            process.stdout.write("\n");

            process.stdin.removeListener('keypress', inputHandler);
            process.stdin.setRawMode(false);
            process.stdin.pause();

            buf = "";

            prompt();
        } else if (key.sequence === "\x1B[A" || key.sequence === "\x1B\x1B[A" || key.sequence === "\x1B[1;9A" || key.sequence === "\x1B[1;2A") {
            upKey();
        } else if (key.sequence === "\x1B[B" || key.sequence === "\x1B\x1B[B" || key.sequence === "\x1B[1;9B" || key.sequence === "\x1B[1;2B") {
            downKey();
        } else if (key.sequence === "\x1B[D" || key.sequence === "\x1B[1;2D") {
            leftKey();
        } else if (key.sequence === "\x1B[1;9D" || key.sequence === "\x1Bb") {
            leftWord();
        } else if (key.sequence === "\x1B[1;9C" || key.sequence === "\x1Bf") {
            rightWord();
        } else if (key.sequence === "\x1B[C" || key.sequence === "\x1B[1;2C") {
            rightKey();
        } else if (key.sequence === "\x7F") {
            backspace();
        } else if (key.sequence === "\x1B\x7F") {
            wordBackspace();
        } else if (key.sequence === "\x1B[3~") {
            del();
        } else if (key.sequence === "\x1B[H") {
            home();
        } else if (key.sequence === "\x1B[F") {
            end();
        } else if (key.sequence === "\t") {
            tab();
        } else if (key.sequence === "\f") {
            console.clear();
            refreshLine();
        } else if (!key.control && !key.meta) {
            historyPosition = 0;
            global.buf = buf.substring(0, cursor - ps1.length) + key.sequence + buf.substring(cursor - ps1.length);
            cursor++;
            refreshLine();
        }
    }

    process.stdin.addListener('keypress', inputHandler);
    refreshLine();
}

prompt();