# Truth or Dare Telegram Bot

This is a simple "Truth or Dare" bot for Telegram. Users can play the game by using commands to get random truth questions or dare challenges. The bot can be used both in private chats and in group chats.

## Features

- `/start` - Introduction to the bot and how to use it
- `/truth` - Get a random truth question
- `/dare` - Get a random dare challenge

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine
- A Telegram account

### Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/truth-or-dare-bot.git
    cd truth-or-dare-bot
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Create a `.env` file in the root directory and add your Telegram bot token:**

    ```
    BOT_TOKEN=your_telegram_bot_token
    ```

4. **Run the bot:**

    ```bash
    npm start
    ```

### Using the Bot

1. **Start the bot in a private chat or a group chat:**

    - In a private chat, send `/start` to get a welcome message and instructions.
    - In a group chat, send `/start` to get a welcome message and instructions.

2. **Play the game:**

    - Send `/truth` to get a random truth question.
    - Send `/dare` to get a random dare challenge.

### Adding the Bot to a Group

1. **Add the bot to your group:**

    - Invite the bot to your group by searching for the bot's username and adding it to the group.

2. **Ensure the bot has necessary permissions:**

    - Make sure the bot has the permission to read and send messages in the group.

3. **Use the commands:**

    - Members of the group can use `/truth` and `/dare` commands to play the game in the group chat.

### Deployment

To deploy this bot on a server or a cloud platform (e.g., Heroku, AWS, etc.), follow these steps:

1. **Ensure your environment variables are set:**

    Set your `BOT_TOKEN` as an environment variable on your server.

2. **Deploy the bot:**

    Deploy the code to your server or cloud platform and run `npm start` to start the bot.

### Example Code

Here's the main bot code for reference:

```javascript
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


