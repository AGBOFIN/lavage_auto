/* =====================================================
   BIDE Admin — Messagerie JavaScript
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* --- Éléments du DOM --- */
    var conversationItems = document.querySelectorAll(".conversation-item");
    var conversationSearch = document.getElementById("conversationSearch");
    var messagesArea = document.getElementById("messagesArea");
    var messageForm = document.getElementById("messageForm");
    var messageInput = document.getElementById("messageInput");
    var attachmentBtn = document.getElementById("attachmentBtn");
    var fileInput = document.getElementById("fileInput");
    var attachmentPreview = document.getElementById("attachmentPreview");
    var attachmentName = document.getElementById("attachmentName");
    var removeAttachment = document.getElementById("removeAttachment");
    var emojiBtn = document.getElementById("emojiBtn");
    var navbarUnread = document.getElementById("navbarUnread");
    var newConversationBtn = document.getElementById("newConversationBtn");
    var searchMessagesBtn = document.getElementById("searchMessagesBtn");
    var chatInfoBtn = document.getElementById("chatInfoBtn");

    var newConversationModal = new bootstrap.Modal(
        document.getElementById("newConversationModal")
    );


    /* =====================================================
       SÉLECTION CONVERSATION
    ===================================================== */

    conversationItems.forEach(function (item) {

        item.addEventListener("click", function () {

            /* Retirer l'active de toutes */
            conversationItems.forEach(function (conv) {
                conv.classList.remove("active");
            });

            /* Ajouter active à la cliquée */
            this.classList.add("active");

            /* Mettre à jour le titre du chat */
            var conversationName = this.dataset.name;
            document.getElementById("chatTitle").textContent = conversationName;

            /* Supprimer le compteur unread */
            var unread = this.querySelector(".unread-count");
            if (unread) {
                unread.remove();
            }

            updateUnreadCount();
        });

    });


    /* =====================================================
       RECHERCHE CONVERSATIONS
    ===================================================== */

    conversationSearch.addEventListener("input", function () {

        var search = this.value.toLowerCase().trim();

        conversationItems.forEach(function (item) {

            var name = item.dataset.name.toLowerCase();

            if (name.includes(search)) {
                item.style.display = "flex";
            } else {
                item.style.display = "none";
            }

        });

    });


    /* =====================================================
       ENVOYER MESSAGE
    ===================================================== */

    messageForm.addEventListener("submit", function (event) {

        event.preventDefault();

        var message = messageInput.value.trim();

        if (!message) {
            return;
        }

        addMessage(message, "sent");

        messageInput.value = "";
        messageInput.style.height = "42px";

        scrollMessages();

        /* Simulation d'une réponse du support */
        setTimeout(function () {
            addMessage(
                "Merci pour votre message. Notre équipe va vous répondre rapidement.",
                "received"
            );
            scrollMessages();
        }, 1200);

    });


    /* =====================================================
       AJOUTER MESSAGE
    ===================================================== */

    function addMessage(text, type) {

        var row = document.createElement("div");
        row.className = "message-row " + type;

        var currentTime = new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
        });

        if (type === "received") {
            row.innerHTML =
                '<div class="message-avatar"><i class="bi bi-headset"></i></div>' +
                '<div>' +
                    '<div class="message-bubble">' + escapeHtml(text) + '</div>' +
                    '<div class="message-time">' + currentTime + '</div>' +
                '</div>';
        } else {
            row.innerHTML =
                '<div>' +
                    '<div class="message-bubble">' + escapeHtml(text) + '</div>' +
                    '<div class="message-time">' + currentTime +
                        ' <i class="bi bi-check2-all"></i>' +
                    '</div>' +
                '</div>';
        }

        messagesArea.appendChild(row);
    }


    /* =====================================================
       PROTECTION HTML
    ===================================================== */

    function escapeHtml(text) {
        var div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }


    /* =====================================================
       SCROLL
    ===================================================== */

    function scrollMessages() {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }


    /* =====================================================
       AUTO HEIGHT TEXTAREA
    ===================================================== */

    messageInput.addEventListener("input", function () {
        this.style.height = "42px";
        this.style.height = Math.min(this.scrollHeight, 120) + "px";
    });


    /* =====================================================
       PIÈCE JOINTE
    ===================================================== */

    attachmentBtn.addEventListener("click", function () {
        fileInput.click();
    });

    fileInput.addEventListener("change", function () {
        if (!this.files.length) {
            return;
        }
        var file = this.files[0];
        attachmentName.textContent = file.name;
        attachmentPreview.classList.remove("d-none");
    });

    removeAttachment.addEventListener("click", function () {
        fileInput.value = "";
        attachmentPreview.classList.add("d-none");
    });


    /* =====================================================
       EMOJI
    ===================================================== */

    emojiBtn.addEventListener("click", function () {
        var emojis = ["😊", "👍", "🚗", "✨", "🙏"];
        var randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        messageInput.value += randomEmoji;
        messageInput.focus();
    });


    /* =====================================================
       NOUVELLE CONVERSATION
    ===================================================== */

    newConversationBtn.addEventListener("click", function () {
        newConversationModal.show();
    });

    var newConversationForm = document.getElementById("newConversationForm");

    newConversationForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var subject = document.getElementById("conversationSubject").value;
        var initialMessage = document.getElementById("initialMessage").value.trim();

        if (!subject || !initialMessage) {
            return;
        }

        /* Simulation de création */
        alert('Votre conversation « ' + subject + ' » a été créée.');

        newConversationForm.reset();
        newConversationModal.hide();
    });


    /* =====================================================
       COMPTEUR MESSAGES NON LUS
    ===================================================== */

    function updateUnreadCount() {
        var unreadElements = document.querySelectorAll(".unread-count");
        var total = 0;

        unreadElements.forEach(function (element) {
            total += parseInt(element.textContent) || 0;
        });

        if (navbarUnread) {
            navbarUnread.textContent = total;
            navbarUnread.style.display = total > 0 ? "inline-block" : "none";
        }
    }


    /* =====================================================
       BOUTON RECHERCHE MESSAGES
    ===================================================== */

    if (searchMessagesBtn) {
        searchMessagesBtn.addEventListener("click", function () {
            messageInput.focus();
        });
    }


    /* =====================================================
       INFORMATIONS CONVERSATION
    ===================================================== */

    if (chatInfoBtn) {
        chatInfoBtn.addEventListener("click", function () {
            alert("Conversation avec le support Bidè.");
        });
    }


    /* =====================================================
       INIT
    ===================================================== */

    updateUnreadCount();
    scrollMessages();

});
