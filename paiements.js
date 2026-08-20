"use strict";

/*
|--------------------------------------------------------------------------
| BIDÈ - GESTION DES PAIEMENTS
|--------------------------------------------------------------------------
| Stockage :
| bide_clients
| bide_reservations
| bide_paiements
| bide_prestations
|--------------------------------------------------------------------------
*/

const STORAGE = {


/* ==========================================================================

   DOM
========================================================================== */


const elements = {

    tableBody: document.getElementById("paymentsTableBody"),
    emptyState: document.getElementById("emptyState"),


    search: document.getElementById("searchInput"),
    dateFilter: document.getElementById("dateFilter"),

    methodFilter: document.getElementById("methodFilter"),

    statusFilter: document.getElementById("statusFilter"),
    resetButton: document.getElementById("resetFiltersBtn"),


    form: document.getElementById("paymentForm"),

    paymentId: document.getElementById("paymentId"),


    reservation: document.getElementById("reservationSelect"),


    clientName: document.getElementById("clientPreviewName"),

    clientPhone: document.getElementById("clientPreviewPhone"),

    amount: document.getElementById("paymentAmount"),
    method: document.getElementById("paymentMethod"),

    date: document.getElementById("paymentDate"),
    status: document.getElementById("paymentStatus"),

    reference: document.getElementById("transactionReference"),
    notes: document.getElementById("paymentNotes"),


    modalTitle: document.getElementById("modalTitle"),
    saveButton: document.getElementById("savePaymentBtn"),

    details: document.getElementById("detailsContent"),

    totalAmount: document.getElementById("totalAmount"),
    paidCount: document.getElementById("successfulPayments"),
    pendingCount: document.getElementById("pendingPayments"),
    failedCount: document.getElementById("failedPayments"),

    newButton: document.getElementById("newPaymentBtn"),

    mobileMenu: document.getElementById("mobileMenuBtn"),
    sidebar: document.getElementById("sidebar"),

    logout: document.getElementById("logoutBtn")
};


/* ==========================================================================
   VÉRIFICATION DU DOM
========================================================================== */

function checkRequiredElements() {

    const required = [
        "tableBody",
        "emptyState",
        "search",
        "dateFilter",
        "methodFilter",
        "statusFilter",
        "resetButton",
        "form",
        "paymentId",
        "reservation",
        "clientName",
        "clientPhone",
        "amount",
        "method",
        "date",
        "status",
        "reference",
        "notes",
        "modalTitle",
        "saveButton",
        "details",
        "totalAmount",
        "paidCount",
        "pendingCount",
        "failedCount",
        "newButton",
        "mobileMenu",
        "sidebar",
        "logout"
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


/* ==========================================================================
   MODALS BOOTSTRAP
========================================================================== */

let paymentModal = null;
let detailsModal = null;


function initModals() {

    const paymentModalElement =
        document.getElementById("paymentModal");

    const detailsModalElement =
        document.getElementById("detailsModal");

    if (!paymentModalElement || !detailsModalElement) {
        console.error("Modales Bootstrap introuvables.");
        return;
    }

    paymentModal =
        bootstrap.Modal.getOrCreateInstance(
            paymentModalElement
        );

    detailsModal =
        bootstrap.Modal.getOrCreateInstance(
            detailsModalElement
        );
}


/* ==========================================================================
   LOCAL STORAGE
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
            `Erreur de lecture de ${key}`,
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
    return readStorage(STORAGE.clients);
}


function getReservations() {
    return readStorage(STORAGE.reservations);
}


function getPayments() {
    return readStorage(STORAGE.payments);
}


function getServices() {
    return readStorage(STORAGE.services);
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


function formatPrice(value) {

    const amount =
        Number(value) || 0;

    return new Intl.NumberFormat("fr-FR")
        .format(amount) +
        " FCFA";
}


function formatDate(date) {

    if (!date) {
        return "-";
    }

    const parts =
        String(date).split("-");

    if (parts.length !== 3) {
        return String(date);
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


function today() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
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

    return "Client sans nom";
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
   RÉSERVATION
========================================================================== */

function getReservationClientId(reservation) {

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


function getReservationDate(reservation) {

    if (!reservation) {
        return "";
    }

    return (
        reservation.date ||
        reservation.reservationDate ||
        reservation.bookingDate ||
        ""
    );
}


function getReservationTime(reservation) {

    if (!reservation) {
        return "";
    }

    return (
        reservation.time ||
        reservation.reservationTime ||
        ""
    );
}


function getReservationLabel(reservation) {

    if (!reservation) {
        return "Réservation supprimée";
    }

    const id =
        reservation.id ??
        reservation._id ??
        "";

    const reference =
        reservation.reference ||
        reservation.referenceReservation ||
        `RES-${String(id).slice(-6)}`;

    const date =
        getReservationDate(reservation);

    const time =
        getReservationTime(reservation);

    let label = reference;

    if (date) {
        label += ` — ${formatDate(date)}`;
    }

    if (time) {
        label += ` ${time}`;
    }

    return label;
}


function getReservationById(id) {

    return getReservations().find(
        reservation =>
            String(
                reservation.id ??
                reservation._id
            ) === String(id)
    );
}


/* ==========================================================================
   MOYENS DE PAIEMENT
========================================================================== */

function methodLabel(method) {

    const labels = {

        cash: "Espèces",

        mobile_money:
            "Mobile Money",

        card:
            "Carte bancaire",

        transfer:
            "Virement bancaire",

        bank:
            "Virement bancaire"
    };

    return labels[method] || method || "-";
}


/* ==========================================================================
   STATUTS
========================================================================== */

function statusLabel(status) {

    const labels = {

        paid: "Payé",

        pending:
            "En attente",

        failed:
            "Échoué",

        cancelled:
            "Annulé"
    };

    return labels[status] || status || "-";
}


function statusClass(status) {

    const classes = {

        paid: "status-paid",

        pending:
            "status-pending",

        failed:
            "status-failed",

        cancelled:
            "status-cancelled"
    };

    return classes[status] || "";
}


/* ==========================================================================
   CHARGER LES RÉSERVATIONS
========================================================================== */

function loadReservations(selectedId = "") {

    const reservations =
        getReservations();

    elements.reservation.innerHTML = "";

    const firstOption =
        document.createElement("option");

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
                document.createElement("option");

            option.value = id;

            option.textContent =
                getReservationLabel(
                    reservation
                );

            if (
                selectedId !== "" &&
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
   APERÇU CLIENT
========================================================================== */

function updateClientPreview() {

    const reservationId =
        elements.reservation.value;

    if (!reservationId) {

        elements.clientName.textContent =
            "Aucun client";

        elements.clientPhone.textContent =
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

        return;
    }


    const clientId =
        getReservationClientId(
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


    elements.clientName.textContent =
        getClientName(client);

    elements.clientPhone.textContent =
        getClientPhone(client) ||
        "Téléphone non renseigné";


    /*
     * Pour un nouveau paiement uniquement,
     * on peut proposer le prix de la prestation.
     */
    if (
        !elements.paymentId.value &&
        !elements.amount.value
    ) {

        const serviceId =
            reservation.serviceId ??
            reservation.service_id ??
            reservation.prestationId ??
            reservation.prestation_id;

        if (serviceId) {

            const service =
                getServices().find(
                    item =>
                        String(
                            item.id ??
                            item._id
                        ) ===
                        String(serviceId)
                );

            if (service) {

                const price =
                    Number(
                        service.price ??
                        service.prix ??
                        service.amount ??
                        service.montant ??
                        0
                    );

                if (price > 0) {
                    elements.amount.value =
                        price;
                }
            }
        }
    }
}


/* ==========================================================================
   RENDU DU TABLEAU
========================================================================== */

function renderPayments() {

    const payments =
        getPayments();

    const reservations =
        getReservations();

    const clients =
        getClients();


    const search =
        elements.search.value
            .trim()
            .toLowerCase();

    const selectedDate =
        elements.dateFilter.value;

    const selectedMethod =
        elements.methodFilter.value;

    const selectedStatus =
        elements.statusFilter.value;


    const filtered =
        payments.filter(
            payment => {

                const reservation =
                    reservations.find(
                        item =>
                            String(
                                item.id ??
                                item._id
                            ) ===
                            String(
                                payment.reservationId
                            )
                    );


                const client =
                    reservation
                        ? clients.find(
                            item =>
                                String(
                                    item.id ??
                                    item._id
                                ) ===
                                String(
                                    getReservationClientId(
                                        reservation
                                    )
                                )
                        )
                        : null;


                const clientName =
                    getClientName(client);

                const reference =
                    payment.reference ||
                    `PAY-${String(
                        payment.id
                    ).slice(-6)}`;

                const reservationLabel =
                    getReservationLabel(
                        reservation
                    );


                const searchable = [
                    clientName,
                    reference,
                    reservationLabel,
                    payment.amount,
                    methodLabel(payment.method),
                    statusLabel(payment.status)
                ]
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    searchable.includes(
                        search
                    );


                const matchesDate =
                    !selectedDate ||
                    payment.date === selectedDate;


                const matchesMethod =
                    selectedMethod === "all" ||
                    payment.method === selectedMethod;


                const matchesStatus =
                    selectedStatus === "all" ||
                    payment.status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesDate &&
                    matchesMethod &&
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
        payment => {

            const reservation =
                reservations.find(
                    item =>
                        String(
                            item.id ??
                            item._id
                        ) ===
                        String(
                            payment.reservationId
                        )
                );


            const client =
                reservation
                    ? clients.find(
                        item =>
                            String(
                                item.id ??
                                item._id
                            ) ===
                            String(
                                getReservationClientId(
                                    reservation
                                )
                            )
                    )
                    : null;


            const clientName =
                getClientName(client);

            const clientPhone =
                getClientPhone(client);


            const reference =
                payment.reference ||
                `PAY-${String(
                    payment.id
                ).slice(-6)}`;


            const row =
                document.createElement("tr");


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

                    <span class="client-phone">
                        ${escapeHTML(
                            clientPhone || "—"
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
                    <span class="amount">
                        ${formatPrice(
                            payment.amount
                        )}
                    </span>
                </td>

                <td>
                    <span class="method">
                        ${escapeHTML(
                            methodLabel(
                                payment.method
                            )
                        )}
                    </span>
                </td>

                <td>
                    ${formatDate(payment.date)}
                </td>

                <td>
                    <span class="status ${statusClass(
                        payment.status
                    )}">
                        ${escapeHTML(
                            statusLabel(
                                payment.status
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
                            data-id="${escapeHTML(payment.id)}"
                        >
                            <i class="bi bi-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn action-edit"
                            title="Modifier"
                            data-action="edit"
                            data-id="${escapeHTML(payment.id)}"
                        >
                            <i class="bi bi-pencil"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn action-delete"
                            title="Supprimer"
                            data-action="delete"
                            data-id="${escapeHTML(payment.id)}"
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


    updateStatistics(payments);
}


/* ==========================================================================
   STATISTIQUES
========================================================================== */

function updateStatistics(payments) {

    const paidPayments =
        payments.filter(
            payment =>
                payment.status === "paid"
        );


    const total =
        paidPayments.reduce(
            (sum, payment) =>
                sum +
                Number(
                    payment.amount
                ),
            0
        );


    const pending =
        payments.filter(
            payment =>
                payment.status === "pending"
        ).length;


    const failed =
        payments.filter(
            payment =>
                payment.status === "failed" ||
                payment.status === "cancelled"
        ).length;


    elements.totalAmount.textContent =
        formatPrice(total);

    elements.paidCount.textContent =
        paidPayments.length;

    elements.pendingCount.textContent =
        pending;

    elements.failedCount.textContent =
        failed;
}


/* ==========================================================================
   RÉINITIALISER LE FORMULAIRE
========================================================================== */

function resetPaymentForm() {

    elements.form.reset();

    elements.paymentId.value = "";

    elements.clientName.textContent =
        "Aucun client";

    elements.clientPhone.textContent =
        "—";

    elements.amount.value = "";

    elements.method.value = "";

    elements.date.value =
        today();

    elements.status.value =
        "paid";

    elements.reference.value = "";

    elements.notes.value = "";

    elements.reservation.value = "";
}


/* ==========================================================================
   NOUVEAU PAIEMENT
========================================================================== */

function openCreateModal() {

    resetPaymentForm();

    elements.modalTitle.textContent =
        "Nouveau paiement";

    elements.saveButton.innerHTML =
        `<i class="bi bi-check-lg"></i> Enregistrer`;

    loadReservations();

    elements.date.value =
        today();

    elements.status.value =
        "paid";

    paymentModal.show();
}


/* ==========================================================================
   MODIFIER PAIEMENT
========================================================================== */

function openEditModal(id) {

    const payment =
        getPayments().find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!payment) {

        alert(
            "Paiement introuvable."
        );

        return;
    }


    resetPaymentForm();


    elements.paymentId.value =
        payment.id;

    elements.modalTitle.textContent =
        "Modifier le paiement";

    elements.saveButton.innerHTML =
        `<i class="bi bi-check-lg"></i> Enregistrer les modifications`;


    loadReservations(
        payment.reservationId
    );


    elements.amount.value =
        payment.amount ?? "";

    elements.method.value =
        payment.method ?? "";

    elements.date.value =
        payment.date ?? today();

    elements.status.value =
        payment.status ?? "paid";

    elements.reference.value =
        payment.reference ?? "";

    elements.notes.value =
        payment.notes ?? "";


    updateClientPreview();

    paymentModal.show();
}


/* ==========================================================================
   ENREGISTRER PAIEMENT
========================================================================== */

function savePayment(event) {

    event.preventDefault();


    const reservationId =
        elements.reservation.value;

    const amount =
        Number(
            elements.amount.value
        );

    const method =
        elements.method.value;

    const date =
        elements.date.value;

    const status =
        elements.status.value;

    const reference =
        elements.reference.value.trim();

    const notes =
        elements.notes.value.trim();

    const existingId =
        elements.paymentId.value;


    /* VALIDATION */

    if (!reservationId) {

        alert(
            "Veuillez sélectionner une réservation."
        );

        elements.reservation.focus();

        return;
    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Veuillez saisir un montant valide."
        );

        elements.amount.focus();

        return;
    }


    if (!method) {

        alert(
            "Veuillez sélectionner un moyen de paiement."
        );

        elements.method.focus();

        return;
    }


    if (!date) {

        alert(
            "Veuillez sélectionner une date."
        );

        elements.date.focus();

        return;
    }


    if (!status) {

        alert(
            "Veuillez sélectionner un statut."
        );

        elements.status.focus();

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


    let payments =
        getPayments();


    /* ID */

    const paymentId =
        existingId ||
        generateId();


    /* OBJET PAIEMENT */

    const payment = {

        id: paymentId,

        reservationId:
            reservation.id ??
            reservation._id,

        amount: amount,

        method: method,

        date: date,

        status: status,

        reference:
            reference ||
            `PAY-${paymentId}`,

        notes: notes,

        updatedAt:
            new Date().toISOString()
    };


    /* MODIFICATION */

    if (existingId) {

        const index =
            payments.findIndex(
                item =>
                    String(item.id) ===
                    String(existingId)
            );


        if (index === -1) {

            alert(
                "Le paiement à modifier est introuvable."
            );

            return;
        }


        payment.createdAt =
            payments[index].createdAt ||
            new Date().toISOString();


        payments[index] =
            payment;


    } else {

        payment.createdAt =
            new Date().toISOString();

        payments.push(
            payment
        );
    }


    /* SAUVEGARDE */

    try {

        saveStorage(
            STORAGE.payments,
            payments
        );

    } catch (error) {

        console.error(error);

        alert(
            "Impossible d'enregistrer le paiement."
        );

        return;
    }


    /* ACTUALISATION */

    renderPayments();

    paymentModal.hide();

    alert(
        existingId
            ? "Paiement modifié avec succès."
            : "Paiement ajouté avec succès."
    );
}


/* ==========================================================================
   DÉTAILS
========================================================================== */

function viewPayment(id) {

    const payment =
        getPayments().find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!payment) {

        alert(
            "Paiement introuvable."
        );

        return;
    }


    const reservation =
        getReservationById(
            payment.reservationId
        );


    const clientId =
        getReservationClientId(
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


    const reference =
        payment.reference ||
        `PAY-${String(
            payment.id
        ).slice(-6)}`;


    elements.details.innerHTML = `

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
                Date
            </span>

            <span class="detail-value">
                ${formatDate(
                    payment.date
                )}
            </span>
        </div>


        <div class="detail-row">
            <span class="detail-label">
                Montant
            </span>

            <span class="detail-value">
                ${formatPrice(
                    payment.amount
                )}
            </span>
        </div>


        <div class="detail-row">
            <span class="detail-label">
                Moyen
            </span>

            <span class="detail-value">
                ${escapeHTML(
                    methodLabel(
                        payment.method
                    )
                )}
            </span>
        </div>


        <div class="detail-row">
            <span class="detail-label">
                Statut
            </span>

            <span class="status ${statusClass(
                payment.status
            )}">
                ${escapeHTML(
                    statusLabel(
                        payment.status
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
                    payment.notes
                        ? escapeHTML(
                            payment.notes
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

function deletePayment(id) {

    const payments =
        getPayments();


    const payment =
        payments.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!payment) {

        alert(
            "Paiement introuvable."
        );

        return;
    }


    const confirmed =
        confirm(
            `Voulez-vous vraiment supprimer le paiement ${
                payment.reference ||
                `PAY-${payment.id}`
            } ?`
        );


    if (!confirmed) {
        return;
    }


    const updated =
        payments.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    saveStorage(
        STORAGE.payments,
        updated
    );


    renderPayments();


    alert(
        "Paiement supprimé avec succès."
    );
}


/* ==========================================================================
   RÉINITIALISATION DES FILTRES
========================================================================== */

function resetPaymentFilters() {

    /* Recherche */
    elements.search.value = "";

    /* Date */
    elements.dateFilter.value = "";

    /* Moyen */
    elements.methodFilter.value = "all";

    /* Statut */
    elements.statusFilter.value = "all";

    /* Actualiser immédiatement le tableau */
    renderPayments();

    /* Remettre le curseur dans la recherche */
    elements.search.focus();
}


/* ==========================================================================
   MENU MOBILE
========================================================================== */

function toggleMobileMenu() {

    elements.sidebar.classList.toggle(
        "show"
    );
}


/* ==========================================================================
   DÉCONNEXION
========================================================================== */

function logout() {

    const confirmed =
        confirm(
            "Voulez-vous vraiment vous déconnecter ?"
        );


    if (!confirmed) {
        return;
    }


    window.location.href =
        "login.html";
}


/* ==========================================================================
   ÉVÉNEMENTS
========================================================================== */

function bindEvents() {

    /* Nouveau paiement */
    elements.newButton.addEventListener(
        "click",
        openCreateModal
    );


    /* Formulaire */
    elements.form.addEventListener(
        "submit",
        savePayment
    );


    /* Réservation */
    elements.reservation.addEventListener(
        "change",
        updateClientPreview
    );


    /* Recherche */
    elements.search.addEventListener(
        "input",
        renderPayments
    );


    /* Filtres */
    elements.dateFilter.addEventListener(
        "change",
        renderPayments
    );

    elements.methodFilter.addEventListener(
        "change",
        renderPayments
    );

    elements.statusFilter.addEventListener(
        "change",
        renderPayments
    );


    /* Réinitialiser */
    elements.resetButton.addEventListener(
        "click",
        resetPaymentFilters
    );


    /* Actions tableau */
    elements.tableBody.addEventListener(
        "click",
        function(event) {

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
                    viewPayment(id);
                    break;

                case "edit":
                    openEditModal(id);
                    break;

                case "delete":
                    deletePayment(id);
                    break;
            }
        }
    );


    /* Menu mobile */
    elements.mobileMenu.addEventListener(
        "click",
        toggleMobileMenu
    );


    /* Déconnexion */
    elements.logout.addEventListener(
        "click",
        logout
    );
}


/* ==========================================================================
   INITIALISATION
========================================================================== */

function init() {

    if (!checkRequiredElements()) {
        return;
    }

    initModals();

    bindEvents();

    loadReservations();

    renderPayments();
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
