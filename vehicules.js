"use strict";


/* ==========================================================
   CONFIGURATION
========================================================== */

const VEHICLE_STORAGE_KEY = "bide_vehicles";
const CLIENT_STORAGE_KEY = "bide_clients";

const ITEMS_PER_PAGE = 8;

let vehicles = [];
let clients = [];

let currentPage = 1;
let editingVehicleId = null;


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


    addVehicleButton:
        document.getElementById("addVehicleButton"),


    vehicleForm:
        document.getElementById("vehicleForm"),

    vehicleModal:
        document.getElementById("vehicleModal"),


    detailsModal:

        document.getElementById("detailsModal"),

    modalTitle:
        document.getElementById("modalTitle"),


    vehicleId:
        document.getElementById("vehicleId"),

    clientId:
        document.getElementById("clientId"),

    registration:
        document.getElementById("registration"),

    brand:
        document.getElementById("brand"),

    model:
        document.getElementById("model"),

    type:
        document.getElementById("type"),

    color:
        document.getElementById("color"),

    year:
        document.getElementById("year"),

    status:
        document.getElementById("status"),

    saveVehicleButton:
        document.getElementById("saveVehicleButton"),

    searchInput:
        document.getElementById("searchInput"),

    typeFilter:
        document.getElementById("typeFilter"),

    statusFilter:
        document.getElementById("statusFilter"),

    vehiclesTableBody:
        document.getElementById("vehiclesTableBody"),

    emptyState:
        document.getElementById("emptyState"),

    resultCount:
        document.getElementById("resultCount"),

    paginationInfo:
        document.getElementById("paginationInfo"),

    pagination:
        document.getElementById("pagination"),

    totalVehicles:
        document.getElementById("totalVehicles"),

    activeVehicles:
        document.getElementById("activeVehicles"),

    vehicleTypes:
        document.getElementById("vehicleTypes"),

    vehicleDetails:
        document.getElementById("vehicleDetails"),

    vehicleToast:
        document.getElementById("vehicleToast"),

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

    loadClients();

    loadVehicles();

    initializeSidebar();

    initializeDate();

    initializeEvents();

    populateClientSelect();

    updateStatistics();

    renderVehicles();

}


/* ==========================================================
   CLIENTS
========================================================== */

function loadClients() {

    const stored =
        localStorage.getItem(
            CLIENT_STORAGE_KEY
        );


    if (!stored) {

        clients = [];

        return;

    }


    try {

        const parsed =
            JSON.parse(stored);


        clients =
            Array.isArray(parsed)
                ? parsed
                : [];

    } catch (error) {

        console.error(
            "Impossible de charger les clients.",
            error
        );

        clients = [];

    }

}


/* ==========================================================
   VÉHICULES
========================================================== */

function loadVehicles() {

    const stored =
        localStorage.getItem(
            VEHICLE_STORAGE_KEY
        );


    if (stored) {

        try {

            const parsed =
                JSON.parse(stored);


            vehicles =
                Array.isArray(parsed)
                    ? parsed
                    : [];

        } catch (error) {

            console.error(
                "Erreur de lecture des véhicules.",
                error
            );

            vehicles = [];

        }

    }


    if (vehicles.length === 0 && clients.length > 0) {

        vehicles =
            createDemoVehicles();


        saveVehicles();

    }

}


function createDemoVehicles() {

    const result = [];


    if (clients[0]) {

        result.push({

            id: generateId(),

            clientId:
                clients[0].id,

            registration:
                "TG-1234-AB",

            brand:
                "Toyota",

            model:
                "Corolla",

            type:
                "berline",

            color:
                "Noir",

            year:
                2023,

            status:
                "active",

            createdAt:
                formatDate(new Date())

        });

    }


    if (clients[1]) {

        result.push({

            id: generateId(),

            clientId:
                clients[1].id,

            registration:
                "TG-5678-CD",

            brand:
                "Peugeot",

            model:
                "208",

            type:
                "berline",

            color:
                "Blanc",

            year:
                2022,

            status:
                "active",

            createdAt:
                formatDate(new Date())

        });

    }


    return result;

}


/* ==========================================================
   SAUVEGARDE
========================================================== */

function saveVehicles() {

    localStorage.setItem(
        VEHICLE_STORAGE_KEY,
        JSON.stringify(vehicles)
    );

}


/* ==========================================================
   EVENTS
========================================================== */

