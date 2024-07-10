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

    const bot = new Telegraf(BOT_TOKEN);

    let multiplayerParticipants = [];
    let lobbyParticipants = []; // Participants in the lobby
    let currentPlayerIndex = 0;
    let joinMessageId = null;

    bot.start(async (ctx) => {
        await ctx.reply(`Hello! I'm your Truth or Dare bot. Choose game mode:`, Markup.inlineKeyboard([
            Markup.button.callback('Single Player', 'single_player'),
            Markup.button.callback('Multiplayer', 'multiplayer')
        ]));
    });

    bot.hears('Single Player', async (ctx) => {
        resetGame();
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
        resetGame();
        await startMultiplayer(ctx);
    });

    async function startMultiplayer(ctx) {
        const message = await ctx.reply(`You have selected Multiplayer mode. Players, please join the lobby by pressing 'Join Lobby'.`, Markup.inlineKeyboard([
            Markup.button.callback('Join Lobby', 'join_lobby'),
            Markup.button.callback('Change Mode', 'change_mode')
        ]));
        joinMessageId = message.message_id;
    }

    bot.action('join_lobby', async (ctx) => {
        const userId = ctx.from.id;
        const username = ctx.from.username || ctx.from.first_name;
        const userTag = `@${username}`;

        if (lobbyParticipants.find(p => p.id === userId)) {
            await ctx.reply('You have already joined the lobby.');
        } else {
            lobbyParticipants.push({ id: userId, username });
            await ctx.reply(`${userTag} has joined the lobby.`);
            
            // Update message with current lobby participants
            const message = await ctx.editMessageText(`Current players in lobby: ${getParticipantTags(lobbyParticipants)}. Press 'Join Lobby' to join.`, getLobbyKeyboard());

            // Check if enough players have joined to start the game
            if (lobbyParticipants.length >= 2) {
                await ctx.telegram.editMessageText(ctx.chat.id, joinMessageId, null, `Current players in lobby: ${getParticipantTags(lobbyParticipants)}. Press 'Start Game' to begin.`, getStartGameKeyboard());
            }
        }

        await ctx.answerCbQuery();
    });

    bot.action('start_game', async (ctx) => {
        if (lobbyParticipants.length < 2) {
            await ctx.reply('You need at least 2 players in the lobby to start the game.');
        } else {
            // Move players from lobbyParticipants to multiplayerParticipants
            multiplayerParticipants = [...lobbyParticipants];
            lobbyParticipants = []; // Clear the lobby participants
            currentPlayerIndex = 0;

            await ctx.reply('Starting the game with all players.');

            // Remove inline keyboard after starting the game
            await ctx.editMessageReplyMarkup();

            await nextTurn(ctx);
        }

        await ctx.answerCbQuery();
    });

    bot.action('leave', async (ctx) => {
        const userId = ctx.from.id;
        const username = ctx.from.username || ctx.from.first_name;
        const userTag = `@${username}`;

        multiplayerParticipants = multiplayerParticipants.filter(p => p.id !== userId);
        lobbyParticipants = lobbyParticipants.filter(p => p.id !== userId);

        if (lobbyParticipants.length === 0) {
            await ctx.reply(`${userTag} has left the lobby.`);
            await ctx.editMessageReplyMarkup();
        } else {
            await ctx.reply(`${userTag} has left the lobby.`);
            await ctx.editMessageText(`Current players in lobby: ${getParticipantTags(lobbyParticipants)}. Press 'Join Lobby' to join.`, getLobbyKeyboard());
        }

        // Check if only one player left, end the game
        if (multiplayerParticipants.length === 1) {
            await ctx.reply(`Game ended because ${getParticipantTags(multiplayerParticipants)} is the only player left.`);
            await ctx.reply(`/start@lapinESPDbot bot to play again!`);
            resetGame();
        }

        await ctx.answerCbQuery();
    });

    async function askTruthOrDare(ctx) {
        const currentPlayer = multiplayerParticipants[currentPlayerIndex];
        const truthOrDare = Math.random() < 0.5 ? 'Truth' : 'Dare';

        if (truthOrDare === 'Truth') {
            const truth = getRandomItem(questions);
            await ctx.reply(`Truth for ${getParticipantTag(currentPlayer)}: ${truth}`, getMultiplayerKeyboard());
        } else {
            const dare = getRandomItem(dares);
            await ctx.reply(`Dare for ${getParticipantTag(currentPlayer)}: ${dare}`, getMultiplayerKeyboard());
        }
    }

    async function nextTurn(ctx) {
        if (multiplayerParticipants.length > 1) {
            await askTruthOrDare(ctx);
        } else {
            await ctx.reply('Game ended because only one player left.');
            await ctx.reply(`/start@lapinESPDbot bot to play again!`);
            resetGame();
        }
    }

    bot.action('next_player', async (ctx) => {
        if (ctx.from.id !== multiplayerParticipants[currentPlayerIndex].id) {
            await ctx.reply(`It's not your turn yet! ${getParticipantTags(multiplayerParticipants)}`);
        } else {
            currentPlayerIndex = (currentPlayerIndex + 1) % multiplayerParticipants.length;
            await ctx.editMessageReplyMarkup();
            await nextTurn(ctx);
        }
        await ctx.answerCbQuery();
    });

    bot.action('change_mode', async (ctx) => {
        resetGame();
        if (joinMessageId) {
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, joinMessageId);
            } catch (error) {
                console.error('Error deleting message:', error.message);
            }
        }
        try {
            await ctx.editMessageText('You have chosen to change mode. Select another mode:', getModeKeyboard());
        } catch (error) {
            if (error.description === 'Bad Request: message to edit not found') {
                await ctx.reply('You have chosen to change mode. Select another mode:', getModeKeyboard());
            } else {
                console.error('Unexpected error:', error.message);
            }
        }
        await ctx.answerCbQuery();
    });

    bot.action('single_truth', async (ctx) => {
        const truth = getRandomItem(questions);
        await ctx.editMessageReplyMarkup();
        await ctx.reply(`Truth: ${truth}`, getSinglePlayerKeyboard());
        await ctx.answerCbQuery();
    });

    bot.action('single_dare', async (ctx) => {
        const dare = getRandomItem(dares);
        await ctx.editMessageReplyMarkup();
        await ctx.reply(`Dare: ${dare}`, getSinglePlayerKeyboard());
        await ctx.answerCbQuery();
    });

    bot.action('single_player', async (ctx) => {
        resetGame();
        await ctx.editMessageReplyMarkup();
        await startSinglePlayer(ctx);
        await ctx.answerCbQuery();
    });

    bot.action('multiplayer', async (ctx) => {
        resetGame();
        await ctx.editMessageReplyMarkup();
        await startMultiplayer(ctx);
        await ctx.answerCbQuery();
    });

    function getRandomItem(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    function getParticipantTags(participants) {
        return participants.map(p => getParticipantTag(p)).join(', ');
    }

    function getParticipantTag(participant) {
        return `@${participant.username}`;
    }

    function getMultiplayerKeyboard() {
        return Markup.inlineKeyboard([
            Markup.button.callback('Next Player', 'next_player'),
            Markup.button.callback('Leave', 'leave')
        ]);
    }

    function getSinglePlayerKeyboard() {
        return Markup.inlineKeyboard([
            Markup.button.callback('Another Truth', 'single_truth'),
            Markup.button.callback('Another Dare', 'single_dare'),
            Markup.button.callback('Change Mode', 'change_mode')
        ]);
    }

    function getModeKeyboard() {
        return Markup.inlineKeyboard([
            Markup.button.callback('Single Player', 'single_player'),
            Markup.button.callback('Multiplayer', 'multiplayer')
        ]);
    }

    function getLobbyKeyboard() {
        return Markup.inlineKeyboard([
            Markup.button.callback('Join Lobby', 'join_lobby'),
            Markup.button.callback('Start Game', 'start_game'),
            Markup.button.callback('Change Mode', 'change_mode')
        ]);
    }

    function getStartGameKeyboard() {
        return Markup.inlineKeyboard([
            Markup.button.callback('Start Game', 'start_game'),
            Markup.button.callback('Change Mode', 'change_mode')
        ]);
    }

    function resetGame() {
        multiplayerParticipants = [];
        lobbyParticipants = [];
        currentPlayerIndex = 0;
        joinMessageId = null;
    }

    return bot;
}

module.exports = { createTruthOrDareBot };
