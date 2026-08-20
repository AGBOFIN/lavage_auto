"use strict";

/* ==========================================================
   BIDÈ — GESTION CLIENTS
   ========================================================== */

const CLIENT_STORAGE_KEY = "bide_clients";

const ITEMS_PER_PAGE = 8;

let clients = [];

let currentPage = 1;

let editingClientId = null;


/* ==========================================================
   DOM
   ========================================================== */

const elements = {

    sidebar:
        document.getElementById("sidebar"),

    sidebarOverlay:
        document.getElementById("sidebarOverlay"),

    menuToggle:
        document.getElementById("menuToggle"),

    sidebarClose:
        document.getElementById("sidebarClose"),

    currentDate:
        document.getElementById("currentDate"),

    notificationBtn:
        document.getElementById("notificationBtn"),

    notificationBadge:
        document.getElementById("notificationBadge"),

    addClientButton:
        document.getElementById("addClientButton"),

    clientForm:
        document.getElementById("clientForm"),

    clientModal:
        document.getElementById("clientModal"),

    detailsModal:
        document.getElementById("detailsModal"),

    modalTitle:
        document.getElementById("modalTitle"),

    clientId:
        document.getElementById("clientId"),

    firstName:
        document.getElementById("firstName"),

    lastName:
        document.getElementById("lastName"),

    phone:
        document.getElementById("phone"),

    email:
        document.getElementById("email"),

    address:
        document.getElementById("address"),

    status:
        document.getElementById("status"),

    saveClientButton:
        document.getElementById("saveClientButton"),

    searchInput:
        document.getElementById("searchInput"),

    statusFilter:
        document.getElementById("statusFilter"),

    clientsTableBody:
        document.getElementById("clientsTableBody"),

    emptyState:
        document.getElementById("emptyState"),

    resultCount:
        document.getElementById("resultCount"),

    paginationInfo:
        document.getElementById("paginationInfo"),

    pagination:
        document.getElementById("pagination"),

    totalClients:
        document.getElementById("totalClients"),

    activeClients:
        document.getElementById("activeClients"),

    newClients:
        document.getElementById("newClients"),

    clientDetails:
        document.getElementById("clientDetails"),

    clientToast:
        document.getElementById("clientToast"),

    toastMessage:
        document.getElementById("toastMessage")

};


/* ==========================================================
   INITIALISATION
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    init
);


function init() {

    initializeClients();

    initializeSidebar();

    initializeDate();

    initializeEvents();

    updateStatistics();

    renderClients();

}


/* ==========================================================
   DONNÉES INITIALES
   ========================================================== */

function initializeClients() {

    const stored =
        localStorage.getItem(
            CLIENT_STORAGE_KEY
        );


    if (stored) {

        try {

            clients =
                JSON.parse(stored);

            if (!Array.isArray(clients)) {
                clients = [];
            }

        } catch (error) {

            console.error(
                "Erreur de lecture des clients.",
                error
            );

            clients = [];

        }

    }


    if (clients.length === 0) {

        clients = createDemoClients();

        saveClients();

    }

}


/* ==========================================================
   CLIENTS DE DÉMONSTRATION
   ========================================================== */

function createDemoClients() {

    const today =
        new Date();


    return [

        {
            id: generateId(),

            firstName: "Kossi",

            lastName: "Mensah",

            phone: "90 11 22 33",

            email: "kossi.mensah@email.com",

            address: "Lomé, Togo",

            vehicles: 2,

            status: "active",

            createdAt:
                formatDate(today)

        },


        {
            id: generateId(),

            firstName: "Afi",

            lastName: "Amouzou",

            phone: "91 44 55 66",

            email: "afi.amouzou@email.com",

            address: "Agoè, Lomé",

            vehicles: 1,

            status: "active",

            createdAt:
                formatDate(today)

        },


        {
            id: generateId(),

            firstName: "Komlan",

            lastName: "Kouassi",

            phone: "92 33 44 55",

            email: "komlan.k@email.com",

            address: "Bè, Lomé",

            vehicles: 3,

            status: "inactive",

            createdAt:
                formatDate(today)

        },


        {
            id: generateId(),

            firstName: "Ama",

            lastName: "Adjei",

            phone: "98 22 11 00",

            email: "ama.adjei@email.com",

            address: "Tokoin, Lomé",

            vehicles: 1,

            status: "active",

            createdAt:
                formatDate(today)

        }

    ];

}


