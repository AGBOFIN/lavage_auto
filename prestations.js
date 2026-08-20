"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const STORAGE_KEY = "bide_prestations";

const ITEMS_PER_PAGE = 8;

let prestations = [];

let currentPage = 1;

let editingId = null;


/* =========================================================
   ELEMENTS
========================================================= */
const elements = {

    sidebar:
        document.getElementById("sidebar"),


    sidebarOverlay:
        document.getElementById("sidebarOverlay"),

    mobileMenuButton:
        document.getElementById("mobileMenuButton"),


    sidebarClose:
        document.getElementById("sidebarClose"),

    currentDate:
        document.getElementById("currentDate"),


    notificationButton:
        document.getElementById("notificationButton"),

    notificationCount:

        document.getElementById("notificationCount"),

    addButton:
        document.getElementById("addButton"),

    emptyAddButton:
        document.getElementById("emptyAddButton"),


    exportButton:
        document.getElementById("exportButton"),


    searchInput:
        document.getElementById("searchInput"),

    categoryFilter:
        document.getElementById("categoryFilter"),

    statusFilter:
        document.getElementById("statusFilter"),

    sortFilter:
        document.getElementById("sortFilter"),


    servicesTableBody:
        document.getElementById("servicesTableBody"),

    emptyState:
        document.getElementById("emptyState"),

    resultDescription:
        document.getElementById("resultDescription"),

    paginationText:
        document.getElementById("paginationText"),

    paginationContainer:
        document.getElementById("paginationContainer"),

    totalCount:
        document.getElementById("totalCount"),

    activeCount:
        document.getElementById("activeCount"),

    inactiveCount:
        document.getElementById("inactiveCount"),

    averagePrice:
        document.getElementById("averagePrice"),

    serviceModal:
        document.getElementById("serviceModal"),

    detailsModal:
        document.getElementById("detailsModal"),

    modalTitle:
        document.getElementById("modalTitle"),

    serviceForm:
        document.getElementById("serviceForm"),

    serviceId:
        document.getElementById("serviceId"),

    serviceName:
        document.getElementById("serviceName"),

    serviceDescription:
        document.getElementById("serviceDescription"),

    serviceCategory:
        document.getElementById("serviceCategory"),

    serviceDuration:
        document.getElementById("serviceDuration"),

    servicePrice:
        document.getElementById("servicePrice"),

    serviceStatus:
        document.getElementById("serviceStatus"),

    saveButton:
        document.getElementById("saveButton"),

    detailsContent:
        document.getElementById("detailsContent"),

    appToast:
        document.getElementById("appToast"),

    toastMessage:
        document.getElementById("toastMessage")

};


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


function init() {

    loadData();

    setCurrentDate();

    setupEvents();

    updateStatistics();

    render();

}


/* =========================================================
   DONNEES
========================================================= */

function loadData() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!saved) {

        prestations =
            createInitialData();

        saveData();

        return;

    }


    try {

        const parsed =
            JSON.parse(saved);


        if (Array.isArray(parsed)) {

            prestations = parsed;

        } else {

            prestations = [];

        }

    } catch (error) {

        console.error(
            "Impossible de lire les prestations :",
            error
        );

        prestations = [];

    }

}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(prestations)
    );

}


/* =========================================================
   DONNEES INITIALES
========================================================= */

function createInitialData() {

    return [

        createService(
            "Lavage extérieur",
            "Nettoyage complet de la carrosserie, des vitres et des jantes.",
            "exterieur",
            30,
            3000,
            "active"
        ),


        createService(
            "Nettoyage intérieur",
            "Aspiration complète et nettoyage du tableau de bord et des sièges.",
            "interieur",
            40,
            4000,
            "active"
        ),


        createService(
            "Lavage complet",
            "Nettoyage intérieur et extérieur complet du véhicule.",
            "complet",
            60,
            7000,
            "active"
        ),


        createService(
            "Formule Premium",
            "Lavage complet avec traitement premium de la carrosserie.",
            "premium",
            90,
            12000,
            "active"
        )

    ];

}


