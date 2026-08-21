/**
 * =====================================================
 * BIDE Admin — Clients Management
 * =====================================================
 * CRUD complet avec modales et localStorage
 * =====================================================
 */

(function () {

    /* =====================================================
       HELPERS
    ===================================================== */

    function generateId() {
        return 'CLI' + Math.floor(1000 + Math.random() * 9000);
    }

    function getClients() {
        try {
            return JSON.parse(localStorage.getItem('bide_clients')) || [];
        } catch (e) {
            return [];
        }
    }

    function saveClients(clients) {
        localStorage.setItem('bide_clients', JSON.stringify(clients));
    }

    function getRequests() {
        try {
            return JSON.parse(localStorage.getItem('bide_requests')) || [];
        } catch (e) {
            return [];
        }
    }

    function formatDate(iso) {
        var d = new Date(iso);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function getInitials(prenom, nom) {
        return ((prenom ? prenom.charAt(0) : '') + (nom ? nom.charAt(0) : '')).toUpperCase();
    }

    function countClientRequests(clientId) {
        var requests = getRequests();
        return requests.filter(function (r) {
            return r.clientId === clientId;
        }).length;
    }

    function countClientVehicles(clientId) {
        var clients = getClients();
        var client = clients.find(function (c) { return c.id === clientId; });
        return client ? (client.nbVehicules || 1) : 1;
    }

    /* =====================================================
       SEED DATA (si vide)
    ===================================================== */

    function seedClients() {
        var clients = getClients();
        if (clients.length > 0) return;

        var seed = [
            { id: 'CLI001', nom: 'Agbeko', prenom: 'Kossi', telephone: '+228 90 00 00 01', email: 'kossi@email.com', nbVehicules: 2, statut: 'active', dateInscription: '2026-01-12T10:00:00Z', derniereVisite: '2026-08-20T14:30:00Z' },
            { id: 'CLI002', nom: 'Mensah', prenom: 'Ama', telephone: '+228 91 00 00 02', email: 'ama@email.com', nbVehicules: 1, statut: 'active', dateInscription: '2026-02-04T10:00:00Z', derniereVisite: '2026-08-19T09:15:00Z' },
            { id: 'CLI003', nom: 'Komlan', prenom: 'Yao', telephone: '+228 92 00 00 03', email: 'yao@email.com', nbVehicules: 3, statut: 'active', dateInscription: '2026-03-21T10:00:00Z', derniereVisite: '2026-08-18T16:45:00Z' },
            { id: 'CLI004', nom: 'Adjo', prenom: 'Eyram', telephone: '+228 93 00 00 04', email: 'eyram@email.com', nbVehicules: 1, statut: 'inactive', dateInscription: '2026-05-15T10:00:00Z', derniereVisite: '2026-07-10T11:00:00Z' },
            { id: 'CLI005', nom: 'Dodzi', prenom: 'Sena', telephone: '+228 94 00 00 05', email: 'sena@email.com', nbVehicules: 2, statut: 'active', dateInscription: '2026-06-28T10:00:00Z', derniereVisite: '2026-08-21T08:20:00Z' }
        ];

        saveClients(seed);
    }


    /* =====================================================
       VARIABLES
    ===================================================== */

    var currentPage = 1;
    var perPage = 5;
    var deleteClientId = null;

    var tbody = document.getElementById('clientsTableBody');
    var emptyState = document.getElementById('emptyState');
    var searchInput = document.getElementById('searchClient');
    var filterStatus = document.getElementById('filterStatus');
    var resetBtn = document.getElementById('resetBtn');

    var addClientBtn = document.getElementById('addClientBtn');
    var addClientForm = document.getElementById('addClientForm');
    var editClientForm = document.getElementById('editClientForm');
    var confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    var addModal = new bootstrap.Modal(document.getElementById('addClientModal'));
    var viewModal = new bootstrap.Modal(document.getElementById('viewClientModal'));
    var editModal = new bootstrap.Modal(document.getElementById('editClientModal'));
    var deleteModal = new bootstrap.Modal(document.getElementById('deleteClientModal'));


    /* =====================================================
       RENDER TABLE
    ===================================================== */

    function renderTable() {
        var clients = getFilteredClients();

        if (clients.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('d-none');
            document.getElementById('pagination').style.display = 'none';
            return;
        }

        emptyState.classList.add('d-none');
        document.getElementById('pagination').style.display = 'flex';

        var total = clients.length;
        var totalPages = Math.ceil(total / perPage);
        if (currentPage > totalPages) currentPage = totalPages;

        var start = (currentPage - 1) * perPage;
        var end = Math.min(start + perPage, total);
        var pageClients = clients.slice(start, end);

        tbody.innerHTML = '';

        pageClients.forEach(function (c) {
            var initials = getInitials(c.prenom, c.nom);
            var nbVehicules = c.nbVehicules || 1;
            var nbResa = countClientRequests(c.id);
            var statut = c.statut || 'active';
            var dateStr = c.dateInscription ? formatDate(c.dateInscription) : '—';

            var row = document.createElement('tr');

            row.innerHTML =
                /* CLIENT */
                '<td><div class="client-cell">' +
                    '<div class="client-avatar">' + initials + '</div>' +
                    '<div><strong>' + escHtml(c.prenom + ' ' + c.nom) + '</strong><span>' + escHtml(c.id) + '</span></div>' +
                '</div></td>' +

                /* CONTACT */
                '<td><strong>' + escHtml(c.telephone) + '</strong>' +
                    '<span class="table-subtext">' + escHtml(c.email || '—') + '</span></td>' +

                /* VÉHICULES */
                '<td>' + nbVehicules + ' véhicule' + (nbVehicules > 1 ? 's' : '') + '</td>' +

                /* RÉSERVATIONS */
                '<td><strong>' + nbResa + '</strong><span class="table-subtext">réservation' + (nbResa > 1 ? 's' : '') + '</span></td>' +

                /* INSCRIPTION */
                '<td>' + dateStr + '</td>' +

                /* STATUT */
                '<td><span class="status ' + (statut === 'active' ? 'confirmed' : 'pending') + '">' +
                    (statut === 'active' ? 'Actif' : 'Inactif') +
                '</span></td>' +

                /* ACTIONS */
                '<td><div class="action-buttons">' +
                    '<button class="table-action view" data-id="' + c.id + '" title="Voir"><i class="bi bi-eye"></i></button>' +
                    '<button class="table-action edit" data-id="' + c.id + '" title="Modifier"><i class="bi bi-pencil"></i></button>' +
                    '<button class="table-action delete" data-id="' + c.id + '" title="Supprimer"><i class="bi bi-trash"></i></button>' +
                '</div></td>';

            tbody.appendChild(row);
        });

        renderPagination(total, totalPages);
    }


    /* =====================================================
       GET FILTERED CLIENTS
    ===================================================== */

    function getFilteredClients() {
        var clients = getClients();
        var search = searchInput ? searchInput.value.toLowerCase().trim() : '';
        var status = filterStatus ? filterStatus.value : 'all';

        return clients.filter(function (c) {
            var matchSearch = !search ||
                (c.prenom + ' ' + c.nom).toLowerCase().includes(search) ||
                (c.telephone || '').includes(search) ||
                (c.email || '').toLowerCase().includes(search) ||
                (c.id || '').toLowerCase().includes(search);

            var matchStatus = status === 'all' || c.statut === status;

            return matchSearch && matchStatus;
        });
    }


    /* =====================================================
       RENDER PAGINATION
    ===================================================== */

    function renderPagination(total, totalPages) {
        var info = document.getElementById('paginationInfo');
        var btns = document.getElementById('paginationBtns');

        var start = (currentPage - 1) * perPage + 1;
        var end = Math.min(currentPage * perPage, total);
        info.textContent = 'Affichage de ' + start + ' à ' + end + ' sur ' + total + ' clients';

        btns.innerHTML = '';

        // Prev
        var prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn' + (currentPage === 1 ? ' disabled' : '');
        prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
        prevBtn.addEventListener('click', function () {
            if (currentPage > 1) { currentPage--; renderTable(); }
        });
        btns.appendChild(prevBtn);

        for (var i = 1; i <= totalPages; i++) {
            (function (page) {
                var btn = document.createElement('button');
                btn.className = 'pagination-btn' + (page === currentPage ? ' active' : '');
                btn.textContent = page;
                btn.addEventListener('click', function () {
                    currentPage = page;
                    renderTable();
                });
                btns.appendChild(btn);
            })(i);
        }

        // Next
        var nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn' + (currentPage === totalPages ? ' disabled' : '');
        nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
        nextBtn.addEventListener('click', function () {
            if (currentPage < totalPages) { currentPage++; renderTable(); }
        });
        btns.appendChild(nextBtn);
    }


    /* =====================================================
       UPDATE STATS
    ===================================================== */

    function updateStats() {
        var clients = getClients();
        var total = clients.length;
        var actifs = clients.filter(function (c) { return c.statut === 'active'; }).length;
        var inactifs = total - actifs;
        var vehicules = clients.reduce(function (sum, c) { return sum + (c.nbVehicules || 1); }, 0);

        document.getElementById('statTotal').textContent = total;
        document.getElementById('statActifs').textContent = actifs;
        document.getElementById('statInactifs').textContent = inactifs;
        document.getElementById('statVehicules').textContent = vehicules;
    }


    /* =====================================================
       VIEW CLIENT
    ===================================================== */

    function viewClient(clientId) {
        var clients = getClients();
        var c = clients.find(function (cl) { return cl.id === clientId; });
        if (!c) return;

        var nbResa = countClientRequests(c.id);
        var nbVeh = c.nbVehicules || 1;

        var html =
            '<div style="text-align:center;margin-bottom:20px">' +
                '<div class="client-avatar" style="width:60px;height:60px;font-size:20px;margin:0 auto 10px">' + getInitials(c.prenom, c.nom) + '</div>' +
                '<h5 style="margin:0">' + escHtml(c.prenom + ' ' + c.nom) + '</h5>' +
                '<span style="color:#6B7280;font-size:12px">' + escHtml(c.id) + '</span>' +
            '</div>' +
            '<div class="vehicle-info-list">' +
                '<div class="vehicle-info-item"><span>Téléphone</span><strong>' + escHtml(c.telephone) + '</strong></div>' +
                '<div class="vehicle-info-item"><span>Email</span><strong>' + escHtml(c.email || '—') + '</strong></div>' +
                '<div class="vehicle-info-item"><span>Véhicules</span><strong>' + nbVeh + '</strong></div>' +
                '<div class="vehicle-info-item"><span>Réservations</span><strong>' + nbResa + '</strong></div>' +
                '<div class="vehicle-info-item"><span>Inscription</span><strong>' + (c.dateInscription ? formatDate(c.dateInscription) : '—') + '</strong></div>' +
                '<div class="vehicle-info-item"><span>Statut</span><strong>' +
                    '<span class="status ' + (c.statut === 'active' ? 'confirmed' : 'pending') + '">' +
                    (c.statut === 'active' ? 'Actif' : 'Inactif') + '</span></strong></div>' +
            '</div>';

        document.getElementById('viewClientContent').innerHTML = html;
        viewModal.show();
    }


    /* =====================================================
       EDIT CLIENT
    ===================================================== */

    function editClient(clientId) {
        var clients = getClients();
        var c = clients.find(function (cl) { return cl.id === clientId; });
        if (!c) return;

        document.getElementById('editClientId').value = c.id;
        document.getElementById('editPrenom').value = c.prenom || '';
        document.getElementById('editNom').value = c.nom || '';
        document.getElementById('editTelephone').value = c.telephone || '';
        document.getElementById('editEmail').value = c.email || '';
        document.getElementById('editStatut').value = c.statut || 'active';

        editModal.show();
    }


    /* =====================================================
       DELETE CLIENT
    ===================================================== */

    function deleteClient(clientId) {
        var clients = getClients();
        var c = clients.find(function (cl) { return cl.id === clientId; });
        if (!c) return;

        deleteClientId = clientId;
        document.getElementById('deleteClientName').textContent = c.prenom + ' ' + c.nom + ' (' + c.id + ')';
        deleteModal.show();
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escHtml(str) {
        var div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }


    /* =====================================================
       EVENT: ADD CLIENT
    ===================================================== */

    if (addClientBtn) {
        addClientBtn.addEventListener('click', function () {
            addClientForm.reset();
            addModal.show();
        });
    }

    if (addClientForm) {
        addClientForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var prenom = document.getElementById('addPrenom').value.trim();
            var nom = document.getElementById('addNom').value.trim();
            var telephone = document.getElementById('addTelephone').value.trim();
            var email = document.getElementById('addEmail').value.trim();
            var statut = document.getElementById('addStatut').value;

            if (!prenom || !nom || !telephone) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }

            var clients = getClients();

            // Vérifier doublon téléphone
            var exists = clients.find(function (c) { return c.telephone === telephone; });
            if (exists) {
                alert('Un client avec ce numéro de téléphone existe déjà.');
                return;
            }

            var newClient = {
                id: generateId(),
                prenom: prenom,
                nom: nom,
                telephone: telephone,
                email: email,
                nbVehicules: 0,
                statut: statut,
                dateInscription: new Date().toISOString(),
                derniereVisite: new Date().toISOString()
            };

            clients.unshift(newClient);
            saveClients(clients);

            addModal.hide();
            renderTable();
            updateStats();

            BIDE.toast('Client ' + prenom + ' ' + nom + ' ajouté !', 'success');
        });
    }


    /* =====================================================
       EVENT: EDIT CLIENT
    ===================================================== */

    if (editClientForm) {
        editClientForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var id = document.getElementById('editClientId').value;
            var prenom = document.getElementById('editPrenom').value.trim();
            var nom = document.getElementById('editNom').value.trim();
            var telephone = document.getElementById('editTelephone').value.trim();
            var email = document.getElementById('editEmail').value.trim();
            var statut = document.getElementById('editStatut').value;

            if (!prenom || !nom || !telephone) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }

            var clients = getClients();
            var client = clients.find(function (c) { return c.id === id; });
            if (!client) return;

            client.prenom = prenom;
            client.nom = nom;
            client.telephone = telephone;
            client.email = email;
            client.statut = statut;

            saveClients(clients);

            editModal.hide();
            renderTable();
            updateStats();

            BIDE.toast('Client mis à jour !', 'success');
        });
    }


    /* =====================================================
       EVENT: DELETE CLIENT (confirm)
    ===================================================== */

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function () {
            if (!deleteClientId) return;

            var clients = getClients();
            clients = clients.filter(function (c) { return c.id !== deleteClientId; });
            saveClients(clients);

            deleteClientId = null;
            deleteModal.hide();
            renderTable();
            updateStats();

            BIDE.toast('Client supprimé.', 'success');
        });
    }


    /* =====================================================
       EVENT: TABLE CLICK (delegation)
    ===================================================== */

    if (tbody) {
        tbody.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-id]');
            if (!btn) return;

            var id = btn.getAttribute('data-id');
            var action = btn.getAttribute('title') || '';

            if (btn.classList.contains('view') || action === 'Voir') {
                viewClient(id);
            } else if (btn.classList.contains('edit') || action === 'Modifier') {
                editClient(id);
            } else if (btn.classList.contains('delete') || action === 'Supprimer') {
                deleteClient(id);
            }
        });
    }


    /* =====================================================
       EVENT: SEARCH & FILTER
    ===================================================== */

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentPage = 1;
            renderTable();
        });
    }

    if (filterStatus) {
        filterStatus.addEventListener('change', function () {
            currentPage = 1;
            renderTable();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            if (searchInput) searchInput.value = '';
            if (filterStatus) filterStatus.value = 'all';
            currentPage = 1;
            renderTable();
        });
    }


    /* =====================================================
       EVENT: MOBILE MENU
    ===================================================== */

    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var sidebar = document.getElementById('sidebar');
    var sidebarOverlay = document.getElementById('sidebarOverlay');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            sidebar.classList.toggle('show');
            if (sidebarOverlay) sidebarOverlay.classList.toggle('show');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function () {
            sidebar.classList.remove('show');
            sidebarOverlay.classList.remove('show');
        });
    }


    /* =====================================================
       SYNC (realtime across tabs)
    ===================================================== */

    window.addEventListener('storage', function (e) {
        if (e.key === 'bide_clients') {
            renderTable();
            updateStats();
        }
    });


    /* =====================================================
       INIT
    ===================================================== */

    seedClients();
    renderTable();
    updateStats();

})();