/* ==========================================================
   EVENTS
   ========================================================== */

function initializeEvents() {

    elements.addClientButton
        .addEventListener(
            "click",
            openCreateModal
        );


    elements.clientForm
        .addEventListener(
            "submit",
            handleFormSubmit
        );


    elements.searchInput
        .addEventListener(
            "input",
            function () {

                currentPage = 1;

                renderClients();

            }
        );


    elements.statusFilter
        .addEventListener(
            "change",
            function () {

                currentPage = 1;

                renderClients();

            }
        );


    elements.notificationBtn
        .addEventListener(
            "click",
            handleNotification
        );

}


/* ==========================================================
   SIDEBAR
   ========================================================== */

function initializeSidebar() {

    elements.menuToggle
        .addEventListener(
            "click",
            openSidebar
        );


    elements.sidebarClose
        .addEventListener(
            "click",
            closeSidebar
        );


    elements.sidebarOverlay
        .addEventListener(
            "click",
            closeSidebar
        );


    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeSidebar();

            }

        }
    );

}


function openSidebar() {

    elements.sidebar.classList.add(
        "open"
    );

    elements.sidebarOverlay.classList.add(
        "active"
    );

}


function closeSidebar() {

    elements.sidebar.classList.remove(
        "open"
    );

    elements.sidebarOverlay.classList.remove(
        "active"
    );

}


/* ==========================================================
   DATE
   ========================================================== */

function initializeDate() {

    const date =
        new Intl.DateTimeFormat(
            "fr-FR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        ).format(new Date());


    elements.currentDate.textContent =
        date.charAt(0).toUpperCase()
        + date.slice(1);

}


/* ==========================================================
   SAUVEGARDE
   ========================================================== */

function saveClients() {

    localStorage.setItem(
        CLIENT_STORAGE_KEY,
        JSON.stringify(clients)
    );

}


/* ==========================================================
   FILTRAGE
   ========================================================== */

function getFilteredClients() {

    const search =
        elements.searchInput
            .value
            .trim()
            .toLowerCase();


    const status =
        elements.statusFilter.value;


    return clients.filter(
        function (client) {

            const fullName =
                `${client.firstName} ${client.lastName}`
                    .toLowerCase();


            const matchesSearch =
                !search
                ||
                fullName.includes(search)
                ||
                client.phone
                    .toLowerCase()
                    .includes(search)
                ||
                (
                    client.email &&
                    client.email
                        .toLowerCase()
                        .includes(search)
                );


            const matchesStatus =
                status === "all"
                ||
                client.status === status;


            return (
                matchesSearch &&
                matchesStatus
            );

        }
    );

}


/* ==========================================================
   AFFICHAGE CLIENTS
   ========================================================== */

function renderClients() {

    const filtered =
        getFilteredClients();


    const total =
        filtered.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total / ITEMS_PER_PAGE
            )
        );


    if (currentPage > totalPages) {
        currentPage = totalPages;
    }


    const start =
        (currentPage - 1)
        * ITEMS_PER_PAGE;


    const end =
        start + ITEMS_PER_PAGE;


    const pageClients =
        filtered.slice(
            start,
            end
        );


    elements.clientsTableBody.innerHTML =
        "";


    if (pageClients.length === 0) {

        elements.emptyState
            .classList
            .remove("d-none");

    } else {

        elements.emptyState
            .classList
            .add("d-none");


        pageClients.forEach(
            renderClientRow
        );

    }


    elements.resultCount.textContent =
        `${total} client${total > 1 ? "s" : ""}`;


    updatePagination(
        total,
        start,
        end,
        totalPages
    );

}


