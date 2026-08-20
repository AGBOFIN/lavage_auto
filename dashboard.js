"use strict";

/*
 * ==========================================================
 * BIDÈ — DASHBOARD ADMIN
 * ==========================================================
 *
 * Ce fichier gère :
 *
 * - Le menu mobile
 * - La date
 * - L'année du footer
 * - Les statistiques
 * - Les activités récentes
 * - Le bouton actualiser
 * - Les notifications
 * - Les actions des modules non encore disponibles
 *
 * Les données de démonstration sont conservées dans
 * localStorage afin de conserver un comportement réel
 * côté navigateur.
 *
 * ==========================================================
 */


/* ==========================================================
   CONFIGURATION
   ========================================================== */

const STORAGE_KEY = "bide_dashboard_data";


/* ==========================================================
   DONNÉES PAR DÉFAUT
   ========================================================== */

const DEFAULT_DATA = {

    clients: 128,

    reservations: 18,

    washes: 31,

    revenue: 185000,

    activities: [

        {
            icon: "bi-person-plus-fill",
            title: "Nouveau client",
            description: "Un nouveau client a été enregistré.",
            time: "Il y a 10 min"
        },

        {
            icon: "bi-calendar-check-fill",
            title: "Nouvelle réservation",
            description: "Une réservation vient d'être créée.",
            time: "Il y a 25 min"
        },

        {
            icon: "bi-droplet-fill",
            title: "Lavage terminé",
            description: "Une prestation de lavage est terminée.",
            time: "Il y a 42 min"
        },

        {
            icon: "bi-credit-card-fill",
            title: "Paiement reçu",
            description: "Un paiement de 15 000 FCFA a été enregistré.",
            time: "Il y a 1 h"
        }

    ]

};


const STORAGE = {
    clients: "bide_clients",
    reservations: "bide_reservations",
    payments: "bide_paiements",
    services: "bide_prestations"
};


/* ==========================================================
   DOM
   ========================================================== */

const DOM = {

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

    currentYear:
        document.getElementById("currentYear"),

    clientsCount:
        document.getElementById("clientsCount"),

    reservationsCount:
        document.getElementById("reservationsCount"),

    washCount:
        document.getElementById("washCount"),

    revenueCount:
        document.getElementById("revenueCount"),

    activityList:
        document.getElementById("activityList"),

    refreshActivity:
        document.getElementById("refreshActivity"),

    notificationBtn:
        document.getElementById("notificationBtn"),

    notificationBadge:
        document.getElementById("notificationBadge"),

    toast:
        document.getElementById("dashboardToast"),

    toastMessage:
        document.getElementById("toastMessage")

};


/* ==========================================================
   INITIALISATION
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);


function initializeDashboard() {

    initializeDate();

    initializeYear();

    initializeSidebar();

    initializeData();

    initializeActivities();

    initializeNotifications();

    initializeQuickActions();

}


/* ==========================================================
   DATE
   ========================================================== */

function initializeDate() {

    if (!DOM.currentDate) {
        return;
    }

    const now = new Date();

    const formattedDate =
        new Intl.DateTimeFormat(
            "fr-FR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        ).format(now);

    DOM.currentDate.textContent =
        capitalizeFirstLetter(formattedDate);
}


/* ==========================================================
   ANNÉE
   ========================================================== */

function initializeYear() {

    if (!DOM.currentYear) {
        return;
    }

    DOM.currentYear.textContent =
        new Date().getFullYear();
}


/* ==========================================================
   SIDEBAR
   ========================================================== */

function initializeSidebar() {

    if (
        !DOM.sidebar ||
        !DOM.menuToggle ||
        !DOM.sidebarOverlay
    ) {
        return;
    }


    DOM.menuToggle.addEventListener(
        "click",
        openSidebar
    );


    if (DOM.sidebarClose) {

        DOM.sidebarClose.addEventListener(
            "click",
            closeSidebar
        );

    }


    DOM.sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                DOM.sidebar.classList.contains("open")
            ) {

                closeSidebar();

            }

        }
    );


    window.addEventListener(
        "resize",
        function () {

            if (window.innerWidth >= 992) {
                closeSidebar();
            }

        }
    );

}


/* ==========================================================
   OUVRIR SIDEBAR
   ========================================================== */

function openSidebar() {

    DOM.sidebar.classList.add("open");

    DOM.sidebarOverlay.classList.add("active");

    DOM.menuToggle.setAttribute(
        "aria-expanded",
        "true"
    );

    document.body.style.overflow = "hidden";
}


/* ==========================================================
   FERMER SIDEBAR
   ========================================================== */

function closeSidebar() {

    DOM.sidebar.classList.remove("open");

    DOM.sidebarOverlay.classList.remove("active");

    DOM.menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    document.body.style.overflow = "";
}


/* ==========================================================
   DONNÉES
   ========================================================== */

function initializeData() {

    let data =
        localStorage.getItem(STORAGE_KEY);


    if (!data) {

        saveDashboardData(
            DEFAULT_DATA
        );

        data = DEFAULT_DATA;

    } else {

        try {

            data = JSON.parse(data);

        } catch (error) {

            console.error(
                "Impossible de lire les données du dashboard.",
                error
            );

            saveDashboardData(
                DEFAULT_DATA
            );

            data = DEFAULT_DATA;
        }

    }


    updateStatistics(data);
}


/* ==========================================================
   SAUVEGARDE
   ========================================================== */

function saveDashboardData(data) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* ==========================================================
   STATISTIQUES
   ========================================================== */

