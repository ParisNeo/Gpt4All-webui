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
    const sendbtn = document.querySelector("#submit-input")
    const waitAnimation = document.querySelector("#wait-animation")
    sendbtn.style.display="none";
    waitAnimation.style.display="block";
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
                            sendbtn.style.display="block";
                            waitAnimation.style.display="none";
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
    messageTextElement.innerHTML = message;

    // Create a hidden div element
    const hiddenElement = document.createElement('div');
    hiddenElement.style.display = 'none';
    hiddenElement.innerHTML = '';    
    
    messageElement.appendChild(senderElement);
    messageElement.appendChild(messageTextElement);
    const ratingButtons = document.createElement('div');
    ratingButtons.classList.add('rating-buttons');
    const thumbsUpButton = document.createElement('button');
    thumbsUpButton.classList.add('btn', 'btn-outline-success', 'btn-sm');
    thumbsUpButton.innerHTML = '&#x1F44D;';
    thumbsUpButton.addEventListener('click', () => {
        rateResponse('thumbs-up');
    });
    const thumbsDownButton = document.createElement('button');
    thumbsDownButton.classList.add('btn', 'btn-outline-danger', 'btn-sm');
    thumbsDownButton.innerHTML = '&#x1F44E;';
    thumbsDownButton.addEventListener('click', () => {
        rateResponse('thumbs-down');
    });
    ratingButtons.appendChild(thumbsUpButton);
    ratingButtons.appendChild(thumbsDownButton);
    messageElement.appendChild(ratingButtons);
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
        addBotMessage("GPT4ALL",welcome_message);
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



function add_collapsible_div(text, id){
    output = `
    <div class="collapsible">
    <div class="collapsible-header" click=uncollapse('${id}')>
      <h3 style='text-decoration: underline;' >Click to Expand/Collapse</h3>
    </div>
    <div id="${id}" class="collapsible-content">
      <p>${text}</p>
    </div>
  </div>`;
  return output
} 

welcome_message = `
Note:This is a beta demo of GPT4All.
`

addBotMessage("GPT4ALL",welcome_message);

// Code for collapsable text
const collapsibles = document.querySelectorAll('.collapsible');
function uncollapse(id){
    console.log("uncollapsing")
    const content = document.querySelector(`#${id}`);
    content.classList.toggle('active');
}