/* ==========================================================
   LIGNE CLIENT
   ========================================================== */

function renderClientRow(client) {

    const row =
        document.createElement("tr");


    const initials =
        getInitials(
            client.firstName,
            client.lastName
        );


    const statusLabel =
        client.status === "active"
            ? "Actif"
            : "Inactif";


    row.innerHTML = `

        <td>

            <div class="client-name">

                <div class="client-avatar">
                    ${escapeHtml(initials)}
                </div>

                <div>

                    <strong>
                        ${escapeHtml(
                            client.firstName
                        )}
                        ${escapeHtml(
                            client.lastName
                        )}
                    </strong>

                    <small>
                        ID :
                        ${escapeHtml(client.id)}
                    </small>

                </div>

            </div>

        </td>


        <td>
            ${escapeHtml(client.phone)}
        </td>


        <td>
            ${escapeHtml(client.email || "—")}
        </td>


        <td>
            ${Number(client.vehicles) || 0}
        </td>


        <td>

            <span class="status ${client.status}">
                ${statusLabel}
            </span>

        </td>


        <td>
            ${escapeHtml(client.createdAt)}
        </td>


        <td>

            <div class="table-actions">

                <button
                    type="button"
                    class="action-btn"
                    title="Voir"
                    data-action="view"
                    data-id="${client.id}"
                >
                    <i class="bi bi-eye"></i>
                </button>


                <button
                    type="button"
                    class="action-btn"
                    title="Modifier"
                    data-action="edit"
                    data-id="${client.id}"
                >
                    <i class="bi bi-pencil"></i>
                </button>


                <button
                    type="button"
                    class="action-btn delete"
                    title="Supprimer"
                    data-action="delete"
                    data-id="${client.id}"
                >
                    <i class="bi bi-trash"></i>
                </button>

            </div>

        </td>

    `;


    row
        .querySelectorAll("[data-action]")
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        handleClientAction(
                            button.dataset.action,
                            button.dataset.id
                        );

                    }
                );

            }
        );


    elements.clientsTableBody.appendChild(
        row
    );

}


/* ==========================================================
   ACTION CLIENT
   ========================================================== */

function handleClientAction(
    action,
    id
) {

    const client =
        clients.find(
            function (item) {
                return item.id === id;
            }
        );


    if (!client) {

        showToast(
            "Client introuvable."
        );

        return;

    }


    if (action === "view") {

        showClientDetails(client);

    }


    if (action === "edit") {

        openEditModal(client);

    }


    if (action === "delete") {

        deleteClient(client);

    }

}


/* ==========================================================
   AJOUT
   ========================================================== */

function openCreateModal() {

    editingClientId = null;


    elements.clientForm.reset();


    elements.clientId.value =
        "";


    elements.status.value =
        "active";


    elements.modalTitle.textContent =
        "Nouveau client";


    elements.saveClientButton.innerHTML = `
        <i class="bi bi-check-lg"></i>
        Enregistrer
    `;


    elements.clientForm.classList.remove(
        "was-validated"
    );


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            elements.clientModal
        );


    modal.show();

}


/* ==========================================================
   MODIFICATION
   ========================================================== */

function openEditModal(client) {

    editingClientId =
        client.id;


    elements.clientId.value =


    elements.firstName.value =
        client.firstName;



    elements.lastName.value =
        client.lastName;



    elements.phone.value =
        client.phone;



    elements.email.value =

        client.email || "";



    elements.address.value =
        client.address || "";



    elements.status.value =
        client.status;


    elements.modalTitle.textContent =
        "Modifier le client";



    elements.saveClientButton.innerHTML = `
        <i class="bi bi-check-lg"></i>
        Enregistrer les modifications
    `;


    elements.clientForm.classList.remove(
        "was-validated"
    );



    const modal =
        bootstrap.Modal.getOrCreateInstance(
            elements.clientModal
        );


    modal.show();

}


