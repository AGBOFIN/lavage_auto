"use strict";

/* =====================================================
   CONFIGURATION
===================================================== */

const STORAGE_KEY = "bide_utilisateurs";

/* =====================================================
   DONNEES INITIALES
===================================================== */

const defaultUsers = [
    {
        id: crypto.randomUUID(),
        status: "active",
        password: "Admin123",
        createdAt: "2026-01-10"

    },
    {

        id: crypto.randomUUID(),

        firstName: "Koffi",
        lastName: "Mensah",
        email: "koffi@bide.tg",

        phone: "+228 90 00 00 02",
        role: "manager",

        status: "active",
        password: "Manager123",

        createdAt: "2026-02-15"
    }

];

/* =====================================================

   VARIABLES
===================================================== */


let users = [];
let editingUserId = null;


let userModal;
let detailsModal;

let toast;


/* =====================================================
   INITIALISATION
===================================================== */


document.addEventListener("DOMContentLoaded", () => {


    initializeStorage();

    loadUsers();


    initializeBootstrap();


    initializeEvents();

    updateDate();


    renderUsers();


    updateStatistics();

});


/* =====================================================
   STORAGE
===================================================== */

function initializeStorage() {


    const savedUsers = localStorage.getItem(STORAGE_KEY);

    if (!savedUsers) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(defaultUsers)
        );

    }

}

function loadUsers() {

    try {

        const savedUsers =
            localStorage.getItem(STORAGE_KEY);

        users = savedUsers
            ? JSON.parse(savedUsers)
            : [];

    } catch (error) {

        console.error(
            "Erreur lecture utilisateurs :",
            error
        );

        users = [];

    }

}

function saveUsers() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(users)
    );

}

/* =====================================================
   BOOTSTRAP
===================================================== */

function initializeBootstrap() {

    const userModalElement =
        document.getElementById("userModal");

    const detailsModalElement =
        document.getElementById("detailsModal");

    userModal =
        new bootstrap.Modal(userModalElement);

    detailsModal =
        new bootstrap.Modal(detailsModalElement);

    toast =
        new bootstrap.Toast(
            document.getElementById("appToast"),
            {
                delay: 3000
            }
        );

}

/* =====================================================
   EVENEMENTS
===================================================== */

function initializeEvents() {

    document
        .getElementById("newUserBtn")
        .addEventListener(
            "click",
            openCreateModal
        );

    document
        .getElementById("userForm")
        .addEventListener(
            "submit",
            handleSubmit
        );

    document
        .getElementById("searchInput")
        .addEventListener(
            "input",
            renderUsers
        );

    document
        .getElementById("roleFilter")
        .addEventListener(
            "change",
            renderUsers
        );

    document
        .getElementById("statusFilter")
        .addEventListener(
            "change",
            renderUsers
        );

    document
        .getElementById("resetFiltersBtn")
        .addEventListener(
            "click",
            resetFilters
        );

    document
        .getElementById("usersTableBody")
        .addEventListener(
            "click",
            handleTableAction
        );

    document
        .getElementById("menuToggle")
        .addEventListener(
            "click",
            openSidebar
        );

    document
        .getElementById("sidebarClose")
        .addEventListener(
            "click",
            closeSidebar
        );

    document
        .getElementById("sidebarOverlay")
        .addEventListener(
            "click",
            closeSidebar
        );

}

/* =====================================================
   SIDEBAR
===================================================== */

function openSidebar() {

    document
        .getElementById("sidebar")
        .classList.add("show");

    document
        .getElementById("sidebarOverlay")
        .classList.add("show");

}

function closeSidebar() {

    document
        .getElementById("sidebar")
        .classList.remove("show");

    document
        .getElementById("sidebarOverlay")
        .classList.remove("show");

}

/* =====================================================
   MODAL CREATION
===================================================== */

function openCreateModal() {

    editingUserId = null;

    const form =
        document.getElementById("userForm");

    form.reset();

    document.getElementById("userId").value = "";

    document.getElementById("modalTitle").textContent =
        "Nouvel utilisateur";

    document.getElementById("password").required = true;

    document.getElementById("passwordConfirm").required = true;

    userModal.show();

}