function initializeEvents() {

    elements.addVehicleButton
        .addEventListener(
            "click",
            openCreateModal
        );


    elements.vehicleForm
        .addEventListener(
            "submit",
            handleFormSubmit
        );


    elements.searchInput
        .addEventListener(
            "input",
            resetAndRender
        );


    elements.typeFilter
        .addEventListener(
            "change",
            resetAndRender
        );


    elements.statusFilter
        .addEventListener(
            "change",
            resetAndRender
        );


    elements.notificationBtn
        .addEventListener(
            "click",
            function () {

                elements.notificationBadge.style.display =
                    "none";


                showToast(
                    "Notifications consultées."
                );

            }
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
   CLIENTS DANS SELECT
========================================================== */

function populateClientSelect(
    selectedId = ""
) {

    elements.clientId.innerHTML = `
        <option value="">
            Sélectionner un client
        </option>
    `;


    clients.forEach(
        function (client) {

            const option =
                document.createElement("option");


            option.value =
                client.id;


            option.textContent =
                `${client.firstName} ${client.lastName}`;


            if (client.id === selectedId) {

                option.selected = true;

            }


            elements.clientId.appendChild(
                option
            );

        }
    );


    if (clients.length === 0) {

        elements.clientId.innerHTML = `
            <option value="">
                Aucun client disponible
            </option>
        `;

    }

}


/* ==========================================================
   RECHERCHE / FILTRES
========================================================== */

function resetAndRender() {

    currentPage = 1;

    renderVehicles();

}


function getFilteredVehicles() {

    const search =
        elements.searchInput
            .value
            .trim()
            .toLowerCase();


    const type =
        elements.typeFilter.value;


    const status =
        elements.statusFilter.value;


    return vehicles.filter(
        function (vehicle) {

            const client =
                getClient(vehicle.clientId);


            const ownerName =
                client
                    ? `${client.firstName} ${client.lastName}`
                    : "";


            const vehicleName =
                `${vehicle.brand} ${vehicle.model}`
                    .toLowerCase();


            const matchesSearch =
                !search
                ||
                vehicleName.includes(search)
                ||
                vehicle.registration
                    .toLowerCase()
                    .includes(search)
                ||
                ownerName
                    .toLowerCase()
                    .includes(search);


            const matchesType =
                type === "all"
                ||
                vehicle.type === type;


            const matchesStatus =
                status === "all"
                ||
                vehicle.status === status;


            return (
                matchesSearch
                &&
                matchesType
                &&
                matchesStatus
            );

        }
    );

}


/* ==========================================================
   RENDU
========================================================== */

function renderVehicles() {

    const filtered =
        getFilteredVehicles();


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

        currentPage =
            totalPages;

    }


    const start =
        (currentPage - 1)
        * ITEMS_PER_PAGE;


    const end =
        start + ITEMS_PER_PAGE;


    const pageVehicles =
        filtered.slice(
            start,
            end
        );


    elements.vehiclesTableBody.innerHTML =
        "";


    if (pageVehicles.length === 0) {

        elements.emptyState
            .classList
            .remove("d-none");

    } else {

        elements.emptyState
            .classList
            .add("d-none");


        pageVehicles.forEach(
            renderVehicleRow
        );

    }


    elements.resultCount.textContent =
        `${total} véhicule${total > 1 ? "s" : ""}`;


    updatePagination(
        total,
        start,
        end,
        totalPages
    );

}


/* ==========================================================
   LIGNE
========================================================== */

function renderVehicleRow(vehicle) {

    const client =
        getClient(vehicle.clientId);


    const ownerName =
        client
            ? `${client.firstName} ${client.lastName}`
            : "Client supprimé";


    const typeLabel =
        getTypeLabel(vehicle.type);


    const statusLabel =
        vehicle.status === "active"
            ? "Actif"
            : "Inactif";


    const row =
        document.createElement("tr");


    row.innerHTML = `

        <td>

            <div class="vehicle-name">

                <div class="vehicle-icon">

                    <i class="bi bi-car-front-fill"></i>

                </div>

                <div>

                    <strong>
                        ${escapeHtml(vehicle.brand)}
                        ${escapeHtml(vehicle.model)}
                    </strong>

                    <small>
                        ${vehicle.year || "Année inconnue"}
                    </small>

                </div>

            </div>

        </td>


        <td>

            <div class="owner-name">

                <strong>
                    ${escapeHtml(ownerName)}
                </strong>

                <small>
                    ${client
                        ? escapeHtml(client.phone || "")
                        : "—"}
                </small>

            </div>

        </td>


        <td>

            <span class="registration">
                ${escapeHtml(vehicle.registration)}
            </span>

        </td>


        <td>
            ${escapeHtml(typeLabel)}
        </td>


        <td>
            ${escapeHtml(vehicle.color || "—")}
        </td>


        <td>

            <span class="status ${vehicle.status}">
                ${statusLabel}
            </span>

        </td>


        <td>

            <div class="table-actions">

                <button
                    type="button"
                    class="action-btn"
                    title="Voir"
                    data-action="view"
                    data-id="${vehicle.id}"
                >
                    <i class="bi bi-eye"></i>
                </button>


                <button
                    type="button"
                    class="action-btn"
                    title="Modifier"
                    data-action="edit"
                    data-id="${vehicle.id}"
                >
                    <i class="bi bi-pencil"></i>
                </button>


                <button
                    type="button"
                    class="action-btn delete"
                    title="Supprimer"
                    data-action="delete"
                    data-id="${vehicle.id}"
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

                        handleVehicleAction(
                            button.dataset.action,
                            button.dataset.id
                        );

                    }
                );

            }
        );


    elements.vehiclesTableBody.appendChild(
        row
    );

}


/* ==========================================================
   ACTIONS
========================================================== */

function handleVehicleAction(
    action,
    id
) {

    const vehicle =
        vehicles.find(
            function (item) {
                return item.id === id;
            }
        );


    if (!vehicle) {

        showToast(
            "Véhicule introuvable."
        );

        return;

    }


    if (action === "view") {

        showVehicleDetails(vehicle);

    }


    if (action === "edit") {

        openEditModal(vehicle);

    }


    if (action === "delete") {

        deleteVehicle(vehicle);

    }

}


/* ==========================================================
   AJOUT
========================================================== */

function openCreateModal() {

    editingVehicleId = null;


    elements.vehicleForm.reset();


    elements.vehicleForm.classList.remove(
        "was-validated"
    );


    elements.vehicleId.value = "";


    elements.modalTitle.textContent =
        "Nouveau véhicule";


    elements.saveVehicleButton.innerHTML = `
        <i class="bi bi-check-lg"></i>
        Enregistrer
    `;


    populateClientSelect();


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            elements.vehicleModal
        );


    modal.show();

}


/* ==========================================================
   MODIFICATION
========================================================== */

function openEditModal(vehicle) {

    editingVehicleId =
        vehicle.id;


    elements.vehicleId.value =
        vehicle.id;


    populateClientSelect(
        vehicle.clientId
    );


    elements.registration.value =
        vehicle.registration;


    elements.brand.value =
        vehicle.brand;


    elements.model.value =
        vehicle.model;


    elements.type.value =
        vehicle.type;


    elements.color.value =
        vehicle.color || "";


    elements.year.value =
        vehicle.year || "";


    elements.status.value =
        vehicle.status;


    elements.modalTitle.textContent =
        "Modifier le véhicule";


    elements.saveVehicleButton.innerHTML = `
        <i class="bi bi-check-lg"></i>
        Enregistrer les modifications
    `;


    elements.vehicleForm.classList.remove(
        "was-validated"
    );


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            elements.vehicleModal
        );


    modal.show();

}


/* ==========================================================
   FORMULAIRE
========================================================== */

function handleFormSubmit(event) {

    event.preventDefault();


    if (
        !elements.vehicleForm.checkValidity()
    ) {

        event.stopPropagation();

        elements.vehicleForm.classList.add(
            "was-validated"
        );

        return;

    }


    if (clients.length === 0) {

        showToast(
            "Vous devez d'abord créer un client."
        );

        return;

    }


    const registration =
        elements.registration.value
            .trim()
            .toUpperCase();


    if (
        isRegistrationAlreadyUsed(
            registration,
            editingVehicleId
        )
    ) {

        elements.registration.classList.add(
            "is-invalid"
        );


        showToast(
            "Cette immatriculation est déjà utilisée."
        );


        return;

    }


    elements.registration.classList.remove(
        "is-invalid"
    );


    const data = {

        clientId:
            elements.clientId.value,

        registration,

        brand:
            elements.brand.value.trim(),

        model:
            elements.model.value.trim(),

        type:
            elements.type.value,

        color:
            elements.color.value.trim(),

        year:
            elements.year.value
                ? Number(elements.year.value)
                : null,

        status:
            elements.status.value

    };


    if (editingVehicleId) {

        updateVehicle(
            data
        );

    } else {

        createVehicle(
            data
        );

    }

}


/* ==========================================================
   CRÉER
========================================================== */

function createVehicle(data) {

    const vehicle = {

        id:
            generateId(),

        ...data,

        createdAt:
            formatDate(new Date())

    };


    vehicles.unshift(
        vehicle
    );


    saveVehicles();


    closeVehicleModal();


    updateStatistics();

    renderVehicles();


    showToast(
        "Le véhicule a été enregistré avec succès."
    );

}


/* ==========================================================
   MODIFIER
========================================================== */

function updateVehicle(data) {

    const index =
        vehicles.findIndex(
            function (vehicle) {
                return vehicle.id === editingVehicleId;
            }
        );


    if (index === -1) {

        showToast(
            "Véhicule introuvable."
        );

        return;

    }


    vehicles[index] = {

        ...vehicles[index],

        ...data

    };


    saveVehicles();


    closeVehicleModal();


    updateStatistics();

    renderVehicles();


    showToast(
        "Le véhicule a été modifié avec succès."
    );

}


/* ==========================================================
   SUPPRIMER
========================================================== */

function deleteVehicle(vehicle) {

    const confirmed =
        window.confirm(
            `Voulez-vous supprimer ${vehicle.brand} ${vehicle.model} (${vehicle.registration}) ?`
        );


    if (!confirmed) {
        return;
    }


    vehicles =
        vehicles.filter(
            function (item) {
                return item.id !== vehicle.id;
            }
        );


    saveVehicles();


    updateStatistics();

    renderVehicles();


    showToast(
        "Le véhicule a été supprimé."
    );

}


/* ==========================================================
   DETAILS
========================================================== */

function showVehicleDetails(vehicle) {

    const client =
        getClient(vehicle.clientId);


    const ownerName =
        client
            ? `${client.firstName} ${client.lastName}`
            : "Client supprimé";


    const status =
        vehicle.status === "active"
            ? "Actif"
            : "Inactif";


    elements.vehicleDetails.innerHTML = `

        <div class="detail-profile">

            <div class="detail-avatar">

                <i class="bi bi-car-front-fill"></i>

            </div>

            <div>

                <h4>
                    ${escapeHtml(vehicle.brand)}
                    ${escapeHtml(vehicle.model)}
                </h4>

                <span>
                    ${escapeHtml(vehicle.registration)}
                </span>

            </div>

        </div>


        <div class="detail-row">

            <span>
                Propriétaire
            </span>

            <strong>
                ${escapeHtml(ownerName)}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Immatriculation
            </span>

            <strong>
                ${escapeHtml(vehicle.registration)}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Marque
            </span>

            <strong>
                ${escapeHtml(vehicle.brand)}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Modèle
            </span>

            <strong>
                ${escapeHtml(vehicle.model)}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Type
            </span>

            <strong>
                ${escapeHtml(
                    getTypeLabel(vehicle.type)
                )}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Couleur
            </span>

            <strong>
                ${escapeHtml(vehicle.color || "Non renseignée")}
            </strong>

        </div>


        <div class="detail-row">

            <span>
                Année
            </span>

            <strong>
                ${vehicle.year || "Non renseignée"}
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

    `;


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            elements.detailsModal
        );


    modal.show();

}


/* ==========================================================
   STATISTIQUES
========================================================== */

function updateStatistics() {

    const total =
        vehicles.length;


    const active =
        vehicles.filter(
            vehicle =>
                vehicle.status === "active"
        ).length;


    const types =
        new Set(
            vehicles.map(
                vehicle =>
                    vehicle.type
            )
        );


    elements.totalVehicles.textContent =
        total;


    elements.activeVehicles.textContent =
        active;


    elements.vehicleTypes.textContent =
        types.size;

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


        button.textContent =
            page;


        if (page === currentPage) {

            button.classList.add(
                "active"
            );

        }


        button.addEventListener(
            "click",
            function () {

                currentPage =
                    page;

                renderVehicles();

            }
        );


        elements.pagination.appendChild(
            button
        );

    }

}


/* ==========================================================
   UTILITAIRES
========================================================== */

function getClient(clientId) {

    return clients.find(
        function (client) {
            return client.id === clientId;
        }
    );

}


function getTypeLabel(type) {

    const labels = {

        berline: "Berline",

        suv: "SUV",

        "4x4": "4x4",

        utilitaire: "Utilitaire",

        moto: "Moto",

        autre: "Autre"

    };


    return labels[type] || "Autre";

}


function isRegistrationAlreadyUsed(
    registration,
    currentId = null
) {

    const normalized =
        registration
            .replace(/\s+/g, "")
            .toUpperCase();


    return vehicles.some(
        function (vehicle) {

            const existing =
                vehicle.registration
                    .replace(/\s+/g, "")
                    .toUpperCase();


            return (
                existing === normalized
                &&
                vehicle.id !== currentId
            );

        }
    );

}


function generateId() {

    return (
        "VEH-"
        +
        Date.now()
            .toString(36)
            .toUpperCase()
        +
        "-"
        +
        Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase()
    );

}


function formatDate(date) {

    return new Intl.DateTimeFormat(
        "fr-FR"
    ).format(date);

}


function escapeHtml(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


function closeVehicleModal() {

    const modal =
        bootstrap.Modal.getInstance(
            elements.vehicleModal
        );


    if (modal) {
        modal.hide();
    }

}


function showToast(message) {

    elements.toastMessage.textContent =
        message;


    const toast =
        bootstrap.Toast.getOrCreateInstance(
            elements.vehicleToast,
            {
                delay: 3500
            }
        );


    toast.show();

}
