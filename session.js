const { useMultiFileAuthState, makeWASocket } = require('@whiskeysockets/baileys');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

async function generateSession() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter your WhatsApp number (e.g., 254712345678): ', async (number) => {
        rl.close();

        const sessionFolder = './auth_info_baileys';
        const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
        });

        sock.ev.on('creds.update', saveCreds);

        console.log('\nScan the QR code above with your WhatsApp to log in.');
        console.log('After successful login, your session will be saved.');
    });
}

generateSession();
