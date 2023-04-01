const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

chatForm.addEventListener('submit', event => {
    event.preventDefault();

    // get user input and clear input field
    message = userInput.value;
    userInput.value = '';
    
    // add user message to chat window
    addMessage('user', message);
    
    // send user message to Flask back-end using fetch API
    fetch('/bot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
    })
    .then(response => response.json())
    .then(data => {
        // add bot message to chat window
        addMessage('bot', data.message);
    })
    .catch(error => console.error(error));
});

function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender);
    const senderElement = document.createElement('div');
    senderElement.classList.add('sender');
    senderElement.textContent = sender;
    
    const messageTextElement = document.createElement('div');
    messageTextElement.classList.add('message-text');
    messageTextElement.textContent = message;
    
    messageElement.appendChild(senderElement);
    messageElement.appendChild(messageTextElement);
    chatWindow.appendChild(messageElement);
    
    // scroll to bottom of chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

const exportButton = document.getElementById('export-button');

exportButton.addEventListener('click', () => {
    const messages = Array.from(chatWindow.querySelectorAll('.message')).map(messageElement => {
        const senderElement = messageElement.querySelector('.sender');
        const messageTextElement= messageElement.querySelector('.message-text');
        const sender = senderElement.textContent;
        const messageText = messageTextElement.textContent;
        return { sender, messageText };
        });
    const exportFormat = 'text'; // replace with desired export format

    if (exportFormat === 'text') {
        const exportText = messages.map(({ sender, messageText }) => `${sender}: ${messageText}`).join('\n');
        downloadTextFile(exportText);
    } else if (exportFormat === 'json') {
        const exportJson = JSON.stringify(messages);
        downloadJsonFile(exportJson);
    } else {
        console.error(`Unsupported export format: ${exportFormat}`);
    }
});

function downloadTextFile(text) {
const blob = new Blob([text], { type: 'text/plain' });
const url = URL.createObjectURL(blob);
downloadUrl(url);
}

function downloadJsonFile(json) {
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
downloadUrl(url);
}

function downloadUrl(url) {
const link = document.createElement('a');
link.href = url;
link.download = 'chat.txt';
link.click();
}