function updateStatistics(data) {

    if (DOM.clientsCount) {

        DOM.clientsCount.textContent =
            formatNumber(data.clients);

    }


    if (DOM.reservationsCount) {

        DOM.reservationsCount.textContent =
            formatNumber(data.reservations);

    }


    if (DOM.washCount) {

        DOM.washCount.textContent =
            formatNumber(data.washes);

    }


    if (DOM.revenueCount) {

        DOM.revenueCount.textContent =
            formatCurrency(data.revenue);

    }

}


/* ==========================================================
   ACTIVITÉS
   ========================================================== */

function initializeActivities() {

    if (!DOM.activityList) {
        return;
    }


    const data =
        getDashboardData();


    renderActivities(
        data.activities
    );


    if (DOM.refreshActivity) {

        DOM.refreshActivity.addEventListener(
            "click",
            refreshActivities
        );

    }

}


/* ==========================================================
   RENDU DES ACTIVITÉS
   ========================================================== */

function renderActivities(activities) {

    if (
        !Array.isArray(activities) ||
        activities.length === 0
    ) {

        DOM.activityList.innerHTML = `
            <div class="py-4 text-center">
                <i class="bi bi-inbox fs-3 text-secondary"></i>
                <p class="mt-2 mb-0 text-secondary small">
                    Aucune activité récente.
                </p>
            </div>
        `;

        return;
    }


    DOM.activityList.innerHTML =
        activities
            .map(function (activity) {

                return `
                    <div class="activity-item">

                        <div class="activity-icon">
                            <i class="bi ${escapeHtml(activity.icon)}"></i>
                        </div>

                        <div class="activity-content">

                            <strong>
                                ${escapeHtml(activity.title)}
                            </strong>

                            <span>
                                ${escapeHtml(activity.description)}
                            </span>

                        </div>

                        <time class="activity-time">
                            ${escapeHtml(activity.time)}
                        </time>

                    </div>
                `;

            })
            .join("");
}


/* ==========================================================
   ACTUALISER ACTIVITÉS
   ========================================================== */

function refreshActivities() {

    const button =
        DOM.refreshActivity;


    if (button) {

        button.disabled = true;

        button.innerHTML = `
            <span
                class="spinner-border spinner-border-sm"
                aria-hidden="true"
            ></span>

            Actualisation
        `;

    }


    window.setTimeout(
        function () {

            const data =
                getDashboardData();


            data.activities =
                [
                    {
                        icon: "bi-arrow-repeat",
                        title: "Activité actualisée",
                        description:
                            "Les données du dashboard ont été actualisées.",
                        time: "À l'instant"
                    },
                    ...data.activities
                ].slice(0, 4);


            saveDashboardData(data);

            renderActivities(data.activities);

            showToast(
                "Les activités ont été actualisées."
            );


            if (button) {

                button.disabled = false;

                button.innerHTML = `
                    <i class="bi bi-arrow-clockwise"></i>
                    Actualiser
                `;

            }

        },
        500
    );

}


/* ==========================================================
   NOTIFICATIONS
   ========================================================== */

function initializeNotifications() {

    if (!DOM.notificationBtn) {
        return;
    }


    DOM.notificationBtn.addEventListener(
        "click",
        function () {

            const count =
                DOM.notificationBadge
                    ? DOM.notificationBadge.textContent
                    : "0";


            if (DOM.notificationBadge) {

                DOM.notificationBadge.textContent =
                    "0";

                DOM.notificationBadge.style.display =
                    "none";

            }


            showToast(
                count === "0"
                    ? "Vous n'avez aucune nouvelle notification."
                    : `Vous aviez ${count} notification(s) non lue(s).`
            );

        }
    );

}


/* ==========================================================
   ACTIONS RAPIDES
   ========================================================== */

function initializeQuickActions() {

    const actions =
        document.querySelectorAll(
            ".disabled-action"
        );


    actions.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const module =
                        button.dataset.module ||
                        "Ce module";


                    showToast(
                        `${module} : le module sera activé prochainement.`
                    );

                }
            );

        }
    );

}


/* ==========================================================
   RÉCUPÉRER LES DONNÉES
   ========================================================== */

function getDashboardData() {

    const stored =
        localStorage.getItem(STORAGE_KEY);


    if (!stored) {

        return {
            ...DEFAULT_DATA
        };

    }


    try {

        return JSON.parse(stored);

    } catch (error) {

        console.error(
            "Erreur de lecture des données.",
            error
        );

        return {
            ...DEFAULT_DATA
        };

    }

}


/* ==========================================================
   TOAST BOOTSTRAP
   ========================================================== */

function showToast(message) {

    if (
        !DOM.toast ||
        !DOM.toastMessage
    ) {
        return;
    }


    DOM.toastMessage.textContent =
        message;


    if (
        typeof bootstrap !== "undefined" &&
        bootstrap.Toast
    ) {

        const toast =
            bootstrap.Toast.getOrCreateInstance(
                DOM.toast,
                {
                    delay: 3500
                }
            );


        toast.show();

    }

}


/* ==========================================================
   FORMAT NOMBRE
   ========================================================== */

function formatNumber(number) {

    return new Intl.NumberFormat(
        "fr-FR"
    ).format(
        Number(number) || 0
    );

}


/* ==========================================================
   FORMAT MONNAIE
   ========================================================== */

function formatCurrency(amount) {

    return (
        new Intl.NumberFormat(
            "fr-FR"
        ).format(
            Number(amount) || 0
        )
        + " FCFA"
    );

}


/* ==========================================================
   MAJUSCULE
   ========================================================== */

function capitalizeFirstLetter(text) {

    if (!text) {
        return "";
    }

    return (
        text.charAt(0).toUpperCase()
        + text.slice(1)
    );

}


/* ==========================================================
   PROTECTION HTML
   ========================================================== */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
