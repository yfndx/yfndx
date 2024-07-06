const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

function createTruthOrDareBot(token, customQuestions, customDares) {
    const BOT_TOKEN = token || process.env.BOT_TOKEN;

    const defaultQuestions = [
        "What is your biggest fear?",
        "Who is your secret crush?",
        "Tell us about your most embarrassing moment."
    ];

    const defaultDares = [
        "Sing a song out loud.",
        "Do 10 push-ups.",
        "Act like your favorite animal for 1 minute."
    ];

    const questions = customQuestions || defaultQuestions;
    const dares = customDares || defaultDares;

    function getRandomItem(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    const bot = new Telegraf(BOT_TOKEN);

    bot.start((ctx) => {
        ctx.reply(
            `Hello! I'm your Truth or Dare bot.\nYou can use the following commands:\n- /truth to get a truth question\n- /dare to get a dare challenge\nEnjoy the game!`,
            Markup.keyboard([
                ['/truth', '/dare'],
            ]).resize().oneTime().extra()
        );
    });

    bot.command('truth', (ctx) => {
        const truth = getRandomItem(questions);
        ctx.reply(`Truth: ${truth}`);
    });

    bot.command('dare', (ctx) => {
        const dare = getRandomItem(dares);
        ctx.reply(`Dare: ${dare}`);
    });

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

    return bot;
}

module.exports = { createTruthOrDareBot };
