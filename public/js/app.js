(() => {
  const pusher = new Pusher("d276ac41fb6f9fd82804", {
    authEndpoint: "/pusher/auth",
    cluster: "ap3",
    encrypted: true
  });

  let chat = {
    name: undefined,
    email: undefined,
    endUserName: undefined,
    currentRoom: undefined,
    currentChannel: undefined,
    subscribedChannels: [],
    subscribedUsers: []
  };

  let publicChannel = pusher.subscribe("update");

  const chatRoomsList = document.querySelector("#rooms");
  const chatReplyMessage = document.querySelector("#replyMessage");

  const helpers = {
    clearChatMessages: () => {
      document.querySelector("#chat-msgs").innerHTML = "";
    },

    displayChatMessage: message => {
      if (message.email === chat.email) {
        document.querySelector("#chat-msgs").prepend(
          `<tr>
             <td>
               <div class="sender">${message.sender} @ <span class="date">${message.createdAt}</span></div>
               <div class="message">${message.text}</div>
             </td>
           </tr>`
        );
      }
    },

    loadChatRoom: evt => {
      chat.currentRoom = evt.target.dataset.roomId;
      chat.currentChannel = evt.target.dataset.channelId;
      chat.endUserName = evt.target.dataset.userName;
      if (chat.currentRoom !== undefined) {
        document.querySelector(".response").style.display = "block";
        document
          .querySelector("#room-title")
          .textContent(
            "Write a message to " + evt.target.dataset.userName + "."
          );
      }

      evt.preventDefault();
      helpers.clearChatMessages();
    },

    replyMessage: evt => {
      evt.preventDefault();

      let createdAt = new Date().toLocaleString();
      let message = document.querySelector("#replyMessage input").value.trim();
      let event = "client-" + chat.currentRoom;

      chat.subscribedChannels[chat.currentChannel].trigger(event, {
        sender: chat.name,
        email: chat.currentRoom,
        text: message,
        createdAt: createdAt
      });

      document.querySelector("#chat-msgs").prepend(
        `<tr>
           <td>
             <div class="sender"> ${chat.name} @ <span class="date">${createdAt}</span></div>
             <div class="message">${message}</div>
           </td>
         </tr>`
      );

      document.querySelector("#replyMessage input").value = "";
    },

    LogIntoChatSession: evt => {
      const name = document.querySelector("#fullname").value.trim();
      const email = document
        .querySelector("#email")
        .value.trim()
        .toLowerCase();

      chat.name = name;
      chat.email = email;

      document
        .querySelector("#loginScreenForm input, #loginScreenForm button")
        .setAttribute("disabled", true);

      let validName = name !== "" && name.length >= 3;
      let validEmail = email !== "" && email.length >= 5;

      if (validName && validEmail) {
        axios.post("/new/user", { name, email }).then(res => {
          console.log(res);
          document.querySelector("#registerScreen").style.display = "none";
          document.querySelector("#main").style.display = "block";

          chat.myChannel = pusher.subscribe("private-" + res.data.email);
          chat.myChannel.bind("client-" + chat.email, data => {
            helpers.displayChatMessage(data);
          });
        });
      } else {
        alert("Enter a valid name and email.");
      }

      evt.preventDefault();
    }
  };

  publicChannel.bind("new-user", data => {
    if (data.email != chat.email) {
      chat.subscribedChannels.push(pusher.subscribe("private-" + data.email));
      chat.subscribedUsers.push(data);

      document.querySelector("#rooms").innerHTML = "";

      chat.subscribedUsers.forEach((user, index) => {
        document
          .querySelector("#rooms")
          .append(
            `<li class="nav-item"><a data-room-id="${user.email}" data-user-name="${user.name}" data-channel-id="${index}" class="nav-link" href="#">${user.name}</a></li>`
          );
      });
    }
  });

  chatReplyMessage.addEventListener("submit", helpers.replyMessage);
  chatRoomsList.addEventListener("click", "li", helpers.loadChatRoom);
  document
    .querySelector("#loginScreenForm")
    .addEventListener("submit", helpers.LogIntoChatSession);
})();