/* =====================================================
   MODAL MODIFICATION
===================================================== */

function openEditModal(id) {

    const user =
        users.find(
            item => item.id === id
        );

    if (!user) {

        showToast(
            "Utilisateur introuvable."
        );

        return;

    }

    editingUserId = id;

    document.getElementById("modalTitle").textContent =
        "Modifier l'utilisateur";

    document.getElementById("userId").value =
        user.id;

    document.getElementById("firstName").value =
        user.firstName;

    document.getElementById("lastName").value =
        user.lastName;

    document.getElementById("email").value =
        user.email;

    document.getElementById("phone").value =
        user.phone || "";

    document.getElementById("role").value =
        user.role;

    document.getElementById("status").value =
        user.status;

    document.getElementById("password").value =
        "";

    document.getElementById("passwordConfirm").value =
        "";

    /*
      Le mot de passe n'est obligatoire
      que lors de la création.
    */

    document.getElementById("password").required =
        false;

    document.getElementById("passwordConfirm").required =
        false;

    userModal.show();

}

/* =====================================================
   ENREGISTREMENT
===================================================== */

function handleSubmit(event) {

    event.preventDefault();

    const firstName =
        document
            .getElementById("firstName")
            .value
            .trim();

    const lastName =
        document
            .getElementById("lastName")
            .value
            .trim();

    const email =
        document
            .getElementById("email")
            .value
            .trim()
            .toLowerCase();

    const phone =
        document
            .getElementById("phone")
            .value
            .trim();

    const role =
        document
            .getElementById("role")
            .value;

    const status =
        document
            .getElementById("status")
            .value;

    const password =
        document
            .getElementById("password")
            .value;

    const passwordConfirm =
        document
            .getElementById("passwordConfirm")
            .value;

    /* VALIDATIONS */

    if (!firstName || !lastName || !email || !role) {

        showToast(
            "Veuillez remplir tous les champs obligatoires."
        );

        return;

    }

    if (!isValidEmail(email)) {

        showToast(
            "Veuillez saisir une adresse email valide."
        );

        return;

    }

    /*
      Vérifier si l'email existe déjà.
    */

    const duplicate =
        users.find(
            user =>
                user.email.toLowerCase() === email &&
                user.id !== editingUserId
        );

    if (duplicate) {

        showToast(
            "Cette adresse email est déjà utilisée."
        );

        return;

    }

    /* CREATION */

    if (!editingUserId) {

        if (password.length < 6) {

            showToast(
                "Le mot de passe doit contenir au moins 6 caractères."
            );

            return;

        }

        if (password !== passwordConfirm) {

            showToast(
                "Les mots de passe ne correspondent pas."
            );

            return;

        }

        const newUser = {

            id: crypto.randomUUID(),

            firstName,

            lastName,

            email,

            phone,

            role,

            status,

            password,

            createdAt:
                getTodayISO()

        };

        users.push(newUser);

        saveUsers();

        userModal.hide();

        renderUsers();

        updateStatistics();

        showToast(
            "Utilisateur ajouté avec succès."
        );

        return;
    }

    /* MODIFICATION */

    const userIndex =
        users.findIndex(
            user =>
                user.id === editingUserId
        );

    if (userIndex === -1) {

        showToast(
            "Utilisateur introuvable."
        );

        return;

    }

    if (password || passwordConfirm) {

        if (password.length < 6) {

            showToast(
                "Le nouveau mot de passe doit contenir au moins 6 caractères."
            );

            return;

        }

        if (password !== passwordConfirm) {

            showToast(
                "Les mots de passe ne correspondent pas."
            );

            return;

        }

        users[userIndex].password =
            password;

    }

    users[userIndex].firstName =
        firstName;

    users[userIndex].lastName =
        lastName;

    users[userIndex].email =
        email;

    users[userIndex].phone =
        phone;

    users[userIndex].role =
        role;

    users[userIndex].status =
        status;

    saveUsers();

    userModal.hide();

    renderUsers();

    updateStatistics();

    showToast(
        "Utilisateur modifié avec succès."
    );

}

