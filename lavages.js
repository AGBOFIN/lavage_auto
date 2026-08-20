"use strict";

/*
|--------------------------------------------------------------------------
| BIDÈ - GESTION DES LAVAGES
|--------------------------------------------------------------------------
| Stockage :
|
| bide_clients
| bide_reservations
| bide_prestations
| bide_lavages
| bide_paiements
|--------------------------------------------------------------------------
*/

const STORAGE = {
    clients: "bide_clients",
    reservations: "bide_reservations",
    services: "bide_prestations",
    washes: "bide_lavages",
    payments: "bide_paiements"
};


/* ==========================================================================
   DOM
========================================================================== */

const elements = {

    tableBody:
        document.getElementById("washesTableBody"),

    emptyState:
        document.getElementById("emptyState"),

    search:
        document.getElementById("searchInput"),

    dateFilter:
        document.getElementById("dateFilter"),

    statusFilter:
        document.getElementById("statusFilter"),

    serviceFilter:
        document.getElementById("serviceFilter"),

    resetFiltersBtn:
        document.getElementById("resetFiltersBtn"),

    newButton:
        document.getElementById("newWashBtn"),

    emptyNewButton:
        document.getElementById("emptyNewBtn"),

    form:
        document.getElementById("washForm"),

    washId:
        document.getElementById("washId"),

    reservation:
        document.getElementById("reservationSelect"),

    clientName:
        document.getElementById("clientPreviewName"),

    clientPhone:
        document.getElementById("clientPreviewPhone"),

    serviceName:
        document.getElementById("servicePreviewName"),

    servicePrice:
        document.getElementById("servicePreviewPrice"),

    date:
        document.getElementById("washDate"),
    startTime:
        document.getElementById("startTime"),

    endTime:
        document.getElementById("endTime"),

    amount:
        document.getElementById("washAmount"),

    status:
        document.getElementById("washStatus"),


    notes:
        document.getElementById("washNotes"),

    modalTitle:

        document.getElementById("modalTitle"),

    saveButton:
        document.getElementById("saveWashBtn"),

    details:

        document.getElementById("detailsContent"),

    total:
        document.getElementById("totalWashes"),

    completed:
        document.getElementById("completedWashes"),


    running:
        document.getElementById("runningWashes"),

    revenue:
        document.getElementById("washRevenue"),

    resultsCount:
        document.getElementById("resultsCount"),

    currentDate:
        document.getElementById("currentDate"),

    currentYear:
        document.getElementById("currentYear"),


    menuToggle:
        document.getElementById("menuToggle"),

    sidebar:
        document.getElementById("sidebar"),

    sidebarClose:
        document.getElementById("sidebarClose"),

    sidebarOverlay:
        document.getElementById("sidebarOverlay")
};


/* ==========================================================================
   MODALS
========================================================================== */

let washModal = null;
let detailsModal = null;


/* ==========================================================================
   STORAGE
========================================================================== */

function readStorage(key) {

    const value =
        localStorage.getItem(key);

    if (!value) {
        return [];
    }

    try {

        const data =
            JSON.parse(value);

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        console.error(
            `Erreur de lecture : ${key}`,
            error
        );

        return [];
    }
}


function saveStorage(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );
}


function getClients() {
    return readStorage(
        STORAGE.clients
    );
}


function getReservations() {
    return readStorage(
        STORAGE.reservations
    );
}


function getServices() {
    return readStorage(
        STORAGE.services
    );
}


function getWashes() {
    return readStorage(
        STORAGE.washes
    );
}


function getPayments() {
    return readStorage(
        STORAGE.payments
    );
}


/* ==========================================================================
   HELPERS
========================================================================== */

