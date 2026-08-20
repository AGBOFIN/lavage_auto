"use strict";

/* =========================================================
   BIDÈ - STATISTIQUES
   Gestion complète de la page
========================================================= */


/* =========================================================
   DONNÉES
========================================================= */

const STORAGE_KEY = "bide_statistics_data";

const defaultData = {
    lavages: [
        {
            id: 1,
            date: "2026-08-20",
            client: "Kossi Mensah",
            service: "Lavage complet",
            montant: 5000,
            paiement: "Espèces"
        },
        {
            id: 2,
            date: "2026-08-20",
            client: "Ama Lawson",
            service: "Lavage extérieur",
            montant: 2500,
            paiement: "Mobile Money"
        },
        {
            id: 3,
            date: "2026-08-19",
            client: "Jean Koffi",
            service: "Lavage complet",
            montant: 5000,
            paiement: "Carte"
        },
        {
            id: 4,
            date: "2026-08-18",
            client: "Kodjo Adjei",
            service: "Nettoyage intérieur",
            montant: 3500,
            paiement: "Espèces"
        },
        {
            date: "2026-08-17",
            client: "Sena Mensah",

            service: "Lavage complet",
            montant: 5000,

            paiement: "Mobile Money"

        },
        {

            id: 6,
            date: "2026-08-15",
            client: "David Afi",

            service: "Lavage extérieur",

            montant: 2500,

            paiement: "Espèces"
        },

        {

            id: 7,
            date: "2026-08-10",
            client: "Paul Tchalla",
            service: "Polissage",
            montant: 7000,

            paiement: "Mobile Money"
        },
        {

            id: 8,
            date: "2026-08-05",

            client: "Mawuli Doe",
            service: "Lavage complet",
            montant: 5000,
            paiement: "Carte"
        }
    ],

    clients: [
        {
            id: 1,
            name: "Kossi Mensah",
            date: "2026-08-20"
        },
        {
            id: 2,
            name: "Ama Lawson",
            date: "2026-08-20"
        },
        {
            id: 3,
            name: "Jean Koffi",
            date: "2026-08-19"
        },
        {
            id: 4,
            name: "Kodjo Adjei",
            date: "2026-08-18"
        },
        {
            id: 5,
            name: "Sena Mensah",
            date: "2026-08-17"
        }
    ],

    vehicules: [
        {
            id: 1,
            client: "Kossi Mensah",
            date: "2026-08-20"
        },
        {
            id: 2,
            client: "Ama Lawson",
            date: "2026-08-20"
        },
        {
            id: 3,
            client: "Jean Koffi",
            date: "2026-08-19"
        },
        {
            id: 4,
            client: "Kodjo Adjei",
            date: "2026-08-18"
        }
    ],

    employes: [
        {
            id: 1,
            name: "Abdou-Akim",
            active: true
        },
        {
            id: 2,
            name: "Kossi",
            active: true
        },
        {
            id: 3,
            name: "Mensah",
            active: true
        },
        {
            id: 4,
            name: "Kodjo",
            active: false
        }
    ],

    reservations: [
        {
            id: 1,
            date: "2026-08-20",
            status: "confirmed"
        },
        {
            id: 2,
            date: "2026-08-19",
            status: "confirmed"
        },
        {
            id: 3,
            date: "2026-08-15",
            status: "confirmed"
        }
    ]
};


/* =========================================================
   VARIABLES
========================================================= */

let data = loadData();

let currentPeriod = "today";

let revenueChart = null;
let washChart = null;
let paymentChart = null;


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeStorage();

    setupDate();

    setupSidebar();

    setupPeriodButtons();

    setupRefresh();

    setupExport();

    renderStatistics();

});


/* =========================================================
   STORAGE
========================================================= */

function initializeStorage() {

    const existing = localStorage.getItem(STORAGE_KEY);

    if (!existing) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(defaultData)
        );

        data = structuredClone(defaultData);
    }
}


function loadData() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return structuredClone(defaultData);
        }

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "Erreur de lecture des statistiques :",
            error
        );

        return structuredClone(defaultData);
    }
}


/* =========================================================
   DATE
========================================================= */

function setupDate() {

    const dateElement =
        document.getElementById("currentDate");

    const yearElement =
        document.getElementById("currentYear");

    const today = new Date();

    if (dateElement) {

        dateElement.textContent =
            today.toLocaleDateString(
                "fr-FR",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );
    }

    if (yearElement) {
        yearElement.textContent =
            today.getFullYear();
    }
}


/* =========================================================
   SIDEBAR MOBILE
========================================================= */

function setupSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");

    const menuToggle =
        document.getElementById("menuToggle");

    const sidebarClose =
        document.getElementById("sidebarClose");


    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            () => {

                sidebar.classList.add("show");

                overlay.classList.add("show");

            }
        );
    }


    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            closeSidebar
        );
    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeSidebar
        );
    }


    function closeSidebar() {

        sidebar.classList.remove("show");

        overlay.classList.remove("show");
    }
}


/* =========================================================
   FILTRES
========================================================= */

function setupPeriodButtons() {

    const buttons =
        document.querySelectorAll(
            ".period-btn"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(btn =>
                    btn.classList.remove("active")
                );

                button.classList.add("active");

                currentPeriod =
                    button.dataset.period;

                updatePeriodLabels();

                renderStatistics();

            }
        );

    });
}


function updatePeriodLabels() {

    const labels = {

        today: "Aujourd'hui",

        "7days": "7 derniers jours",

        month: "Ce mois",

        year: "Cette année",

        all: "Toute la période"
    };

    const label =
        labels[currentPeriod];


    const periodLabel =
        document.getElementById(
            "periodLabel"
        );

    const chartPeriod =
        document.getElementById(
            "chartPeriod"
        );


    if (periodLabel) {
        periodLabel.textContent = label;
    }

    if (chartPeriod) {
        chartPeriod.textContent = label;
    }
}


/* =========================================================
   FILTRAGE DES DONNÉES
========================================================= */

function getFilteredWashData() {

    const now = new Date();

    return data.lavages.filter(item => {

        const itemDate =
            parseLocalDate(item.date);

        if (!itemDate) {
            return false;
        }

        if (currentPeriod === "all") {
            return true;
        }


        if (currentPeriod === "today") {

            return isSameDay(
                itemDate,
                now
            );
        }


        if (currentPeriod === "7days") {

            const start =
                new Date(now);

            start.setDate(
                start.getDate() - 6
            );

            start.setHours(0, 0, 0, 0);

            return itemDate >= start;
        }


        if (currentPeriod === "month") {

            return (
                itemDate.getMonth() === now.getMonth() &&
                itemDate.getFullYear() === now.getFullYear()
            );
        }


        if (currentPeriod === "year") {

            return (
                itemDate.getFullYear() ===
                now.getFullYear()
            );
        }


        return true;
    });
}


/* =========================================================
   RENDU GLOBAL
========================================================= */

function renderStatistics() {

    data = loadData();

    const filtered =
        getFilteredWashData();


    renderKpis(filtered);

    renderCharts(filtered);

    renderServices(filtered);

    renderSummary(filtered);
}


/* =========================================================
   KPI
========================================================= */

function renderKpis(lavages) {

    const revenue =
        lavages.reduce(
            (sum, item) =>
                sum + Number(item.montant || 0),
            0
        );


    const washes =
        lavages.length;


    const clients =
        new Set(
            lavages
                .map(item => item.client)
                .filter(Boolean)
        ).size;


    const vehicles =
        data.vehicules.length;


    setText(
        "revenueStat",
        formatMoney(revenue)
    );

    setText(
        "washStat",
        washes
    );

    setText(
        "clientStat",
        clients
    );

    setText(
        "vehicleStat",
        vehicles
    );


    setText(
        "revenueEvolution",
        `${washes} prestation(s)`
    );

    setText(
        "washEvolution",
        "Activité enregistrée"
    );

    setText(
        "clientEvolution",
        "Clients servis"
    );

    setText(
        "vehicleEvolution",
        "Véhicules enregistrés"
    );
}


/* =========================================================
   CHARTS
========================================================= */

function renderCharts(lavages) {

    renderRevenueChart(lavages);

    renderWashChart(lavages);

    renderPaymentChart(lavages);
}


/* =========================================================
   CHART CA
========================================================= */

function renderRevenueChart(lavages) {

    const canvas =
        document.getElementById(
            "revenueChart"
        );

    if (!canvas) return;


    if (revenueChart) {
        revenueChart.destroy();
    }


    const grouped =
        groupByDate(lavages);


    const labels =
        Object.keys(grouped);


    const values =
        labels.map(
            label => grouped[label]
        );


    revenueChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {
                            label: "Chiffre d'affaires",

                            data: values,

                            borderColor: "#1769e0",

                            backgroundColor:
                                "rgba(23,105,224,.10)",

                            fill: true,

                            tension: .35,

                            pointRadius: 4,

                            pointBackgroundColor:
                                "#102a43"
                        }

                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    context =>
                                        formatMoney(
                                            context.raw
                                        )
                            }
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    value =>
                                        formatMoneyShort(
                                            value
                                        )
                            }
                        },

                        x: {

                            grid: {
                                display: false
                            }
                        }
                    }
                }
            }
        );
}