function createService(
    name,
    description,
    category,
    duration,
    price,
    status
) {

    return {

        id: generateId(),

        name: name,

        description: description,

        category: category,

        duration: Number(duration),

        price: Number(price),

        status: status,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    elements.mobileMenuButton.addEventListener(
        "click",
        openSidebar
    );


    elements.sidebarClose.addEventListener(
        "click",
        closeSidebar
    );


    elements.sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );


    elements.addButton.addEventListener(
        "click",
        openCreateModal
    );


    elements.emptyAddButton.addEventListener(
        "click",
        openCreateModal
    );


    elements.exportButton.addEventListener(
        "click",
        exportCSV
    );


    elements.notificationButton.addEventListener(
        "click",
        readNotifications
    );


    elements.searchInput.addEventListener(
        "input",
        function () {

            currentPage = 1;

            render();

        }
    );


    elements.categoryFilter.addEventListener(
        "change",
        function () {

            currentPage = 1;

            render();

        }
    );


    elements.statusFilter.addEventListener(
        "change",
        function () {

            currentPage = 1;

            render();

        }
    );


    elements.sortFilter.addEventListener(
        "change",
        function () {

            currentPage = 1;

            render();

        }
    );


    elements.serviceForm.addEventListener(
        "submit",
        handleSubmit
    );

}


/* =========================================================
   SIDEBAR
========================================================= */

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


/* =========================================================
   DATE
========================================================= */

function setCurrentDate() {

    const date =
        new Intl.DateTimeFormat(
            "fr-FR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        ).format(
            new Date()
        );


    elements.currentDate.textContent =
        capitalize(date);

}


/* =========================================================
   FILTRAGE
========================================================= */

function getFilteredData() {

    const search =
        elements.searchInput
            .value
            .trim()
            .toLowerCase();


    const category =
        elements.categoryFilter.value;


    const status =
        elements.statusFilter.value;


    let result =
        prestations.filter(
            function (service) {

                const searchMatch =
                    search === ""
                    ||
                    service.name
                        .toLowerCase()
                        .includes(search)
                    ||
                    service.description
                        .toLowerCase()
                        .includes(search);


                const categoryMatch =
                    category === "all"
                    ||
                    service.category === category;


                const statusMatch =
                    status === "all"
                    ||
                    service.status === status;


                return (
                    searchMatch
                    &&
                    categoryMatch
                    &&
                    statusMatch
                );

            }
        );


    result =
        sortData(
            result,
            elements.sortFilter.value
        );


    return result;

}


/* =========================================================
   TRI
========================================================= */

function sortData(
    data,
    sort
) {

    const sorted =
        [...data];


    switch (sort) {

        case "name-asc":

            sorted.sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name,
                        "fr"
                    )
            );

            break;


        case "name-desc":

            sorted.sort(
                (a, b) =>
                    b.name.localeCompare(
                        a.name,
                        "fr"
                    )
            );

            break;


        case "price-asc":

            sorted.sort(
                (a, b) =>
                    a.price - b.price
            );

            break;


        case "price-desc":

            sorted.sort(
                (a, b) =>
                    b.price - a.price
            );

            break;


        case "recent":

        default:

            sorted.sort(
                (a, b) =>
                    new Date(b.createdAt)
                    -
                    new Date(a.createdAt)
            );

            break;

    }


    return sorted;

}


/* =========================================================
   RENDU
========================================================= */

function render() {

    const data =
        getFilteredData();


    const total =
        data.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total / ITEMS_PER_PAGE
            )
        );


    if (
        currentPage > totalPages
    ) {

        currentPage =
            totalPages;

    }


    const start =
        (
            currentPage - 1
        )
        *
        ITEMS_PER_PAGE;


    const end =
        start
        +
        ITEMS_PER_PAGE;


    const currentItems =
        data.slice(
            start,
            end
        );


    renderRows(
        currentItems
    );


    updateResultText(
        total
    );


    updatePagination(
        total,
        start,
        end,
        totalPages
    );

}


