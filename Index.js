const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const chalk = require("chalk");
const figlet = require("figlet");

const PREFIX = "..";

const commands = {
  menu: "Show available commands",
  alive: "Check if the bot is alive",
  ai: "Ask the AI anything (soon)",
  help: "Need help? I'm here!",
};

const fancyMenu = () =>
  Object.entries(commands)
    .map(([cmd, desc]) => `• ${PREFIX}${cmd} – ${desc}`)
    .join("\n");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (!text.startsWith(PREFIX)) return;

    const command = text.slice(PREFIX.length).split(" ")[0].toLowerCase();
    const args = text.split(" ").slice(1);

    switch (command) {
      case "menu":
        await sock.sendMessage(from, {
          text: `*Hipster Savvy x md*\n\n${fancyMenu()}`,
        });
        break;

      case "alive":
        await sock.sendMessage(from, {
          text: "✅ *Bot is alive!* Powered by Node.js and Cyber Code.",
        });
        break;

      case "ai":
        await sock.sendMessage(from, {
          text: "⚠️ AI feature coming soon (ChatGPT integration in progress)...",
        });
        break;

      case "help":
        await sock.sendMessage(from, {
          text: "Need help? Contact: @254756389460 (Owner)",
        });
        break;

      default:
        await sock.sendMessage(from, {
          text: `❌ Unknown command: *${command}*.\nTry ${PREFIX}menu.`,
        });
    }
  });

  sock.ev.on("group-participants.update", async ({ id, participants, action }) => {
    for (let user of participants) {
      let msg = action === "add"
        ? `👋 Welcome @${user.split("@")[0]} to the group!\nDid you come with a cup of tea?`
        : `👋 @${user.split("@")[0]} left the group. Don’t spill your tea!`;

      await sock.sendMessage(id, {
        text: msg,
        mentions: [user],
      });
    }
  });

  console.log(chalk.cyan(figlet.textSync("Hipster Savvy")));
  console.log(chalk.green(">> Bot started successfully <<"));
}

startBot();
