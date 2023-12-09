const socket = io();

const clientsTotal = document.getElementById("clients-total");
const messageContainer = document.getElementById("message-container");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const nameInput = document.getElementById("name-input");

function sendMessage() {
  if (messageInput.value === "") {
    return;
  }

  const data = {
    name: nameInput.value,
    message: messageInput.value,
    sentTime: new Date(),
  };

  socket.emit("message", data);
  addMessageToUI(true, data);
  messageInput.value = "";
}

function addMessageToUI(isOwnMessage, data) {
  clearFeedback();

  const element = `
    <li class="${isOwnMessage ? "message-right" : "message-left"}">
      <p class="message">
        <span>${data.message}</span>
        <span class="message-details">${data.name} - ${moment(
    data.sentTime
  ).fromNow()}</span>
      </p>
    </li>`;

  messageContainer.innerHTML += element;
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

function clearFeedback() {
  document.querySelectorAll("li.message-feedback").forEach((element) => {
    element.parentNode.removeChild(element);
  });
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

messageInput.addEventListener("focus", (e) => {
  socket.emit("feedback", {
    feedback: `${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener("keypress", (e) => {
  socket.emit("feedback", {
    feedback: `${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener("blur", (e) => {
  socket.emit("feedback", {
    feedback: "",
  });
});

socket.on("clients-total", (data) => {
  clientsTotal.innerText = `${data} members`;
});

socket.on("messages", (data) => {
  for (const message of data) {
    addMessageToUI(false, message);
  }
});

socket.on("chat-message", (data) => {
  addMessageToUI(false, data);
});

socket.on("feedback", (data) => {
  clearFeedback();

  const element = `
    <li class="message-feedback">
      <p class="feedback" id="feedback">
        ${data.feedback}
      </p>
    </li>`;

  messageContainer.innerHTML += element;
});
