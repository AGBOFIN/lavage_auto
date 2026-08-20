"use strict";

/*
===========================================================
 BIDÈ — ADMINISTRATION
 GESTION DES RÉSERVATIONS
===========================================================

 Stockage utilisé :

 bide_clients
 bide_vehicules
 bide_prestations
 bide_reservations

 La page fonctionne actuellement avec localStorage.
 Elle pourra ensuite être connectée à une API / base de données.
===========================================================
*/


/* =========================================================
   CONFIGURATION
========================================================= */

const STORAGE = {
    clients: "bide_clients",
    services: "bide_prestations",
    reservations: "bide_reservations"
};



/* =========================================================
   DOM

========================================================= */


const elements = {
    tableBody: document.getElementById("reservationsTableBody"),
    emptyState: document.getElementById("emptyState"),


    searchInput: document.getElementById("searchInput"),

    dateFilter: document.getElementById("dateFilter"),
    statusFilter: document.getElementById("statusFilter"),
    resetFiltersBtn: document.getElementById("resetFiltersBtn"),

    newReservationBtn: document.getElementById("newReservationBtn"),

    reservationForm: document.getElementById("reservationForm"),
    reservationId: document.getElementById("reservationId"),


    clientSelect: document.getElementById("clientSelect"),
    vehicleSelect: document.getElementById("vehicleSelect"),

    serviceSelect: document.getElementById("serviceSelect"),

    priceDisplay: document.getElementById("priceDisplay"),

    reservationDate: document.getElementById("reservationDate"),
    reservationTime: document.getElementById("reservationTime"),

    reservationStatus: document.getElementById("reservationStatus"),
    reservationNotes: document.getElementById("reservationNotes"),

    modalTitle: document.getElementById("modalTitle"),
    detailsContent: document.getElementById("detailsContent"),

    totalReservations: document.getElementById("totalReservations"),
    pendingReservations: document.getElementById("pendingReservations"),
    confirmedReservations: document.getElementById("confirmedReservations"),
    cancelledReservations: document.getElementById("cancelledReservations"),

    mobileMenuBtn: document.getElementById("mobileMenuBtn"),
    sidebar: document.getElementById("sidebar"),

    logoutBtn: document.getElementById("logoutBtn")
};


/* =========================================================
   VÉRIFICATION DU DOM
========================================================= */

function checkRequiredElements() {

    const required = [
        "tableBody",
        "emptyState",
        "searchInput",
        "dateFilter",
        "statusFilter",
        "resetFiltersBtn",
        "newReservationBtn",
        "reservationForm",
        "reservationId",
        "clientSelect",
        "vehicleSelect",
        "serviceSelect",
        "priceDisplay",
        "reservationDate",
        "reservationTime",
        "reservationStatus",
        "reservationNotes",
        "modalTitle",
        "detailsContent"
    ];

    const missing = required.filter(
        key => !elements[key]
    );

    if (missing.length > 0) {

        console.error(
            "Éléments HTML manquants :",
            missing
        );

        return false;
    }

    return true;
}


/* =========================================================
   MODALES BOOTSTRAP
========================================================= */

let reservationModal = null;
let detailsModal = null;


function initializeModals() {

    if (
        typeof bootstrap === "undefined"
    ) {

        console.error(
            "Bootstrap JavaScript n'est pas chargé."
        );

        return false;
    }

    const reservationModalElement =
        document.getElementById(
            "reservationModal"
        );

    const detailsModalElement =
        document.getElementById(
            "detailsModal"
        );

    if (
        !reservationModalElement ||
        !detailsModalElement
    ) {

        console.error(
            "Une ou plusieurs modales sont introuvables."
        );

        return false;
    }

    reservationModal =
        new bootstrap.Modal(
            reservationModalElement
        );

    detailsModal =
        new bootstrap.Modal(
            detailsModalElement
        );

    return true;
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function readStorage(key) {

    const data = localStorage.getItem(key);

    if (!data) {
        return [];
    }

    try {

        const parsed = JSON.parse(data);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            `Erreur lors de la lecture de ${key}`,
            error
        );

        return [];
    }
}


function saveStorage(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

        return true;

    } catch (error) {

        console.error(
            `Erreur lors de l'enregistrement de ${key}`,
            error
        );

        return false;
    }
}


/* =========================================================
   RÉCUPÉRATION DES DONNÉES
========================================================= */

function getClients() {

    return readStorage(
        STORAGE.clients
    );
}


function getVehicles() {

    return readStorage(
        STORAGE.vehicles
    );
}


