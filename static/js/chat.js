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

// Populate discussions list
const discussionsList = document.querySelector('#discussions-list');
fetch('/discussions')
  .then(response => response.json())
  .then(discussions => {
    discussions.forEach(discussion => {
      const buttonWrapper = document.createElement('div');
      buttonWrapper.classList.add('flex', 'space-x-2', 'mt-2');

      const renameButton = document.createElement('button');
      renameButton.classList.add('bg-green-500', 'hover:bg-green-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded');
      const renameImg = document.createElement('img');
      renameImg.src = "/static/images/edit_discussion.png";
      renameImg.style.width='20px'
      renameImg.style.height='20px'
      renameButton.appendChild(renameImg);

      //renameButton.style.backgroundImage = "/rename_discussion.svg"; //.textContent = 'Rename';
      renameButton.addEventListener('click', () => {
        const dialog = document.createElement('dialog');
        dialog.classList.add('bg-white', 'rounded', 'p-4');

        const inputLabel = document.createElement('label');
        inputLabel.textContent = 'New name: ';
        const inputField = document.createElement('input');
        inputField.classList.add('border', 'border-gray-400', 'rounded', 'py-1', 'px-2');
        inputField.setAttribute('type', 'text');
        inputField.setAttribute('name', 'title');
        inputField.setAttribute('value', discussion.title);
        inputLabel.appendChild(inputField);
        dialog.appendChild(inputLabel);

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
          dialog.close();
        });

        const renameConfirmButton = document.createElement('button');
        renameConfirmButton.classList.add('bg-green-500', 'hover:bg-green-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded', 'ml-2');
        renameConfirmButton.textContent = 'Rename';
        renameConfirmButton.addEventListener('click', () => {
          const newTitle = inputField.value;
          if (newTitle === '') {
            alert('New name cannot be empty');
          } else {
            fetch('/rename', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ id: discussion.id, title: newTitle })
            })
            .then(response => {
              if (response.ok) {
                discussion.title = newTitle;
                discussionButton.textContent = newTitle;
                dialog.close();
              } else {
                alert('Failed to rename discussion');
              }
            })
            .catch(error => {
              console.error('Failed to rename discussion:', error);
              alert('Failed to rename discussion');
            });
          }
        });
    
        dialog.appendChild(cancelButton);
        dialog.appendChild(renameConfirmButton);
        document.body.appendChild(dialog);
        dialog.showModal();
      });
      const deleteButton = document.createElement('button');
      deleteButton.classList.add('bg-green-500', 'hover:bg-green-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded');
      const deleteImg = document.createElement('img');
      deleteImg.src = "/static/images/delete_discussion.png";
      deleteImg.style.width='20px'
      deleteImg.style.height='20px'

      deleteButton.addEventListener('click', () => {
        fetch('/delete_discussion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: discussion.id})
          })
          .then(response => {
            if (response.ok) {
                buttonWrapper.parentElement.remove();
            } else {
              alert('Failed to delete discussion');
            }
          })
          .catch(error => {
            console.error('Failed to delete discussion:', error);
            alert('Failed to delete discussion');
          });        
        
      });

      deleteButton.appendChild(deleteImg);
      deleteButton.addEventListener('click', () => {

      });

      const discussionButton = document.createElement('button');
      discussionButton.classList.add('bg-blue-500', 'hover:bg-blue-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded');
      discussionButton.textContent = discussion.title;
      discussionButton.addEventListener('click', () => {
        // send query with discussion id to reveal discussion messages
        fetch('/get_messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: discussion.id })
          })
          .then(response => {
            if (response.ok) {
                var container = document.getElementById("chat-window");
                container.innerHTML = "";
                response.json().then(messages => {
                    messages.forEach(message => {
                        addUserMessage(message.sender, message.content);
                    });
                });
            } else {
              alert('Failed to querry the discussion');
            }
          })
          .catch(error => {
            console.error('Failed to rename discussion:', error);
            alert('Failed to rename discussion');
          });
        console.log(`Showing messages for discussion ${discussion.id}`);
      });


      buttonWrapper.appendChild(renameButton);
      buttonWrapper.appendChild(deleteButton);
      buttonWrapper.appendChild(discussionButton);
      discussionsList.appendChild(buttonWrapper);
    });
})
.catch(error => {
console.error('Failed to get discussions:', error);
alert('Failed to get discussions');
});







