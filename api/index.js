
const express = require('express');
const cors = require('cors');
const { JSDOM } = require('jsdom');
const TelegramBot = require('node-telegram-bot-api');
const { translate } = require('free-translate');


const PORT = process.env.PORT || 3000;
const token = '8139148778:AAFNzYSpfqcA7dtekXu1VyOKOVkT6ccQSK4';
const channelId = "@test_bot_channel_leo";

const app = express();
const bot = new TelegramBot(token, { polling: true, request: { timeout: 20000 } });

var before = -1;

app.use(cors());
app.use(express.json());

const getImg = (htmlString) => {

    if(htmlString == "</a>") return "";

    if(htmlString == "<br>") return "\n";

    const dom = new JSDOM(htmlString);

    let element = dom.window.document.querySelector('a');

    if(element == null) {

        element = dom.window.document.querySelector('img');

        if(element == null){

            console.log(htmlString);
            
            return null;
        }

        return element.alt;
        
    } else{
        
        link = element.href;
        content = element.innerText;
        
        return `(${link})`;
    }
}

app.post('/send-message', async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins or specify a domain
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); 

    // res.status(200).json({ success: true, message: 'Yeah, server is ok' });

    const { message } = req.body; // Extract message from request body

    let isHead = true;
    let str = "";
    let BotMessage = "";

    let len = message.length;

    if((before == 0 && len <= 1300) || (before == 1 && len > 1300)){
        
        res.status(200).json({ success: true, message: 'Already sent!' });

        return;
    }  

    if(len > 1300) before = 1;
    if(len <= 1300) before = 0;

    for (let i = 0; i < len; i++) {
        if (message[i] == ">" && isHead == true) {

            isHead = false;

            continue;
        }

        if (isHead == true) continue;

        if (message[i] == ">") {

            str = `${str}>`;
            
            let img = getImg(str);
            
            if(img == null) break;

            BotMessage = `${BotMessage}${img}`;
            str = "";

            continue;
        }

        if (message[i] == "<") {

            BotMessage = `${BotMessage}${str}`;
            str = "";

        }

        str = `${str}${message[i]}`;

        if(str == "&nbsp;") str = " "; 

    }

    // console.log("=+++++++++++++++> ", BotMessage);

    BotMessage = await translate(BotMessage, { from: 'pt', to: 'fr' });

    // console.log("++++++++++++++++++>", BotMessage);

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    bot.sendMessage(channelId, BotMessage)
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