/* ==========================================================
   FORMULAIRE
   ========================================================== */

function handleFormSubmit(event) {

    event.preventDefault();


    if (
        !elements.clientForm.checkValidity()
    ) {

        event.stopPropagation();

        elements.clientForm.classList.add(
            "was-validated"
        );

        return;

    }


    const firstName =
        elements.firstName.value.trim();


    const lastName =
        elements.lastName.value.trim();


    const phone =
        elements.phone.value.trim();


    const email =
        elements.email.value.trim();


    if (!isValidPhone(phone)) {

        elements.phone.classList.add(
            "is-invalid"
        );

        return;

    }


    if (
        email &&
        !isValidEmail(email)
    ) {

        elements.email.classList.add(
            "is-invalid"
        );

        return;

    }


    elements.phone.classList.remove(
        "is-invalid"
    );


    elements.email.classList.remove(
        "is-invalid"
    );


    if (editingClientId) {

        updateClient({

            id: editingClientId,

            firstName,

            lastName,

            phone,

            email,

            address:
                elements.address.value.trim(),

            status:
                elements.status.value

        });

    } else {

        createClient({

            firstName,

            lastName,

            phone,

            email,

            address:
                elements.address.value.trim(),

            status:
                elements.status.value

        });

    }

}


/* ==========================================================
   CRÉER
   ========================================================== */

function createClient(data) {

    const newClient = {

        id: generateId(),

        firstName: data.firstName,

        lastName: data.lastName,

        phone: data.phone,

        email: data.email,

        address: data.address,

        vehicles: 0,


        status: data.status,

        createdAt:
            formatDate(new Date())


    };


    clients.unshift(

        newClient
    );



    saveClients();



    closeClientModal();



    currentPage = 1;


    updateStatistics();


    renderClients();



    showToast(
        "Le client a été enregistré avec succès."

    );


}



/* ==========================================================

   MODIFIER

   ========================================================== */

function updateClient(data) {


    const index =

        clients.findIndex(
            function (client) {
                return client.id === data.id;

            }

        );


    if (index === -1) {


        showToast(
            "Impossible de modifier ce client."
        );

        return;

    }


    clients[index] = {

        ...clients[index],

        firstName: data.firstName,

        lastName: data.lastName,

        phone: data.phone,

        email: data.email,

        address: data.address,

        status: data.status

    };


    saveClients();


    closeClientModal();


    updateStatistics();

    renderClients();


    showToast(
        "Les informations du client ont été mises à jour."
    );

}


/* ==========================================================
   SUPPRIMER
   ========================================================== */

function deleteClient(client) {

    const confirmed =
        window.confirm(
            `Voulez-vous vraiment supprimer ${client.firstName} ${client.lastName} ?`
        );


    if (!confirmed) {
        return;
    }


    clients =
        clients.filter(
            function (item) {
                return item.id !== client.id;
            }
        );


    saveClients();


    updateStatistics();

    renderClients();


    showToast(
        "Le client a été supprimé."
    );

}


/* ==========================================================
   DETAILS
   ========================================================== */