function getServices() {

    return readStorage(
        STORAGE.services
    );
}


function getReservations() {

    return readStorage(
        STORAGE.reservations
    );
}


/* =========================================================
   ID
========================================================= */

function generateId() {

    return Date.now() +
        Math.floor(
            Math.random() * 1000
        );
}


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatPrice(value) {

    const amount =
        Number(value) || 0;

    return (
        new Intl.NumberFormat(
            "fr-FR"
        ).format(amount)
        + " FCFA"
    );
}


function formatDate(date) {

    if (!date) {
        return "-";
    }

    const parts = date.split("-");

    if (parts.length !== 3) {
        return date;
    }

    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
    );
}


function getToday() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =========================================================
   CLIENTS
========================================================= */

function getClientName(client) {

    if (!client) {
        return "Client inconnu";
    }

    if (client.name) {
        return client.name;
    }

    if (client.fullName) {
        return client.fullName;
    }

    if (
        client.firstName ||
        client.lastName
    ) {

        return [
            client.firstName,
            client.lastName
        ]
            .filter(Boolean)
            .join(" ");
    }

    if (
        client.prenom ||
        client.nom
    ) {

        return [
            client.prenom,
            client.nom
        ]
            .filter(Boolean)
            .join(" ");
    }

    return "Client sans nom";
}


function getClientPhone(client) {

    if (!client) {
        return "";
    }

    return (
        client.phone ||
        client.telephone ||
        client.tel ||
        ""
    );
}


function loadClients(selectedId = "") {

    const clients =
        getClients();

    elements.clientSelect.innerHTML = `
        <option value="">
            Sélectionner un client
        </option>
    `;

    if (clients.length === 0) {

        elements.clientSelect.innerHTML = `
            <option value="">
                Aucun client disponible
            </option>
        `;

        return;
    }

    clients.forEach(client => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            client.id;

        option.textContent =
            getClientName(client);

        if (
            String(client.id) ===
            String(selectedId)
        ) {

            option.selected = true;
        }

        elements.clientSelect.appendChild(
            option
        );
    });
}


/* =========================================================
   VÉHICULES
========================================================= */

function getVehicleLabel(vehicle) {

    if (!vehicle) {
        return "Véhicule inconnu";
    }

    const brand =
        vehicle.brand ||
        vehicle.marque ||
        "";

    const model =
        vehicle.model ||
        vehicle.modele ||
        "";

    const registration =
        vehicle.registration ||
        vehicle.immatriculation ||
        vehicle.plate ||
        vehicle.plaque ||
        "";

    let name =
        vehicle.name ||
        vehicle.nom ||
        `${brand} ${model}`.trim();

    if (!name) {
        name = "Véhicule";
    }

    if (registration) {

        return (
            name +
            " — " +
            registration
        );
    }

    return name;
}


function loadVehicles(
    clientId = "",
    selectedVehicleId = ""
) {

    elements.vehicleSelect.innerHTML = "";

    if (!clientId) {

        elements.vehicleSelect.disabled =
            true;

        elements.vehicleSelect.innerHTML = `
            <option value="">
                Sélectionnez d'abord un client
            </option>
        `;

        return;
    }

    const vehicles =
        getVehicles();

    const clientVehicles =
        vehicles.filter(vehicle => {

            return (
                String(vehicle.clientId) ===
                String(clientId)
            );
        });

    elements.vehicleSelect.disabled =
        false;

    if (clientVehicles.length === 0) {

        elements.vehicleSelect.innerHTML = `
            <option value="">
                Aucun véhicule pour ce client
            </option>
        `;

        return;
    }

    elements.vehicleSelect.innerHTML = `
        <option value="">
            Sélectionner un véhicule
        </option>
    `;

    clientVehicles.forEach(vehicle => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            vehicle.id;

        option.textContent =
            getVehicleLabel(vehicle);

        if (
            String(vehicle.id) ===
            String(selectedVehicleId)
        ) {

            option.selected = true;
        }

        elements.vehicleSelect.appendChild(
            option
        );
    });
}


/* =========================================================
   PRESTATIONS
========================================================= */