/* =========================================================
   TABLE ROWS
========================================================= */

function renderRows(
    services
) {

    elements.servicesTableBody.innerHTML =
        "";


    if (
        services.length === 0
    ) {

        elements.emptyState.classList.remove(
            "d-none"
        );

        return;

    }


    elements.emptyState.classList.add(
        "d-none"
    );


    services.forEach(
        function (service) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <div class="service-information">

                        <div class="service-icon">

                            <i class="bi bi-droplet-fill"></i>

                        </div>

                        <div class="service-name">

                            <strong>
                                ${escapeHTML(service.name)}
                            </strong>

                            <small>
                                ${escapeHTML(service.description)}
                            </small>

                        </div>

                    </div>

                </td>


                <td>

                    <span class="category-badge">

                        ${getCategoryLabel(service.category)}

                    </span>

                </td>


                <td>

                    <span class="duration-value">

                        <i class="bi bi-clock me-1"></i>

                        ${service.duration} min

                    </span>

                </td>


                <td>

                    <span class="price-value">

                        ${formatMoney(service.price)}

                    </span>

                </td>


                <td>

                    <span
                        class="
                            status-badge
                            ${
                                service.status === "active"
                                    ? "status-active"
                                    : "status-inactive"
                            }
                        "
                    >

                        ${
                            service.status === "active"
                                ? "Active"
                                : "Inactive"
                        }

                    </span>

                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="action-button"
                            title="Voir"
                            data-action="view"
                            data-id="${service.id}"
                        >

                            <i class="bi bi-eye"></i>

                        </button>


                        <button
                            type="button"
                            class="action-button"
                            title="Modifier"
                            data-action="edit"
                            data-id="${service.id}"
                        >

                            <i class="bi bi-pencil"></i>

                        </button>


                        <button
                            type="button"
                            class="action-button toggle"
                            title="${
                                service.status === "active"
                                    ? "Désactiver"
                                    : "Activer"
                            }"
                            data-action="toggle"
                            data-id="${service.id}"
                        >

                            <i class="bi ${
                                service.status === "active"
                                    ? "bi-toggle-on"
                                    : "bi-toggle-off"
                            }"></i>

                        </button>


                        <button
                            type="button"
                            class="action-button delete"
                            title="Supprimer"
                            data-action="delete"
                            data-id="${service.id}"
                        >

                            <i class="bi bi-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            row
                .querySelectorAll(
                    "[data-action]"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            function () {

                                executeAction(
                                    button.dataset.action,
                                    button.dataset.id
                                );

                            }
                        );

                    }
                );


            elements.servicesTableBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   ACTIONS
========================================================= */

function executeAction(
    action,
    id
) {

    const service =
        findService(id);


    if (!service) {

        showToast(
            "Cette prestation n'existe plus."
        );

        return;

    }


    switch (action) {

        case "view":

            openDetails(service);

            break;


        case "edit":

            openEditModal(service);

            break;


        case "toggle":

            toggleStatus(service);

            break;


        case "delete":

            deleteService(service);

            break;

    }

}


/* =========================================================
   AJOUT
========================================================= */

function openCreateModal() {

    editingId = null;


    elements.serviceForm.reset();


    elements.serviceForm.classList.remove(
        "was-validated"
    );


    elements.serviceId.value =
        "";


    elements.serviceStatus.value =
        "active";


    elements.modalTitle.textContent =
        "Nouvelle prestation";


    elements.saveButton.innerHTML = `
        <i class="bi bi-check-lg"></i>
        Enregistrer
    `;


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            elements.serviceModal
        );


    modal.show();

}


/* =========================================================
   MODIFICATION
========================================================= */

