
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const PORT = process.env.PORT || 3000;
const token = '8139148778:AAFNzYSpfqcA7dtekXu1VyOKOVkT6ccQSK4';
const channelId = "@test_bot_channel_leo";

const app = express();
const bot = new TelegramBot(token, { polling: true,  request: { timeout: 20000 } });

const welcomeMessage = `👩🏻‍💼 Welcome to the Dixmondsg Club, 🎉`;



app.get('/', (req, res) => {
    res.send('Hello, World!');
    bot.sendMessage(channelId, welcomeMessage);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});