/* =====================================================
   AFFICHAGE
===================================================== */

function renderUsers() {

    const tbody =
        document.getElementById(
            "usersTableBody"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );

    const filteredUsers =
        getFilteredUsers();

    tbody.innerHTML = "";

    if (filteredUsers.length === 0) {

        emptyState.classList.remove("d-none");

        return;

    }

    emptyState.classList.add("d-none");

    filteredUsers.forEach(
        user => {

            const tr =
                document.createElement("tr");

            const initials =
                getInitials(
                    user.firstName,
                    user.lastName
                );

            tr.innerHTML = `

                <td>

                    <div class="user-cell">

                        <div class="user-avatar">
                            ${escapeHTML(initials)}
                        </div>

                        <div>

                            <span class="user-name">
                                ${escapeHTML(user.firstName)}
                                ${escapeHTML(user.lastName)}
                            </span>

                            <span class="user-email">
                                ${escapeHTML(user.email)}
                            </span>

                        </div>

                    </div>

                </td>

                <td>
                    ${escapeHTML(user.phone || "—")}
                </td>

                <td>
                    <span class="badge-custom ${getRoleClass(user.role)}">
                        ${getRoleLabel(user.role)}
                    </span>
                </td>

                <td>
                    ${formatDate(user.createdAt)}
                </td>

                <td>
                    <span class="badge-custom ${getStatusClass(user.status)}">
                        ${getStatusLabel(user.status)}
                    </span>
                </td>

                <td>

                    <div class="actions">

                        <button
                            class="action-btn action-view"
                            data-action="view"
                            data-id="${user.id}"
                            title="Voir">

                            <i class="bi bi-eye"></i>

                        </button>

                        <button
                            class="action-btn action-edit"
                            data-action="edit"
                            data-id="${user.id}"
                            title="Modifier">

                            <i class="bi bi-pencil"></i>

                        </button>

                        <button
                            class="action-btn action-delete"
                            data-action="delete"
                            data-id="${user.id}"
                            title="Supprimer">

                            <i class="bi bi-trash"></i>

                        </button>

                    </div>

                </td>

            `;

            tbody.appendChild(tr);

        }
    );

}

/* =====================================================
   FILTRAGE
===================================================== */

function getFilteredUsers() {

    const search =
        document
            .getElementById("searchInput")
            .value
            .trim()
            .toLowerCase();

    const role =
        document
            .getElementById("roleFilter")
            .value;

    const status =
        document
            .getElementById("statusFilter")
            .value;

    return users.filter(user => {

        const fullName =
            `${user.firstName} ${user.lastName}`
                .toLowerCase();

        const matchesSearch =
            !search ||
            fullName.includes(search) ||
            user.email.toLowerCase().includes(search) ||
            (user.phone || "")
                .toLowerCase()
                .includes(search);

        const matchesRole =
            role === "all" ||
            user.role === role;

        const matchesStatus =
            status === "all" ||
            user.status === status;

        return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
        );

    });

}

/* =====================================================
   RESET FILTRES
===================================================== */

function resetFilters() {

    document.getElementById("searchInput").value = "";

    document.getElementById("roleFilter").value =
        "all";

    document.getElementById("statusFilter").value =
        "all";

    renderUsers();

    showToast(
        "Les filtres ont été réinitialisés."
    );

}

/* =====================================================
   ACTIONS TABLE
===================================================== */

function handleTableAction(event) {

    const button =
        event.target.closest(
            "button[data-action]"
        );

    if (!button) {
        return;
    }

    const action =
        button.dataset.action;

    const id =
        button.dataset.id;

    if (action === "view") {

        openDetailsModal(id);

    }

    if (action === "edit") {

        openEditModal(id);

    }

    if (action === "delete") {

        deleteUser(id);

    }

}

/* =====================================================
   DETAILS
===================================================== */