function openEditModal(
    service
) {

    editingId =
        service.id;


    elements.serviceId.value =
        service.id;


    elements.serviceName.value =
        service.name;


    elements.serviceDescription.value =
        service.description;


    elements.serviceCategory.value =
        service.category;


    elements.serviceDuration.value =
        service.duration;


    elements.servicePrice.value =
        service.price;


    elements.serviceStatus.value =
        service.status;


    elements.serviceForm.classList.remove(
        "was-validated"
    );


    elements.modalTitle.textContent =
        "Modifier la prestation";


    elements.saveButton.innerHTML = `
        <i class="bi bi-check-lg"></i>
        Enregistrer les modifications
    `;


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            elements.serviceModal
        );


    modal.show();

}


/* =========================================================
   FORMULAIRE
========================================================= */

function handleSubmit(
    event
) {

    event.preventDefault();


    elements.serviceForm.classList.add(
        "was-validated"
    );


    if (
        !elements.serviceForm.checkValidity()
    ) {

        return;

    }


    const name =
        elements.serviceName
            .value
            .trim();


    const description =
        elements.serviceDescription
            .value
            .trim();


    const category =
        elements.serviceCategory
            .value;


    const duration =
        Number(
            elements.serviceDuration
                .value
        );


    const price =
        Number(
            elements.servicePrice
                .value
        );


    const status =
        elements.serviceStatus
            .value;


    if (
        name.length < 3
        ||
        description.length < 10
    ) {

        showToast(
            "Veuillez vérifier les informations saisies."
        );

        return;

    }


    if (
        duration < 5
        ||
        duration > 600
    ) {

        showToast(
            "La durée doit être comprise entre 5 et 600 minutes."
        );

        return;

    }


    if (
        price < 0
        ||
        price > 1000000
    ) {

        showToast(
            "Le prix saisi est invalide."
        );

        return;

    }


    if (
        isDuplicateName(
            name,
            editingId
        )
    ) {

        showToast(
            "Une prestation avec ce nom existe déjà."
        );

        elements.serviceName.focus();

        return;

    }


    if (editingId) {

        updateService(
            editingId,
            {
                name,
                description,
                category,
                duration,
                price,
                status
            }
        );

    } else {

        addService(
            {
                name,
                description,
                category,
                duration,
                price,
                status
            }
        );

    }

}


/* =========================================================
   CREATE
========================================================= */

function addService(
    data
) {

    const service = {

        id:
            generateId(),

        name:
            data.name,

        description:
            data.description,

        category:
            data.category,

        duration:
            data.duration,

        price:
            data.price,

        status:
            data.status,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };


    prestations.unshift(
        service
    );


    saveData();


    closeServiceModal();


    updateStatistics();

    render();


    showToast(
        "Prestation créée avec succès."
    );

}


/* =========================================================
   UPDATE
========================================================= */

function updateService(
    id,
    data
) {

    const index =
        prestations.findIndex(
            function (service) {

                return service.id === id;

            }
        );


    if (index === -1) {

        showToast(
            "Prestation introuvable."
        );

        return;

    }


    prestations[index] = {

        ...prestations[index],

        ...data,

        updatedAt:
            new Date().toISOString()

    };


    saveData();


    closeServiceModal();


    updateStatistics();

    render();


    showToast(
        "Prestation modifiée avec succès."
    );

}


/* =========================================================
   SUPPRESSION
========================================================= */

function deleteService(
    service
) {

    const confirmed =
        window.confirm(
            `Voulez-vous vraiment supprimer "${service.name}" ?`
        );


    if (!confirmed) {

        return;

    }


    prestations =
        prestations.filter(
            function (item) {

                return item.id !== service.id;

            }
        );


    saveData();


    updateStatistics();

    render();


    showToast(
        "Prestation supprimée avec succès."
    );

}


/* =========================================================
   ACTIVER / DESACTIVER
========================================================= */

function toggleStatus(
    service
) {

    const newStatus =
        service.status === "active"
            ? "inactive"
            : "active";


    service.status =
        newStatus;


    service.updatedAt =
        new Date().toISOString();


    saveData();


    updateStatistics();

    render();


    showToast(
        newStatus === "active"
            ? "Prestation activée."
            : "Prestation désactivée."
    );

}


/* =========================================================
   DETAILS
========================================================= */

