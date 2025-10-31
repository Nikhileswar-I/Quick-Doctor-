
const messagesEl = document.getElementById('messages');
const inputForm = document.getElementById('inputForm');
const inputBox = document.getElementById('inputBox');
const clearBtn = document.getElementById('clearBtn');
const patientAge = document.getElementById('patientAge');
const patientGender = document.getElementById('patientGender');
const chatHistory = document.getElementById('chatHistory');
const newChatBtn = document.querySelector('.new-chat');

// Auto-resize textarea
inputBox.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
});

function appendMessage(text, who = 'bot') {
  const wrapper = document.createElement('div');
  wrapper.className = 'msg-wrapper';
  
  const el = document.createElement('div');
  el.className = 'msg ' + (who === 'user' ? 'user' : 'bot');
  
  // Add icon for the message
  const icon = document.createElement('span');
  icon.className = 'material-icons';
  icon.textContent = who === 'user' ? 'account_circle' : 'medical_services';
  
  el.textContent = text;
  
  wrapper.appendChild(el);
  messagesEl.appendChild(wrapper);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  
  // Add to chat history if it's the first message in a new chat
  if (who === 'user' && messagesEl.children.length <= 2) {
    addChatToHistory(text);
  }
}

// Hero show/hide logic
const heroEl = document.getElementById('hero');
const heroInput = document.getElementById('heroInput');
function hideHero(){ if(heroEl) heroEl.style.display = 'none'; }
function showHero(){ if(heroEl) heroEl.style.display = 'block'; }

// When appending a user message, hide hero
const _appendMessage = appendMessage;
appendMessage = function(text, who='bot'){
  if(who === 'user') hideHero();
  _appendMessage(text, who);
}

inputForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const symptoms = inputBox.value.trim();
  if (!symptoms) return;

  const age = patientAge.value;
  if (!age) {
    alert('Please select an age group');
    patientAge.focus();
    return;
  }

  // Construct the input with patient info
  const fullInput = `Patient Info:
Age Group: ${age}
${patientGender.value ? `Gender: ${patientGender.value}` : ''}

Symptoms:
${symptoms}`;

  appendMessage(fullInput, 'user');
  inputBox.value = '';
  appendMessage('Analyzing symptoms...', 'bot');

  try {
    const resp = await fetch('/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: fullInput })
    });
    
    const data = await resp.json();
    
    // Remove the "Analyzing" placeholder
    const last = messagesEl.querySelector('.msg.bot:last-child');
    if (last && last.textContent === 'Analyzing symptoms...') {
      last.remove();
    }

    if (data.error) {
      appendMessage('Error: ' + (data.error || 'Unknown error occurred'), 'bot');
      return;
    }

    if (data.source === 'openai' && data.text) {
      appendMessage(data.text, 'bot');
    } else if (data.diagnosis) {
      appendMessage(data.diagnosis + '\n\n' + (data.note || ''), 'bot');
    } else {
      appendMessage('Unexpected response format. Please try again.', 'bot');
    }
  } catch (err) {
    const last = messagesEl.querySelector('.msg.bot:last-child');
    if (last && last.textContent === 'Analyzing symptoms...') {
      last.remove();
    }
    appendMessage('Network or server error. Please try again later.', 'bot');
    console.error('Error:', err);
  }
});

clearBtn.addEventListener('click', () => {
  if (confirm('Clear all messages?')) {
    messagesEl.innerHTML = '';
    appendMessage('Welcome to Quick Doctor — describe symptoms and get simple guidance. For emergencies, seek immediate care.', 'bot');
  }
});

// Chat history functionality
function addChatToHistory(text) {
  const historyItem = document.createElement('div');
  historyItem.className = 'history-item';
  
  const icon = document.createElement('span');
  icon.className = 'material-icons';
  icon.textContent = 'chat';
  
  const title = document.createElement('span');
  title.textContent = text.split('\n')[0].substring(0, 30) + '...';
  
  historyItem.appendChild(icon);
  historyItem.appendChild(title);
  chatHistory.insertBefore(historyItem, chatHistory.firstChild);
}

// New chat button
newChatBtn.addEventListener('click', () => {
  if (confirm('Start a new chat? Current conversation will be cleared.')) {
    messagesEl.innerHTML = '';
    showHero();
    patientAge.value = '';
    patientGender.value = '';
    inputBox.value = '';
  }
});

// Hero input click focuses the textarea
if(heroInput){
  heroInput.addEventListener('click', ()=>{ hideHero(); inputBox.focus(); });
}

// Show hero initially
showHero();
