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

    let multiplayerParticipants = [];
    let currentPlayerIndex = 0;
    let joinMessageId = null;

    bot.start(async (ctx) => {
        await ctx.reply(`Hello! I'm your Truth or Dare bot. Choose game mode:`, Markup.keyboard([
            ['Single Player', 'Multiplayer']
        ]).resize());
    });

    bot.hears('Single Player', async (ctx) => {
        multiplayerParticipants = []; // Clear multiplayer participants
        await startSinglePlayer(ctx);
    });

    async function startSinglePlayer(ctx) {
        await ctx.reply(`You have selected Single Player mode. Choose your challenge:`, Markup.inlineKeyboard([
            Markup.button.callback('Truth', 'single_truth'),
            Markup.button.callback('Dare', 'single_dare'),
            Markup.button.callback('Change Mode', 'change_mode')
        ]));
    }

    bot.hears('Multiplayer', async (ctx) => {
        multiplayerParticipants = [];
        await startMultiplayer(ctx);
    });

    async function startMultiplayer(ctx) {
        const message = await ctx.reply(`You have selected Multiplayer mode. Players, please join the game by pressing 'Join Game'.`, Markup.inlineKeyboard([
            Markup.button.callback('Join Game', 'join'),
            Markup.button.callback('Start Game', 'startgame'),
            Markup.button.callback('Change Mode', 'change_mode')
        ]));
        joinMessageId = message.message_id;
    }

    bot.action('join', async (ctx) => {
        const userId = ctx.from.id;
        const username = ctx.from.username || ctx.from.first_name;
        if (multiplayerParticipants.find(p => p.id === userId)) {
            await ctx.reply('You have already joined the game.');
        } else {
            multiplayerParticipants.push({ id: userId, username });
            if (joinMessageId) {
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, joinMessageId);
                } catch (error) {
                    console.error('Error deleting message:', error.message);
                }
            }
            const message = await ctx.reply(`Current players: ${multiplayerParticipants.map(p => p.username).join(', ')}. More players can join by pressing 'Join Game'.`, Markup.inlineKeyboard([
                Markup.button.callback('Join Game', 'join'),
                Markup.button.callback('Start Game', 'startgame'),
                Markup.button.callback('Change Mode', 'change_mode')
            ]));
            joinMessageId = message.message_id;
        }
        await ctx.answerCbQuery(); // Answer the callback query (optional)
    });

    bot.action('startgame', async (ctx) => {
        if (multiplayerParticipants.length < 2) {
            await ctx.reply('You need at least 2 players to start the game.');
        } else {
            currentPlayerIndex = 0;
            await ctx.reply('Starting the game with all players.');
            await nextTurn(ctx);
        }
        await ctx.answerCbQuery(); // Answer the callback query (optional)
    });

    async function askTruthOrDare(ctx) {
        const currentPlayer = multiplayerParticipants[currentPlayerIndex];
        const truthOrDare = Math.random() < 0.5 ? 'Truth' : 'Dare';

        if (truthOrDare === 'Truth') {
            const truth = getRandomItem(questions);
            await ctx.reply(`Truth for ${currentPlayer.username}: ${truth}`, Markup.inlineKeyboard([
                Markup.button.callback('Next Player', 'next_player'),
                Markup.button.callback('Change Mode', 'change_mode')
            ]));
        } else {
            const dare = getRandomItem(dares);
            await ctx.reply(`Dare for ${currentPlayer.username}: ${dare}`, Markup.inlineKeyboard([
                Markup.button.callback('Next Player', 'next_player'),
                Markup.button.callback('Change Mode', 'change_mode')
            ]));
        }
    }

    async function nextTurn(ctx) {
        await askTruthOrDare(ctx);
    }

    bot.action('next_player', async (ctx) => {
        if (ctx.from.id !== multiplayerParticipants[currentPlayerIndex].id) {
            const participantsTags = multiplayerParticipants.map(p => `@${p.username}`).join(' ');
            await ctx.reply(`It's not your turn yet! ${participantsTags}`);
        } else {
            currentPlayerIndex = (currentPlayerIndex + 1) % multiplayerParticipants.length;
            await ctx.editMessageReplyMarkup(); // Remove inline keyboard
            await nextTurn(ctx);
        }
        await ctx.answerCbQuery(); // Answer the callback query (optional)
    });

    bot.action('change_mode', async (ctx) => {
        multiplayerParticipants = []; // Clear multiplayer participants
        if (joinMessageId) {
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, joinMessageId);
            } catch (error) {
                console.error('Error deleting message:', error.message);
            }
        }
        await ctx.editMessageText('You have chosen to change mode. Select another mode:', Markup.inlineKeyboard([
            Markup.button.callback('Single Player', 'single_player'),
            Markup.button.callback('Multiplayer', 'multiplayer')
        ]));
        await ctx.answerCbQuery(); // Answer the callback query (optional)
    });

    bot.action('single_truth', async (ctx) => {
        const truth = getRandomItem(questions);
        await ctx.editMessageReplyMarkup(); // Remove inline keyboard
        await ctx.reply(`Truth: ${truth}`, Markup.inlineKeyboard([
            Markup.button.callback('Another Truth', 'single_truth'),
            Markup.button.callback('Another Dare', 'single_dare'),
            Markup.button.callback('Change Mode', 'change_mode')
        ]));
        await ctx.answerCbQuery(); // Answer the callback query (optional)
    });

    bot.action('single_dare', async (ctx) => {
        const dare = getRandomItem(dares);
        await ctx.editMessageReplyMarkup(); // Remove inline keyboard
        await ctx.reply(`Dare: ${dare}`, Markup.inlineKeyboard([
            Markup.button.callback('Another Truth', 'single_truth'),
            Markup.button.callback('Another Dare', 'single_dare'),
            Markup.button.callback('Change Mode', 'change_mode')
        ]));
        await ctx.answerCbQuery(); // Answer the callback query (optional)
    });

    bot.action('single_player', async (ctx) => {
        multiplayerParticipants = []; // Clear multiplayer participants
        await ctx.editMessageReplyMarkup(); // Remove inline keyboard
        await startSinglePlayer(ctx);
        await ctx.answerCbQuery(); // Answer the callback query (optional)
    });

    bot.action('multiplayer', async (ctx) => {
        multiplayerParticipants = []; // Clear multiplayer participants
        await ctx.editMessageReplyMarkup(); // Remove inline keyboard
        await startMultiplayer(ctx);
        await ctx.answerCbQuery(); // Answer the callback query (optional)
    });

    return bot;
}

module.exports = { createTruthOrDareBot };