function openDetails(
    service
) {

    elements.detailsContent.innerHTML = `

        <div class="details-heading">

            <div class="details-icon">

                <i class="bi bi-droplet-fill"></i>

            </div>

            <div>

                <h4>
                    ${escapeHTML(service.name)}
                </h4>

                <span>
                    ${getCategoryLabel(service.category)}
                </span>

            </div>

        </div>


        <div class="details-row">

            <span>
                Description
            </span>

            <strong>
                ${escapeHTML(service.description)}
            </strong>

        </div>


        <div class="details-row">

            <span>
                Catégorie
            </span>

            <strong>
                ${getCategoryLabel(service.category)}
            </strong>

        </div>


        <div class="details-row">

            <span>
                Durée
            </span>

            <strong>
                ${service.duration} minutes
            </strong>

        </div>


        <div class="details-row">

            <span>
                Prix
            </span>

            <strong>
                ${formatMoney(service.price)}
            </strong>

        </div>


        <div class="details-row">

            <span>
                Statut
            </span>

            <strong>
                ${
                    service.status === "active"
                        ? "Active"
                        : "Inactive"
                }
            </strong>

        </div>


        <div class="details-row">

            <span>
                Création
            </span>

            <strong>
                ${formatDate(service.createdAt)}
            </strong>

        </div>


        <div class="details-row">

            <span>
                Dernière modification
            </span>

            <strong>
                ${formatDate(service.updatedAt)}
            </strong>

        </div>

    `;


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            elements.detailsModal
        );


    modal.show();

}


/* =========================================================
   STATISTIQUES
========================================================= */

function updateStatistics() {

    const total =
        prestations.length;


    const active =
        prestations.filter(
            service =>
                service.status === "active"
        ).length;


    const inactive =
        prestations.filter(
            service =>
                service.status === "inactive"
        ).length;


    const average =
        total > 0
            ?
                prestations.reduce(
                    function (
                        totalPrice,
                        service
                    ) {

                        return (
                            totalPrice
                            +
                            Number(service.price)
                        );

                    },
                    0
                )
                /
                total
            :
                0;


    elements.totalCount.textContent =
        total;


    elements.activeCount.textContent =
        active;


    elements.inactiveCount.textContent =
        inactive;


    elements.averagePrice.textContent =
        formatMoney(
            Math.round(average)
        );


    /*
       Notification :
       nombre de prestations inactives.
    */

    elements.notificationCount.textContent =
        inactive;


    if (inactive === 0) {

        elements.notificationCount.style.display =
            "none";

    } else {

        elements.notificationCount.style.display =
            "flex";

    }

}


/* =========================================================
   RESULTATS
========================================================= */

function updateResultText(
    total
) {

    elements.resultDescription.textContent =
        `${total} prestation${total > 1 ? "s" : ""}`;

}


/* =========================================================
   PAGINATION
========================================================= */

function updatePagination(
    total,
    start,
    end,
    totalPages
) {

    if (total === 0) {

        elements.paginationText.textContent =
            "Aucun résultat";

    } else {

        elements.paginationText.textContent =
            `Affichage ${start + 1}-${Math.min(end, total)} sur ${total}`;

    }


    elements.paginationContainer.innerHTML =
        "";


    if (totalPages <= 1) {

        return;

    }


    const previous =
        document.createElement("button");


    previous.type =
        "button";


    previous.className =
        "pagination-button";


    previous.innerHTML =
        '<i class="bi bi-chevron-left"></i>';


    previous.disabled =
        currentPage === 1;


    previous.addEventListener(
        "click",
        function () {

            if (
                currentPage > 1
            ) {

                currentPage--;

                render();

            }

        }
    );


    elements.paginationContainer.appendChild(
        previous
    );


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
            "pagination-button";


        button.textContent =
            page;


        if (
            page === currentPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.addEventListener(
            "click",
            function () {

                currentPage =
                    page;

                render();

            }
        );


        elements.paginationContainer.appendChild(
            button
        );

    }


    const next =
        document.createElement("button");


    next.type =
        "button";


    next.className =
        "pagination-button";


    next.innerHTML =
        '<i class="bi bi-chevron-right"></i>';


    next.disabled =
        currentPage === totalPages;


    next.addEventListener(
        "click",
        function () {

            if (
                currentPage < totalPages
            ) {

                currentPage++;

                render();

            }

        }
    );


    elements.paginationContainer.appendChild(
        next
    );

}


