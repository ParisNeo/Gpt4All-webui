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
    elements = addBotMessage('GPT4ALL', '');
    messageTextElement=elements['messageTextElement'];
    hiddenElement=elements['hiddenElement'];
    last_reception_is_f=false;

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
                text = textDecoder.decode(result.value);
                for (const char of text) {
                    if (last_reception_is_f){
                      // start a new message
                        elements = addBotMessage('GPT4ALL', '');
                        messageTextElement=elements['messageTextElement'];
                        hiddenElement=elements['hiddenElement'];
                        last_reception_is_f = false;
                    }

                    if (char === '\f') {
                        last_reception_is_f = true;                    
                    }
                    else{
                        txt = hiddenElement.innerHTML;
                        txt += char
                        hiddenElement.innerHTML = txt
                        messageTextElement.innerHTML = txt.replace(/\n/g, "<br>")
                        console.log(messageTextElement.innerHTML)
                    }
                    // scroll to bottom of chat window
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                  }
                readStream();
            });
        }
        readStream();
    });

});


function addUserMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('bg-secondary', 'drop-shadow-sm', 'p-4', 'mx-6', 'my-4', 'flex', 'flex-col', 'space-x-2');
    messageElement.classList.add(sender);
    const senderElement = document.createElement('div');
    senderElement.classList.add('font-normal', 'underline', 'text-sm');
    senderElement.innerHTML = sender;
    
    const messageTextElement = document.createElement('div');
    messageTextElement.classList.add('font-medium', 'text-md');
    messageTextElement.innerHTML = message;
    
    messageElement.appendChild(senderElement);
    messageElement.appendChild(messageTextElement);
    chatWindow.appendChild(messageElement);
    
    // scroll to bottom of chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;
}


function addBotMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('bg-secondary', 'drop-shadow-sm', 'p-4', 'mx-6', 'my-4', 'flex', 'flex-col', 'space-x-2');
    messageElement.classList.add(sender);
    const senderElement = document.createElement('div');
    senderElement.classList.add('font-normal', 'underline', 'text-sm');
    senderElement.innerHTML = sender;
    
    const messageTextElement = document.createElement('div');
    messageTextElement.classList.add('font-medium', 'text-md');
    messageTextElement.innerHTML = message

    // Create a hidden div element
    const hiddenElement = document.createElement('div');
    hiddenElement.style.display = 'none';
    hiddenElement.innerHTML = '';    
    
    messageElement.appendChild(senderElement);
    messageElement.appendChild(messageTextElement);
    chatWindow.appendChild(messageElement);
    chatWindow.appendChild(hiddenElement);
    
    // scroll to bottom of chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;

    return {'messageTextElement':messageTextElement, 'hiddenElement':hiddenElement}
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
    const exportFormat = 'json'; // replace with desired export format

    if (exportFormat === 'text') {
        const exportText = messages.map(({ sender, messageText }) => `${sender}: ${messageText}`).join('\n');
        downloadTextFile(exportText);
    } else if (exportFormat === 'json') {
        fetch('/export')
        .then(response => response.json())
        .then(data => {
            db_data = JSON.stringify(data)
          // Do something with the data, such as displaying it on the page
          console.log(db_data);
          downloadJsonFile(db_data);
        })
        .catch(error => {
          // Handle any errors that occur
          console.error(error);
        });
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

addBotMessage("GPT4ALL","Note:</b><br>This is a very early testing Web UI of GPT4All chatbot.<br>Bre in mind that this is a 7B parameters model running on your own PC's CPU.Its is literally 24 times smaller than gpt3 in terms of parameters number.<br>It is still new and is not yet as powerful as GPT3.5 or GPT4. But still can be useful for many applications.<br>Any feedback and contribution is welcomed.<br>This Webui is a binding to the Gpt4All model that allows you to test a chatbot locally on your machine. Feel free to ask questions or give instructions.<br><b>It is advised to have a single instruct response interaction then you press new conversation as this model is poor in multiple interactions.</b><br>Examples:<br>A color description has been provided. Find the CSS code associated with that color. A light red color with a medium light shade of pink.<br>Come up with an interesting idea for a new movie plot. Your plot should be described with a title and a summary.<br>Reverse a string in python.<br>List 10 dogs.<br>Write me a poem about the fall of Julius Ceasar into a ceasar salad in iambic pentameter.<br>What is a three word topic describing the following keywords: baseball, football, soccer:<br>")


const newDiscussionBtn = document.querySelector('#new-discussion-btn');
newDiscussionBtn.addEventListener('click', () => {
  const discussionName = prompt('Enter a name for the new discussion:');
  if (discussionName) {
    // Add the discussion to the discussion list
    const discussionList = document.querySelector('#discussion-list');
    const discussionItem = document.createElement('li');
    discussionItem.textContent = discussionName;
    fetch(`/new_discussion?tite=${discussionName}`)
    .then(response => response.json())
    .then(data => {
    })
    .catch(error => {
      // Handle any errors that occur
      console.error(error);
    });
    
    // Select the new discussion
    //selectDiscussion(discussionId);
    chatWindow.innerHTML=""
  }
});


// Code for collapsable text
const collapsibles = document.querySelectorAll('.collapsible');

collapsibles.forEach(collapsible => {
  const header = collapsible.querySelector('.collapsible-header');
  const content = collapsible.querySelector('.collapsible-content');

  header.addEventListener('click', () => {
    content.classList.toggle('active');
  });
});