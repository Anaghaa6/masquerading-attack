// Create a WebSocket connection to the server
const socket = io('http://localhost:8000');

// Function to send a crafted message to the server
const sendCraftedMessage = (username, token, messageContent) => {
    // Craft the message object with required fields
    const message = {
        message: messageContent,
        username: username,
        token: token
    };

    // Emit the 'send' event with the crafted message to the server
    socket.emit('send', message);
};

// Event listener for form submission
document.getElementById('message-form').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get input values
    const username = document.getElementById('username').value;
    const token = document.getElementById('token').value;
    const message = document.getElementById('message').value;

    // Check if username, token, and message are provided
    if (!username || !token || !message) {
        console.error('Username, token, or message is missing.');
        return;
    }

    // Send the crafted message
    sendCraftedMessage(username, token, message);

    // Clear input fields
    document.getElementById('username').value = '';
    document.getElementById('token').value = '';
    document.getElementById('message').value = '';
});