/* =========================================================
   CHART LAVAGES
========================================================= */

function renderWashChart(lavages) {

    const canvas =
        document.getElementById(
            "washChart"
        );

    if (!canvas) return;


    if (washChart) {
        washChart.destroy();
    }


    const grouped =
        groupCountByDate(lavages);


    const labels =
        Object.keys(grouped);


    const values =
        labels.map(
            label => grouped[label]
        );


    washChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {
                            label: "Lavages",

                            data: values,

                            backgroundColor:
                                "#102a43",

                            borderRadius: 7
                        }

                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            }
                        },

                        x: {

                            grid: {
                                display: false
                            }
                        }
                    }
                }
            }
        );
}


/* =========================================================
   CHART PAIEMENT
========================================================= */

function renderPaymentChart(lavages) {

    const canvas =
        document.getElementById(
            "paymentChart"
        );

    if (!canvas) return;


    if (paymentChart) {
        paymentChart.destroy();
    }


    const payments = {};


    lavages.forEach(item => {

        const method =
            item.paiement ||
            "Non précisé";

        payments[method] =
            (payments[method] || 0) +
            Number(item.montant || 0);
    });


    const labels =
        Object.keys(payments);


    const values =
        labels.map(
            label => payments[label]
        );


    paymentChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels,

                    datasets: [

                        {

                            data: values,

                            backgroundColor: [
                                "#1769e0",
                                "#102a43",
                                "#3d82e8",
                                "#274c6e",
                                "#6b9ee8"
                            ],

                            borderWidth: 2,

                            borderColor: "#ffffff"
                        }

                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "65%",

                    plugins: {

                        legend: {

                            position: "bottom"
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    context =>
                                        `${context.label} : ${formatMoney(context.raw)}`
                            }
                        }
                    }
                }
            }
        );
}


/* =========================================================
   PRESTATIONS
========================================================= */

