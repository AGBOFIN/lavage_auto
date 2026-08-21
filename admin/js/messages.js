document.addEventListener("DOMContentLoaded", function () {

    const conversationItems =
        document.querySelectorAll(".conversation-item");

    const conversationSearch =
        document.getElementById("conversationSearch");

    const messagesArea =
        document.getElementById("messagesArea");

    const messageForm =
        document.getElementById("messageForm");

    const messageInput =
        document.getElementById("messageInput");

    const attachmentBtn =
        document.getElementById("attachmentBtn");

    const fileInput =
        document.getElementById("fileInput");

    const attachmentPreview =
        document.getElementById("attachmentPreview");

    const attachmentName =
        document.getElementById("attachmentName");

    const removeAttachment =
        document.getElementById("removeAttachment");

    const emojiBtn =
    const navbarUnread =
    conversationItems.forEach(function (item) {
            conversationItems.forEach(function (conversation) {




                this.dataset.name;
                "chatTitle"


            /* Supprimer le compteur */

            const unread =

            if (unread) {

                unread.remove();
            }


            updateUnreadCount();

        });

    });


    /* =====================================================
       RECHERCHE CONVERSATIONS
    ===================================================== */

    conversationSearch.addEventListener(
        "input",
        function () {

            const search =
                this.value.toLowerCase().trim();


            conversationItems.forEach(function (item) {

                const name =
                    item.dataset.name.toLowerCase();


                if (name.includes(search)) {

                    item.style.display = "flex";

                } else {

                    item.style.display = "none";

                }

            });

        }
    );


    /* =====================================================
       ENVOYER MESSAGE
    ===================================================== */

    messageForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const message =
                messageInput.value.trim();


            if (!message) {

                return;

            }


            addMessage(
                message,
                "sent"
            );


            messageInput.value = "";

            messageInput.style.height = "42px";


            scrollMessages();


            /*
             * Simulation d'une réponse du support.
             * À remplacer plus tard par le backend.
             */

            setTimeout(function () {

                addMessage(
                    "Merci pour votre message. Notre équipe va vous répondre rapidement.",
                    "received"
                );

                scrollMessages();

            }, 1200);

        }
    );


    /* =====================================================
       AJOUTER MESSAGE
    ===================================================== */

    function addMessage(
        text,
        type
    ) {

        const row =
            document.createElement("div");

        row.className =
            "message-row " + type;


        const currentTime =
            new Date().toLocaleTimeString(
                "fr-FR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );


        if (type === "received") {

            row.innerHTML = `

                <div class="message-avatar">
                    <i class="bi bi-headset"></i>
                </div>

                <div>

                    <div class="message-bubble">
                        ${escapeHtml(text)}
                    </div>

                    <div class="message-time">
                        ${currentTime}
                    </div>

                </div>

            `;

        } else {

            row.innerHTML = `

                <div>

                    <div class="message-bubble">
                        ${escapeHtml(text)}
                    </div>

                    <div class="message-time">

                        ${currentTime}

                        <i class="bi bi-check2-all"></i>

                    </div>

                </div>

            `;

        }


        messagesArea.appendChild(row);

    }


    /* =====================================================
       PROTECTION HTML
    ===================================================== */

    function escapeHtml(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;

    }


    /* =====================================================
       SCROLL
    ===================================================== */

    function scrollMessages() {

        messagesArea.scrollTop =
            messagesArea.scrollHeight;

    }


    /* =====================================================
       AUTO HEIGHT TEXTAREA
    ===================================================== */

    messageInput.addEventListener(
        "input",
        function () {

            this.style.height = "42px";

            this.style.height =
                Math.min(
                    this.scrollHeight,
                    120
                ) + "px";

        }
    );


    /* =====================================================
       PIECE JOINTE
    ===================================================== */

    attachmentBtn.addEventListener(
        "click",
        function () {

            fileInput.click();

        }
    );


    fileInput.addEventListener(
        "change",
        function () {

            if (!this.files.length) {

                return;

            }


            const file =
                this.files[0];

            attachmentName.textContent =
                file.name;

            attachmentPreview.classList.remove(
                "d-none"
            );

        }
    );


    removeAttachment.addEventListener(
        "click",
        function () {

            fileInput.value = "";

            attachmentPreview.classList.add(
                "d-none"
            );

        }
    );


    /* =====================================================
       EMOJI
    ===================================================== */

    emojiBtn.addEventListener(
        "click",
        function () {

            const emojis =
                [
                    "😊",
                    "👍",
                    "🚗",
                    "✨",
                    "🙏"
                ];

            const randomEmoji =
                emojis[
                    Math.floor(
                        Math.random() *
                        emojis.length
                    )
                ];

            messageInput.value +=
                randomEmoji;

            messageInput.focus();

        }
    );


    /* =====================================================
       NOUVELLE CONVERSATION
    ===================================================== */

    newConversationBtn.addEventListener(
        "click",
        function () {

            newConversationModal.show();

        }
    );


    const newConversationForm =
        document.getElementById(
            "newConversationForm"
        );


    newConversationForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const subject =
                document.getElementById(
                    "conversationSubject"
                ).value;

            const initialMessage =
                document.getElementById(
                    "initialMessage"
                ).value.trim();


            if (!subject || !initialMessage) {

                return;

            }


            /*
             * Pour l'instant nous simulons
             * la création de la conversation.
             */

            alert(
                "Votre conversation « " +
                subject +
                " » a été créée."
            );


            newConversationForm.reset();

            newConversationModal.hide();

        }
    );


    /* =====================================================
       COMPTEUR MESSAGES NON LUS
    ===================================================== */

    function updateUnreadCount() {

        const unreadElements =
            document.querySelectorAll(
                ".unread-count"
            );


        let total = 0;


        unreadElements.forEach(function (element) {

            total +=
                parseInt(
                    element.textContent
                ) || 0;

        });


        if (navbarUnread) {

            navbarUnread.textContent =
                total;

            navbarUnread.style.display =
                total > 0
                    ? "inline-block"
                    : "none";

        }

    }


    /* =====================================================
       BOUTON RECHERCHE MESSAGES
    ===================================================== */

    document
        .getElementById("searchMessagesBtn")
        .addEventListener(
            "click",
            function () {

                messageInput.focus();

            }
        );


    /* =====================================================
       INFORMATIONS CONVERSATION
    ===================================================== */

    document
        .getElementById("chatInfoBtn")
        .addEventListener(
            "click",
            function () {

                alert(
                    "Conversation avec le support Bidè."
                );

            }
        );


    updateUnreadCount();

    scrollMessages();

});
                this.querySelector(".unread-count");
            ).textContent = conversationName;

            document.getElementById(
            const conversationName =
            this.classList.add("active");

            });
                conversation.classList.remove("active");

        item.addEventListener("click", function () {

    /* =====================================================
       SELECTION CONVERSATION
    ===================================================== */

    const newConversationBtn =
    const newConversationModal =
        new bootstrap.Modal(
            document.getElementById(
                "newConversationModal"
            )
        );


        document.getElementById("newConversationBtn");

        document.getElementById("navbarUnread");

        document.getElementById("emojiBtn");