function add_collapsible_div(discussion_title, text, id) {
    // Create the outer box element
    const box = document.createElement('div');
    box.classList.add('bg-gray-100', 'rounded-lg', 'p-4');
  
    // Create the title element
    const title = document.createElement('h2');
    title.classList.add('text-lg', 'font-medium');
    title.textContent = discussion_title;
  
    // Create the toggle button element
    const toggleBtn = document.createElement('button');
    toggleBtn.classList.add('focus:outline-none');
    toggleBtn.id = `${id}-toggle-btn`;
  
    // Create the expand icon element
    const expandIcon = document.createElement('path');
    expandIcon.id = `${id}-expand-icon`;
    expandIcon.setAttribute('d', 'M5 5h10v10H5z');
  
    // Create the collapse icon element
    const collapseIcon = document.createElement('path');
    collapseIcon.id = `${id}-collapse-icon`;
    collapseIcon.setAttribute('d', 'M7 10h6');
  
    // Add the icons to the toggle button element
    toggleBtn.appendChild(expandIcon);
    toggleBtn.appendChild(collapseIcon);
  
    // Create the content element
    const content = document.createElement('div');
    content.id = `${id}-box-content`;
    content.classList.add('mt-4');
    content.textContent = text; 
    // Add the title, toggle button, and content to the box element
    // Create the title and toggle button container element
    const titleToggleContainer = document.createElement('div');
    titleToggleContainer.classList.add('flex', 'justify-between', 'items-center');

    // Add the title and toggle button to the container element
    titleToggleContainer.appendChild(title);
    titleToggleContainer.appendChild(toggleBtn);

    // Add the container element to the box element
    box.appendChild(titleToggleContainer);
    box.appendChild(content);
  
    // Add the box to the document
    document.body.appendChild(box);
  
    // Add the CSS styles to the head of the document
    const css = `
      #${id}-box-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.2s ease-out;
      }
  
      #${id}-box-content.expanded {
        max-height: 1000px;
        transition: max-height 0.5s ease-in;
      }
  
      #${id}-toggle-btn:focus #${id}-collapse-icon {
        display: block;
      }
  
      #${id}-toggle-btn:focus #${id}-expand-icon {
        display: none;
      }
  
      #${id}-collapse-icon {
        display: none;
      }
    `;
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
  
    // Add the JavaScript code to toggle the box
    const toggleBtnEl = document.querySelector(`#${id}-toggle-btn`);
    const boxContentEl = document.querySelector(`#${id}-box-content`);
  
    toggleBtnEl.addEventListener('click', function() {
      boxContentEl.classList.toggle('expanded');
    });
    return box
  }

const text = `
<div>
<code>This is a very early testing Web UI of GPT4All chatbot.
<br>Keep in mind that this is a 7B parameters model running on your own PC's CPU. It is literally 24 times smaller than GPT-3 in terms of parameter count.
<br>While it is still new and not as powerful as GPT-3.5 or GPT-4, it can still be useful for many applications.
<br>Any feedback and contribution is welcomed.
<br>This Web UI is a binding to the GPT4All model that allows you to test a chatbot locally on your machine. Feel free to ask questions or give instructions.</code>

<br>Examples:<br>
<code>
- A color description has been provided. Find the CSS code associated with that color. A light red color with a medium light shade of pink.<br>
- Come up with an interesting idea for a new movie plot. Your plot should be described with a title and a summary.<br>
- Reverse a string in python.<br>
- List 10 dogs.<br>
- Write me a poem about the fall of Julius Ceasar into a ceasar salad in iambic pentameter.<br>
- What is a three word topic describing the following keywords: baseball, football, soccer.<br>
- Act as ChefAI an AI that has the ability to create recipes for any occasion. Instruction: Give me a recipe for my next anniversary.<br>
</code>
</div>
`;
//welcome_message = add_collapsible_div("Note:", text, 'hints');

addBotMessage("GPT4ALL",text);

// Code for collapsable text
const collapsibles = document.querySelectorAll('.collapsible');
function uncollapse(id){
    console.log("uncollapsing")
    const content = document.querySelector(`#${id}`);
    content.classList.toggle('active');
}
