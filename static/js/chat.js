const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

chatForm.addEventListener('submit', event => {
    event.preventDefault();

    // get user input and clear input field
    message = userInput.value;
    userInput.value = '';
    
    // add user message to chat window
    addUserMessage('User', message);
    messageTextElement = addBotMessage('GPT4ALL', '');
    

    fetch('/bot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
    }).then(function(response) {
        const stream = new ReadableStream({
            start(controller) {
                const reader = response.body.getReader();
                function push() {
                    reader.read().then(function(result) {
                        if (result.done) {
                            controller.close();
                            return;
                        }
                        controller.enqueue(result.value);
                        push();
                    })
                }
                push();
            }
        });
        const textDecoder = new TextDecoder();
        const readableStreamDefaultReader = stream.getReader();
        function readStream() {
            readableStreamDefaultReader.read().then(function(result) {
                if (result.done) {
                    return;
                }
                messageTextElement.innerHTML += textDecoder.decode(result.value);
                readStream();
            });
        }
        readStream();
    });

});


function addUserMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('user-message');
    messageElement.classList.add(sender);
    const senderElement = document.createElement('div');
    senderElement.classList.add('user-sender');
    senderElement.innerHTML = sender;
    
    const messageTextElement = document.createElement('div');
    messageTextElement.classList.add('message-text');
    messageTextElement.innerHTML = message;
    
    messageElement.appendChild(senderElement);
    messageElement.appendChild(messageTextElement);
    chatWindow.appendChild(messageElement);
    
    // scroll to bottom of chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;
}


function addBotMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('bot-message');
    messageElement.classList.add(sender);
    const senderElement = document.createElement('div');
    senderElement.classList.add('bot-sender');
    senderElement.innerHTML = sender;
    
    const messageTextElement = document.createElement('div');
    messageTextElement.classList.add('message-text');

    messageTextElement.innerHTML = message
    
    messageElement.appendChild(senderElement);
    messageElement.appendChild(messageTextElement);
    chatWindow.appendChild(messageElement);
    
    // scroll to bottom of chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;

    return messageTextElement
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

addBotMessage("GPT4ALL","Hello there, I am GPT4ALL. Ready to serve.")


const newDiscussionBtn = document.querySelector('#new-discussion-btn');
newDiscussionBtn.addEventListener('click', () => {
  const discussionName = prompt('Enter a name for the new discussion:');
  if (discussionName) {
    // Create a new discussion in the database
    const discussionId = db.createDiscussion(discussionName);

    // Add the discussion to the discussion list
    const discussionList = document.querySelector('#discussion-list');
    const discussionItem = document.createElement('li');
    discussionItem.textContent = discussionName;
    discussionItem.dataset.id = discussionId;
    discussionList.appendChild(discussionItem);
    
    // Select the new discussion
    selectDiscussion(discussionId);
  }
});