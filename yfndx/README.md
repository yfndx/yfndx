# Truth or Dare Bot

A simple truth or dare bot using Telegraf.

## Installation

To install the module, use npm:

```sh
npm install yfndx
```
### Usage
To create and run the Truth or Dare bot, you can use the following code:

```javascript
const { createTruthOrDareBot } = require('yfndx');

const bot = createTruthOrDareBot();

bot.launch().then(() => {
    console.log('Bot is running');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
```
### Custom Questions and Dares
You can provide your own custom questions and dares when creating the bot:
```javascript
const { createTruthOrDareBot } = require('yfndx');

const customQuestions = [
    "What's your favorite color?",
    "What's your dream job?"
];

const customDares = [
    "Dance for 1 minute.",
    "Do 20 jumping jacks."
];

const bot = createTruthOrDareBot('YOUR_BOT_TOKEN', customQuestions, customDares);

bot.launch().then(() => {
    console.log('Bot is running');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
```
### Environment Variables
You need to create a .env file in the root directory of your project with the following content:
```dotenv
BOT_TOKEN=your-telegram-bot-token
```
This file will be used to store the bot token you received from the BotFather on Telegram.
### License
This project is licensed under the ISC License. See the LICENSE file for details.
### Author
YFNDX
