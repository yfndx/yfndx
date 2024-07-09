# Truth or Dare Bot

A simple truth or dare bot using Telegraf.

## Installation

### 1. Clone the Repository

First, clone the repository from GitHub:

```sh
git clone https://github.com/yfndx/yfndx.git
```
Navigate into the project directory:
```sh
cd yfndx
```
### 2. Install Dependencies
Install the necessary dependencies using npm:
```sh
npm install
```
### Usage
To create and run the Truth or Dare bot, you can use the following code:
```javascript
const { createTruthOrDareBot } = require('./path/to/your/module');

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
const { createTruthOrDareBot } = require('./path/to/your/module');

const bot = createTruthOrDareBot();

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
### Features
- #### Single Player Mode:
  Play alone by choosing between Truth and Dare.
- #### Multiplayer Mode:
   Play with friends. Players can join the game, and the bot will manage turns automatically.
- #### Customizable Questions and Dares:
  Provide your own set of questions and dares.
- #### Player Turn Management:
  Ensures only the current player can perform their action and warns if another player tries to take a turn.
- #### In-game Notifications:
  Tags all players in the game when a rule is violated.
- #### Leave Game Option:
  Players can leave the game during the multiplayer mode.
- #### Automatic Game End:
  The game ends automatically when only one player remains.
- #### Clean-up:
  Inline keyboards are removed after game ends or mode changes to ensure smooth gameplay.
### License
This project is licensed under the MIT License. See the LICENSE file for details.
### Author
YFNDX
