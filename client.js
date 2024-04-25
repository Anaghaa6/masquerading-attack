const socket = io('http://localhost:8000');

let token = null;
let username = null;

// Login form submission event listener
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // Send login event to server
    socket.emit('login', { username: usernameInput, password });
});

// Handle login success
socket.on('login-success', ({ receivedToken, receivedUsername }) => {
    console.log('Login successful');
    // Store token and username
    token = receivedToken;
    username = receivedUsername;
    // Optionally hide login container and show chat container
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('chat-container').style.display = 'block';
});

// Handle login failure
socket.on('login-failed', (errorMessage) => {
    errorMessage.innerText = errorMessage; // Update innerText instead of textContent
});

// Message sending event listener
const form = document.getElementById('send-container');
const messageInput = document.getElementById('mssg'); // Corrected id

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = messageInput.value;
    // Check if user is logged in before sending message
    if (!token || !username) {
        console.error('User is not logged in.'); // Handle error appropriately
        return;
    }

    // Send message along with token to the server
    append(`You: ${message}`, 'right');
    socket.emit('send', { message, username, token });
    messageInput.value = '';
});

// Function to append messages to the chat container
const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    document.querySelector('.mcontainer').append(messageElement);
    document.querySelector('.mcontainer').scrollTop = document.querySelector('.mcontainer').scrollHeight;
};

// Event listeners for receiving messages and user join/leave notifications
socket.on('server-user-joined', name => {
    append(`${name} joined the chat`, 'right');
});

socket.on('receive', ({ message, name, token }) => {
    // Check if token is valid, if needed
    // Append the received message to the chat container
    append(`${name}: ${message}`, 'left');
});

socket.on('server-left', name => {
    append(`${name} left the chat`, 'left');
});
