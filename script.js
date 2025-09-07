
const chatbox = document.getElementById("chatbox");
const toggle = document.getElementById("chat-toggle");
const closeBtn = document.getElementById("closeBtn");
const messages = document.getElementById("messages");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const quickBtns = document.querySelectorAll(".quick-btn");
const langSelect = document.getElementById("langSelect");

let recognition;
let currentLang = "en-US";

toggle.onclick = () => chatbox.style.display = "flex";
closeBtn.onclick = () => chatbox.style.display = "none";

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("msg", sender);
  msg.textContent = text;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage(userText) {
  if (!userText) return;
  addMessage(userText, "user");
  input.value = "";
  const typingMsg = document.createElement("div");
  typingMsg.classList.add("msg", "bot");
  typingMsg.textContent = "Typing...";
  messages.appendChild(typingMsg);
  messages.scrollTop = messages.scrollHeight;
  await new Promise(r => setTimeout(r, 1200));
  typingMsg.textContent = "Hello 👋 I’m INGRES Assistant. I’ll help you with " + userText;
}

sendBtn.onclick = () => sendMessage(input.value.trim());
input.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(input.value.trim()); });
quickBtns.forEach(btn => btn.onclick = () => sendMessage(btn.textContent));

langSelect.onchange = () => {
  currentLang = langSelect.value;
  if (recognition) recognition.lang = currentLang;
};

if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = currentLang;

  recognition.onstart = () => {
    micBtn.classList.add("listening");
  };

  recognition.onend = () => {
    micBtn.classList.remove("listening");
    const listeningMsg = Array.from(messages.children).find(msg =>
      msg.textContent === "🎙️ Listening..." && msg.classList.contains("bot")
    );
    if (listeningMsg) {
      messages.removeChild(listeningMsg);
    }
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    input.value = transcript;
    if (event.results[0].isFinal) {
      sendMessage(transcript);
    }
  };

  recognition.onerror = (event) => {
    addMessage("❌ Voice recognition error: " + event.error, "bot");
    micBtn.classList.remove("listening");
  };

  micBtn.onclick = () => {
    if (micBtn.classList.contains("listening")) {
      recognition.stop();
    } else {
      recognition.lang = currentLang;
      recognition.start();
    }
  };
} else {
  micBtn.disabled = true;
  micBtn.innerHTML = "❌";
  micBtn.title = "Speech recognition not supported in this browser.";
}