/* =========================================================
   EXPORT CSV
========================================================= */

function exportCSV() {

    if (
        prestations.length === 0
    ) {

        showToast(
            "Aucune prestation à exporter."
        );

        return;

    }


    const headers = [

        "ID",
        "Nom",
        "Description",
        "Catégorie",
        "Durée",
        "Prix",
        "Statut",
        "Créée le"

    ];


    const rows =
        prestations.map(
            function (service) {

                return [

                    service.id,

                    service.name,

                    service.description,

                    getCategoryLabel(
                        service.category
                    ),

                    `${service.duration} minutes`,

                    service.price,

                    service.status === "active"
                        ? "Active"
                        : "Inactive",

                    formatDate(
                        service.createdAt
                    )

                ];

            }
        );


    const csvContent =
        [
            headers,
            ...rows
        ]
        .map(
            row =>
                row
                    .map(
                        value =>
                            `"${String(value)
                                .replace(/"/g, '""')}"`
                    )
                    .join(";")
        )
        .join("\n");


    const blob =
        new Blob(
            [
                "\uFEFF"
                +
                csvContent
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");


    link.href =
        url;


    link.download =
        `bide-prestations-${getFileDate()}.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Export CSV généré avec succès."
    );

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function readNotifications() {

    const inactive =
        prestations.filter(
            service =>
                service.status === "inactive"
        ).length;


    if (inactive === 0) {

        showToast(
            "Aucune notification en attente."
        );

        return;

    }


    showToast(
        `${inactive} prestation${inactive > 1 ? "s" : ""} inactive${inactive > 1 ? "s" : ""}.`
    );

}


/* =========================================================
   UTILITAIRES
========================================================= */

function findService(
    id
) {

    return prestations.find(
        service =>
            service.id === id
    );

}


function isDuplicateName(
    name,
    currentId
) {

    const normalized =
        name
            .toLowerCase()
            .trim();


    return prestations.some(
        function (service) {

            return (
                service.name
                    .toLowerCase()
                    .trim()
                ===
                normalized
                &&
                service.id !== currentId
            );

        }
    );

}


function getCategoryLabel(
    category
) {

    const labels = {

        lavage: "Lavage",

        interieur: "Intérieur",

        exterieur: "Extérieur",

        complet: "Complet",

        premium: "Premium"

    };


    return (
        labels[category]
        ||
        "Autre"
    );

}


function formatMoney(
    amount
) {

    return (
        new Intl.NumberFormat(
            "fr-FR"
        ).format(
            Number(amount) || 0
        )
        +
        " FCFA"
    );

}


function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return new Intl.DateTimeFormat(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(
        date
    );

}


function getFileDate() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year
        +
        "-"
        +
        month
        +
        "-"
        +
        day
    );

}


function generateId() {

    return (
        "PREST-"
        +
        Date.now().toString(36)
        .toUpperCase()
        +
        "-"
        +
        Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase()
    );

}


function capitalize(
    text
) {

    if (!text) {

        return "";

    }


    return (
        text.charAt(0).toUpperCase()
        +
        text.slice(1)
    );

}


function escapeHTML(
    value
) {

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


function closeServiceModal() {

    const modal =
        bootstrap.Modal.getInstance(
            elements.serviceModal
        );


    if (modal) {

        modal.hide();

    }

}


function showToast(
    message
) {

    elements.toastMessage.textContent =
        message;


    const toast =
        bootstrap.Toast.getOrCreateInstance(
            elements.appToast,
            {
                delay: 3500
            }
        );


    toast.show();

}
