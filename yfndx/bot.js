const { Telegraf } = require('telegraf');
require('dotenv').config();

// Token Bot dari BotFather
const BOT_TOKEN = process.env.BOT_TOKEN;

// Inisialisasi bot
const bot = new Telegraf(BOT_TOKEN);

// Daftar pertanyaan dan tantangan
const questions = [
    "What is your biggest fear?",
    "Who is your secret crush?",
    "Tell us about your most embarrassing moment."
];

const dares = [
    "Sing a song out loud.",
    "Do 10 push-ups.",
    "Act like your favorite animal for 1 minute."
];

// Fungsi untuk mendapatkan item acak dari array
function getRandomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

// Perintah untuk /start
bot.start((ctx) => {
    ctx.reply(`Hello! I'm your Truth or Dare bot.
You can use the following commands:
- /truth to get a truth question
- /dare to get a dare challenge
Enjoy the game!`);
});

// Command untuk 'truth'
bot.command('truth', (ctx) => {
    const truth = getRandomItem(questions);
    ctx.reply(`Truth: ${truth}`);
});

// Command untuk 'dare'
bot.command('dare', (ctx) => {
    const dare = getRandomItem(dares);
    ctx.reply(`Dare: ${dare}`);
});

// Perintah untuk menangani pesan di grup
bot.on('text', (ctx) => {
    const message = ctx.message.text.toLowerCase();
    if (message.includes('/truth')) {
        const truth = getRandomItem(questions);
        ctx.reply(`Truth: ${truth}`);
    } else if (message.includes('/dare')) {
        const dare = getRandomItem(dares);
        ctx.reply(`Dare: ${dare}`);
    }
});

// Start bot
bot.launch().then(() => {
    console.log('Bot is running');
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
