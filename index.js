const substitutionTable = [
    [6,12,7,1,5,15,13,8,4,10,9,14,0,3,11,2],
    [14,11,4,12,6,13,15,10,2,3,8,1,0,7,5,9],
    [13,11,4,1,3,15,5,9,0,10,14,7,6,8,2,12],
    [7,13,10,1,0,8,9,15,14,4,6,12,11,2,5,3],
    [1,15,13,0,5,7,10,4,9,2,3,14,6,11,8,12],
    [4,10,9,2,13,8,0,14,6,11,1,12,7,15,5,3],
    [4,11,10,0,7,2,1,13,3,6,8,5,9,12,15,14],
    [5,8,1,13,10,3,4,2,14,15,12,7,6,0,9,11]
];

let keysTable = [];

const text = document.querySelector(".text");

const hashBtn = document.querySelector(".hash-button");
const clearBtn = document.querySelector(".clear-button");
const resultText = document.querySelector(".result-text");

hashBtn.addEventListener("click", getHashText);
clearBtn.addEventListener("click", clear);

function getHashText() {
    resultText.innerHTML = "";

    let blocksText = textToBlocks(text.value);
    let currentHash = BigInt(0);

    for (let i = 0; i < blocksText.length; i++) {
        const block = blocksText[i];

        keysTable = getNewKeysTable(currentHash.toString(16).padStart(16, '0'));

        const encryptedBlock = stepsEncrypt(block);

        currentHash = (encryptedBlock + block) & ((1n << 64n) - 1n);
    }

    const hashText = currentHash.toString(16).padStart(16, '0');

    resultText.innerHTML = hashText;
    clearBtn.style.display = "block";
    resultText.style.opacity = "1";
}


function getNewKeysTable(key) {
    keysTable = [];
    let bytes = new TextEncoder().encode(key);
    let hexValues = Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0'));
    let hexKeys = hexValues.join('').match(/.{1,16}/g);

    for (let hexKey of hexKeys) {
        const bigIntKey = BigInt("0x" + hexKey);
        keysTable.push(bigIntKey);
    }

    return keysTable;
}


function textToBlocks(text) {
    const blocks = [];
    const bytes = new TextEncoder().encode(text);

    for (let i = 0; i < bytes.length; i += 8) {
        let block = BigInt(0);
        for (let j = 0; j < 8; j++) {
            if (i + j < bytes.length) {
                block |= BigInt(bytes[i + j]) << (8n * BigInt(j));
            }
        }
        blocks.push(block);
    }

    return blocks;
}

function stepsEncrypt (block) {
    let L = Number(block >> 32n) >>> 0;
    let R = Number(block & 0xFFFFFFFFn) >>> 0;

    for (let i = 0; i < 32; i++) {
        let indexKey = (i < 24) ? Number(keysTable[i % 8]) : Number(keysTable[7 - (i % 8)]);
        [L, R] = encryptRound(L, R, indexKey);
    }

    return (BigInt(L) << 32n) | BigInt(R);
}

function encryptRound(inputL, inputR, indexKey) {
    const outputL = inputR;
    const outputR = (inputL ^ transformationsInRound(inputR, indexKey)) >>> 0;

    return [outputL, outputR];
}

function transformationsInRound(right, keyIndex) {
    right = (right + keyIndex) >>> 0;
    right = substitutionOnTableValues(right);

    return ((right << 11) | (right >>> 21)) >>> 0;
}

function substitutionOnTableValues(right) {
    let result = 0;
    for (let i = 0; i < 8; i++) {
        result |= (substitutionTable[i][(right >> (4 * i)) & 0xf] << (4 * i));
    }

    return result >>> 0;
}

function clear() {
    resultText.innerHTML = "";
    resultText.style.opacity = "0";
    clearBtn.style.display = "none";
}