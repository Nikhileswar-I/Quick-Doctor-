document.addEventListener('DOMContentLoaded', () => {
  const inputForm = document.getElementById('inputForm');
  const inputBox = document.getElementById('inputBox');
  const messages = document.getElementById('messages');
  const hero = document.getElementById('hero');
  const clearBtn = document.getElementById('clearBtn');
  const chatHistory = document.getElementById('chatHistory');

  let conversationId = Date.now().toString();

  // Auto-resize textarea
  inputBox.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

  // Clear conversation
  clearBtn.addEventListener('click', () => {
    messages.innerHTML = '';
    hero.style.display = 'block';
    inputBox.value = '';
    inputBox.style.height = 'auto';
    conversationId = Date.now().toString();
    
    // Add to chat history
    addToChatHistory('New Chat', conversationId);
  });

  // Handle form submission
  inputForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const patientAge = document.getElementById('patientAge').value;
    const patientGender = document.getElementById('patientGender').value;
    const userInput = inputBox.value.trim();

    if (!patientAge || !userInput) return;

    // Hide hero section if visible
    if (hero.style.display !== 'none') {
      hero.style.display = 'none';
    }

    // Add user message
    addMessage('user', userInput);

    // Clear input
    inputBox.value = '';
    inputBox.style.height = 'auto';

    // Add typing indicator
    const typingIndicator = addMessage('assistant', '<div class="typing-indicator">●●●</div>');

    try {
      // Simulate AI response (replace with actual API call)
      const response = await simulateAIResponse(patientAge, patientGender, userInput);
      
      // Replace typing indicator with response
      typingIndicator.querySelector('.message-content').innerHTML = response;

      // Update chat history with first line of user input
      const firstLine = userInput.split('\\n')[0];
      addToChatHistory(firstLine, conversationId);

    } catch (error) {
      typingIndicator.querySelector('.message-content').innerHTML = 
        'I apologize, but I encountered an error. Please try again.';
    }
  });

  function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = `
      <div class="avatar">
        <span class="material-icons">${role === 'user' ? 'person' : 'medical_services'}</span>
      </div>
      <div class="message-content">${content}</div>
    `;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
    return messageDiv;
  }

  function addToChatHistory(title, id) {
    const historyItem = document.createElement('div');
    historyItem.className = 'chat-history-item';
    historyItem.dataset.id = id;
    historyItem.innerHTML = `
      <span class="material-icons">chat</span>
      <span>${title.substring(0, 30)}${title.length > 30 ? '...' : ''}</span>
    `;
    
    // Add to beginning of history
    if (chatHistory.firstChild) {
      chatHistory.insertBefore(historyItem, chatHistory.firstChild);
    } else {
      chatHistory.appendChild(historyItem);
    }
  }

  async function simulateAIResponse(age, gender, input) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // This is a mock response. Replace with actual API integration
    const responses = [
      "Based on the symptoms you've described, this could be indicative of several conditions. However, I want to emphasize that I can only provide general information and cannot give a diagnosis. It's important to consult with a healthcare provider for proper evaluation.",
      "While I can offer some general health information, please note that this isn't a substitute for professional medical advice. Given what you've shared, here are some general considerations...",
      "Thank you for providing those details. While I can share some general information about these symptoms, it's important to understand that only a qualified healthcare provider can properly evaluate your condition.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
});
