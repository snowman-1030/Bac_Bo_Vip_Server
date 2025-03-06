
const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const PORT = process.env.PORT || 3000;
const token = '8139148778:AAFNzYSpfqcA7dtekXu1VyOKOVkT6ccQSK4';
const channelId = "@test_bot_channel_leo";

const app = express();
const bot = new TelegramBot(token, { polling: true,  request: { timeout: 20000 } });

app.use(cors());

app.post('/send-message', (req, res) => {
    const { message } = req.body; // Extract message from request body

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Send the message to the Telegram channel
    bot.sendMessage(channelId, message)
        .then(() => {
            res.status(200).json({ success: true, message: 'Message sent successfully' });
        })
        .catch((error) => {
            console.error('Error sending message:', error);
            res.status(500).json({ error: 'Failed to send message' });
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});