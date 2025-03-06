
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

app.use(cors({ origin: '*' }));
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

const translateToFrench = async (text) => {
    try {
        const res = await translate(text, { from: 'pt', to: 'fr' });
        console.log(`Original (Portuguese): ${text}`);
        console.log(`Translated (French): ${res.text}`);
    } catch (error) {
        console.error('Error during translation:', error);
    }
}

app.post('/send-message', async (req, res) => {

    // translateToFrench("Hi, How are you");

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

    // Send the message to the Telegram channel
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