function renderServices(lavages) {

    const container =
        document.getElementById(
            "servicesList"
        );

    if (!container) return;


    const services = {};


    lavages.forEach(item => {

        const service =
            item.service ||
            "Autre";

        services[service] =
            (services[service] || 0) + 1;
    });


    const sorted =
        Object.entries(services)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    if (!sorted.length) {

        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                Aucune prestation pour cette période.
            </div>
        `;

        return;
    }


    const max =
        sorted[0][1];


    container.innerHTML =
        sorted
            .slice(0, 6)
            .map(
                ([name, count]) => {

                    const percentage =
                        Math.max(
                            5,
                            Math.round(
                                count / max * 100
                            )
                        );

                    return `

                        <div class="service-item">

                            <div class="service-top">

                                <span class="service-name">
                                    ${escapeHtml(name)}
                                </span>

                                <span class="service-count">
                                    ${count}
                                </span>

                            </div>

                            <div class="progress-custom">

                                <span
                                    style="width:${percentage}%"
                                ></span>

                            </div>

                        </div>

                    `;
                }
            )
            .join("");
}


/* =========================================================
   RÉSUMÉ
========================================================= */

function renderSummary(lavages) {

    const revenue =
        lavages.reduce(
            (sum, item) =>
                sum + Number(item.montant || 0),
            0
        );


    const average =
        lavages.length
            ? revenue / lavages.length
            : 0;


    const activeEmployees =
        data.employes.filter(
            employee =>
                employee.active === true
        ).length;


    const reservations =
        data.reservations.filter(
            reservation =>
                isDateInCurrentPeriod(
                    reservation.date
                )
        ).length;


    const paymentCount =
        lavages.filter(
            item =>
                item.paiement
        ).length;


    const paymentRate =
        lavages.length
            ? Math.round(
                paymentCount /
                lavages.length *
                100
            )
            : 0;


    setText(
        "averageBasket",
        formatMoney(average)
    );

    setText(
        "activeEmployees",
        activeEmployees
    );

    setText(
        "reservationStat",
        reservations
    );

    setText(
        "paymentRate",
        `${paymentRate} %`
    );
}


/* =========================================================
   ACTUALISER
========================================================= */

function setupRefresh() {

    const button =
        document.getElementById(
            "refreshBtn"
        );

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const icon =
                button.querySelector("i");


            button.disabled = true;

            if (icon) {
                icon.classList.add(
                    "spin"
                );
            }


            setTimeout(
                () => {

                    data = loadData();

                    renderStatistics();

                    button.disabled = false;

                    if (icon) {
                        icon.classList.remove(
                            "spin"
                        );
                    }

                    showToast(
                        "Les statistiques ont été actualisées."
                    );

                },
                500
            );
        }
    );
}


/* =========================================================
   EXPORT CSV
========================================================= */

function setupExport() {

    const button =
        document.getElementById(
            "exportBtn"
        );

    if (!button) return;


    button.addEventListener(
        "click",
        exportStatistics
    );
}


function exportStatistics() {

    const lavages =
        getFilteredWashData();


    if (!lavages.length) {

        showToast(
            "Aucune donnée à exporter pour cette période."
        );

        return;
    }


    const headers = [
        "Date",
        "Client",
        "Prestation",
        "Montant FCFA",
        "Paiement"
    ];


    const rows =
        lavages.map(item => [

            item.date,

            item.client,

            item.service,

            item.montant,

            item.paiement

        ]);


    const csvContent = [

        headers,

        ...rows

    ]

        .map(
            row =>
                row
                    .map(csvEscape)
                    .join(";")
        )

        .join("\n");


    const blob =
        new Blob(
            [
                "\ufeff" +
                csvContent
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    const date =
        new Date()
            .toISOString()
            .slice(0, 10);


    link.href = url;

    link.download =
        `bide-statistiques-${date}.csv`;


    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);


    showToast(
        "Le fichier CSV a été exporté avec succès."
    );
}


/* =========================================================
   OUTILS
========================================================= */

function parseLocalDate(dateString) {

    if (!dateString) {
        return null;
    }

    const parts =
        dateString.split("-")
            .map(Number);


    if (parts.length !== 3) {
        return null;
    }


    return new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
    );
}


function isSameDay(date1, date2) {

    return (
        date1.getFullYear() ===
            date2.getFullYear() &&

        date1.getMonth() ===
            date2.getMonth() &&

        date1.getDate() ===
            date2.getDate()
    );
}


function isDateInCurrentPeriod(dateString) {

    const date =
        parseLocalDate(dateString);

    if (!date) {
        return false;
    }


    const now = new Date();


    if (currentPeriod === "all") {
        return true;
    }


    if (currentPeriod === "today") {

        return isSameDay(
            date,
            now
        );
    }


    if (currentPeriod === "7days") {

        const start =
            new Date(now);

        start.setDate(
            start.getDate() - 6
        );

        start.setHours(0, 0, 0, 0);

        return date >= start;
    }


    if (currentPeriod === "month") {

        return (
            date.getMonth() ===
                now.getMonth() &&

            date.getFullYear() ===
                now.getFullYear()
        );
    }


    if (currentPeriod === "year") {

        return (
            date.getFullYear() ===
            now.getFullYear()
        );
    }


    return true;
}


/* =========================================================
   GROUPES
========================================================= */

function groupByDate(items) {

    const result = {};


    items.forEach(item => {

        const date =
            item.date;


        result[date] =
            (result[date] || 0) +
            Number(item.montant || 0);
    });


    return sortObjectByDate(result);
}


function groupCountByDate(items) {

    const result = {};


    items.forEach(item => {

        const date =
            item.date;


        result[date] =
            (result[date] || 0) + 1;
    });


    return sortObjectByDate(result);
}


function sortObjectByDate(object) {

    return Object.fromEntries(

        Object.entries(object)
            .sort(
                ([a], [b]) =>
                    a.localeCompare(b)
            )
    );
}


/* =========================================================
   FORMATAGE
========================================================= */

function formatMoney(value) {

    return `${Number(value || 0).toLocaleString("fr-FR")} FCFA`;
}


function formatMoneyShort(value) {

    const number =
        Number(value || 0);


    if (number >= 1000000) {

        return `${(
            number / 1000000
        ).toFixed(1)} M`;
    }


    if (number >= 1000) {

        return `${(
            number / 1000
        ).toFixed(0)} k`;
    }


    return number;
}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


/* =========================================================
   SÉCURITÉ HTML
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function csvEscape(value) {

    const text =
        String(value ?? "");

    return `"${text.replaceAll('"', '""')}"`;
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toastElement =
        document.getElementById(
            "appToast"
        );

    const messageElement =
        document.getElementById(
            "toastMessage"
        );


    if (!toastElement ||
        !messageElement) {

        return;
    }


    messageElement.textContent =
        message;


    const toast =
        bootstrap.Toast.getOrCreateInstance(
            toastElement,
            {
                delay: 2500
            }
        );


    toast.show();
}

// Actualiser
document.getElementById("refreshBtn")?.addEventListener("click", () => {
    chargerStatistiques();
});

// Aujourd'hui
document.getElementById("todayBtn")?.addEventListener("click", () => {
    definirPeriodeAujourdhui();
    chargerStatistiques();
});

// Exporter
document.getElementById("exportBtn")?.addEventListener("click", () => {
    exporterStatistiques();
});
