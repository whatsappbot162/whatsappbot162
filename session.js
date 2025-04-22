const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const readline = require('readline');
const fs = require('fs');

async function startPairing() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter your phone number (e.g. 254712345678): ', async (phoneNumber) => {
        rl.close();

        const { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState('./session');

        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            browser: ['HipsterSavvy X MD', 'Safari', '3.0'],
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, pairingCode } = update;

            if (pairingCode) {
                console.log('\n==== YOUR PAIRING CODE ====');
                console.log(`\n> ${pairingCode}`);
                console.log('\nEnter this code on WhatsApp: Linked Devices > Link a Device > Use Pairing Code\n');
            }

            if (connection === 'open') {
                console.log('\n✅ Successfully connected!');
                await saveCreds();
                process.exit(0);
            }

            if (connection === 'close') {
                console.log('\n❌ Connection closed. Try again.');
                process.exit(1);
            }
        });

        sock.ev.on('creds.update', saveCreds);

        await sock.requestPairingCode(phoneNumber.trim());
    });
}

startPairing();
