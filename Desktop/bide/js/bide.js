/**
 * =====================================================
 * BIDÈ — Core Platform Logic
 * Vehicle Registration → Admin → Invoice → Payment
 * =====================================================
 */

var BIDE = (function () {

    /* =====================================================
       HELPERS
    ===================================================== */

    function generateId(prefix) {
        var n = Math.floor(100000 + Math.random() * 900000);
        return prefix + '-' + n;
    }

    function now() {
        return new Date().toISOString();
    }

    function formatDate(iso) {
        var d = new Date(iso);
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function formatMoney(n) {
        return Number(n).toLocaleString('fr-FR') + ' FCFA';
    }

    function getStore(key) {
        try { return JSON.parse(localStorage.getItem(key)) || []; }
        catch (e) { return []; }
    }

    function setStore(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function getSession() {
        try { return JSON.parse(localStorage.getItem('bide_session')) || null; }
        catch (e) { return null; }
    }

    function setSession(obj) {
        localStorage.setItem('bide_session', JSON.stringify(obj));
    }

    function clearSession() {
        localStorage.removeItem('bide_session');
    }


    /* =====================================================
       1. VEHICLE REGISTRATION (Client → Admin)
       Keys: bide_requests, bide_clients
    ===================================================== */

    function registerVehicle(data) {
        // data: { nom, prenom, telephone, email, marque, modele, immatriculation, couleur, service }
        var requests = getStore('bide_requests');
        var clients  = getStore('bide_clients');

        var request = {
            id: generateId('REQ'),
            clientId: null,
            nom: data.nom || '',
            prenom: data.prenom || '',
            telephone: data.telephone || '',
            email: data.email || '',
            marque: data.marque || '',
            modele: data.modele || '',
            immatriculation: data.immatriculation || '',
            couleur: data.couleur || '',
            service: data.service || 'Lavage Complet',
            statut: 'en_attente',
            dateArrivee: now(),
            datePriseEnCharge: null,
            dateTerminee: null
        };

        // Find or create client
        var existing = clients.find(function (c) {
            return c.telephone === data.telephone || c.email === data.email;
        });

        if (existing) {
            request.clientId = existing.id;
            existing.nbVehicules = (existing.nbVehicules || 0) + 1;
            existing.derniereVisite = now();
        } else {
            var client = {
                id: generateId('CLI'),
                nom: data.nom || '',
                prenom: data.prenom || '',
                telephone: data.telephone || '',
                email: data.email || '',
                nbVehicules: 1,
                dateInscription: now(),
                derniereVisite: now()
            };
            clients.push(client);
            request.clientId = client.id;
        }

        requests.unshift(request);
        setStore('bide_requests', requests);
        setStore('bide_clients', clients);

        return request;
    }


    /* =====================================================
       2. ADMIN ACTIONS
    ===================================================== */

    function takeInCharge(requestId) {
        var requests = getStore('bide_requests');
        var req = requests.find(function (r) { return r.id === requestId; });
        if (req) {
            req.statut = 'en_cours';
            req.datePriseEnCharge = now();
            setStore('bide_requests', requests);
        }
        return req;
    }

    function completeRequest(requestId) {
        var requests = getStore('bide_requests');
        var req = requests.find(function (r) { return r.id === requestId; });
        if (req) {
            req.statut = 'terminee';
            req.dateTerminee = now();
            setStore('bide_requests', requests);
        }
        return req;
    }


    /* =====================================================
       3. INVOICE GENERATION (Admin → Client)
       Key: bide_invoices
    ===================================================== */

    var TARIFS = {
        'Lavage Extérieur': 3000,
        'Lavage Intérieur': 5000,
        'Lavage Complet': 8000,
        'Nettoyage des Sièges': 7500,
        'Nettoyage des Tapis': 5000,
        'Service Approfondi': 15000,
        'Polish': 10000,
        'Nanocéramique': 25000
    };

    function generateInvoice(requestId, details) {
        // details: { prestations: [{ nom, prix }], notes }
        var requests = getStore('bide_requests');
        var invoices = getStore('bide_invoices');

        var req = requests.find(function (r) { return r.id === requestId; });
        if (!req) return null;

        var prestations = details.prestations || [{ nom: req.service, prix: TARIFS[req.service] || 8000 }];
        var total = prestations.reduce(function (sum, p) { return sum + (p.prix || 0); }, 0);

        var invoice = {
            id: generateId('FAC'),
            requestId: requestId,
            clientId: req.clientId,
            nom: req.nom,
            prenom: req.prenom,
            telephone: req.telephone,
            email: req.email || '',
            marque: req.marque,
            modele: req.modele,
            immatriculation: req.immatriculation,
            couleur: req.couleur,
            prestations: prestations,
            total: total,
            statut: 'en_attente',
            dateFacture: now(),
            datePaiement: null,
            modePaiement: null,
            notes: details.notes || ''
        };

        invoices.unshift(invoice);
        setStore('bide_invoices', invoices);

        return invoice;
    }


    /* =====================================================
       4. PAYMENT (Client side)
    ===================================================== */

    function payInvoice(invoiceId, mode) {
        // mode: 'mobile_money', 'carte_bancaire', 'especes'
        var invoices = getStore('bide_invoices');
        var inv = invoices.find(function (i) { return i.id === invoiceId; });
        if (inv) {
            inv.statut = 'payee';
            inv.datePaiement = now();
            inv.modePaiement = mode;
            setStore('bide_invoices', invoices);
        }
        return inv;
    }


    /* =====================================================
       5. GETTERS
    ===================================================== */

    function getRequests() {
        return getStore('bide_requests');
    }

    function getClients() {
        return getStore('bide_clients');
    }

    function getInvoices() {
        return getStore('bide_invoices');
    }

    function getClientInvoices(clientId) {
        return getStore('bide_invoices').filter(function (i) {
            return i.clientId === clientId;
        });
    }

    function getTarif(serviceName) {
        return TARIFS[serviceName] || 0;
    }


    /* =====================================================
       6. STORAGE SYNC (real-time across tabs)
    ===================================================== */

    var _syncCallbacks = [];

    function onSync(callback) {
        _syncCallbacks.push(callback);
    }

    function initSync() {
        window.addEventListener('storage', function (e) {
            if (!e.key) return;
            var validKeys = [
                'bide_requests', 'bide_clients',
                'bide_invoices', 'bide_session'
            ];
            if (validKeys.indexOf(e.key) === -1) return;

            _syncCallbacks.forEach(function (cb) {
                try { cb(e.key, e.newValue); }
                catch (err) { console.error('BIDE sync error:', err); }
            });
        });
    }


    /* =====================================================
       7. TOAST NOTIFICATION
    ===================================================== */

    function toast(msg, type) {
        type = type || 'success';
        var t = document.createElement('div');
        t.style.cssText =
            'position:fixed;top:20px;right:20px;z-index:99999;padding:14px 22px;' +
            'border-radius:10px;color:white;font-weight:700;font-size:14px;' +
            'box-shadow:0 4px 15px rgba(0,0,0,0.2);font-family:Nunito,sans-serif;' +
            'display:flex;align-items:center;gap:10px;transition:opacity 0.3s;';
        var colors = { success: '#198754', info: '#0d6efd', warning: '#fd7e14', error: '#dc3545' };
        var icons  = { success: 'bi-check-circle-fill', info: 'bi-info-circle-fill', warning: 'bi-exclamation-triangle-fill', error: 'bi-x-circle-fill' };
        t.style.background = colors[type] || colors.success;
        t.innerHTML = '<i class="bi ' + (icons[type] || icons.success) + '"></i> ' + msg;
        document.body.appendChild(t);
        setTimeout(function () { t.style.opacity = '0'; }, 2500);
        setTimeout(function () { t.remove(); }, 3000);
    }


    /* =====================================================
       INIT
    ===================================================== */

    initSync();


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {
        registerVehicle: registerVehicle,
        takeInCharge: takeInCharge,
        completeRequest: completeRequest,
        generateInvoice: generateInvoice,
        payInvoice: payInvoice,
        getRequests: getRequests,
        getClients: getClients,
        getInvoices: getInvoices,
        getClientInvoices: getClientInvoices,
        getTarif: getTarif,
        TARIFS: TARIFS,
        onSync: onSync,
        toast: toast,
        formatDate: formatDate,
        formatMoney: formatMoney,
        generateId: generateId,
        getSession: getSession,
        setSession: setSession,
        clearSession: clearSession
    };

})();
