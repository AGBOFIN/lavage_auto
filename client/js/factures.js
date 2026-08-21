/**
 * BIDE Client — Factures & Paiement Module
 * All DOM manipulation uses createElement instead of inline HTML templates
 */
(function() {

    var _currentPayInvoiceId = null;

    /* Helper */
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
       LOAD INVOICES
    ===================================================== */
    window.loadInvoices = function() {
        var session = BIDE.getSession();
        if (!session) return;

        var invoices = BIDE.getInvoices().filter(function(inv) {
            return inv.email === session.email || inv.telephone === session.telephone || inv.clientId === session.clientId;
        });

        var tbody = document.querySelector('#invoiceTable tbody');
        if (!tbody) return;

        if (!invoices.length) {
            tbody.innerHTML = '';
            var emptyRow = el('tr');
            var emptyCell = el('td', { colspan: '7', style: 'text-align:center;padding:40px;color:#6B7280' });
            emptyCell.innerHTML = 'Aucune facture pour le moment.<br>Enregistrez un vehicle depuis le tableau de bord.';
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
            return;
        }

        tbody.innerHTML = '';

        invoices.forEach(function(inv) {
            var isPaid = inv.statut === 'payee';
            var statutColor = isPaid ? 'background:#DCFCE7;color:#166534' : 'background:#FEF3C7;color:#92400E';
            var statutLabel = isPaid ? 'Payee' : 'En attente';
            var paiementInfo = inv.modePaiement ? ' (' + inv.modePaiement + ')' : '';

            var row = el('tr', { style: 'border-bottom:1px solid #F3F4F6' });

            // ID
            row.appendChild(el('td', { style: 'padding:14px' }, inv.id));

            // Date
            row.appendChild(el('td', { style: 'padding:14px' }, BIDE.formatDate(inv.dateFacture)));

            // Vehicule
            var vehCell = el('td', { style: 'padding:14px' });
            vehCell.appendChild(el('strong', null, inv.marque + ' ' + inv.modele));
            vehCell.appendChild(el('br'));
            vehCell.appendChild(el('span', { style: 'font-size:11px;color:#9CA3AF' }, inv.immatriculation));
            row.appendChild(vehCell);

            // Prestation
            var prestNames = inv.prestations.map(function(p) { return p.nom; }).join(', ');
            row.appendChild(el('td', { style: 'padding:14px' }, prestNames));

            // Montant
            row.appendChild(el('td', { style: 'padding:14px;font-weight:700;color:#0D6EFD' }, BIDE.formatMoney(inv.total)));

            // Statut
            var badge = el('span', { style: statutColor + ';padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600' }, statutLabel + paiementInfo);
            var badgeCell = el('td', { style: 'padding:14px' });
            badgeCell.appendChild(badge);
            row.appendChild(badgeCell);

            // Actions
            var actionsCell = el('td', { style: 'padding:14px' });

            var viewBtn = el('button', {
                style: 'background:#EAF2FF;color:#0D6EFD;border:none;padding:5px 10px;border-radius:5px;font-size:11px;cursor:pointer;margin-right:4px'
            });
            viewBtn.innerHTML = '<i class="bi bi-eye"></i>';
            viewBtn.addEventListener('click', function() { voirFacture(inv.id); });
            actionsCell.appendChild(viewBtn);

            if (!isPaid) {
                var payBtn = el('button', {
                    style: 'background:#16A34A;color:white;border:none;padding:5px 10px;border-radius:5px;font-size:11px;cursor:pointer'
                });
                payBtn.innerHTML = '<i class="bi bi-credit-card"></i> Payer';
                payBtn.addEventListener('click', function() { ouvrirPaiement(inv.id); });
                actionsCell.appendChild(payBtn);
            }

            row.appendChild(actionsCell);
            tbody.appendChild(row);
        });

        // Update stat cards
        var statsH3 = document.querySelectorAll('h3');
        var statH3Arr = [];
        for (var j = 0; j < statsH3.length; j++) {
            var p = statsH3[j].parentElement ? statsH3[j].parentElement.querySelector('p') : null;
            if (p && (p.textContent.indexOf('Total des factures') >= 0 || p.textContent.indexOf('payées') >= 0 || p.textContent.indexOf('attente') >= 0)) {
                statH3Arr.push(statsH3[j]);
            }
        }
        if (statH3Arr.length >= 3) {
            statH3Arr[0].textContent = invoices.length;
            statH3Arr[1].textContent = invoices.filter(function(i){return i.statut==='payee'}).length;
            statH3Arr[2].textContent = invoices.filter(function(i){return i.statut!=='payee'}).length;
        }
    };


    /* =====================================================
       VOIR FACTURE (DETAILED MODAL)
    ===================================================== */
    window.voirFacture = function(invoiceId) {
        var invoices = BIDE.getInvoices();
        var inv = invoices.find(function(i) { return i.id === invoiceId; });
        if (!inv) return;

        var modalBody = document.querySelector('#invoiceModal .modal-body');
        if (!modalBody) return;

        modalBody.innerHTML = '';

        // Header
        var header = el('div', { className: 'invoice-details-header', style: 'display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:15px' });
        var left = el('div');
        left.appendChild(el('img', { src: '../images/bide-wash-logo-no-bg.png', alt: 'BIDE', style: 'height:40px' }));
        left.appendChild(el('p', { style: 'font-size:12px;color:#6B7280' }, 'Lavage Automobile Professionnel'));
        header.appendChild(left);

        var right = el('div', { style: 'text-align:right' });
        right.appendChild(el('p', { style: 'font-size:14px;font-weight:700' }, inv.id));
        right.appendChild(el('p', { style: 'font-size:12px;color:#6B7280' }, BIDE.formatDate(inv.dateFacture)));
        var isPaid = inv.statut === 'payee';
        var badge = el('span', {
            style: (isPaid ? 'background:#DCFCE7;color:#166534' : 'background:#FEF3C7;color:#92400E') + ';padding:4px 12px;border-radius:12px;font-size:11px;font-weight:600'
        }, isPaid ? 'Payee' : 'En attente');
        right.appendChild(badge);
        header.appendChild(right);
        modalBody.appendChild(header);

        modalBody.appendChild(el('hr'));

        // Client + Vehicle info
        var infoRow = el('div', { className: 'row', style: 'font-size:13px' });

        var clientCol = el('div', { className: 'col-6' });
        clientCol.appendChild(el('strong', null, 'Client:'));
        clientCol.appendChild(el('br'));
        clientCol.appendChild(document.createTextNode(inv.prenom + ' ' + inv.nom));
        clientCol.appendChild(el('br'));
        clientCol.appendChild(document.createTextNode(inv.telephone));
        infoRow.appendChild(clientCol);

        var vehCol = el('div', { className: 'col-6' });
        vehCol.appendChild(el('strong', null, 'Vehicule:'));
        vehCol.appendChild(el('br'));
        vehCol.appendChild(document.createTextNode(inv.marque + ' ' + inv.modele));
        vehCol.appendChild(el('br'));
        vehCol.appendChild(document.createTextNode(inv.immatriculation + ' - ' + inv.couleur));
        infoRow.appendChild(vehCol);

        modalBody.appendChild(infoRow);
        modalBody.appendChild(el('hr'));

        // Prestations table
        var table = el('table', { className: 'table', style: 'font-size:13px;margin:0' });
        var thead = el('thead');
        var headRow = el('tr');
        headRow.appendChild(el('th', null, 'Prestation'));
        headRow.appendChild(el('th', { style: 'text-align:right' }, 'Prix'));
        thead.appendChild(headRow);
        table.appendChild(thead);

        var tbody = el('tbody');
        inv.prestations.forEach(function(p) {
            var row = el('tr');
            row.appendChild(el('td', null, p.nom));
            var priceCell = el('td', { style: 'text-align:right;font-weight:700' }, BIDE.formatMoney(p.prix));
            row.appendChild(priceCell);
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        var tfoot = el('tfoot');
        var footRow = el('tr', { style: 'border-top:2px solid #E5E7EB' });
        footRow.appendChild(el('td', null, 'TOTAL'));
        var totalCell = el('td', { style: 'text-align:right' });
        totalCell.appendChild(el('strong', { style: 'color:#0D6EFD;font-size:18px' }, BIDE.formatMoney(inv.total)));
        footRow.appendChild(totalCell);
        tfoot.appendChild(footRow);
        table.appendChild(tfoot);
        modalBody.appendChild(table);

        if (inv.modePaiement) {
            modalBody.appendChild(el('p', { style: 'font-size:12px;color:#6B7280;margin-top:15px' },
                'Paye par ' + inv.modePaiement + ' le ' + BIDE.formatDate(inv.datePaiement)));
        }

        var modal = new bootstrap.Modal(document.getElementById('invoiceModal'));
        modal.show();
    };


    /* =====================================================
       MODULE DE PAIEMENT
    ===================================================== */
    window.ouvrirPaiement = function(invoiceId) {
        _currentPayInvoiceId = invoiceId;
        var invoices = BIDE.getInvoices();
        var inv = invoices.find(function(i) { return i.id === invoiceId; });
        if (!inv) return;

        // Create payment modal if not exists
        var pm = document.getElementById('paymentModal');
        if (!pm) {
            pm = el('div', { id: 'paymentModal', className: 'modal fade', tabindex: '-1' });
            var dialog = el('div', { className: 'modal-dialog modal-dialog-centered' });
            var content = el('div', { className: 'modal-content', style: 'border-radius:12px;border:none' });

            var header = el('div', { className: 'modal-header', style: 'border-bottom:1px solid #E5E7EB;padding:20px 24px' });
            var headerTitle = el('h5', { style: 'font-weight:700;margin:0' });
            headerTitle.innerHTML = '<i class="bi bi-credit-card" style="color:#0D6EFD"></i> Paiement';
            header.appendChild(headerTitle);
            var closeBtn = el('button', { className: 'btn-close', 'data-bs-dismiss': 'modal' });
            header.appendChild(closeBtn);
            content.appendChild(header);

            var body = el('div', { className: 'modal-body', style: 'padding:24px' });
            body.appendChild(el('div', { id: 'paymentContent' }));
            content.appendChild(body);

            dialog.appendChild(content);
            pm.appendChild(dialog);
            document.body.appendChild(pm);
        }

        var pc = document.getElementById('paymentContent');
        pc.innerHTML = '';

        // Amount display
        var amountDiv = el('div', { style: 'text-align:center;margin-bottom:20px' });
        amountDiv.appendChild(el('div', { style: 'font-size:14px;color:#6B7280' }, 'Montant a payer'));
        amountDiv.appendChild(el('div', { style: 'font-size:28px;font-weight:800;color:#0D6EFD' }, BIDE.formatMoney(inv.total)));
        amountDiv.appendChild(el('div', { style: 'font-size:12px;color:#9CA3AF' }, 'Facture ' + inv.id));
        pc.appendChild(amountDiv);

        // Online section
        var onlineTitle = el('div', { style: 'font-weight:700;font-size:13px;margin-bottom:10px' }, 'En ligne');
        pc.appendChild(onlineTitle);

        var onlineGrid = el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px' });

        var mmBtn = el('button', { style: 'border:2px solid #E5E7EB;border-radius:10px;padding:15px;background:white;cursor:pointer;text-align:center' });
        mmBtn.innerHTML = '<i class="bi bi-phone" style="font-size:24px;color:#0D6EFD;display:block;margin-bottom:5px"></i>' +
            '<strong style="font-size:12px">Mobile Money</strong><br>' +
            '<span style="font-size:10px;color:#9CA3AF">Mixx/YAS, Flooz, T-Money</span>';
        mmBtn.addEventListener('click', function() { payer('mobile_money', 'Mobile Money'); });
        onlineGrid.appendChild(mmBtn);

        var cbBtn = el('button', { style: 'border:2px solid #E5E7EB;border-radius:10px;padding:15px;background:white;cursor:pointer;text-align:center' });
        cbBtn.innerHTML = '<i class="bi bi-credit-card" style="font-size:24px;color:#0D6EFD;display:block;margin-bottom:5px"></i>' +
            '<strong style="font-size:12px">Carte Bancaire</strong><br>' +
            '<span style="font-size:10px;color:#9CA3AF">Visa / Mastercard</span>';
        cbBtn.addEventListener('click', function() { payer('carte_bancaire', 'Carte Bancaire'); });
        onlineGrid.appendChild(cbBtn);

        pc.appendChild(onlineGrid);

        // Cash section
        var cashTitle = el('div', { style: 'font-weight:700;font-size:13px;margin-bottom:10px' }, 'Sur place');
        pc.appendChild(cashTitle);

        var cashBtn = el('button', {
            style: 'width:100%;border:2px solid #E5E7EB;border-radius:10px;padding:15px;background:white;cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px'
        });
        cashBtn.innerHTML = '<i class="bi bi-cash" style="font-size:24px;color:#16A34A"></i>' +
            '<div><strong style="font-size:12px">Especes</strong><br>' +
            '<span style="font-size:10px;color:#9CA3AF">Paiement cash au guichet</span></div>';
        cashBtn.addEventListener('click', function() { payer('especes', 'Especes'); });
        pc.appendChild(cashBtn);

        var modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        modal.show();
    };


    window.payer = function(mode, label) {
        if (!_currentPayInvoiceId) return;
        BIDE.payInvoice(_currentPayInvoiceId, mode);
        BIDE.toast('Paiement par ' + label + ' confirme !', 'success');

        // Close payment modal
        var pm = document.getElementById('paymentModal');
        if (pm) {
            var bsModal = bootstrap.Modal.getInstance(pm);
            if (bsModal) bsModal.hide();
        }

        loadInvoices();
    };


    /* =====================================================
       DECONNEXION
    ===================================================== */
    window.deconnexion = function() {
        BIDE.clearSession();
        window.location.href = 'deconnexion.html';
    };


    /* =====================================================
       SYNC TEMPS REEL
    ===================================================== */
    BIDE.onSync(function(key) {
        if (key === 'bide_invoices') loadInvoices();
    });


    /* =====================================================
       INIT
    ===================================================== */
    loadInvoices();

})();