function generateId() {

    return Date.now() +
        Math.floor(
            Math.random() * 10000
        );
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function today() {

    const date =
        new Date();

    return [
        date.getFullYear(),
        String(
            date.getMonth() + 1
        ).padStart(2, "0"),
        String(
            date.getDate()
        ).padStart(2, "0")
    ].join("-");
}


function formatDate(date) {

    if (!date) {
        return "-";
    }

    const parts =
        String(date).split("-");

    if (parts.length !== 3) {
        return date;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


function formatPrice(value) {

    return new Intl.NumberFormat(
        "fr-FR"
    ).format(
        Number(value) || 0
    ) + " FCFA";
}


/* ==========================================================================
   CLIENT
========================================================================== */

function getClientName(client) {

    if (!client) {
        return "Client supprimé";
    }

    if (client.name) {
        return client.name;
    }

    if (client.fullName) {
        return client.fullName;
    }

    return [
        client.firstName,
        client.lastName
    ]
        .filter(Boolean)
        .join(" ") ||
        "Client sans nom";
}


function getClientPhone(client) {

    if (!client) {
        return "";
    }

    return (
        client.phone ||
        client.telephone ||
        client.mobile ||
        client.phoneNumber ||
        ""
    );
}


/* ==========================================================================
   RÉSERVATIONS
========================================================================== */

function getReservationById(id) {

    return getReservations().find(
        reservation =>
            String(
                reservation.id ??
                reservation._id
            ) ===
            String(id)
    );
}


function getReservationClientId(
    reservation
) {

    if (!reservation) {
        return null;
    }

    return (
        reservation.clientId ??
        reservation.client_id ??
        reservation.customerId ??
        reservation.customer_id ??
        null
    );
}


function getReservationServiceId(
    reservation
) {

    if (!reservation) {
        return null;
    }

    return (
        reservation.serviceId ??
        reservation.service_id ??
        reservation.prestationId ??
        reservation.prestation_id ??
        null
    );
}


function getReservationDate(
    reservation
) {

    return (
        reservation?.date ||
        reservation?.reservationDate ||
        reservation?.bookingDate ||
        ""
    );
}


function getReservationTime(
    reservation
) {

    return (
        reservation?.time ||
        reservation?.reservationTime ||
        ""
    );
}


function getReservationLabel(
    reservation
) {

    if (!reservation) {
        return "Réservation supprimée";
    }

    const id =
        reservation.id ??
        reservation._id;

    const reference =
        reservation.reference ||
        reservation.referenceReservation ||
        `RES-${String(id).slice(-6)}`;

    const date =
        getReservationDate(
            reservation
        );

    const time =
        getReservationTime(
            reservation
        );

    return [
        reference,
        date ? formatDate(date) : "",
        time || ""
    ]
        .filter(Boolean)
        .join(" — ");
}


/* ==========================================================================
   PRESTATIONS
========================================================================== */

function getServiceById(id) {

    return getServices().find(
        service =>
            String(
                service.id ??
                service._id
            ) ===
            String(id)
    );
}


function getServiceName(service) {

    if (!service) {
        return "Prestation supprimée";
    }

    return (
        service.name ||
        service.nom ||
        service.title ||
        service.libelle ||
        "Prestation sans nom"
    );
}


function getServicePrice(service) {

    if (!service) {
        return 0;
    }

    return Number(
        service.price ??
        service.prix ??
        service.amount ??
        service.montant ??
        0
    );
}


/* ==========================================================================
   STATUTS
========================================================================== */

function statusLabel(status) {

    const labels = {

        scheduled:
            "Programmé",

        in_progress:
            "En cours",

        completed:
            "Terminé",

        cancelled:
            "Annulé"
    };

    return (
        labels[status] ||
        status ||
        "-"
    );
}


function statusClass(status) {

    const classes = {

        scheduled:
            "status-scheduled",

        in_progress:
            "status-progress",

        completed:
            "status-completed",

        cancelled:
            "status-cancelled"
    };

    return classes[status] || "";
}


/* ==========================================================================
   INITIALISATION DES MODALES
========================================================================== */

function initModals() {

    const washElement =
        document.getElementById(
            "washModal"
        );

    const detailsElement =
        document.getElementById(
            "detailsModal"
        );

    if (
        typeof bootstrap === "undefined"
    ) {

        console.error(
            "Bootstrap n'est pas chargé."
        );

        return;
    }

    washModal =
        bootstrap.Modal.getOrCreateInstance(
            washElement
        );

    detailsModal =
        bootstrap.Modal.getOrCreateInstance(
            detailsElement
        );
}


/* ==========================================================================
   CHARGER LES PRESTATIONS
========================================================================== */

function loadServices(
    selectedId = ""
) {

    const services =
        getServices();

    elements.serviceFilter.innerHTML =
        `<option value="all">Toutes</option>`;

    services.forEach(
        service => {

            const id =
                service.id ??
                service._id;

            const option =
                document.createElement(
                    "option"
                );

            option.value = id;

            option.textContent =
                getServiceName(
                    service
                );

            if (
                selectedId &&
                String(id) ===
                String(selectedId)
            ) {
                option.selected = true;
            }

            elements.serviceFilter.appendChild(
                option
            );
        }
    );
}


/* ==========================================================================
   CHARGER LES RÉSERVATIONS
========================================================================== */

function loadReservations(
    selectedId = ""
) {

    const reservations =
        getReservations();

    elements.reservation.innerHTML = "";

    const firstOption =
        document.createElement(
            "option"
        );

    firstOption.value = "";

    firstOption.textContent =
        "Sélectionner une réservation";

    elements.reservation.appendChild(
        firstOption
    );

    reservations.forEach(
        reservation => {

            const id =
                reservation.id ??
                reservation._id;

            const option =
                document.createElement(
                    "option"
                );

            option.value = id;

            option.textContent =
                getReservationLabel(
                    reservation
                );

            if (
                selectedId &&
                String(id) ===
                String(selectedId)
            ) {
                option.selected = true;
            }

            elements.reservation.appendChild(
                option
            );
        }
    );
}


/* ==========================================================================
   APERÇU RÉSERVATION
========================================================================== */

function updateReservationPreview() {

    const reservationId =
        elements.reservation.value;

    if (!reservationId) {

        elements.clientName.textContent =
            "Aucun client";

        elements.clientPhone.textContent =
            "—";

        elements.serviceName.textContent =
            "Aucune prestation";

        elements.servicePrice.textContent =
            "—";

        return;
    }

    const reservation =
        getReservationById(
            reservationId
        );

    if (!reservation) {

        elements.clientName.textContent =
            "Réservation introuvable";

        elements.clientPhone.textContent =
            "—";

        elements.serviceName.textContent =
            "—";

        elements.servicePrice.textContent =
            "—";

        return;
    }


    const clientId =
        getReservationClientId(
            reservation
        );

    const serviceId =
        getReservationServiceId(
            reservation
        );


    const client =
        getClients().find(
            item =>
                String(
                    item.id ??
                    item._id
                ) ===
                String(clientId)
        );


    const service =
        getServiceById(
            serviceId
        );


    elements.clientName.textContent =
        getClientName(client);

    elements.clientPhone.textContent =
        getClientPhone(client) ||
        "Téléphone non renseigné";


    elements.serviceName.textContent =
        getServiceName(service);

    const price =
        getServicePrice(service);


    elements.servicePrice.textContent =
        price > 0
            ? formatPrice(price)
            : "Prix non renseigné";


    /*
     * Pour une nouvelle création,
     * proposer automatiquement la prestation.
     */

    if (
        !elements.washId.value &&
        !elements.amount.value &&
        price > 0
    ) {

        elements.amount.value =
            price;
    }


    /*
     * Proposer la date de la réservation.
     */

    if (
        !elements.washId.value
    ) {

        const reservationDate =
            getReservationDate(
                reservation
            );

        if (reservationDate) {

            elements.date.value =
                reservationDate;
        }


        const reservationTime =
            getReservationTime(
                reservation
            );

        if (
            reservationTime &&
            !elements.startTime.value
        ) {

            elements.startTime.value =
                reservationTime;
        }
    }
}


/* ==========================================================================
   RESET FORMULAIRE
========================================================================== */

function resetWashForm() {

    elements.form.reset();

    elements.washId.value =
        "";

    elements.clientName.textContent =
        "Aucun client";

    elements.clientPhone.textContent =
        "—";

    elements.serviceName.textContent =
        "Aucune prestation";

    elements.servicePrice.textContent =
        "—";

    elements.date.value =
        today();

    elements.status.value =
        "scheduled";

    elements.amount.value =
        "";

    elements.startTime.value =
        "";

    elements.endTime.value =
        "";

    elements.notes.value =
        "";

    elements.reservation.value =
        "";
}


/* ==========================================================================
   NOUVEAU LAVAGE
========================================================================== */

function openCreateModal() {

    resetWashForm();

    loadReservations();

    elements.modalTitle.textContent =
        "Nouveau lavage";

    elements.saveButton.innerHTML =
        `<i class="bi bi-check-lg"></i> Enregistrer`;

    washModal.show();
}


/* ==========================================================================
   MODIFICATION
========================================================================== */

function openEditModal(id) {

    const wash =
        getWashes().find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!wash) {

        alert(
            "Lavage introuvable."
        );

        return;
    }


    resetWashForm();

    elements.washId.value =
        wash.id;


    loadReservations(
        wash.reservationId
    );


    elements.date.value =
        wash.date ||
        today();

    elements.startTime.value =
        wash.startTime ||
        "";

    elements.endTime.value =
        wash.endTime ||
        "";

    elements.amount.value =
        wash.amount ??
        "";

    elements.status.value =
        wash.status ||
        "scheduled";

    elements.notes.value =
        wash.notes ||
        "";


    elements.modalTitle.textContent =
        "Modifier le lavage";

    elements.saveButton.innerHTML =
        `<i class="bi bi-check-lg"></i>
         Enregistrer les modifications`;


    updateReservationPreview();

    washModal.show();
}


/* ==========================================================================
   SAUVEGARDER
========================================================================== */

function saveWash(event) {

    event.preventDefault();


    const reservationId =
        elements.reservation.value;

    const date =
        elements.date.value;

    const startTime =
        elements.startTime.value;

    const endTime =
        elements.endTime.value;

    const amount =
        Number(
            elements.amount.value
        );

    const status =
        elements.status.value;

    const notes =
        elements.notes.value.trim();

    const existingId =
        elements.washId.value;


    /* VALIDATION */

    if (!reservationId) {

        alert(
            "Veuillez sélectionner une réservation."
        );

        elements.reservation.focus();

        return;
    }


    if (!date) {

        alert(
            "Veuillez sélectionner une date."
        );

        elements.date.focus();

        return;
    }


    if (
        !Number.isFinite(amount) ||
        amount < 0
    ) {

        alert(
            "Veuillez saisir un montant valide."
        );

        elements.amount.focus();

        return;
    }


    if (!status) {

        alert(
            "Veuillez sélectionner un statut."
        );

        return;
    }


    if (
        startTime &&
        endTime &&
        endTime < startTime
    ) {

        alert(
            "L'heure de fin doit être après l'heure de début."
        );

        elements.endTime.focus();

        return;
    }


    const reservation =
        getReservationById(
            reservationId
        );


    if (!reservation) {

        alert(
            "La réservation sélectionnée n'existe plus."
        );

        loadReservations();

        return;
    }


    const clientId =
        getReservationClientId(
            reservation
        );

    const serviceId =
        getReservationServiceId(
            reservation
        );


    let washes =
        getWashes();


    const washId =
        existingId ||
        generateId();


    const wash = {

        id: washId,

        reservationId:
            reservation.id ??
            reservation._id,

        clientId:
            clientId,

        serviceId:
            serviceId,

        date:
            date,

        startTime:
            startTime,

        endTime:
            endTime,

        amount:
            amount,

        status:
            status,

        notes:
            notes,

        updatedAt:
            new Date().toISOString()
    };


    if (existingId) {

        const index =
            washes.findIndex(
                item =>
                    String(item.id) ===
                    String(existingId)
            );


        if (index === -1) {

            alert(
                "Le lavage à modifier est introuvable."
            );

            return;
        }


        wash.createdAt =
            washes[index].createdAt ||
            new Date().toISOString();


        washes[index] =
            wash;

    } else {

        wash.createdAt =
            new Date().toISOString();

        washes.push(
            wash
        );
    }


    try {

        saveStorage(
            STORAGE.washes,
            washes
        );

    } catch (error) {

        console.error(
            error
        );

        alert(
            "Impossible d'enregistrer le lavage."
        );

        return;
    }


    renderWashes();

    washModal.hide();


    alert(
        existingId
            ? "Lavage modifié avec succès."
            : "Lavage ajouté avec succès."
    );
}


/* ==========================================================================
   RENDU
========================================================================== */

function renderWashes() {

    const washes =
        getWashes();

    const reservations =
        getReservations();

    const clients =
        getClients();

    const services =
        getServices();


    const search =
        elements.search.value
            .trim()
            .toLowerCase();

    const selectedDate =
        elements.dateFilter.value;

    const selectedStatus =
        elements.statusFilter.value;

    const selectedService =
        elements.serviceFilter.value;


    const filtered =
        washes.filter(
            wash => {

                const reservation =
                    reservations.find(
                        item =>
                            String(
                                item.id ??
                                item._id
                            ) ===
                            String(
                                wash.reservationId
                            )
                    );


                const client =
                    clients.find(
                        item =>
                            String(
                                item.id ??
                                item._id
                            ) ===
                            String(
                                wash.clientId ||
                                getReservationClientId(
                                    reservation
                                )
                            )
                    );


                const service =
                    services.find(
                        item =>
                            String(
                                item.id ??
                                item._id
                            ) ===
                            String(
                                wash.serviceId ||
                                getReservationServiceId(
                                    reservation
                                )
                            )
                    );


                const searchable = [

                    getClientName(client),

                    getReservationLabel(
                        reservation
                    ),

                    getServiceName(
                        service
                    ),

                    wash.date,

                    wash.status,

                    statusLabel(
                        wash.status
                    ),

                    wash.amount

                ]
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    searchable.includes(
                        search
                    );


                const matchesDate =
                    !selectedDate ||
                    wash.date === selectedDate;


                const matchesStatus =
                    selectedStatus === "all" ||
                    wash.status === selectedStatus;


                const serviceId =
                    wash.serviceId ||
                    getReservationServiceId(
                        reservation
                    );


                const matchesService =
                    selectedService === "all" ||
                    String(serviceId) ===
                    String(selectedService);


                return (
                    matchesSearch &&
                    matchesDate &&
                    matchesStatus &&
                    matchesService
                );
            }
        );


    elements.tableBody.innerHTML =
        "";


    if (
        filtered.length === 0
    ) {

        elements.emptyState.classList.remove(
            "d-none"
        );

    } else {

        elements.emptyState.classList.add(
            "d-none"
        );
    }


    elements.resultsCount.textContent =
        `${filtered.length} ${
            filtered.length > 1
                ? "lavages"
                : "lavage"
        }`;


    filtered
        .sort(
            (a, b) =>
                String(b.date)
                    .localeCompare(
                        String(a.date)
                    )
        )
        .forEach(
            wash => {

                const reservation =
                    reservations.find(
                        item =>
                            String(
                                item.id ??
                                item._id
                            ) ===
                            String(
                                wash.reservationId
                            )
                    );


                const client =
                    clients.find(
                        item =>
                            String(
                                item.id ??
                                item._id
                            ) ===
                            String(
                                wash.clientId ||
                                getReservationClientId(
                                    reservation
                                )
                            )
                    );


                const service =
                    services.find(
                        item =>
                            String(
                                item.id ??
                                item._id
                            ) ===
                            String(
                                wash.serviceId ||
                                getReservationServiceId(
                                    reservation
                                )
                            )
                    );


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        <span class="client-name">
                            ${escapeHTML(
                                getClientName(client)
                            )}
                        </span>

                        <span class="client-phone">
                            ${escapeHTML(
                                getClientPhone(client) ||
                                "Téléphone non renseigné"
                            )}
                        </span>

                    </td>


                    <td>
                        ${escapeHTML(
                            getReservationLabel(
                                reservation
                            )
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            getServiceName(service)
                        )}
                    </td>


                    <td>
                        ${formatDate(
                            wash.date
                        )}
                    </td>


                    <td>
                        ${
                            wash.startTime ||
                            "—"
                        }

                        ${
                            wash.endTime
                                ? ` - ${escapeHTML(
                                    wash.endTime
                                )}`
                                : ""
                        }
                    </td>


                    <td>
                        <span class="amount">
                            ${formatPrice(
                                wash.amount
                            )}
                        </span>
                    </td>


                    <td>

                        <span class="status ${statusClass(
                            wash.status
                        )}">
                            ${escapeHTML(
                                statusLabel(
                                    wash.status
                                )
                            )}
                        </span>

                    </td>


                    <td>

                        <div class="actions">

                            <button
                                type="button"
                                class="action-btn action-view"
                                title="Voir"
                                data-action="view"
                                data-id="${escapeHTML(
                                    wash.id
                                )}"
                            >
                                <i class="bi bi-eye"></i>
                            </button>


                            <button
                                type="button"
                                class="action-btn action-edit"
                                title="Modifier"
                                data-action="edit"
                                data-id="${escapeHTML(
                                    wash.id
                                )}"
                            >
                                <i class="bi bi-pencil"></i>
                            </button>


                            <button
                                type="button"
                                class="action-btn action-delete"
                                title="Supprimer"
                                data-action="delete"
                                data-id="${escapeHTML(
                                    wash.id
                                )}"
                            >
                                <i class="bi bi-trash"></i>
                            </button>

                        </div>

                    </td>
                `;


                elements.tableBody.appendChild(
                    row
                );
            }
        );


    updateStatistics(washes);
}


/* ==========================================================================
   STATISTIQUES
========================================================================== */

function updateStatistics(
    washes
) {

    const completed =
        washes.filter(
            wash =>
                wash.status ===
                "completed"
        );


    const running =
        washes.filter(
            wash =>
                wash.status ===
                "in_progress"
        );


    const revenue =
        completed.reduce(
            (
                total,
                wash
            ) =>
                total +
                Number(
                    wash.amount
                ),
            0
        );


    elements.total.textContent =
        washes.length;

    elements.completed.textContent =
        completed.length;

    elements.running.textContent =
        running.length;

    elements.revenue.textContent =
        formatPrice(
            revenue
        );
}


/* ==========================================================================
   DÉTAILS
========================================================================== */

function viewWash(id) {

    const wash =
        getWashes().find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!wash) {

        alert(
            "Lavage introuvable."
        );

        return;
    }


    const reservation =
        getReservationById(
            wash.reservationId
        );


    const client =
        getClients().find(
            item =>
                String(
                    item.id ??
                    item._id
                ) ===
                String(
                    wash.clientId ||
                    getReservationClientId(
                        reservation
                    )
                )
        );


    const service =
        getServiceById(
            wash.serviceId ||
            getReservationServiceId(
                reservation
            )
        );


    elements.details.innerHTML = `

        <div class="detail-row">
            <span class="detail-label">
                Client
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    getClientName(client)
                )}
            </span>
        </div>


        <div class="detail-row">
            <span class="detail-label">
                Téléphone
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    getClientPhone(client) ||
                    "Non renseigné"
                )}
            </span>
        </div>


        <div class="detail-row">
            <span class="detail-label">
                Réservation
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    getReservationLabel(
                        reservation
                    )
                )}
            </span>
        </div>


        <div class="detail-row">
            <span class="detail-label">
                Prestation
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    getServiceName(service)
                )}
            </span>
        </div>


        <div class="detail-row">
            <span class="detail-label">
                Date
            </span>

            <span class="detail-value">
                ${formatDate(
                    wash.date
                )}
            </span>
        </div>


        <div class="detail-row">
            <span class="detail-label">
                Horaire
            </span>

            <span class="detail-value">
                ${
                    wash.startTime ||
                    "—"
                }

                ${
                    wash.endTime
                        ? ` - ${escapeHTML(
                            wash.endTime
                        )}`
                        : ""
                }
            </span>
        </div>


        <div class="detail-row">
            <span class="detail-label">
                Montant
            </span>

            <span class="detail-value">
                ${formatPrice(
                    wash.amount
                )}
            </span>
        </div>


        <div class="detail-row">
            <span class="detail-label">
                Statut
            </span>

            <span class="status ${statusClass(
                wash.status
            )}">
                ${escapeHTML(
                    statusLabel(
                        wash.status
                    )
                )}
            </span>
        </div>


        <div class="detail-row">
            <span class="detail-label">
                Notes
            </span>

            <span class="detail-value">
                ${
                    wash.notes
                        ? escapeHTML(
                            wash.notes
                        )
                        : "Aucune note"
                }
            </span>
        </div>

    `;


    detailsModal.show();
}


/* ==========================================================================
   SUPPRESSION
========================================================================== */

function deleteWash(id) {

    const washes =
        getWashes();


    const wash =
        washes.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!wash) {

        alert(
            "Lavage introuvable."
        );

        return;
    }


    const reservation =
        getReservationById(
            wash.reservationId
        );


    const confirmed =
        confirm(
            `Voulez-vous vraiment supprimer le lavage de ${
                getReservationLabel(
                    reservation
                )
            } ?`
        );


    if (!confirmed) {
        return;
    }


    const updated =
        washes.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    saveStorage(
        STORAGE.washes,
        updated
    );


    renderWashes();


    alert(
        "Lavage supprimé avec succès."
    );
}


/* ==========================================================================
   FILTRES
========================================================================== */

function resetFilters() {

    elements.search.value =
        "";

    elements.dateFilter.value =
        "";

    elements.statusFilter.value =
        "all";

    elements.serviceFilter.value =
        "all";

    renderWashes();

    elements.search.focus();
}


/* ==========================================================================
   MENU MOBILE
========================================================================== */

function openMobileMenu() {

    elements.sidebar.classList.add(
        "show"
    );

    elements.sidebarOverlay.classList.add(
        "show"
    );
}


function closeMobileMenu() {

    elements.sidebar.classList.remove(
        "show"
    );

    elements.sidebarOverlay.classList.remove(
        "show"
    );
}


/* ==========================================================================
   DATE
========================================================================== */

function displayCurrentDate() {

    const date =
        new Date();

    elements.currentDate.textContent =
        date.toLocaleDateString(
            "fr-FR",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    elements.currentYear.textContent =
        date.getFullYear();
}


/* ==========================================================================
   ÉVÉNEMENTS
========================================================================== */

function bindEvents() {

    elements.newButton.addEventListener(
        "click",
        openCreateModal
    );


    elements.emptyNewButton.addEventListener(
        "click",
        openCreateModal
    );


    elements.form.addEventListener(
        "submit",
        saveWash
    );


    elements.reservation.addEventListener(
        "change",
        updateReservationPreview
    );


    elements.search.addEventListener(
        "input",
        renderWashes
    );


    elements.dateFilter.addEventListener(
        "change",
        renderWashes
    );


    elements.statusFilter.addEventListener(
        "change",
        renderWashes
    );


    elements.serviceFilter.addEventListener(
        "change",
        renderWashes
    );


    elements.resetFiltersBtn.addEventListener(
        "click",
        resetFilters
    );


    elements.tableBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;

            const id =
                button.dataset.id;


            if (action === "view") {
                viewWash(id);
            }

            if (action === "edit") {
                openEditModal(id);
            }

            if (action === "delete") {
                deleteWash(id);
            }
        }
    );


    elements.menuToggle.addEventListener(
        "click",
        openMobileMenu
    );


    elements.sidebarClose.addEventListener(
        "click",
        closeMobileMenu
    );


    elements.sidebarOverlay.addEventListener(
        "click",
        closeMobileMenu
    );
}


/* ==========================================================================
   INITIALISATION
========================================================================== */

function init() {

    initModals();

    bindEvents();

    displayCurrentDate();

    loadServices();

    loadReservations();

    renderWashes();
}


/* ==========================================================================
   DOM READY
========================================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

} else {

    init();
}
