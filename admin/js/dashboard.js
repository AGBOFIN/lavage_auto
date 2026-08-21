/* =====================================================
   BIDE Admin Dashboard — Dynamic Logic
   ===================================================== */

(function() {

    /* --- Mobile menu toggle --- */
    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var sidebar = document.getElementById('sidebar');
    var sidebarOverlay = document.getElementById('sidebarOverlay');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            if (sidebarOverlay) sidebarOverlay.classList.toggle('show');
        });
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('show');
            sidebarOverlay.classList.remove('show');
        });
    }

    /* --- Helper: build element with attributes and text --- */
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
        if (text) e.textContent = text;
        return e;
    }

    /* =====================================================
       STATISTIQUES DYNAMIQUES
    ===================================================== */
    function refreshStats() {
        var requests = BIDE.getRequests();
        var clients = BIDE.getClients();
        var invoices = BIDE.getInvoices();
        var totalRevenue = invoices
            .filter(function(i){ return i.statut === 'payee'; })
            .reduce(function(s,i){ return s + i.total; }, 0);

        var statsCards = document.querySelectorAll('.stat-card h2');
        if (statsCards.length >= 4) {
            statsCards[0].textContent = clients.length;
            statsCards[1].textContent = requests.length;
            statsCards[2].textContent = BIDE.formatMoney(totalRevenue);
            statsCards[3].textContent = requests.filter(function(r){ return r.statut === 'terminee'; }).length;
        }
    }


    /* =====================================================
       ARRIVEES DE VEHICULES
    ===================================================== */
    function refreshArrivals() {
        var requests = BIDE.getRequests();
        var container = document.getElementById('adminArrivals');
        if (!container) return;

        if (!requests.length) {
            container.innerHTML = '<p style="text-align:center;color:#6B7280;padding:40px">Aucune arrivée</p>';
            return;
        }

        var statusColors = { en_attente: '#FEF3C7', en_cours: '#DBEAFE', terminee: '#DCFCE7' };
        var statusFg = { en_attente: '#92400E', en_cours: '#1D4ED8', terminee: '#166534' };
        var statusLabels = { en_attente: 'En attente', en_cours: 'En cours', terminee: 'Terminée' };

        var table = el('table', { style: 'width:100%;font-size:13px;border-collapse:collapse' });
        var thead = el('thead');
        var headRow = el('tr');
        ['ID', 'CLIENT', 'VÉHICULE', 'SERVICE', 'STATUT', 'ACTION'].forEach(function(h) {
            headRow.appendChild(el('th', { style: 'padding:12px;border-bottom:1px solid #E5E7EB;font-size:11px;color:#6B7280;text-transform:uppercase;text-align:left' }, h));
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        var tbody = el('tbody');
        requests.slice(0, 15).forEach(function(r) {
            var bg = statusColors[r.statut] || '#F3F4F6';
            var fg = statusFg[r.statut] || '#6B7280';
            var lbl = statusLabels[r.statut] || r.statut;

            var row = el('tr', { style: 'border-bottom:1px solid #F3F4F6' });

            row.appendChild(el('td', { style: 'padding:12px;font-weight:700;font-size:12px' }, r.id));

            var clientCell = el('td', { style: 'padding:12px' });
            clientCell.appendChild(el('strong', null, r.prenom + ' ' + r.nom));
            clientCell.appendChild(el('br'));
            var clientSub = el('span', { style: 'font-size:11px;color:#9CA3AF' }, r.telephone);
            clientCell.appendChild(clientSub);
            row.appendChild(clientCell);

            var vehCell = el('td', { style: 'padding:12px' });
            vehCell.appendChild(el('strong', null, r.marque + ' ' + r.modele));
            vehCell.appendChild(el('br'));
            var vehSub = el('span', { style: 'font-size:11px;color:#9CA3AF' }, r.immatriculation + ' | ' + r.couleur);
            vehCell.appendChild(vehSub);
            row.appendChild(vehCell);

            row.appendChild(el('td', { style: 'padding:12px;font-size:12px' }, r.service));

            var badge = el('span', { style: 'background:' + bg + ';color:' + fg + ';padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600' }, lbl);
            var badgeCell = el('td', { style: 'padding:12px' });
            badgeCell.appendChild(badge);
            row.appendChild(badgeCell);

            var actionCell = el('td', { style: 'padding:12px' });
            if (r.statut === 'en_attente') {
                var btn = el('button', {
                    'data-action': 'take',
                    'data-id': r.id,
                    style: 'background:#0D6EFD;color:white;border:none;padding:5px 12px;border-radius:5px;font-size:11px;cursor:pointer;font-weight:600'
                }, 'Prendre en charge');
                actionCell.appendChild(btn);
            } else if (r.statut === 'en_cours') {
                var btn2 = el('button', {
                    'data-action': 'complete',
                    'data-id': r.id,
                    style: 'background:#16A34A;color:white;border:none;padding:5px 12px;border-radius:5px;font-size:11px;cursor:pointer;font-weight:600'
                }, 'Terminer');
                actionCell.appendChild(btn2);
            } else {
                actionCell.appendChild(el('span', { style: 'color:#16A34A;font-size:11px;font-weight:600' }, '\u2713 OK'));
            }
            row.appendChild(actionCell);

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        container.innerHTML = '';
        container.appendChild(table);
    }


    /* =====================================================
       LISTE DES CLIENTS
    ===================================================== */
    function refreshClients() {
        var clients = BIDE.getClients();
        var container = document.getElementById('adminClients');
        if (!container) return;

        if (!clients.length) {
            container.innerHTML = '<p style="text-align:center;color:#6B7280;padding:40px">Aucun client</p>';
            return;
        }

        container.innerHTML = '';
        clients.forEach(function(c) {
            var initials = ((c.prenom ? c.prenom.charAt(0) : '') + (c.nom ? c.nom.charAt(0) : '')).toUpperCase();
            var item = el('div', { style: 'display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid #F3F4F6' });
            var avatar = el('div', { style: 'width:36px;height:36px;border-radius:50%;background:#EAF2FF;color:#0D6EFD;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0' }, initials);
            item.appendChild(avatar);
            var info = el('div', { style: 'min-width:0;flex:1' });
            info.appendChild(el('strong', { style: 'font-size:13px' }, c.prenom + ' ' + c.nom));
            info.appendChild(el('div', { style: 'font-size:11px;color:#9CA3AF' }, c.telephone));
            item.appendChild(info);
            item.appendChild(el('span', { style: 'font-size:10px;color:#9CA3AF' }, (c.nbVehicules || 1) + ' véhicule(s)'));
            container.appendChild(item);
        });
    }


    /* =====================================================
       SELECTEUR DE FACTURE
    ===================================================== */
    function refreshInvoiceSelect() {
        var requests = BIDE.getRequests();
        var select = document.getElementById('invoiceRequest');
        if (!select) return;
        var current = select.value;
        select.innerHTML = '<option value="">Sélectionner une demande...</option>';
        requests.forEach(function(r) {
            var opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = r.id + ' — ' + r.prenom + ' ' + r.nom + ' (' + r.marque + ' ' + r.modele + ')';
            select.appendChild(opt);
        });
        if (current) select.value = current;
    }


    /* =====================================================
       GENERATION DE FACTURE
    ===================================================== */
    var genBtn = document.getElementById('generateInvoiceBtn');
    if (genBtn) genBtn.addEventListener('click', function() {
        var reqId = document.getElementById('invoiceRequest').value;
        if (!reqId) {
            BIDE.toast('Sélectionnez une demande', 'warning');
            return;
        }
        var serviceStr = document.getElementById('invoiceService').value;
        var parts = serviceStr.split(' — ');
        var serviceName = parts[0];
        var price = parseInt(parts[1].replace(/\s/g, ''));

        var invoice = BIDE.generateInvoice(reqId, {
            prestations: [{ nom: serviceName, prix: price }],
            notes: document.getElementById('invoiceNotes').value
        });

        if (!invoice) {
            BIDE.toast('Erreur: demande introuvable', 'error');
            return;
        }

        var resultDiv = document.getElementById('invoiceResult');

        var box = el('div', { style: 'background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:20px;margin-top:15px' });

        var header = el('div', { style: 'display:flex;align-items:center;gap:10px;margin-bottom:12px' });
        var icon = el('i', { className: 'bi bi-check-circle-fill', style: 'color:#16A34A;font-size:20px' });
        header.appendChild(icon);
        header.appendChild(el('strong', { style: 'color:#166534' }, 'Facture générée avec succès !'));
        box.appendChild(header);

        var grid = el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px' });

        var items = [
            ['Référence:', invoice.id],
            ['Client:', invoice.prenom + ' ' + invoice.nom],
            ['Véhicule:', invoice.marque + ' ' + invoice.modele + ' (' + invoice.immatriculation + ')'],
            ['Prestation:', serviceName]
        ];
        items.forEach(function(pair) {
            var d = el('div');
            d.appendChild(el('span', { style: 'color:#6B7280' }, pair[0] + ' '));
            d.appendChild(el('strong', null, pair[1]));
            grid.appendChild(d);
        });

        var totalDiv = el('div', { style: 'grid-column:1/-1;padding-top:10px;border-top:1px solid #BBF7D0' });
        totalDiv.appendChild(el('span', { style: 'color:#6B7280' }, 'Total: '));
        totalDiv.appendChild(el('strong', { style: 'color:#16A34A;font-size:18px' }, BIDE.formatMoney(invoice.total)));
        grid.appendChild(totalDiv);
        box.appendChild(grid);

        box.appendChild(el('p', { style: 'font-size:11px;color:#6B7280;margin:10px 0 0' }, 'Cette facture est visible côté client dans "Mes factures".'));

        resultDiv.innerHTML = '';
        resultDiv.appendChild(box);

        BIDE.toast('Facture ' + invoice.id + ' créée !', 'success');
        document.getElementById('invoiceNotes').value = '';
        refreshArrivals();
    });


    /* =====================================================
       SYNC TEMPS REEL
    ===================================================== */
    BIDE.onSync(function(key) {
        if (key === 'bide_requests' || key === 'bide_clients') {
            refreshStats();
            refreshArrivals();
            refreshClients();
            refreshInvoiceSelect();
        }
    });


    /* =====================================================
       EVENT DELEGATION (boutons Prendre en charge / Terminer)
    ===================================================== */
    var arrivalsEl = document.getElementById('adminArrivals');
    if (arrivalsEl) arrivalsEl.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-action]');
        if (!btn) return;
        var action = btn.getAttribute('data-action');
        var id = btn.getAttribute('data-id');
        if (action === 'take') {
            BIDE.takeInCharge(id);
            BIDE.toast('Prise en charge !', 'info');
        } else if (action === 'complete') {
            BIDE.completeRequest(id);
            BIDE.toast('Terminée !', 'success');
        }
        refreshArrivals();
        refreshStats();
        refreshInvoiceSelect();
    });


    /* =====================================================
       INIT
    ===================================================== */
    refreshStats();
    refreshArrivals();
    refreshClients();
    refreshInvoiceSelect();

})();