function openDetailsModal(id) {

    const user =
        users.find(
            item => item.id === id
        );

    if (!user) {

        showToast(
            "Utilisateur introuvable."
        );

        return;

    }

    const content =
        document.getElementById(
            "detailsContent"
        );

    content.innerHTML = `

        <div class="detail-grid">

            <div class="detail-item">

                <span class="detail-label">
                    Nom complet
                </span>

                <span class="detail-value">
                    ${escapeHTML(user.firstName)}
                    ${escapeHTML(user.lastName)}
                </span>

            </div>

            <div class="detail-item">

                <span class="detail-label">
                    Email
                </span>

                <span class="detail-value">
                    ${escapeHTML(user.email)}
                </span>

            </div>

            <div class="detail-item">

                <span class="detail-label">
                    Téléphone
                </span>

                <span class="detail-value">
                    ${escapeHTML(user.phone || "Non renseigné")}
                </span>

            </div>

            <div class="detail-item">

                <span class="detail-label">
                    Rôle
                </span>

                <span class="detail-value">
                    ${getRoleLabel(user.role)}
                </span>

            </div>

            <div class="detail-item">

                <span class="detail-label">
                    Statut
                </span>

                <span class="detail-value">
                    ${getStatusLabel(user.status)}
                </span>

            </div>

            <div class="detail-item">

                <span class="detail-label">
                    Date de création
                </span>

                <span class="detail-value">
                    ${formatDate(user.createdAt)}
                </span>

            </div>

        </div>

    `;

    detailsModal.show();

}

/* =====================================================
   SUPPRESSION
===================================================== */

function deleteUser(id) {

    const user =
        users.find(
            item => item.id === id
        );

    if (!user) {

        showToast(
            "Utilisateur introuvable."
        );

        return;

    }

    const confirmation =
        confirm(
            `Voulez-vous vraiment supprimer l'utilisateur "${user.firstName} ${user.lastName}" ?`
        );

    if (!confirmation) {
        return;
    }

    users =
        users.filter(
            item => item.id !== id
        );

    saveUsers();

    renderUsers();

    updateStatistics();

    showToast(
        "Utilisateur supprimé avec succès."
    );

}

/* =====================================================
   STATISTIQUES
===================================================== */

function updateStatistics() {

    const total =
        users.length;

    const active =
        users.filter(
            user =>
                user.status === "active"
        ).length;

    const inactive =
        users.filter(
            user =>
                user.status === "inactive"
        ).length;

    const admins =
        users.filter(
            user =>
                user.role === "admin"
        ).length;

    document.getElementById(
        "totalUsers"
    ).textContent = total;

    document.getElementById(
        "activeUsers"
    ).textContent = active;

    document.getElementById(
        "inactiveUsers"
    ).textContent = inactive;

    document.getElementById(
        "adminUsers"
    ).textContent = admins;

}

/* =====================================================
   LABELS
===================================================== */

function getRoleLabel(role) {

    const labels = {

        admin: "Administrateur",

        manager: "Manager",

        agent: "Agent",

        caissier: "Caissier"

    };

    return labels[role] || role;

}

function getRoleClass(role) {

    return `role-${role}`;

}

function getStatusLabel(status) {

    return status === "active"
        ? "Actif"
        : "Inactif";

}

function getStatusClass(status) {

    return status === "active"
        ? "status-active"
        : "status-inactive";

}

/* =====================================================
   UTILITAIRES
===================================================== */

function getInitials(firstName, lastName) {

    return (
        (firstName?.charAt(0) || "") +
        (lastName?.charAt(0) || "")
    ).toUpperCase();

}

function getTodayISO() {

    const date =
        new Date();

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

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }

    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    return new Intl.DateTimeFormat(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(date);

}

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );

}

/*
   Protection contre l'injection HTML
*/

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

/* =====================================================
   TOAST
===================================================== */

function showToast(message) {

    document.getElementById(
        "toastMessage"
    ).textContent = message;

    toast.show();

}

/* =====================================================
   DATE
===================================================== */

function updateDate() {

    const date =
        new Date();

    document.getElementById(
        "currentDate"
    ).textContent =
        new Intl.DateTimeFormat(
            "fr-FR",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        ).format(date);

    document.getElementById(
        "currentYear"
    ).textContent =
        date.getFullYear();

}
