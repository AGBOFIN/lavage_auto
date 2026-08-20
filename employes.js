/* =========================================================
   BIDÈ ADMINISTRATION - GESTION DES EMPLOYÉS
   CRUD complet avec localStorage
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =====================================================
       1. CONFIGURATION
       ===================================================== */

    const STORAGE_KEY = "bide_employees";

    const ROLE_LABELS = {
        admin: "Administrateur",
        manager: "Manager",
        agent: "Agent",
        lavage: "Agent de lavage",
        caissier: "Caissier"
    };

    const STATUS_LABELS = {
        active: "Actif",
        inactive: "Inactif"
    };

    /* =====================================================
       2. RÉCUPÉRATION DES ÉLÉMENTS HTML
       ===================================================== */

    const elements = {
        // Sidebar
        sidebar: document.getElementById("sidebar"),
        menuToggle: document.getElementById("menuToggle"),
        sidebarClose: document.getElementById("sidebarClose"),
        sidebarOverlay: document.getElementById("sidebarOverlay"),
        // Date
        currentDate: document.getElementById("currentDate"),
        currentYear: document.getElementById("currentYear"),


        // Statistiques
        totalEmployees: document.getElementById("totalEmployees"),
        activeEmployees: document.getElementById("activeEmployees"),
        inactiveEmployees: document.getElementById("inactiveEmployees"),

        adminEmployees: document.getElementById("adminEmployees"),

        // Filtres

        searchInput: document.getElementById("searchInput"),
        roleFilter: document.getElementById("roleFilter"),

        statusFilter: document.getElementById("statusFilter"),

        resetFiltersBtn: document.getElementById("resetFiltersBtn"),

        // Tableau

        employeesTableBody: document.getElementById("employeesTableBody"),
        emptyState: document.getElementById("emptyState"),


        // Bouton nouvel employé
        newEmployeeBtn: document.getElementById("newEmployeeBtn"),


        // Formulaire

        employeeForm: document.getElementById("employeeForm"),
        employeeId: document.getElementById("employeeId"),
        firstName: document.getElementById("firstName"),
        lastName: document.getElementById("lastName"),

        phone: document.getElementById("phone"),

        email: document.getElementById("email"),
        role: document.getElementById("role"),
        status: document.getElementById("status"),
        hireDate: document.getElementById("hireDate"),
        salary: document.getElementById("salary"),

        address: document.getElementById("address"),
        notes: document.getElementById("notes"),

        // Modal
        employeeModal: document.getElementById("employeeModal"),
        modalTitle: document.getElementById("modalTitle"),
        saveEmployeeBtn: document.getElementById("saveEmployeeBtn"),


        // Modal détails
        detailsModal: document.getElementById("detailsModal"),
        detailsContent: document.getElementById("detailsContent"),

        // Toast
        appToast: document.getElementById("appToast"),
        toastMessage: document.getElementById("toastMessage")
    };

    /* =====================================================
       3. VÉRIFICATION DES ÉLÉMENTS
       ===================================================== */

    const requiredElements = [
        "employeesTableBody",
        "employeeForm",
        "employeeModal",
        "detailsModal",
        "searchInput",
        "roleFilter",
        "statusFilter"
    ];

    for (const key of requiredElements) {
        if (!elements[key]) {
            console.error(`Élément HTML introuvable : #${key}`);
        }
    }

    /* =====================================================
       4. INITIALISATION DES MODALES BOOTSTRAP
       ===================================================== */

    let employeeModalInstance = null;
    let detailsModalInstance = null;
    let toastInstance = null;

    if (typeof bootstrap !== "undefined") {
        employeeModalInstance = bootstrap.Modal.getOrCreateInstance(
            elements.employeeModal
        );

        detailsModalInstance = bootstrap.Modal.getOrCreateInstance(
            elements.detailsModal
        );

        toastInstance = bootstrap.Toast.getOrCreateInstance(
            elements.appToast,
            {
                delay: 3000
            }
        );
    }

    /* =====================================================
       5. DONNÉES
       ===================================================== */

    let employees = loadEmployees();

    /* =====================================================
       6. INITIALISATION
       ===================================================== */

    init();

    function init() {
        updateDate();
        updateYear();
        renderEmployees();
        updateStatistics();
        setupEvents();
    }

    /* =====================================================
       7. LOCAL STORAGE
       ===================================================== */

    function loadEmployees() {
        try {
            const storedEmployees = localStorage.getItem(STORAGE_KEY);

            if (!storedEmployees) {
                const demoEmployees = createDemoEmployees();

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(demoEmployees)
                );

                return demoEmployees;
            }

            const parsed = JSON.parse(storedEmployees);

            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed;
        } catch (error) {
            console.error(
                "Erreur lors du chargement des employés :",
                error
            );

            return [];
        }
    }

    function saveEmployees() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(employees)
            );

            return true;
        } catch (error) {
            console.error(
                "Erreur lors de la sauvegarde :",
                error
            );

            showToast(
                "Impossible de sauvegarder les données.",
                "danger"
            );

            return false;
        }
    }

    /* =====================================================
       8. EMPLOYÉS DE DÉMONSTRATION
       ===================================================== */

    function createDemoEmployees() {
        return [
            {
                id: generateId(),
                firstName: "Abdou",
                lastName: "Akim",
                phone: "+228 90 00 00 01",
                email: "abdou@bide.tg",
                role: "admin",
                status: "active",
                hireDate: "2024-01-15",
                salary: 350000,
                address: "Lomé, Togo",
                notes: "Administrateur principal",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                firstName: "Kossi",
                lastName: "Mensah",
                phone: "+228 90 00 00 02",
                email: "kossi@bide.tg",
                role: "manager",
                status: "active",
                hireDate: "2024-03-10",
                salary: 250000,
                address: "Lomé, Togo",
                notes: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                firstName: "Yao",
                lastName: "Kodjo",
                phone: "+228 90 00 00 03",
                email: "yao@bide.tg",
                role: "lavage",
                status: "active",
                hireDate: "2024-05-20",
                salary: 180000,
                address: "Agoè, Lomé",
                notes: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                firstName: "Ama",
                lastName: "Lawson",
                phone: "+228 90 00 00 04",
                email: "ama@bide.tg",
                role: "caissier",
                status: "inactive",
                hireDate: "2023-11-08",
                salary: 170000,
                address: "Adidogomé, Lomé",
                notes: "En congé prolongé",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }

    /* =====================================================
       9. ÉVÉNEMENTS
       ===================================================== */

    function setupEvents() {

        // Nouvel employé
        elements.newEmployeeBtn?.addEventListener(
            "click",
            openCreateModal
        );

        // Formulaire
        elements.employeeForm?.addEventListener(
            "submit",
            handleFormSubmit
        );

        // Recherche
        elements.searchInput?.addEventListener(
            "input",
            renderEmployees
        );

        // Filtre rôle
        elements.roleFilter?.addEventListener(
            "change",
            renderEmployees
        );

        // Filtre statut
        elements.statusFilter?.addEventListener(
            "change",
            renderEmployees
        );

        // Reset filtres
        elements.resetFiltersBtn?.addEventListener(
            "click",
            resetFilters
        );

        // Actions du tableau
        elements.employeesTableBody?.addEventListener(
            "click",
            handleTableAction
        );

        // Menu mobile
        elements.menuToggle?.addEventListener(
            "click",
            openSidebar
        );

        elements.sidebarClose?.addEventListener(
            "click",
            closeSidebar
        );

        elements.sidebarOverlay?.addEventListener(
            "click",
            closeSidebar
        );

        // Fermer le menu après clic sur un lien
        document.querySelectorAll(".sidebar .nav-item").forEach(
            (link) => {
                link.addEventListener("click", closeSidebar);
            }
        );
    }

    /* =====================================================
       10. CRUD - CREATE / READ / UPDATE / DELETE
       ===================================================== */

    function openCreateModal() {
        resetForm();

        elements.modalTitle.textContent = "Nouvel employé";

        elements.saveEmployeeBtn.innerHTML = `
            <i class="bi bi-check-lg"></i>
            Enregistrer
        `;

        const today = new Date().toISOString().split("T")[0];

        elements.hireDate.value = today;
        elements.status.value = "active";

        employeeModalInstance?.show();

        setTimeout(() => {
            elements.firstName?.focus();
        }, 300);
    }

    function openEditModal(id) {
        const employee = employees.find(
            (item) => String(item.id) === String(id)
        );

        if (!employee) {
            showToast(
                "Employé introuvable.",
                "danger"
            );

            return;
        }

        elements.employeeId.value = employee.id;
        elements.firstName.value = employee.firstName || "";
        elements.lastName.value = employee.lastName || "";
        elements.phone.value = employee.phone || "";
        elements.email.value = employee.email || "";
        elements.role.value = employee.role || "";
        elements.status.value = employee.status || "active";
        elements.hireDate.value = employee.hireDate || "";
        elements.salary.value =
            employee.salary !== null &&
            employee.salary !== undefined
                ? employee.salary
                : "";
        elements.address.value = employee.address || "";
        elements.notes.value = employee.notes || "";

        elements.modalTitle.textContent = "Modifier l'employé";

        elements.saveEmployeeBtn.innerHTML = `
            <i class="bi bi-check-lg"></i>
            Enregistrer les modifications
        `;

        employeeModalInstance?.show();
    }

    function handleFormSubmit(event) {
        event.preventDefault();

        if (!elements.employeeForm.checkValidity()) {
            elements.employeeForm.classList.add("was-validated");
            return;
        }

        const data = getFormData();

        const duplicatePhone = employees.find(
            (employee) =>
                normalizePhone(employee.phone) ===
                    normalizePhone(data.phone) &&
                String(employee.id) !== String(data.id)
        );

        if (duplicatePhone) {
            showToast(
                "Ce numéro de téléphone est déjà utilisé.",
                "warning"
            );

            elements.phone.focus();
            return;
        }

        if (data.email) {
            const duplicateEmail = employees.find(
                (employee) =>
                    employee.email &&
                    employee.email.toLowerCase() ===
                        data.email.toLowerCase() &&
                    String(employee.id) !== String(data.id)
            );

            if (duplicateEmail) {
                showToast(
                    "Cette adresse email est déjà utilisée.",
                    "warning"
                );

                elements.email.focus();
                return;
            }
        }

        // UPDATE
        if (data.id) {
            const index = employees.findIndex(
                (employee) =>
                    String(employee.id) === String(data.id)
            );

            if (index === -1) {
                showToast(
                    "Employé introuvable.",
                    "danger"
                );

                return;
            }

            employees[index] = {
                ...employees[index],
                ...data,
                updatedAt: new Date().toISOString()
            };

            if (!saveEmployees()) {
                return;
            }

            employeeModalInstance?.hide();

            showToast(
                "Employé modifié avec succès.",
                "success"
            );
        }

        // CREATE
        else {
            const newEmployee = {
                ...data,
                id: generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            employees.push(newEmployee);

            if (!saveEmployees()) {
                return;
            }

            employeeModalInstance?.hide();

            showToast(
                "Employé ajouté avec succès.",
                "success"
            );
        }

        resetForm();
        renderEmployees();
        updateStatistics();
    }

    function deleteEmployee(id) {
        const employee = employees.find(
            (item) => String(item.id) === String(id)
        );

        if (!employee) {
            showToast(
                "Employé introuvable.",
                "danger"
            );

            return;
        }

        const fullName =
            `${employee.firstName} ${employee.lastName}`;

        const confirmation = window.confirm(
            `Voulez-vous vraiment supprimer l'employé "${fullName}" ?\n\nCette action est irréversible.`
        );

        if (!confirmation) {
            return;
        }

        employees = employees.filter(
            (item) => String(item.id) !== String(id)
        );

        if (!saveEmployees()) {
            return;
        }

        renderEmployees();
        updateStatistics();

        showToast(
            `${fullName} a été supprimé.`,
            "success"
        );
    }

    /* =====================================================
       11. FORMULAIRE
       ===================================================== */

    function getFormData() {
        const salaryValue = elements.salary.value.trim();

        return {
            id: elements.employeeId.value.trim(),

            firstName:
                elements.firstName.value.trim(),

            lastName:
                elements.lastName.value.trim(),

            phone:
                elements.phone.value.trim(),

            email:
                elements.email.value.trim(),

            role:
                elements.role.value,

            status:
                elements.status.value,

            hireDate:
                elements.hireDate.value,

            salary:
                salaryValue === ""
                    ? null
                    : Number(salaryValue),

            address:
                elements.address.value.trim(),

            notes:
                elements.notes.value.trim()
        };
    }

    function resetForm() {
        elements.employeeForm.reset();

        elements.employeeId.value = "";

        elements.employeeForm.classList.remove(
            "was-validated"
        );

        elements.status.value = "active";

        elements.saveEmployeeBtn.innerHTML = `
            <i class="bi bi-check-lg"></i>
            Enregistrer
        `;
    }

    /* =====================================================
       12. AFFICHAGE DU TABLEAU
       ===================================================== */

    function renderEmployees() {
        const filteredEmployees = getFilteredEmployees();

        elements.employeesTableBody.innerHTML = "";

        if (filteredEmployees.length === 0) {
            elements.emptyState.classList.remove("d-none");
            updateStatistics();
            return;
        }

        elements.emptyState.classList.add("d-none");

        filteredEmployees.forEach((employee) => {
            const row = createEmployeeRow(employee);

            elements.employeesTableBody.appendChild(row);
        });

        updateStatistics();
    }

    function createEmployeeRow(employee) {
        const tr = document.createElement("tr");

        const fullName =
            `${employee.firstName} ${employee.lastName}`;

        const initials =
            getInitials(
                employee.firstName,
                employee.lastName
            );

        const roleLabel =
            ROLE_LABELS[employee.role] ||
            employee.role ||
            "Non défini";

        const statusLabel =
            STATUS_LABELS[employee.status] ||
            employee.status ||
            "Non défini";

        const formattedHireDate =
            formatDate(employee.hireDate);

        tr.innerHTML = `
            <td>
                <div class="employee-cell">
                    <div class="employee-avatar">
                        ${escapeHTML(initials)}
                    </div>

                    <div>
                        <span class="employee-name">
                            ${escapeHTML(fullName)}
                        </span>

                        <span class="employee-email">
                            ${escapeHTML(
                                employee.email || "Aucun email"
                            )}
                        </span>
                    </div>
                </div>
            </td>

            <td>
                ${escapeHTML(employee.phone || "-")}
            </td>

            <td>
                <span class="badge-custom role-${escapeHTML(
                    employee.role
                )}">
                    ${escapeHTML(roleLabel)}
                </span>
            </td>

            <td>
                ${escapeHTML(formattedHireDate)}
            </td>

            <td>
                <span class="badge-custom status-${escapeHTML(
                    employee.status
                )}">
                    ${escapeHTML(statusLabel)}
                </span>
            </td>

            <td>
                <div class="actions">

                    <button
                        type="button"
                        class="action-btn action-view"
                        title="Voir les détails"
                        data-action="view"
                        data-id="${escapeHTML(
                            String(employee.id)
                        )}">
                        <i class="bi bi-eye-fill"></i>
                    </button>

                    <button
                        type="button"
                        class="action-btn action-edit"
                        title="Modifier"
                        data-action="edit"
                        data-id="${escapeHTML(
                            String(employee.id)
                        )}">
                        <i class="bi bi-pencil-fill"></i>
                    </button>

                    <button
                        type="button"
                        class="action-btn action-delete"
                        title="Supprimer"
                        data-action="delete"
                        data-id="${escapeHTML(
                            String(employee.id)
                        )}">
                        <i class="bi bi-trash-fill"></i>
                    </button>

                </div>
            </td>
        `;

        return tr;
    }

    /* =====================================================
       13. ACTIONS DU TABLEAU
       ===================================================== */

    function handleTableAction(event) {
        const button =
            event.target.closest("[data-action]");

        if (!button) {
            return;
        }

        const action =
            button.dataset.action;

        const id =
            button.dataset.id;

        if (!id) {
            return;
        }

        switch (action) {
            case "view":
                openDetailsModal(id);
                break;

            case "edit":
                openEditModal(id);
                break;

            case "delete":
                deleteEmployee(id);
                break;

            default:
                console.warn(
                    `Action inconnue : ${action}`
                );
        }
    }

    /* =====================================================
       14. RECHERCHE ET FILTRES
       ===================================================== */

    function getFilteredEmployees() {
        const search =
            elements.searchInput.value
                .trim()
                .toLowerCase();

        const selectedRole =
            elements.roleFilter.value;

        const selectedStatus =
            elements.statusFilter.value;

        return employees
            .filter((employee) => {

                const searchableText = [
                    employee.firstName,
                    employee.lastName,
                    employee.phone,
                    employee.email,
                    ROLE_LABELS[employee.role],
                    employee.address
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    !search ||
                    searchableText.includes(search);

                const matchesRole =
                    selectedRole === "all" ||
                    employee.role === selectedRole;

                const matchesStatus =
                    selectedStatus === "all" ||
                    employee.status === selectedStatus;

                return (
                    matchesSearch &&
                    matchesRole &&
                    matchesStatus
                );
            })
            .sort((a, b) => {

                const nameA =
                    `${a.lastName} ${a.firstName}`;

                const nameB =
                    `${b.lastName} ${b.firstName}`;

                return nameA.localeCompare(
                    nameB,
                    "fr",
                    {
                        sensitivity: "base"
                    }
                );
            });
    }

    function resetFilters() {
        elements.searchInput.value = "";
        elements.roleFilter.value = "all";
        elements.statusFilter.value = "all";

        renderEmployees();

        showToast(
            "Les filtres ont été réinitialisés.",
            "success"
        );
    }

    /* =====================================================
       15. STATISTIQUES
       ===================================================== */

    function updateStatistics() {
        const total =
            employees.length;

        const active =
            employees.filter(
                employee =>
                    employee.status === "active"
            ).length;

        const inactive =
            employees.filter(
                employee =>
                    employee.status === "inactive"
            ).length;

        const admins =
            employees.filter(
                employee =>
                    employee.role === "admin"
            ).length;

        elements.totalEmployees.textContent =
            total;

        elements.activeEmployees.textContent =
            active;

        elements.inactiveEmployees.textContent =
            inactive;

        elements.adminEmployees.textContent =
            admins;
    }

    /* =====================================================
       16. MODAL DÉTAILS
       ===================================================== */

    function openDetailsModal(id) {
        const employee = employees.find(
            (item) => String(item.id) === String(id)
        );

        if (!employee) {
            showToast(
                "Employé introuvable.",
                "danger"
            );

            return;
        }

        const fullName =
            `${employee.firstName} ${employee.lastName}`;

        const roleLabel =
            ROLE_LABELS[employee.role] ||
            employee.role ||
            "-";

        const statusLabel =
            STATUS_LABELS[employee.status] ||
            employee.status ||
            "-";

        const salary =
            formatCurrency(employee.salary);

        elements.detailsContent.innerHTML = `
            <div class="detail-grid">

                <div class="detail-item">
                    <span class="detail-label">
                        Prénom
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            employee.firstName || "-"
                        )}
                    </span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">
                        Nom
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            employee.lastName || "-"
                        )}
                    </span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">
                        Nom complet
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(fullName)}
                    </span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">
                        Téléphone
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            employee.phone || "-"
                        )}
                    </span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">
                        Email
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            employee.email || "-"
                        )}
                    </span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">
                        Rôle
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(roleLabel)}
                    </span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">
                        Statut
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(statusLabel)}
                    </span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">
                        Date d'embauche
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            formatDate(
                                employee.hireDate
                            )
                        )}
                    </span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">
                        Salaire
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(salary)}
                    </span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">
                        Téléphone
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            employee.phone || "-"
                        )}
                    </span>
                </div>

                <div class="detail-item full">
                    <span class="detail-label">
                        Adresse
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            employee.address || "-"
                        )}
                    </span>
                </div>

                <div class="detail-item full">
                    <span class="detail-label">
                        Notes
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            employee.notes || "-"
                        )}
                    </span>
                </div>

            </div>
        `;

        detailsModalInstance?.show();
    }

    /* =====================================================
       17. DATE
       ===================================================== */

    function updateDate() {
        if (!elements.currentDate) {
            return;
        }

        const now = new Date();

        const formattedDate =
            new Intl.DateTimeFormat(
                "fr-FR",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            ).format(now);

        elements.currentDate.textContent =
            capitalizeFirstLetter(formattedDate);
    }

    function updateYear() {
        if (!elements.currentYear) {
            return;
        }

        elements.currentYear.textContent =
            new Date().getFullYear();
    }

    /* =====================================================
       18. TOAST
       ===================================================== */

    function showToast(message, type = "success") {
        if (!elements.toastMessage) {
            return;
        }

        elements.toastMessage.textContent =
            message;

        const toastHeader =
            elements.appToast.querySelector(
                ".toast-header"
            );

        if (toastHeader) {
            toastHeader.classList.remove(
                "text-bg-success",
                "text-bg-danger",
                "text-bg-warning"
            );

            if (type === "danger") {
                toastHeader.classList.add(
                    "text-bg-danger"
                );
            } else if (type === "warning") {
                toastHeader.classList.add(
                    "text-bg-warning"
                );
            } else {
                toastHeader.classList.add(
                    "text-bg-success"
                );
            }
        }

        if (toastInstance) {
            toastInstance.show();
        } else {
            alert(message);
        }
    }

    /* =====================================================
       19. MENU MOBILE
       ===================================================== */

    function openSidebar() {
        elements.sidebar?.classList.add("show");
        elements.sidebarOverlay?.classList.add("show");

        document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
        elements.sidebar?.classList.remove("show");
        elements.sidebarOverlay?.classList.remove("show");

        document.body.style.overflow = "";
    }

    /* =====================================================
       20. UTILITAIRES
       ===================================================== */

    function generateId() {
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }

        return (
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .substring(2, 9)
        );
    }

    function getInitials(firstName, lastName) {
        const first =
            (firstName || "")
                .trim()
                .charAt(0)
                .toUpperCase();

        const last =
            (lastName || "")
                .trim()
                .charAt(0)
                .toUpperCase();

        return `${first}${last}`;
    }

    function normalizePhone(phone) {
        return String(phone || "")
            .replace(/\D/g, "");
    }

    function formatDate(dateString) {
        if (!dateString) {
            return "-";
        }

        const date = new Date(
            `${dateString}T00:00:00`
        );

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return new Intl.DateTimeFormat(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        ).format(date);
    }

    function formatCurrency(value) {
        if (
            value === null ||
            value === undefined ||
            value === "" ||
            Number.isNaN(Number(value))
        ) {
            return "-";
        }

        return new Intl.NumberFormat(
            "fr-FR",
            {
                style: "currency",
                currency: "XOF",
                maximumFractionDigits: 0
            }
        ).format(Number(value));
    }

    function capitalizeFirstLetter(text) {
        if (!text) {
            return "";
        }

        return (
            text.charAt(0).toUpperCase() +
            text.slice(1)
        );
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

});