function showClientDetails(client) {

    const initials =
        getInitials(
            client.firstName,
            client.lastName
        );


    const status =
        client.status === "active"
            ? "Actif"
            : "Inactif";


    elements.clientDetails.innerHTML = `

        <div class="detail-profile">

            <div class="detail-avatar">
                ${escapeHtml(initials)}
            </div>

            <div>

                <h4>
                    ${escapeHtml(client.firstName)}
                    ${escapeHtml(client.lastName)}
                </h4>

                <span>
                    Client ${escapeHtml(client.id)}
                </span>

            </div>

        </div>


        <div class="detail-row">

            <span>
                Téléphone
            </span>

            <strong>
                ${escapeHtml(client.phone)}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Email
            </span>

            <strong>
                ${escapeHtml(client.email || "Non renseigné")}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Adresse
            </span>

            <strong>
                ${escapeHtml(client.address || "Non renseignée")}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Véhicules
            </span>

            <strong>
                ${Number(client.vehicles) || 0}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Statut
            </span>

            <strong>
                ${status}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Date d'inscription
            </span>

            <strong>
                ${escapeHtml(client.createdAt)}
            </strong>

        </div>

    `;


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            elements.detailsModal
        );


    modal.show();

}


/* ==========================================================
   FERMER MODAL
   ========================================================== */

function closeClientModal() {

    const modal =
        bootstrap.Modal.getInstance(
            elements.clientModal
        );


    if (modal) {
        modal.hide();
    }

}


/* ==========================================================
   STATISTIQUES
   ========================================================== */

function updateStatistics() {

    const total =
        clients.length;


    const active =
        clients.filter(
            client =>
                client.status === "active"
        ).length;


    const today =
        formatDate(new Date());


    const newClients =
        clients.filter(
            client =>
                client.createdAt === today
        ).length;


    elements.totalClients.textContent =
        total;


    elements.activeClients.textContent =
        active;


    elements.newClients.textContent =
        newClients;

}


/* ==========================================================
   PAGINATION
   ========================================================== */

function updatePagination(
    total,
    start,
    end,
    totalPages
) {

    if (total === 0) {

        elements.paginationInfo.textContent =
            "Aucun résultat";

    } else {

        elements.paginationInfo.textContent =
            `Affichage ${start + 1}-${Math.min(end, total)} sur ${total}`;

    }


    elements.pagination.innerHTML =
        "";


    if (totalPages <= 1) {
        return;
    }


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement("button");


        button.type =
            "button";


        button.className =
            "page-btn";


        if (page === currentPage) {

            button.classList.add(
                "active"
            );

        }


        button.textContent =
            page;


        button.addEventListener(
            "click",
            function () {

                currentPage =
                    page;

                renderClients();

            }
        );


        elements.pagination.appendChild(
            button
        );

    }

}


/* ==========================================================
   NOTIFICATION
   ========================================================== */

function handleNotification() {

    elements.notificationBadge.style.display =
        "none";


    showToast(
        "Toutes les notifications ont été consultées."
    );

}


/* ==========================================================
   ID
   ========================================================== */

function generateId() {

    return (
        "CL-"
        +
        Date.now().toString(36).toUpperCase()
        +
        "-"
        +
        Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase()
    );

}


/* ==========================================================
   INITIALES
   ========================================================== */

function getInitials(
    firstName,
    lastName
) {

    return (
        firstName.charAt(0)
        +
        lastName.charAt(0)
    ).toUpperCase();

}


/* ==========================================================
   DATE
   ========================================================== */

function formatDate(date) {

    return new Intl.DateTimeFormat(
        "fr-FR"
    ).format(date);

}


/* ==========================================================
   VALIDATION TÉLÉPHONE
   ========================================================== */

function isValidPhone(phone) {

    const cleaned =
        phone.replace(/\s+/g, "");


    return /^[0-9+()-]{8,15}$/.test(
        cleaned
    );

}


/* ==========================================================
   VALIDATION EMAIL
   ========================================================== */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


/* ==========================================================
   TOAST
   ========================================================== */

function showToast(message) {

    elements.toastMessage.textContent =
        message;


    const toast =
        bootstrap.Toast.getOrCreateInstance(
            elements.clientToast,
            {
                delay: 3500
            }
        );


    toast.show();

}


/* ==========================================================
   SÉCURISATION AFFICHAGE
   ========================================================== */

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
