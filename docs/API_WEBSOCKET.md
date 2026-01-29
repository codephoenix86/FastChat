# WebSocket API Reference

Real-time communication using Socket.io for the fastchat application.

## Connection

### Establishing Connection

Connect to the Socket.io server with JWT authentication:

```javascript
import io from 'socket.io-client'

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_access_token',
  },
})
```

### Connection Events

#### `connect`

Fired when successfully connected to the server.

```javascript
socket.on('connect', () => {
  console.log('Connected to server')
  console.log('Socket ID:', socket.id)
})
```

#### `disconnect`

Fired when disconnected from the server.

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason)

  // Reasons:
  // 'io server disconnect' - Server forcefully disconnected
  // 'io client disconnect' - Client called socket.disconnect()
  // 'ping timeout' - Connection timed out
  // 'transport close' - Connection lost
  // 'transport error' - Transport error
})
```

#### `connect_error`

Fired when connection fails.

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message)
  // Common: Authentication token is missing or invalid
})
```

---

## Chat Events

### Client → Server

#### `chat:join`

Join a chat room to receive real-time messages.

**Emit:**

```javascript
socket.emit('chat:join', { chatId: 'chatId123' })
```

**Parameters:**

- `chatId` (string): ID of the chat to join

**Requirements:**

- User must be authenticated
- User must be a participant of the chat

**Use Case:**
Emit this event when user opens a chat to start receiving real-time updates.

---

#### `chat:leave`

Leave a chat room to stop receiving messages.

**Emit:**

```javascript
socket.emit('chat:leave', { chatId: 'chatId123' })
```

**Parameters:**

- `chatId` (string): ID of the chat to leave

**Use Case:**
Emit this event when user closes or navigates away from a chat.

---

### Server → Client

No server-initiated chat events currently implemented.

---

## Message Events

### Client → Server

#### `message:delivered`

Mark a message as delivered to the user.

**Emit:**

```javascript
socket.emit('message:delivered', { messageId: 'msg123' })
```

**Parameters:**

- `messageId` (string): ID of the message that was delivered

**Use Case:**
Emit when the client receives and displays a message.

---

#### `message:read`

Mark a message as read by the user.

**Emit:**

```javascript
socket.emit('message:read', { messageId: 'msg123' })
```

**Parameters:**

- `messageId` (string): ID of the message that was read

**Use Case:**
Emit when user actually views/reads the message (e.g., message is in viewport).

---

### Server → Client

#### `message:new`

Received when a new message is sent in a chat.

**Listen:**

```javascript
socket.on('message:new', (message) => {
  console.log('New message:', message)
  // Display message in UI
  // Emit message:delivered when rendered
})
```

**Data:**

```javascript
{
  id: "messageId",
  content: "Hello!",
  sender: "userId",
  chat: "chatId",
  status: "sent",
  type: "text",
  createdAt: "2024-01-21T10:30:00.000Z",
  updatedAt: "2024-01-21T10:30:00.000Z"
}
```

**Properties:**

- `id` (string): Message ID
- `content` (string): Message text content
- `sender` (string): User ID of sender
- `chat` (string): Chat ID
- `status` (string): "sent", "delivered", or "read"
- `type` (string): "text" or "file"
- `createdAt` (string): ISO timestamp
- `updatedAt` (string): ISO timestamp

**Use Case:**
Automatically received when someone sends a message in any chat you've joined.

---

#### `message:updated`

Received when a message is edited.

**Listen:**

```javascript
socket.on('message:updated', (message) => {
  console.log('Message updated:', message)
  // Update message in UI
})
```

**Data:**

```javascript
{
  id: "messageId",
  content: "Updated content",
  sender: "userId",
  chat: "chatId",
  status: "sent",
  type: "text",
  createdAt: "2024-01-21T10:30:00.000Z",
  updatedAt: "2024-01-21T10:35:00.000Z"
}
```

**Use Case:**
Update the displayed message when someone edits it.

---

#### `message:deleted`

Received when a message is deleted.

**Listen:**

```javascript
socket.on('message:deleted', (data) => {
  console.log('Message deleted:', data.messageId)
  // Remove message from UI
})
```

**Data:**

```javascript
{
  messageId: 'messageId'
}
```

**Use Case:**
Remove the message from UI when someone deletes it.

---

## Typing Events

### Client → Server

#### `message:start-typing`

Indicate that user started typing in a chat.

**Emit:**

```javascript
socket.emit('message:start-typing', { chatId: 'chatId123' })
```

**Parameters:**

- `chatId` (string): ID of the chat where user is typing

**Best Practices:**

