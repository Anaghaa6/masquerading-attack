const io = require('socket.io')(8000, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize an empty object to store user data
const users = {
    // Example user credentials (replace with actual user data)
    "maithili": { password: "passm" },
    "anagha": { password: "passa" }
};


// Initialize an array to store active tokens along with their associated usernames
const activeTokens = [];

// Function to generate a random token (for demonstration purposes)
function generateToken() {
    return Math.random().toString(36).substr(2);
}

// Function to verify the token
function verifyToken(token) {
    // Check if the token exists in the array of active tokens
    const tokenIndex = activeTokens.findIndex(entry => entry.token === token);
    return tokenIndex !== -1; // Return true if token exists, false otherwise
}

io.on('connection', socket => {
    console.log("New connection");

    // Handle login event
    socket.on('login', ({ username, password }) => {
        // Check if username exists and password matches
        if (users[username] && users[username].password === password) {
            // Generate token (for simplicity, using a random string)
            const token = generateToken();

            // Associate token with username
            users[username].token = token;
            socket.username = username;

            // Add the token to the array of active tokens
            activeTokens.push({ username, token });

            // Send token and username back to client
            socket.emit('login-success', { receivedToken: token, receivedUsername: username });
            socket.broadcast.emit('server-user-joined', username);
        } else {
            // Send login failed message to client
            socket.emit('login-failed', 'Invalid username or password');
        }
    });

    // Handle chat messages
    socket.on('send', ({ message, username, token }) => { // Receive message, username, and token
        // Verify token before broadcasting the message
        if (verifyToken(token)) {
            // Token is valid, broadcast the message to other users
            io.sockets.sockets.forEach((connectedSocket) => {
                if (connectedSocket.username !== username) {
                    connectedSocket.emit('receive', { message, name: username, token });
                }
            });
        } else {
            // Token is not valid, handle error or ignore the message
            console.error('Invalid token, message not sent.');
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const name = socket.username;
        if (name) {
            socket.broadcast.emit('server-left', name);
            delete users[socket.id];

            // Remove the token from the array of active tokens
            const tokenIndex = activeTokens.findIndex(entry => entry.username === name);
            if (tokenIndex !== -1) {
                activeTokens.splice(tokenIndex, 1);
            }
        }
    });
});