function getServiceName(service) {

    if (!service) {
        return "Prestation inconnue";
    }

    return (
        service.name ||
        service.title ||
        service.libelle ||
        service.nom ||
        "Prestation"
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


function loadServices(
    selectedServiceId = ""
) {

    const services =
        getServices();

    elements.serviceSelect.innerHTML = `
        <option value="">
            Sélectionner une prestation
        </option>
    `;

    services.forEach(service => {

        if (
            service.active === false ||
            service.status === "inactive"
        ) {
            return;
        }

        const option =
            document.createElement(
                "option"
            );

        option.value =
            service.id;

        option.textContent =
            `${getServiceName(service)} — ${formatPrice(
                getServicePrice(service)
            )}`;

        if (
            String(service.id) ===
            String(selectedServiceId)
        ) {

            option.selected = true;
        }

        elements.serviceSelect.appendChild(
            option
        );
    });
}


function updatePrice() {

    const serviceId =
        elements.serviceSelect.value;

    const service =
        getServices().find(
            item =>
                String(item.id) ===
                String(serviceId)
        );

    const price =
        getServicePrice(service);

    elements.priceDisplay.textContent =
        formatPrice(price);
}


/* =========================================================
   STATUTS
========================================================= */

function getStatusLabel(status) {

    const labels = {

        pending: "En attente",

        confirmed: "Confirmée",

        completed: "Terminée",

        cancelled: "Annulée"
    };

    return (
        labels[status] ||
        "Inconnu"
    );
}


function getStatusClass(status) {

    const classes = {

        pending: "status-pending",

        confirmed: "status-confirmed",

        completed: "status-completed",

        cancelled: "status-cancelled"
    };

    return (
        classes[status] ||
        ""
    );
}


/* =========================================================
   RÉCUPÉRER LES INFOS D'UNE RÉSERVATION
========================================================= */

function getReservationRelations(
    reservation
) {

    const client =
        getClients().find(
            item =>
                String(item.id) ===
                String(
                    reservation.clientId
                )
        );

    const vehicle =
        getVehicles().find(
            item =>
                String(item.id) ===
                String(
                    reservation.vehicleId
                )
        );

    const service =
        getServices().find(
            item =>
                String(item.id) ===
                String(
                    reservation.serviceId
                )
        );

    return {
        client,
        vehicle,
        service
    };
}


/* =========================================================
   RENDU DU TABLEAU
========================================================= */

function renderReservations() {

    const reservations =
        getReservations();

    const search =
        elements.searchInput.value
            .trim()
            .toLowerCase();

    const date =
        elements.dateFilter.value;

    const status =
        elements.statusFilter.value;

    const filtered =
        reservations.filter(
            reservation => {

                const {
                    client,
                    vehicle,
                    service
                } =
                    getReservationRelations(
                        reservation
                    );

                const clientName =
                    client
                        ? getClientName(client)
                        : reservation.clientName || "";

                const vehicleName =
                    vehicle
                        ? getVehicleLabel(vehicle)
                        : reservation.vehicleName || "";

                const serviceName =
                    service
                        ? getServiceName(service)
                        : reservation.serviceName || "";

                const searchable =
                    [
                        reservation.id,
                        clientName,
                        vehicleName,
                        serviceName,
                        reservation.date,
                        reservation.time,
                        reservation.status
                    ]
                        .join(" ")
                        .toLowerCase();

                const matchesSearch =
                    searchable.includes(
                        search
                    );

                const matchesDate =
                    !date ||
                    reservation.date === date;

                const matchesStatus =
                    status === "all" ||
                    reservation.status === status;

                return (
                    matchesSearch &&
                    matchesDate &&
                    matchesStatus
                );
            }
        );

    elements.tableBody.innerHTML = "";

    if (filtered.length === 0) {

        elements.emptyState.classList.remove(
            "d-none"
        );

    } else {

        elements.emptyState.classList.add(
            "d-none"
        );
    }


    filtered.forEach(
        reservation => {

            const {
                client,
                vehicle,
                service
            } =
                getReservationRelations(
                    reservation
                );

            const clientName =
                client
                    ? getClientName(client)
                    : reservation.clientName ||
                      "Client supprimé";

            const clientPhone =
                getClientPhone(client);

            const vehicleName =
                vehicle
                    ? getVehicleLabel(vehicle)
                    : reservation.vehicleName ||
                      "Véhicule supprimé";

            const serviceName =
                service
                    ? getServiceName(service)
                    : reservation.serviceName ||
                      "Prestation supprimée";

            const price =
                service
                    ? getServicePrice(service)
                    : Number(
                        reservation.price || 0
                    );

            const reference =
                "RES-" +
                String(
                    reservation.id
                ).slice(-6);

            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML = `

                <td>
                    <span class="reference">
                        ${escapeHTML(reference)}
                    </span>
                </td>

                <td>

                    <span class="client-name">
                        ${escapeHTML(clientName)}
                    </span>

                    ${
                        clientPhone
                            ? `
                                <span class="client-phone">
                                    ${escapeHTML(clientPhone)}
                                </span>
                            `
                            : ""
                    }

                </td>

                <td>

                    <span class="vehicle-name">
                        ${escapeHTML(vehicleName)}
                    </span>

                </td>

                <td>
                    ${escapeHTML(serviceName)}
                </td>

                <td>
                    ${formatDate(
                        reservation.date
                    )}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(
                            reservation.time || "-"
                        )}
                    </strong>
                </td>

                <td>

                    <span class="amount">
                        ${formatPrice(price)}
                    </span>

                </td>

                <td>

                    <span class="status ${getStatusClass(
                        reservation.status
                    )}">
                        ${getStatusLabel(
                            reservation.status
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
                            data-id="${reservation.id}"
                        >
                            <i class="bi bi-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn action-edit"
                            title="Modifier"
                            data-action="edit"
                            data-id="${reservation.id}"
                        >
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn action-delete"
                            title="Supprimer"
                            data-action="delete"
                            data-id="${reservation.id}"
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

    updateStatistics(
        reservations
    );
}


/* =========================================================
   STATISTIQUES
========================================================= */

function updateStatistics(
    reservations
) {

    elements.totalReservations.textContent =
        reservations.length;

    elements.pendingReservations.textContent =
        reservations.filter(
            item =>
                item.status === "pending"
        ).length;

    elements.confirmedReservations.textContent =
        reservations.filter(
            item =>
                item.status === "confirmed"
        ).length;

    elements.cancelledReservations.textContent =
        reservations.filter(
            item =>
                item.status === "cancelled"
        ).length;
}


/* =========================================================
   NOUVELLE RÉSERVATION
========================================================= */

function openCreateModal() {

    elements.reservationForm.reset();

    elements.reservationId.value = "";

    elements.modalTitle.textContent =
        "Nouvelle réservation";

    elements.reservationStatus.value =
        "pending";

    elements.priceDisplay.textContent =
        "0 FCFA";

    loadClients();

    loadServices();

    elements.vehicleSelect.innerHTML = `
        <option value="">
            Sélectionnez d'abord un client
        </option>
    `;

    elements.vehicleSelect.disabled =
        true;

    elements.reservationDate.value =
        getToday();

    elements.reservationTime.value =
        "09:00";

    elements.reservationNotes.value =
        "";

    reservationModal.show();
}


/* =========================================================
   MODIFIER
========================================================= */

function openEditModal(id) {

    const reservation =
        getReservations().find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!reservation) {

        alert(
            "Réservation introuvable."
        );

        return;
    }

    elements.reservationId.value =
        reservation.id;

    elements.modalTitle.textContent =
        "Modifier la réservation";

    loadClients(
        reservation.clientId
    );

    loadVehicles(
        reservation.clientId,
        reservation.vehicleId
    );

    loadServices(
        reservation.serviceId
    );

    elements.reservationDate.value =
        reservation.date || "";

    elements.reservationTime.value =
        reservation.time || "";

    elements.reservationStatus.value =
        reservation.status || "pending";

    elements.reservationNotes.value =
        reservation.notes || "";

    updatePrice();

    reservationModal.show();
}


/* =========================================================
   VÉRIFICATION CRÉNEAU
========================================================= */

function hasScheduleConflict(
    date,
    time,
    ignoredId = null
) {

    return getReservations().some(
        reservation => {

            if (
                ignoredId &&
                String(reservation.id) ===
                String(ignoredId)
            ) {

                return false;
            }

            if (
                reservation.status ===
                "cancelled"
            ) {

                return false;
            }

            return (
                reservation.date === date &&
                reservation.time === time
            );
        }
    );
}


/* =========================================================
   ENREGISTRER
========================================================= */

function saveReservation(
    event
) {

    event.preventDefault();

    const id =
        elements.reservationId.value.trim();

    const clientId =
        elements.clientSelect.value;

    const vehicleId =
        elements.vehicleSelect.value;

    const serviceId =
        elements.serviceSelect.value;

    const date =
        elements.reservationDate.value;

    const time =
        elements.reservationTime.value;

    const status =
        elements.reservationStatus.value;

    const notes =
        elements.reservationNotes.value.trim();


    /* Validation */

    if (
        !clientId ||
        !vehicleId ||
        !serviceId ||
        !date ||
        !time
    ) {

        alert(
            "Veuillez remplir tous les champs obligatoires."
        );

        return;
    }


    /* Vérifier client */

    const client =
        getClients().find(
            item =>
                String(item.id) ===
                String(clientId)
        );

    if (!client) {

        alert(
            "Le client sélectionné n'existe plus."
        );

        return;
    }


    /* Vérifier véhicule */

    const vehicle =
        getVehicles().find(
            item =>
                String(item.id) ===
                String(vehicleId)
        );

    if (!vehicle) {

        alert(
            "Le véhicule sélectionné n'existe plus."
        );

        return;
    }


    if (
        String(vehicle.clientId) !==
        String(clientId)
    ) {

        alert(
            "Le véhicule sélectionné n'appartient pas à ce client."
        );

        return;
    }


    /* Vérifier prestation */

    const service =
        getServices().find(
            item =>
                String(item.id) ===
                String(serviceId)
        );

    if (!service) {

        alert(
            "La prestation sélectionnée n'existe plus."
        );

        return;
    }


    /* Vérifier créneau */

    if (
        hasScheduleConflict(
            date,
            time,
            id || null
        )
    ) {

        alert(
            "Ce créneau est déjà occupé. Veuillez choisir une autre heure."
        );

        return;
    }


    let reservations =
        getReservations();


    const reservationData = {

        id:
            id
                ? Number(id)
                : generateId(),

        clientId:
            Number(clientId),

        vehicleId:
            Number(vehicleId),

        serviceId:
            Number(serviceId),

        date,

        time,

        status,

        notes,

        price:
            getServicePrice(service),

        createdAt:
            id
                ? undefined
                : new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    };


    /* Modification */

    if (id) {

        const index =
            reservations.findIndex(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (index === -1) {

            alert(
                "Impossible de modifier cette réservation."
            );

            return;
        }

        const oldReservation =
            reservations[index];

        reservationData.createdAt =
            oldReservation.createdAt ||
            new Date().toISOString();

        reservations[index] =
            reservationData;

    }

    /* Création */

    else {

        reservations.push(
            reservationData
        );
    }


    /* Sauvegarde */

    const saved =
        saveStorage(
            STORAGE.reservations,
            reservations
        );

    if (!saved) {

        alert(
            "Une erreur est survenue lors de l'enregistrement."
        );

        return;
    }


    /* Fermer modal */

    reservationModal.hide();


    /* Actualiser tableau */

    renderReservations();


    /* Message */

    showNotification(
        id
            ? "Réservation modifiée avec succès."
            : "Réservation créée avec succès.",
        "success"
    );
}


/* =========================================================
   VOIR DÉTAILS
========================================================= */

function viewReservation(id) {

    const reservation =
        getReservations().find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!reservation) {

        alert(
            "Réservation introuvable."
        );

        return;
    }

    const {
        client,
        vehicle,
        service
    } =
        getReservationRelations(
            reservation
        );

    const clientName =
        client
            ? getClientName(client)
            : "Client supprimé";

    const vehicleName =
        vehicle
            ? getVehicleLabel(vehicle)
            : "Véhicule supprimé";

    const serviceName =
        service
            ? getServiceName(service)
            : "Prestation supprimée";

    const price =
        service
            ? getServicePrice(service)
            : Number(
                reservation.price || 0
            );

    const reference =
        "RES-" +
        String(
            reservation.id
        ).slice(-6);


    elements.detailsContent.innerHTML = `

        <div class="detail-row">

            <span class="detail-label">
                Référence
            </span>

            <span class="detail-value">
                ${escapeHTML(reference)}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Client
            </span>

            <span class="detail-value">
                ${escapeHTML(clientName)}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Téléphone
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    getClientPhone(client) ||
                    "-"
                )}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Véhicule
            </span>

            <span class="detail-value">
                ${escapeHTML(vehicleName)}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Prestation
            </span>

            <span class="detail-value">
                ${escapeHTML(serviceName)}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Date
            </span>

            <span class="detail-value">
                ${formatDate(
                    reservation.date
                )}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Heure
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    reservation.time || "-"
                )}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Montant
            </span>

            <span class="detail-value">
                ${formatPrice(price)}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Statut
            </span>

            <span class="status ${getStatusClass(
                reservation.status
            )}">
                ${getStatusLabel(
                    reservation.status
                )}
            </span>

        </div>


        <div class="detail-row">

            <span class="detail-label">
                Notes
            </span>

            <span class="detail-value">
                ${
                    reservation.notes
                        ? escapeHTML(
                            reservation.notes
                        )
                        : "Aucune note"
                }
            </span>

        </div>

    `;

    detailsModal.show();
}


/* =========================================================
   SUPPRESSION
========================================================= */

function deleteReservation(id) {

    const reservations =
        getReservations();

    const reservation =
        reservations.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!reservation) {

        alert(
            "Réservation introuvable."
        );

        return;
    }


    const reference =
        "RES-" +
        String(
            reservation.id
        ).slice(-6);


    const confirmation =
        confirm(
            `Voulez-vous vraiment supprimer la réservation ${reference} ?`
        );


    if (!confirmation) {
        return;
    }


    const updated =
        reservations.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    const saved =
        saveStorage(
            STORAGE.reservations,
            updated
        );


    if (!saved) {

        alert(
            "Impossible de supprimer la réservation."
        );

        return;
    }


    renderReservations();


    showNotification(
        "Réservation supprimée avec succès.",
        "success"
    );
}


/* =========================================================
   ACTIONS DU TABLEAU
========================================================= */

function handleTableAction(
    event
) {

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


    switch (action) {

        case "view":

            viewReservation(id);

            break;


        case "edit":

            openEditModal(id);

            break;


        case "delete":

            deleteReservation(id);

            break;


        default:

            console.warn(
                "Action inconnue :",
                action
            );
    }
}


/* =========================================================
   RÉINITIALISATION DES FILTRES
========================================================= */

function resetReservationFilters() {

    elements.searchInput.value =
        "";

    elements.dateFilter.value =
        "";

    elements.statusFilter.value =
        "all";

    renderReservations();

    elements.searchInput.focus();
}


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification(
    message,
    type = "success"
) {

    const existing =
        document.querySelector(
            ".bide-notification"
        );

    if (existing) {
        existing.remove();
    }


    const notification =
        document.createElement(
            "div"
        );

    notification.className =
        `bide-notification ${type}`;

    notification.innerHTML = `

        <i class="bi bi-check-circle-fill"></i>

        <span>
            ${escapeHTML(message)}
        </span>

    `;


    document.body.appendChild(
        notification
    );


    setTimeout(
        () => {

            notification.classList.add(
                "hide"
            );

            setTimeout(
                () =>
                    notification.remove(),
                300
            );

        },
        3000
    );
}


/* =========================================================
   ÉVÉNEMENTS
========================================================= */

function initializeEvents() {

    /* Nouvelle réservation */

    elements.newReservationBtn.addEventListener(
        "click",
        openCreateModal
    );


    /* Formulaire */

    elements.reservationForm.addEventListener(
        "submit",
        saveReservation
    );


    /* Client */

    elements.clientSelect.addEventListener(
        "change",
        function () {

            loadVehicles(
                this.value
            );
        }
    );


    /* Prestation */

    elements.serviceSelect.addEventListener(
        "change",
        updatePrice
    );


    /* Recherche */

    elements.searchInput.addEventListener(
        "input",
        renderReservations
    );


    /* Date */

    elements.dateFilter.addEventListener(
        "change",
        renderReservations
    );


    /* Statut */

    elements.statusFilter.addEventListener(
        "change",
        renderReservations
    );


    /* Réinitialisation */

    elements.resetFiltersBtn.addEventListener(
        "click",
        resetReservationFilters
    );


    /* Actions tableau */

    elements.tableBody.addEventListener(
        "click",
        handleTableAction
    );


    /* Menu mobile */

    if (elements.mobileMenuBtn) {

        elements.mobileMenuBtn.addEventListener(
            "click",
            function () {

                elements.sidebar.classList.toggle(
                    "show"
                );
            }
        );
    }


    /* Déconnexion */

    if (elements.logoutBtn) {

        elements.logoutBtn.addEventListener(
            "click",
            function () {

                const confirmed =
                    confirm(
                        "Voulez-vous vraiment vous déconnecter ?"
                    );

                if (confirmed) {

                    window.location.href =
                        "login.html";
                }
            }
        );
    }
}


/* =========================================================
   INITIALISATION
========================================================= */

function initReservations() {

    if (!checkRequiredElements()) {
        return;
    }

    if (!initializeModals()) {
        return;
    }

    loadClients();

    loadServices();

    loadVehicles();

    renderReservations();

    initializeEvents();

    console.log(
        "Bidè — Module Réservations initialisé avec succès."
    );
}


/* =========================================================
   DÉMARRAGE
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initReservations
    );

} else {

    initReservations();
}