- Emit when user starts typing
- Don't emit on every keystroke
- Use debouncing (300-500ms recommended)

**Example with debouncing:**

```javascript
let typingTimeout

function handleTyping(chatId) {
  // Clear existing timeout
  clearTimeout(typingTimeout)

  // Emit start typing
  socket.emit('message:start-typing', { chatId })

  // Auto-stop after 3 seconds
  typingTimeout = setTimeout(() => {
    socket.emit('message:stop-typing', { chatId })
  }, 3000)
}

// On input change
inputElement.addEventListener('input', () => {
  if (inputElement.value.length > 0) {
    handleTyping(currentChatId)
  }
})
```

---

#### `message:stop-typing`

Indicate that user stopped typing in a chat.

**Emit:**

```javascript
socket.emit('message:stop-typing', { chatId: 'chatId123' })
```

**Parameters:**

- `chatId` (string): ID of the chat where user stopped typing

**Use Cases:**

- User clears the input
- User sends the message
- Timeout after inactivity (recommended: 3 seconds)

---

### Server → Client

#### `message:start-typing`

Received when another user starts typing in a chat.

**Listen:**

```javascript
socket.on('message:start-typing', (data) => {
  console.log(`User ${data.userId} is typing in chat ${data.chatId}`)
  // Show "User is typing..." indicator
})
```

**Data:**

```javascript
{
  userId: "userId",
  chatId: "chatId"
}
```

**Properties:**

- `userId` (string): ID of user who is typing
- `chatId` (string): Chat ID where typing is happening

**UI Implementation:**

```javascript
const typingUsers = new Set()

socket.on('message:start-typing', (data) => {
  typingUsers.add(data.userId)
  updateTypingIndicator()
})

socket.on('message:stop-typing', (data) => {
  typingUsers.delete(data.userId)
  updateTypingIndicator()
})

function updateTypingIndicator() {
  if (typingUsers.size === 0) {
    hideTypingIndicator()
  } else if (typingUsers.size === 1) {
    showTypingIndicator('User is typing...')
  } else {
    showTypingIndicator(`${typingUsers.size} users are typing...`)
  }
}
```

---

#### `message:stop-typing`

Received when a user stops typing in a chat.

**Listen:**

```javascript
socket.on('message:stop-typing', (data) => {
  console.log(`User ${data.userId} stopped typing in chat ${data.chatId}`)
  // Hide "User is typing..." indicator
})
```

**Data:**

```javascript
{
  userId: "userId",
  chatId: "chatId"
}
```

---

## User Presence Events

### Server → Client

#### `user:online`

Received when a user comes online.

**Listen:**

```javascript
socket.on('user:online', (data) => {
  console.log('User came online:', data.userId)
  // Update user's online status in UI
})
```

**Data:**

```javascript
{
  userId: 'userId'
}
```

**Use Case:**
Update the online/offline indicator for users in your contacts or chat lists.

---

#### `user:offline`

Received when a user goes offline.

**Listen:**

```javascript
socket.on('user:offline', (data) => {
  console.log('User went offline:', data.userId)
  // Update user's offline status in UI
  // Show "last seen" timestamp
})
```

**Data:**

```javascript
{
  userId: 'userId'
}
```

**Use Case:**
Update the online/offline indicator and display "last seen" time.

---

## Complete Example

Here's a complete implementation example:

