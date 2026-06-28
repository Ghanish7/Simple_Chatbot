/*
Client-side interactive handling script file.
Maintains chat queries, typing timers, TXT downloads and triggers server synchronization.
*/

// Toggle sidebar on mobile responsive screens
function toggleSidebar() {
    const sidebar = document.getElementById('chatSidebar');
    sidebar.classList.toggle('open');
}

// Set text directly from pre-defined lists buttons
function fillInput(text) {
    const userInput = document.getElementById('userInput');
    userInput.value = text;
    userInput.focus();
    // Fire dynamic characters keyup counter update
    updateCharCounter();
}

// Characters count helper
const userInputEl = document.getElementById('userInput');
if (userInputEl) {
    userInputEl.addEventListener('input', updateCharCounter);
}

function updateCharCounter() {
    const textValue = document.getElementById('userInput').value;
    document.getElementById('charCount').innerText = textValue.length + ' characters';
}

// Support hitting Enter keys in inputs box
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Main message sender logic
async function sendMessage() {
    const inputEl = document.getElementById('userInput');
    const userText = inputEl.value.strip ? inputEl.value.strip() : inputEl.value.trim();
    
    if (userText === "") return;

    // Flush active welcome prompt
    const welcomeBox = document.getElementById('welcomeMessage');
    if (welcomeBox) welcomeBox.style.display = 'none';

    // Clear input bar and reset length counter
    inputEl.value = "";
    document.getElementById('charCount').innerText = '0 characters';

    // Append user message to chat UI immediately
    appendMessage({
        sender: 'user',
        text: userText,
        timestamp: getCurrentTime()
    });

    // Fire continuous typing indicator visualization
    const loader = document.getElementById('typingIndicator');
    loader.classList.remove('d-none');
    scrollToBottom();

    try {
        // Post text back to Python Flask chatbot service API endpoint
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText })
        });
        
        const data = await response.json();
        
        // Hide loader after short structural delay
        setTimeout(() => {
            loader.classList.add('d-none');
            
            if (response.ok && data.bot_message) {
                appendMessage(data.bot_message);
            } else {
                appendMessage({
                    sender: 'bot',
                    text: "Sorry, I am having trouble connecting to my local server nodes.",
                    timestamp: getCurrentTime()
                });
            }
            scrollToBottom();
        }, 650);

    } catch (err) {
        console.error('API Error:', err);
        loader.classList.add('d-none');
        appendMessage({
            sender: 'bot',
            text: "Network node connectivity issue detected. Make sure the Flask server is running.",
            timestamp: getCurrentTime()
        });
        scrollToBottom();
    }
}

// Append messages element with dynamic template layouts
function appendMessage(msg) {
    const container = document.getElementById('messagesContainer');
    const isUser = msg.sender === 'user';
    
    const messageRow = document.createElement('div');
    messageRow.className = "d-flex align-items-start gap-3 w-100 " + (isUser ? 'justify-content-end' : '');
    
    const timeHtml = '<small class="text-secondary text-xxs d-block mt-1 font-mono">' + msg.timestamp + '</small>';
    
    const textColumnHtml = `
        <div class="d-flex flex-column ${isUser ? 'align-items-end' : 'align-items-start'}" style="max-width: 80%;">
            <div class="${isUser ? 'chat-msg-user' : 'chat-msg-bot'} p-3 rounded-2xl relative shadow-sm">
                <p class="mb-0 text-sm" style="white-space: pre-line; word-break: break-word;">${msg.text}</p>
                ${!isUser ? `<button class="btn p-0 text-secondary hover-white border-0 position-absolute end-0 top-0 mt-1 me-2" onclick="copyToClipboard(this)" style="font-size: 0.75rem;"><i class="fa-regular fa-copy"></i></button>`: ''}
            </div>
            ${timeHtml}
        </div>
    `;

    const avatarHtml = isUser ? '' : `
        <div class="avatar-small bg-primary rounded-full d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; min-width: 32px;">
            <i class="fa-solid fa-robot text-white text-xs"></i>
        </div>
    `;

    messageRow.innerHTML = avatarHtml + textColumnHtml;
    container.appendChild(messageRow);
}

// Helper utility for exact active layout dynamic timers
function getCurrentTime() {
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

// Auto scroll support
function scrollToBottom() {
    const chatContainer = document.getElementById('chatBox');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Start clean conversation states
function startNewChat() {
    document.getElementById('messagesContainer').innerHTML = "";
    const welcomeBox = document.getElementById('welcomeMessage');
    if (welcomeBox) welcomeBox.style.display = 'block';
    showToast("Starting clean conversation stream.", "success");
}

// Trigger clearing sessions history
async function triggerClearChat() {
    if (confirm("Are you sure you want to delete session log entries?")) {
        try {
            const res = await fetch('/api/clear', { method: 'DELETE' });
            if (res.ok) {
                startNewChat();
                showToast("Chat logs cleared successfully.", "info");
            }
        } catch (e) {
            console.error(e);
        }
    }
}

// Copy clipboard items
function copyToClipboard(button) {
    const pElement = button.previousElementSibling;
    if (pElement) {
        navigator.clipboard.writeText(pElement.innerText).then(() => {
            const icon = button.querySelector('i');
            icon.className = "fa-solid fa-check text-success";
            showToast("Copied to clipboard!", "success");
            setTimeout(() => {
                icon.className = "fa-regular fa-copy";
            }, 1500);
        });
    }
}

// Toast components utilities
function showToast(message, type = "success") {
    const toastEl = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');
    
    if (toastEl) {
        toastMsg.innerText = message;
        toastIcon.className = type === "success" ? "fa-solid fa-circle-check text-success" : "fa-solid fa-circle-info text-primary";
        const bsToast = new bootstrap.Toast(toastEl, { delay: 3000 });
        bsToast.show();
    }
}

// Export conversation output log to dynamic downloadable text
async function exportHistoryTxt() {
    try {
        const response = await fetch('/api/history');
        const data = await response.json();
        
        if (data.history && data.history.length > 0) {
            let logText = "=== Simple Chatbot using Python: Conversation Export Log ===\n";
            logText += "Generated Date: " + new Date().toISOString() + "\n\n";
            
            data.history.forEach(item => {
                const label = item.sender === 'user' ? "USER" : "CHATBOT";
                logText += "[" + item.timestamp + "] " + label + ": " + item.text + "\n";
            });
            
            const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "nltk_chatbot_history.txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast("Chat history exported successfully!", "success");
        } else {
            showToast("No active conversation logs found to export.", "info");
        }
    } catch (e) {
        console.error('Error exporting logs:', e);
    }
}

// Pre-load historic records on browser start
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/history');
        const data = await response.json();
        if (data.history && data.history.length > 0) {
            const welcomeBox = document.getElementById('welcomeMessage');
            if (welcomeBox) welcomeBox.style.display = 'none';
            data.history.forEach(msg => appendMessage(msg));
            scrollToBottom();
        }
    } catch (e) {
        console.error('Failed to load local chat logs:', e);
    }
});
