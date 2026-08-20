"use strict";

/* =========================================================
   BIDÈ - PARAMÈTRES
   Gestion complète
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIGURATION
       ===================================================== */

    const STORAGE_KEY = "bide_parametres_v2";
    const PASSWORD_KEY = "bide_admin_password";


    const DEFAULT_SETTINGS = {

        entreprise: {

            nom: "Bidè",

            slogan: "Administration",

            telephone: "",

            email: "",

            adresse: "",

            ville: "Lomé",

            pays: "Togo",


            description: ""


        },



        preferences: {


            langue: "fr",


            formatDate: "DD/MM/YYYY",


            formatHeure: "24",

            pageAccueil: "dashboard",

            lignesTableau: "10",


            theme: "light",


            couleur: "royal",

            densite: "normal"


        },



        notifications: {

            reservations: true,

            paiements: true,

            lavages: true,


            clients: true,

            alertes: true,

            email: false

        },



        securite: {

            session: "30",

            doubleAuthentification: false

        }

    };


    /* =====================================================
       CLONAGE
       ===================================================== */

    function cloneDefaults() {

        return JSON.parse(
            JSON.stringify(DEFAULT_SETTINGS)
        );

    }


    /* =====================================================
       FUSION
       ===================================================== */

    function mergeSettings(saved) {

        const result = cloneDefaults();

        if (!saved || typeof saved !== "object") {
            return result;
        }

        Object.keys(result).forEach(section => {

            if (
                saved[section] &&
                typeof saved[section] === "object"
            ) {

                Object.assign(
                    result[section],
                    saved[section]
                );

            }

        });

        return result;

    }


    /* =====================================================
       CHARGEMENT
       ===================================================== */

    function loadSettings() {

        try {

            const saved =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!saved) {

                return cloneDefaults();

            }

            return mergeSettings(
                JSON.parse(saved)
            );

        } catch (error) {

            console.error(error);

            return cloneDefaults();

        }

    }


    let settings = loadSettings();


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const tabs =
        document.querySelectorAll(
            "[data-settings-tab]"
        );


    const sections =
        document.querySelectorAll(
            "[data-settings-section]"
        );


    const toastElement =
        document.getElementById(
            "appToast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    /* =====================================================
       TOAST
       ===================================================== */

    function showToast(
        message,
        type = "success"
    ) {

        if (!toastElement) {

            alert(message);

            return;

        }


        toastMessage.textContent =
            message;


        toastElement.classList.remove(
            "text-bg-success",
            "text-bg-danger",
            "text-bg-warning",
            "text-bg-info"
        );


        if (type === "success") {

            toastElement.classList.add(
                "text-bg-success"
            );

        }


        if (type === "danger") {

            toastElement.classList.add(
                "text-bg-danger"
            );

        }


        if (type === "warning") {

            toastElement.classList.add(
                "text-bg-warning"
            );

        }


        if (type === "info") {

            toastElement.classList.add(
                "text-bg-info"
            );

        }


        if (
            typeof bootstrap !== "undefined" &&
            bootstrap.Toast
        ) {

            bootstrap.Toast
                .getOrCreateInstance(
                    toastElement,
                    {
                        delay: 3000
                    }
                )
                .show();

        }

    }


    /* =====================================================
       SAUVEGARDE GENERALE
       ===================================================== */

    function saveSettings() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(settings)
            );

            applyPreferences();

            showToast(
                "Les paramètres ont été enregistrés.",
                "success"
            );

            return true;

        } catch (error) {

            console.error(error);

            showToast(
                "Erreur lors de l'enregistrement.",
                "danger"
            );

            return false;

        }

    }


    /* =====================================================
       LECTURE CHAMP
       ===================================================== */

    function value(id) {

        const element =
            document.getElementById(id);

        if (!element) {
            return "";
        }

        return element.value;

    }


    function checked(id) {

        const element =
            document.getElementById(id);

        if (!element) {
            return false;
        }

        return element.checked;

    }


    /* =====================================================
       REMPLIR CHAMPS
       ===================================================== */

    function setValue(id, val) {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        element.value =
            val ?? "";

    }


    function setChecked(id, val) {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        element.checked =
            Boolean(val);

    }


    /* =====================================================
       PROFIL ENTREPRISE
       ===================================================== */

    function loadCompanyForm() {

        setValue(
            "companyName",
            settings.entreprise.nom
        );

        setValue(
            "companySlogan",
            settings.entreprise.slogan
        );

        setValue(
            "companyPhone",
            settings.entreprise.telephone
        );

        setValue(
            "companyEmail",
            settings.entreprise.email
        );

        setValue(
            "companyAddress",
            settings.entreprise.adresse
        );

        setValue(
            "companyCity",
            settings.entreprise.ville
        );

        setValue(
            "companyCountry",
            settings.entreprise.pays
        );

        setValue(
            "currency",
            settings.entreprise.devise
        );

        setValue(
            "companyDescription",
            settings.entreprise.description
        );

    }


    function saveCompany() {

        const name =
            value("companyName").trim();

        if (!name) {

            showToast(
                "Le nom de l'entreprise est obligatoire.",
                "warning"
            );

            document
                .getElementById("companyName")
                .focus();

            return;

        }


        const email =
            value("companyEmail").trim();


        if (email) {

            const pattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!pattern.test(email)) {

                showToast(
                    "L'adresse email est invalide.",
                    "warning"
                );

                document
                    .getElementById("companyEmail")
                    .focus();

                return;

            }

        }


        settings.entreprise = {

            nom: name,

            slogan:
                value("companySlogan").trim(),

            telephone:
                value("companyPhone").trim(),

            email: email,

            adresse:
                value("companyAddress").trim(),

            ville:
                value("companyCity").trim(),

            pays:
                value("companyCountry").trim(),

            devise:
                value("currency"),

            description:
                value("companyDescription").trim()

        };


        saveSettings();

    }


    /* =====================================================
       PREFERENCES
       ===================================================== */

    function loadPreferencesForm() {

        setValue(
            "language",
            settings.preferences.langue
        );

        setValue(
            "dateFormat",
            settings.preferences.formatDate
        );

        setValue(
            "timeFormat",
            settings.preferences.formatHeure
        );

        setValue(
            "homePage",
            settings.preferences.pageAccueil
        );

        setValue(
            "tableRows",
            settings.preferences.lignesTableau
        );

        setValue(
            "theme",
            settings.preferences.theme
        );

        setValue(
            "primaryColor",
            settings.preferences.couleur
        );

        setValue(
            "density",
            settings.preferences.densite
        );

    }


    function savePreferences() {

        settings.preferences = {

            langue:
                value("language"),

            formatDate:
                value("dateFormat"),

            formatHeure:
                value("timeFormat"),

            pageAccueil:
                value("homePage"),

            lignesTableau:
                value("tableRows"),

            theme:
                value("theme"),

            couleur:
                value("primaryColor"),

            densite:
                value("density")

        };


        saveSettings();

    }


    /* =====================================================
       NOTIFICATIONS
       ===================================================== */

    function loadNotificationsForm() {

        setChecked(
            "notificationReservations",
            settings.notifications.reservations
        );

        setChecked(
            "notificationPayments",
            settings.notifications.paiements
        );

        setChecked(
            "notificationLavages",
            settings.notifications.lavages
        );

        setChecked(
            "notificationClients",
            settings.notifications.clients
        );

        setChecked(
            "notificationAlerts",
            settings.notifications.alertes
        );

        setChecked(
            "notificationEmail",
            settings.notifications.email
        );

    }


    function saveNotifications() {

        settings.notifications = {

            reservations:
                checked("notificationReservations"),

            paiements:
                checked("notificationPayments"),

            lavages:
                checked("notificationLavages"),

            clients:
                checked("notificationClients"),

            alertes:
                checked("notificationAlerts"),

            email:
                checked("notificationEmail")

        };


        saveSettings();

    }


    /* =====================================================
       SECURITE
       ===================================================== */

    function loadSecurityForm() {

        setValue(
            "sessionDuration",
            settings.securite.session
        );

        setChecked(
            "twoFactor",
            settings.securite.doubleAuthentification
        );

    }


    function saveSecurity() {

        settings.securite = {

            session:
                value("sessionDuration"),

            doubleAuthentification:
                checked("twoFactor")

        };


        saveSettings();

    }


    /* =====================================================
       MOT DE PASSE
       ===================================================== */

    function getStoredPassword() {

        return localStorage.getItem(
            PASSWORD_KEY
        );

    }


    function setDefaultPassword() {

        if (!getStoredPassword()) {

            /*
             * Mot de passe initial de démonstration.
             *
             * Pour une vraie application avec backend,
             * le mot de passe doit être géré côté serveur
             * avec un hash sécurisé.
             */

            localStorage.setItem(
                PASSWORD_KEY,
                "Bide@2026"
            );

        }

    }


    function validatePassword(password) {

        return {

            length:
                password.length >= 8,

            upper:
                /[A-Z]/.test(password),

            number:
                /[0-9]/.test(password)

        };

    }


    function updatePasswordRules() {

        const password =
            value("newPassword");


        const rules =
            validatePassword(password);


        updateRule(
            "ruleLength",
            rules.length
        );

        updateRule(
            "ruleUpper",
            rules.upper
        );

        updateRule(
            "ruleNumber",
            rules.number
        );

    }


    function updateRule(
        id,
        valid
    ) {

        const rule =
            document.getElementById(id);

        if (!rule) {
            return;
        }


        rule.classList.toggle(
            "valid",
            valid
        );

    }


    function changePassword() {

        const current =
            value("currentPassword");

        const newPassword =
            value("newPassword");

        const confirmation =
            value("confirmPassword");


        if (!current) {

            showToast(
                "Saisissez votre mot de passe actuel.",
                "warning"
            );

            document
                .getElementById(
                    "currentPassword"
                )
                .focus();

            return;

        }


        const storedPassword =
            getStoredPassword();


        if (current !== storedPassword) {

            showToast(
                "Le mot de passe actuel est incorrect.",
                "danger"
            );

            return;

        }


        const rules =
            validatePassword(
                newPassword
            );


        if (
            !rules.length ||
            !rules.upper ||
            !rules.number
        ) {

            showToast(
                "Le nouveau mot de passe ne respecte pas les règles de sécurité.",
                "warning"
            );

            return;

        }


        if (
            newPassword !== confirmation
        ) {

            showToast(
                "La confirmation du mot de passe ne correspond pas.",
                "warning"
            );

            return;

        }


        if (
            newPassword === current
        ) {

            showToast(
                "Le nouveau mot de passe doit être différent de l'ancien.",
                "warning"
            );

            return;

        }


        localStorage.setItem(
            PASSWORD_KEY,
            newPassword
        );


        document
            .getElementById(
                "passwordForm"
            )
            .reset();


        updatePasswordRules();


        showToast(
            "Votre mot de passe a été modifié avec succès.",
            "success"
        );

    }


    /* =====================================================
       TABS
       ===================================================== */

    function activateTab(
        tabName,
        save = true
    ) {

        tabs.forEach(tab => {

            tab.classList.toggle(
                "active",
                tab.dataset.settingsTab === tabName
            );

        });


        sections.forEach(section => {

            const active =
                section.dataset.settingsSection === tabName;

            section.classList.toggle(
                "active",
                active
            );


            if (active) {

                section.removeAttribute(
                    "hidden"
                );

            } else {

                section.setAttribute(
                    "hidden",
                    ""
                );

            }

        });


        if (save) {

            localStorage.setItem(
                "bide_settings_active_tab",
                tabName
            );

        }

    }


    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                const tabName =
                    tab.dataset.settingsTab;

                if (tabName) {

                    activateTab(
                        tabName
                    );

                }

            }
        );

    });


    /* =====================================================
       FORMS
       ===================================================== */

    const companyForm =
        document.getElementById(
            "companyForm"
        );


    if (companyForm) {

        companyForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveCompany();

            }
        );

    }


    const preferencesForm =
        document.getElementById(
            "preferencesForm"
        );


    if (preferencesForm) {

        preferencesForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                savePreferences();

            }
        );

    }


    const notificationsForm =
        document.getElementById(
            "notificationsForm"
        );


    if (notificationsForm) {

        notificationsForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveNotifications();

            }
        );

    }


    const securityForm =
        document.getElementById(
            "securityForm"
        );


    if (securityForm) {

        securityForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveSecurity();

            }
        );

    }


    const passwordForm =
        document.getElementById(
            "passwordForm"
        );


    if (passwordForm) {

        passwordForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                changePassword();

            }
        );

    }


    /* =====================================================
       PASSWORD SHOW / HIDE
       ===================================================== */

    document
        .querySelectorAll(
            "[data-password-target]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const targetId =
                        button.dataset.passwordTarget;

                    const input =
                        document.getElementById(
                            targetId
                        );

                    if (!input) {
                        return;
                    }


                    if (
                        input.type === "password"
                    ) {

                        input.type = "text";

                        button.innerHTML =
                            '<i class="bi bi-eye-slash"></i>';

                    } else {

                        input.type = "password";

                        button.innerHTML =
                            '<i class="bi bi-eye"></i>';

                    }

                }
            );

        });


    /* =====================================================
       PASSWORD RULES LIVE
       ===================================================== */

    const newPassword =
        document.getElementById(
            "newPassword"
        );


    if (newPassword) {

        newPassword.addEventListener(
            "input",
            updatePasswordRules
        );

    }


    /* =====================================================
       RESET SECTION
       ===================================================== */

    document
        .querySelectorAll(
            "[data-reset-section]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const section =
                        button.dataset.resetSection;


                    const confirmed =
                        confirm(
                            "Voulez-vous vraiment réinitialiser cette section ?"
                        );


                    if (!confirmed) {
                        return;
                    }


                    const defaults =
                        cloneDefaults();


                    if (
                        section === "entreprise"
                    ) {

                        settings.entreprise =
                            defaults.entreprise;

                        loadCompanyForm();

                    }


                    if (
                        section === "preferences"
                    ) {

                        settings.preferences =
                            defaults.preferences;

                        loadPreferencesForm();

                        applyPreferences();

                    }


                    if (
                        section === "notifications"
                    ) {

                        settings.notifications =
                            defaults.notifications;

                        loadNotificationsForm();

                    }


                    if (
                        section === "securite"
                    ) {

                        settings.securite =
                            defaults.securite;

                        loadSecurityForm();

                    }


                    localStorage.setItem(
                        STORAGE_KEY,
                        JSON.stringify(settings)
                    );


                    showToast(
                        "La section a été réinitialisée.",
                        "info"
                    );

                }
            );

        });


    /* =====================================================
       APPLICATION DES PREFERENCES
       ===================================================== */

    function applyPreferences() {

        const root =
            document.documentElement;


        /* THEME */

        if (
            settings.preferences.theme ===
            "dark"
        ) {

            root.setAttribute(
                "data-theme",
                "dark"
            );

        } else {

            root.setAttribute(
                "data-theme",
                "light"
            );

        }


        /* COULEUR */

        const colors = {

            royal: {
                primary: "#1d4ed8",
                dark: "#173ea5"
            },

            navy: {
                primary: "#102a43",
                dark: "#071d2e"
            },

            blue: {
                primary: "#1769e0",
                dark: "#0f4fae"
            }

        };


        const selected =
            colors[
                settings.preferences.couleur
            ] || colors.royal;


        root.style.setProperty(
            "--primary",
            selected.primary
        );


        root.style.setProperty(
            "--primary-dark",
            selected.dark
        );


        /* DENSITE */

        document.body.classList.remove(
            "density-compact",
            "density-normal",
            "density-comfortable"
        );


        document.body.classList.add(
            `density-${settings.preferences.densite}`
        );

    }


    /* =====================================================
       CHANGEMENT APPARENCE EN DIRECT
       ===================================================== */

    const theme =
        document.getElementById(
            "theme"
        );


    if (theme) {

        theme.addEventListener(
            "change",
            () => {

                settings.preferences.theme =
                    theme.value;

                applyPreferences();

            }
        );

    }


    const primaryColor =
        document.getElementById(
            "primaryColor"
        );


    if (primaryColor) {

        primaryColor.addEventListener(
            "change",
            () => {

                settings.preferences.couleur =
                    primaryColor.value;

                applyPreferences();

            }
        );

    }


    const density =
        document.getElementById(
            "density"
        );


    if (density) {

        density.addEventListener(
            "change",
            () => {

                settings.preferences.densite =
                    density.value;

                applyPreferences();

            }
        );

    }


    /* =====================================================
       EXPORT
       ===================================================== */

    const exportButton =
        document.getElementById(
            "exportSettingsBtn"
        );


    if (exportButton) {

        exportButton.addEventListener(
            "click",
            () => {

                const data = {

                    application: "Bidè",

                    version: "2.0",

                    date:
                        new Date().toISOString(),

                    settings:
                        settings

                };


                const blob =
                    new Blob(
                        [
                            JSON.stringify(
                                data,
                                null,
                                4
                            )
                        ],
                        {
                            type:
                                "application/json"
                        }
                    );


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href = url;


                link.download =
                    `bide-parametres-${getFileDate()}.json`;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                URL.revokeObjectURL(
                    url
                );


                showToast(
                    "Les paramètres ont été exportés.",
                    "success"
                );

            }
        );

    }


    /* =====================================================
       IMPORT
       ===================================================== */

    const importButton =
        document.getElementById(
            "importSettingsBtn"
        );


    const importInput =
        document.getElementById(
            "importSettingsInput"
        );


    if (
        importButton &&
        importInput
    ) {

        importButton.addEventListener(
            "click",
            () => {

                importInput.click();

            }
        );


        importInput.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files[0];


                if (!file) {
                    return;
                }


                const reader =
                    new FileReader();


                reader.onload =
                    () => {

                        try {

                            const data =
                                JSON.parse(
                                    reader.result
                                );


                            const imported =
                                data.settings ||
                                data;


                            settings =
                                mergeSettings(
                                    imported
                                );


                            localStorage.setItem(
                                STORAGE_KEY,
                                JSON.stringify(
                                    settings
                                )
                            );


                            loadAllForms();

                            applyPreferences();


                            showToast(
                                "Les paramètres ont été importés.",
                                "success"
                            );


                        } catch (error) {

                            console.error(error);

                            showToast(
                                "Le fichier JSON est invalide.",
                                "danger"
                            );

                        }


                        importInput.value = "";

                    };


                reader.readAsText(
                    file
                );

            }
        );

    }


    /* =====================================================
       DATE
       ===================================================== */

    function updateDate() {

        const dateElement =
            document.getElementById(
                "currentDate"
            );


        if (!dateElement) {
            return;
        }


        dateElement.textContent =
            new Date().toLocaleDateString(
                "fr-FR",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );

    }


    function getFileDate() {

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


    const year =
        document.getElementById(
            "currentYear"
        );


    if (year) {

        year.textContent =
            new Date().getFullYear();

    }


    updateDate();


    /* =====================================================
       SIDEBAR MOBILE
       ===================================================== */

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const menuToggle =
        document.getElementById(
            "menuToggle"
        );


    const sidebarClose =
        document.getElementById(
            "sidebarClose"
        );


    const sidebarOverlay =
        document.getElementById(
            "sidebarOverlay"
        );


    function openSidebar() {

        if (!sidebar) {
            return;
        }


        sidebar.classList.add(
            "show"
        );


        sidebarOverlay?.classList.add(
            "show"
        );

    }


    function closeSidebar() {

        if (!sidebar) {
            return;
        }


        sidebar.classList.remove(
            "show"
        );


        sidebarOverlay?.classList.remove(
            "show"
        );

    }


    menuToggle?.addEventListener(
        "click",
        openSidebar
    );


    sidebarClose?.addEventListener(
        "click",
        closeSidebar
    );


    sidebarOverlay?.addEventListener(
        "click",
        closeSidebar
    );


    /* =====================================================
       CHARGEMENT COMPLET
       ===================================================== */

    function loadAllForms() {

        loadCompanyForm();

        loadPreferencesForm();

        loadNotificationsForm();

        loadSecurityForm();

        updatePasswordRules();

    }


    /* =====================================================
       ONGLET ACTIF
       ===================================================== */

    const savedTab =
        localStorage.getItem(
            "bide_settings_active_tab"
        );


    const validTab =
        savedTab &&
        document.querySelector(
            `[data-settings-section="${savedTab}"]`
        );


    activateTab(
        validTab
            ? savedTab
            : "entreprise",
        false
    );


    /* =====================================================
       INITIALISATION
       ===================================================== */

    setDefaultPassword();

    loadAllForms();

    applyPreferences();

});
