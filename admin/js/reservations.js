/**
 * =====================================================
 * BIDE Admin — Réservations Management
 * =====================================================
 * Gestion complète des réservations :
 * - CRUD réservations
 * - Intégration avec bide.js
 * - Données dynamiques (clients, véhicules)
 * - Filtres et recherche
 * - Synchronisation temps réel
 * =====================================================
 */

(function() {
    
    /* =====================================================
       HELPER FUNCTIONS
    ===================================================== */
    function el(tag, attrs, text) {
        var e = document.createElement(tag);
        if (attrs) {
            for (var k in attrs) {
                if (k === 'className') e.className = attrs[k];
                else if (k === 'style' && typeof attrs[k] === 'object') {
                    for (var s in attrs[k]) e.style[s] = attrs[k][s];
                }
                else if (k.indexOf('data-') === 0) e.setAttribute(k, attrs[k]);
                else e.setAttribute(k, attrs[k]);
            }
        }
        if (text !== undefined) e.textContent = text;
        return e;
    }
    
    /* =====================================================
       CHARGER LES CLIENTS DYNAMIQUEMENT
    ===================================================== */
    function loadClients() {
        var clients = BIDE.getClients();
        var select = document.getElementById('reservationClient');
        if (!select) return;
        
        var currentValue = select.value;
        select.innerHTML = '<option value="">Sélectionner un client</option>';
        
        clients.forEach(function(c) {
            var opt = el('option', { value: c.id });
            opt.textContent = c.prenom + ' ' + c.nom + ' (' + c.telephone + ')';
            select.appendChild(opt);
        });
        
        if (currentValue) select.value = currentValue;
    }
    
    /* =====================================================
       CHARGER LES VÉHICULES DYNAMIQUEMENT
    ===================================================== */
    function loadVehicles() {
        var requests = BIDE.getRequests();
        var select = document.getElementById('reservationVehicle');
        if (!select) return;
        
        var currentValue = select.value;
        select.innerHTML = '<option value="">Sélectionner un véhicule</option>';
        
        // Créer une liste unique de véhicules
        var vehicles = {};
        requests.forEach(function(r) {
            var key = r.marque + ' ' + r.modele;
            if (!vehicles[key]) {
                vehicles[key] = {
                    marque: r.marque,
                    modele: r.modele,
                    immatriculation: r.immatriculation
                };
            }
        });
        
        Object.values(vehicles).forEach(function(v) {
            var opt = el('option', { value: v.immatriculation });
            opt.textContent = v.marque + ' ' + v.modele + ' (' + v.immatriculation + ')';
            select.appendChild(opt);
        });
        
        if (currentValue) select.value = currentValue;
    }
    
    /* =====================================================
       CHARGER LES RÉSERVATIONS DANS LE TABLEAU
    ===================================================== */
    function loadReservations() {
        var requests = BIDE.getRequests();
        var tbody = document.getElementById('reservationsTableBody');
        if (!tbody) return;
        
        if (!requests.length) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#6B7280;">Aucune réservation pour le moment.</td></tr>';
            updateStats(0, 0, 0, 0);
            return;
        }
        
        tbody.innerHTML = '';
        
        var statusColors = {
            'en_attente': 'background:#FEF3C7;color:#92400E',
            'en_cours': 'background:#DBEAFE;color:#1D4ED8',
            'terminee': 'background:#DCFCE7;color:#166534'
        };
        
        var statusLabels = {
            'en_attente': 'En attente',
            'en_cours': 'En cours',
            'terminee': 'Terminée'
        };
        
        requests.forEach(function(r) {
            var row = el('tr', { style: 'border-bottom:1px solid #F3F4F6' });
            
            // Référence
            row.appendChild(el('td', { style: 'padding:14px;font-weight:700;font-size:12px' }, r.id));
            
            // Client
            var clientCell = el('td', { style: 'padding:14px' });
            clientCell.appendChild(el('strong', null, r.prenom + ' ' + r.nom));
            clientCell.appendChild(el('br'));
            clientCell.appendChild(el('span', { style: 'font-size:11px;color:#9CA3AF' }, r.telephone));
            row.appendChild(clientCell);
            
            // Véhicule
            var vehCell = el('td', { style: 'padding:14px' });
            vehCell.appendChild(el('strong', null, r.marque + ' ' + r.modele));
            vehCell.appendChild(el('br'));
            vehCell.appendChild(el('span', { style: 'font-size:11px;color:#9CA3AF' }, r.immatriculation));
            row.appendChild(vehCell);
            
            // Service
            row.appendChild(el('td', { style: 'padding:14px' }, r.service));
            
            // Date
            var date = new Date(r.dateArrivee);
            row.appendChild(el('td', { style: 'padding:14px' }, date.toLocaleDateString('fr-FR')));
            
            // Heure
            row.appendChild(el('td', { style: 'padding:14px' }, date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})));
            
            // Montant
            var price = BIDE.getTarif(r.service) || 0;
            row.appendChild(el('td', { style: 'padding:14px;font-weight:700;color:#0D6EFD' }, BIDE.formatMoney(price)));
            
            // Statut
            var statusColor = statusColors[r.statut] || statusColors['en_attente'];
            var statusLabel = statusLabels[r.statut] || r.statut;
            var badge = el('span', { style: statusColor + ';padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600' }, statusLabel);
            var statusCell = el('td', { style: 'padding:14px' });
            statusCell.appendChild(badge);
            row.appendChild(statusCell);
            
            // Actions
            var actionsCell = el('td', { style: 'padding:14px;text-align:right' });
            
            // Bouton Voir
            var viewBtn = el('button', {
                style: 'background:#EAF2FF;color:#0D6EFD;border:none;padding:5px 10px;border-radius:5px;font-size:11px;cursor:pointer;margin-right:4px'
            });
            viewBtn.innerHTML = '<i class="bi bi-eye"></i>';
            viewBtn.addEventListener('click', function() { viewReservation(r.id); });
            actionsCell.appendChild(viewBtn);
            
            // Bouton Prendre en charge (si en attente)
            if (r.statut === 'en_attente') {
                var takeBtn = el('button', {
                    style: 'background:#0D6EFD;color:white;border:none;padding:5px 10px;border-radius:5px;font-size:11px;cursor:pointer;margin-right:4px'
                });
                takeBtn.innerHTML = '<i class="bi bi-play-fill"></i> Prendre';
                takeBtn.addEventListener('click', function() { 
                    BIDE.takeInCharge(r.id);
                    BIDE.toast('Prise en charge !', 'info');
                    loadReservations();
                });
                actionsCell.appendChild(takeBtn);
            }
            
            // Bouton Terminer (si en cours)
            if (r.statut === 'en_cours') {
                var completeBtn = el('button', {
                    style: 'background:#16A34A;color:white;border:none;padding:5px 10px;border-radius:5px;font-size:11px;cursor:pointer;margin-right:4px'
                });
                completeBtn.innerHTML = '<i class="bi bi-check-lg"></i> Terminer';
                completeBtn.addEventListener('click', function() { 
                    BIDE.completeRequest(r.id);
                    BIDE.toast('Terminée !', 'success');
                    loadReservations();
                });
                actionsCell.appendChild(completeBtn);
            }
            
            // Bouton Supprimer
            var deleteBtn = el('button', {
                style: 'background:#FEE2E2;color:#DC2626;border:none;padding:5px 10px;border-radius:5px;font-size:11px;cursor:pointer'
            });
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
            deleteBtn.addEventListener('click', function() { confirmDeleteReservation(r.id); });
            actionsCell.appendChild(deleteBtn);
            
            row.appendChild(actionsCell);
            tbody.appendChild(row);
        });
        
        // Mettre à jour les statistiques
        var total = requests.length;
        var pending = requests.filter(function(r) { return r.statut === 'en_attente'; }).length;
        var confirmed = requests.filter(function(r) { return r.statut === 'en_cours'; }).length;
        var completed = requests.filter(function(r) { return r.statut === 'terminee'; }).length;
        updateStats(total, pending, confirmed, completed);
    }
    
    /* =====================================================
       METTRE À JOUR LES STATISTIQUES
    ===================================================== */
    function updateStats(total, pending, confirmed, completed) {
        var totalEl = document.getElementById('totalReservations');
        var pendingEl = document.getElementById('pendingReservations');
        var confirmedEl = document.getElementById('confirmedReservations');
        var cancelledEl = document.getElementById('cancelledReservations');
        
        if (totalEl) totalEl.textContent = total;
        if (pendingEl) pendingEl.textContent = pending;
        if (confirmedEl) confirmedEl.textContent = confirmed;
        if (cancelledEl) cancelledEl.textContent = completed;
    }
    
    /* =====================================================
       VOIR DÉTAILS RÉSERVATION
    ===================================================== */
    function viewReservation(reservationId) {
        var requests = BIDE.getRequests();
        var r = requests.find(function(req) { return req.id === reservationId; });
        if (!r) return;
        
        var detailsDiv = document.getElementById('reservationDetails');
        if (!detailsDiv) return;
        
        detailsDiv.innerHTML = '';
        
        var info = el('div', { style: 'font-size:14px' });
        info.appendChild(el('strong', null, 'Client : '));
        info.appendChild(document.createTextNode(r.prenom + ' ' + r.nom));
        info.appendChild(el('br'));
        info.appendChild(el('strong', null, 'Téléphone : '));
        info.appendChild(document.createTextNode(r.telephone));
        info.appendChild(el('br'));
        info.appendChild(el('strong', null, 'Véhicule : '));
        info.appendChild(document.createTextNode(r.marque + ' ' + r.modele));
        info.appendChild(el('br'));
        info.appendChild(el('strong', null, 'Immatriculation : '));
        info.appendChild(document.createTextNode(r.immatriculation));
        info.appendChild(el('br'));
        info.appendChild(el('strong', null, 'Service : '));
        info.appendChild(document.createTextNode(r.service));
        info.appendChild(el('br'));
        info.appendChild(el('strong', null, 'Statut : '));
        info.appendChild(document.createTextNode(r.statut));
        info.appendChild(el('br'));
        info.appendChild(el('strong', null, 'Date arrivée : '));
        info.appendChild(document.createTextNode(BIDE.formatDate(r.dateArrivee)));
        
        detailsDiv.appendChild(info);
        
        var modal = new bootstrap.Modal(document.getElementById('viewReservationModal'));
        modal.show();
    }
    
    /* =====================================================
       CONFIRMER SUPPRESSION RÉSERVATION
    ===================================================== */
    function confirmDeleteReservation(reservationId) {
        var refEl = document.getElementById('deleteReservationReference');
        if (refEl) refEl.textContent = reservationId;
        
        var confirmBtn = document.getElementById('confirmDeleteReservation');
        if (confirmBtn) {
            // Supprimer l'ancien listener pour éviter les doublons
            var newBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
            
            newBtn.addEventListener('click', function() {
                deleteReservation(reservationId);
                var modal = bootstrap.Modal.getInstance(document.getElementById('deleteReservationModal'));
                if (modal) modal.hide();
            });
        }
        
        var modal = new bootstrap.Modal(document.getElementById('deleteReservationModal'));
        modal.show();
    }
    
    /* =====================================================
       SUPPRIMER RÉSERVATION
    ===================================================== */
    function deleteReservation(reservationId) {
        var requests = BIDE.getRequests();
        var filtered = requests.filter(function(r) { return r.id !== reservationId; });
        
        if (filtered.length === requests.length) {
            BIDE.toast('Réservation introuvable', 'error');
            return;
        }
        
        localStorage.setItem('bide_requests', JSON.stringify(filtered));
        BIDE.toast('Réservation supprimée', 'success');
        loadReservations();
    }
    
    /* =====================================================
       CRÉER NOUVELLE RÉSERVATION
    ===================================================== */
    var newReservationForm = document.getElementById('newReservationForm');
    if (newReservationForm) {
        newReservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var clientId = document.getElementById('reservationClient').value;
            var vehicle = document.getElementById('reservationVehicle').value;
            var service = document.getElementById('reservationService').value;
            var price = document.getElementById('reservationPrice').value;
            var date = document.getElementById('reservationDate').value;
            var time = document.getElementById('reservationTime').value;
            var status = document.getElementById('reservationStatus').value;
            var notes = document.getElementById('reservationNotes').value;
            
            if (!clientId || !vehicle || !service || !date || !time) {
                BIDE.toast('Veuillez remplir tous les champs obligatoires', 'warning');
                return;
            }
            
            // Trouver les infos du client
            var clients = BIDE.getClients();
            var client = clients.find(function(c) { return c.id === clientId; });
            
            // Parser les infos du véhicule
            var vehicleParts = vehicle.split(' (');
            var vehicleName = vehicleParts[0];
            var vehiclePartsName = vehicleName.split(' ');
            var marque = vehiclePartsName[0] || '';
            var modele = vehiclePartsName.slice(1).join(' ') || '';
            var immatriculation = vehicleParts[1] ? vehicleParts[1].replace(')', '') : '';
            
            // Créer la réservation via bide.js
            var req = BIDE.registerVehicle({
                nom: client ? client.nom : '',
                prenom: client ? client.prenom : '',
                telephone: client ? client.telephone : '',
                email: client ? client.email : '',
                marque: marque,
                modele: modele,
                immatriculation: immatriculation,
                couleur: '',
                service: service
            });
            
            // Mettre à jour le statut si nécessaire
            if (status === 'confirmed') {
                BIDE.takeInCharge(req.id);
            }
            
            BIDE.toast('Réservation créée avec succès !', 'success');
            
            // Fermer la modale
            var modal = bootstrap.Modal.getInstance(document.getElementById('newReservationModal'));
            if (modal) modal.hide();
            
            // Reset du formulaire
            newReservationForm.reset();
            
            // Recharger les données
            loadReservations();
        });
    }
    
    /* =====================================================
       GESTION DU PRIX DYNAMIQUE
    ===================================================== */
    var serviceSelect = document.getElementById('reservationService');
    var priceInput = document.getElementById('reservationPrice');
    
    if (serviceSelect && priceInput) {
        serviceSelect.addEventListener('change', function() {
            var selectedOption = this.options[this.selectedIndex];
            var price = selectedOption.getAttribute('data-price') || '0';
            priceInput.value = price;
        });
    }
    
    /* =====================================================
       FILTRES ET RECHERCHE
    ===================================================== */
    var searchInput = document.getElementById('searchReservation');
    var statusFilter = document.getElementById('statusFilter');
    var dateFilter = document.getElementById('dateFilter');
    var resetBtn = document.getElementById('resetFilters');
    
    function applyFilters() {
        var requests = BIDE.getRequests();
        var tbody = document.getElementById('reservationsTableBody');
        if (!tbody) return;
        
        var searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        var statusValue = statusFilter ? statusFilter.value : 'all';
        var dateValue = dateFilter ? dateFilter.value : '';
        
        var filtered = requests.filter(function(r) {
            // Filtre recherche
            var matchesSearch = !searchTerm || 
                r.id.toLowerCase().includes(searchTerm) ||
                (r.prenom + ' ' + r.nom).toLowerCase().includes(searchTerm) ||
                (r.marque + ' ' + r.modele).toLowerCase().includes(searchTerm) ||
                r.telephone.includes(searchTerm);
            
            // Filtre statut
            var matchesStatus = statusValue === 'all' || 
                (statusValue === 'pending' && r.statut === 'en_attente') ||
                (statusValue === 'confirmed' && r.statut === 'en_cours') ||
                (statusValue === 'completed' && r.statut === 'terminee');
            
            // Filtre date
            var matchesDate = !dateValue;
            if (dateValue && r.dateArrivee) {
                var reqDate = new Date(r.dateArrivee).toISOString().split('T')[0];
                matchesDate = reqDate === dateValue;
            }
            
            return matchesSearch && matchesStatus && matchesDate;
        });
        
        // Afficher les résultats filtrés
        if (!filtered.length) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#6B7280;">Aucune réservation trouvée.</td></tr>';
            document.getElementById('emptyReservations').classList.remove('d-none');
        } else {
            document.getElementById('emptyReservations').classList.add('d-none');
            // Utiliser la même logique que loadReservations pour afficher
            // Pour simplifier, on recharge toutes les réservations filtrées
            var originalRequests = BIDE.getRequests();
            localStorage.setItem('bide_requests', JSON.stringify(filtered));
            loadReservations();
            localStorage.setItem('bide_requests', JSON.stringify(originalRequests));
        }
    }
    
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = 'all';
            if (dateFilter) dateFilter.value = '';
            loadReservations();
        });
    }
    
    /* =====================================================
       SYNCHRONISATION TEMPS RÉEL
    ===================================================== */
    BIDE.onSync(function(key) {
        if (key === 'bide_requests' || key === 'bide_clients') {
            loadReservations();
            loadClients();
            loadVehicles();
        }
    });
    
    /* =====================================================
       MENU MOBILE
    ===================================================== */
    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var sidebar = document.getElementById('sidebar');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
    
    /* =====================================================
       INITIALISATION
    ===================================================== */
    loadClients();
    loadVehicles();
    loadReservations();
    
})();