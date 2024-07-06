const { createTruthOrDareBot } = require('./lib/bot');

const bot = createTruthOrDareBot();

bot.launch().then(() => {
    console.log('Bot is running');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