```javascript
import io from 'socket.io-client'

class ChatClient {
  constructor(accessToken) {
    this.socket = io('http://localhost:3000', {
      auth: { token: accessToken },
    })

    this.setupEventListeners()
  }

  setupEventListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })

    // Message events
    this.socket.on('message:new', (message) => {
      this.handleNewMessage(message)
      // Mark as delivered
      this.socket.emit('message:delivered', {
        messageId: message.id,
      })
    })

    this.socket.on('message:updated', (message) => {
      this.handleMessageUpdate(message)
    })

    this.socket.on('message:deleted', (data) => {
      this.handleMessageDelete(data.messageId)
    })

    // Typing events
    this.socket.on('message:start-typing', (data) => {
      this.showTypingIndicator(data.userId, data.chatId)
    })

    this.socket.on('message:stop-typing', (data) => {
      this.hideTypingIndicator(data.userId, data.chatId)
    })

    // Presence events
    this.socket.on('user:online', (data) => {
      this.updateUserStatus(data.userId, 'online')
    })

    this.socket.on('user:offline', (data) => {
      this.updateUserStatus(data.userId, 'offline')
    })
  }

  // Join a chat
  joinChat(chatId) {
    this.socket.emit('chat:join', { chatId })
  }

  // Leave a chat
  leaveChat(chatId) {
    this.socket.emit('chat:leave', { chatId })
  }

  // Mark message as read
  markAsRead(messageId) {
    this.socket.emit('message:read', { messageId })
  }

  // Typing indicators with debouncing
  startTyping(chatId) {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
    }

    this.socket.emit('message:start-typing', { chatId })

    this.typingTimeout = setTimeout(() => {
      this.stopTyping(chatId)
    }, 3000)
  }

  stopTyping(chatId) {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
      this.typingTimeout = null
    }

    this.socket.emit('message:stop-typing', { chatId })
  }

  // Implement these methods based on your UI
  handleNewMessage(message) {
    console.log('New message:', message)
  }

  handleMessageUpdate(message) {
    console.log('Message updated:', message)
  }

  handleMessageDelete(messageId) {
    console.log('Message deleted:', messageId)
  }

  showTypingIndicator(userId, chatId) {
    console.log(`${userId} is typing in ${chatId}`)
  }

  hideTypingIndicator(userId, chatId) {
    console.log(`${userId} stopped typing in ${chatId}`)
  }

  updateUserStatus(userId, status) {
    console.log(`${userId} is now ${status}`)
  }

  disconnect() {
    this.socket.disconnect()
  }
}

// Usage
const chatClient = new ChatClient(accessToken)

// When opening a chat
chatClient.joinChat('chatId123')

// When user types
inputElement.addEventListener('input', () => {
  if (inputElement.value.length > 0) {
    chatClient.startTyping('chatId123')
  } else {
    chatClient.stopTyping('chatId123')
  }
})

// When closing a chat
chatClient.leaveChat('chatId123')
```

---

## Best Practices

### Connection Management

1. **Handle Reconnection**: Socket.io automatically reconnects, but update your UI accordingly

```javascript
socket.on('connect', () => {
  // Re-join all active chats
  activeChats.forEach((chatId) => {
    socket.emit('chat:join', { chatId })
  })
})
```

2. **Clean Up**: Leave chats when navigating away

```javascript
// In React
useEffect(() => {
  socket.emit('chat:join', { chatId })

  return () => {
    socket.emit('chat:leave', { chatId })
  }
}, [chatId])
```

### Message Status Updates

1. **Delivered**: Emit when message is displayed
2. **Read**: Emit when message is in viewport and user is focused on the chat

```javascript
// Use Intersection Observer for read receipts
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && document.hasFocus()) {
      const messageId = entry.target.dataset.messageId
      socket.emit('message:read', { messageId })
    }
  })
})
```

### Typing Indicators

1. **Debounce**: Don't emit on every keystroke
2. **Auto-stop**: Clear typing after 3 seconds of inactivity
3. **Clear on send**: Stop typing when message is sent

### Performance

1. **Join Only Active Chats**: Don't join all chats at once
2. **Leave Inactive Chats**: Reduce server load
3. **Throttle Updates**: Batch UI updates if receiving many events

### Error Handling

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error)
  // Show user-friendly error message
})

socket.on('connect_error', (error) => {
  if (error.message === 'Authentication token is missing') {
    // Redirect to login
  }
})
```

---

## Event Summary

### Client → Server

| Event                  | Parameters      | Description               |
| ---------------------- | --------------- | ------------------------- |
| `chat:join`            | `{ chatId }`    | Join a chat room          |
| `chat:leave`           | `{ chatId }`    | Leave a chat room         |
| `message:delivered`    | `{ messageId }` | Mark message as delivered |
| `message:read`         | `{ messageId }` | Mark message as read      |
| `message:start-typing` | `{ chatId }`    | Start typing in chat      |
| `message:stop-typing`  | `{ chatId }`    | Stop typing in chat       |

### Server → Client

| Event                  | Data                           | Description          |
| ---------------------- | ------------------------------ | -------------------- |
| `message:new`          | `{ id, content, sender, ... }` | New message received |
| `message:updated`      | `{ id, content, ... }`         | Message was edited   |
| `message:deleted`      | `{ messageId }`                | Message was deleted  |
| `message:start-typing` | `{ userId, chatId }`           | User started typing  |
| `message:stop-typing`  | `{ userId, chatId }`           | User stopped typing  |
| `user:online`          | `{ userId }`                   | User came online     |
| `user:offline`         | `{ userId }`                   | User went offline    |

### Connection Events

| Event           | Data     | Description              |
| --------------- | -------- | ------------------------ |
| `connect`       | -        | Successfully connected   |
| `disconnect`    | `reason` | Disconnected from server |
| `connect_error` | `error`  | Connection failed        |
