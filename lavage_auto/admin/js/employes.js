/**
 * =====================================================
 * BIDE Admin — Employés Management (CRUD complet)
 * =====================================================
 */

(function () {

    /* =====================================================
       HELPERS
    ===================================================== */

    function generateId() {
        return 'EMP' + Math.floor(1000 + Math.random() * 9000);
    }

    function getEmployees() {
        try {
            return JSON.parse(localStorage.getItem('bide_employees')) || [];
        } catch (e) {
            return [];
        }
    }

    function saveEmployees(arr) {
        localStorage.setItem('bide_employees', JSON.stringify(arr));
    }

    function formatDate(iso) {
        if (!iso) return '—';
        var d = new Date(iso);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function getInitials(prenom, nom) {
        return ((prenom ? prenom.charAt(0) : '') + (nom ? nom.charAt(0) : '')).toUpperCase();
    }

    function escHtml(s) {
        var d = document.createElement('div');
        d.textContent = s || '';
        return d.innerHTML;
    }

    var roleLabels = {
        admin: 'Administrateur',
        manager: 'Manager',
        agent: 'Agent',
        lavage: 'Agent de lavage',
        caissier: 'Caissier'
    };

    var roleClasses = {
        admin: 'role-admin',
        manager: 'role-manager',
        agent: 'role-agent',
        lavage: 'role-lavage',
        caissier: 'role-caissier'
    };


    /* =====================================================
       SEED DATA
    ===================================================== */

    function seedEmployees() {
        var emps = getEmployees();
        if (emps.length > 0) return;

        var seed = [
            { id: 'EMP001', prenom: 'Kossi', nom: 'Agbeko', telephone: '+228 90 11 22 33', email: 'kossi@bide.com', role: 'admin', statut: 'active', hireDate: '2024-01-15', salary: 250000, address: 'Lomé, Togo', notes: 'Super administrateur' },
            { id: 'EMP002', prenom: 'Mariama', nom: 'Fofana', telephone: '+228 91 22 33 44', email: 'mariama@bide.com', role: 'manager', statut: 'active', hireDate: '2024-03-10', salary: 180000, address: 'Lomé, Togo', notes: '' },
            { id: 'EMP003', prenom: 'Kofi', nom: 'Amoussou', telephone: '+228 92 33 44 55', email: 'kofi@bide.com', role: 'agent', statut: 'active', hireDate: '2024-06-20', salary: 120000, address: 'Lomé, Togo', notes: '' },
            { id: 'EMP004', prenom: 'Sena', nom: 'Dodzi', telephone: '+228 93 44 55 66', email: 'sena@bide.com', role: 'lavage', statut: 'active', hireDate: '2025-01-05', salary: 95000, address: 'Lomé, Togo', notes: '' },
            { id: 'EMP005', prenom: 'Ablavi', nom: 'Koffi', telephone: '+228 94 55 66 77', email: 'ablavi@bide.com', role: 'caissier', statut: 'inactive', hireDate: '2025-04-12', salary: 100000, address: 'Lomé, Togo', notes: 'En congé' }
        ];

        saveEmployees(seed);
    }


    /* =====================================================
       VARIABLES
    ===================================================== */

    var deleteEmpId = null;
    var tbody = document.getElementById('employeesTableBody');
    var emptyState = document.getElementById('emptyState');

    var newEmployeeBtn = document.getElementById('newEmployeeBtn');
    var employeeForm = document.getElementById('employeeForm');
    var searchInput = document.getElementById('searchInput');
    var roleFilter = document.getElementById('roleFilter');
    var statusFilter = document.getElementById('statusFilter');
    var resetBtn = document.getElementById('resetFiltersBtn');

    var empModal, detailsModal;

    function getEmpModal() {
        if (!empModal) empModal = new bootstrap.Modal(document.getElementById('employeeModal'));
        return empModal;
    }

    function getDetailsModal() {
        if (!detailsModal) detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
        return detailsModal;
    }


    /* =====================================================
       RENDER TABLE
    ===================================================== */

    function renderTable() {
        var employees = getFiltered();
        tbody.innerHTML = '';

        if (employees.length === 0) {
            emptyState.classList.remove('d-none');
            return;
        }

        emptyState.classList.add('d-none');

        employees.forEach(function (emp) {
            var row = document.createElement('tr');
            row.innerHTML =
                /* Employé */
                '<td><div class="employee-cell">' +
                    '<div class="employee-avatar">' + getInitials(emp.prenom, emp.nom) + '</div>' +
                    '<div><span class="employee-name">' + escHtml(emp.prenom + ' ' + emp.nom) + '</span>' +
                    '<span class="employee-email">' + escHtml(emp.email || '') + '</span></div>' +
                '</div></td>' +

                /* Téléphone */
                '<td>' + escHtml(emp.telephone) + '</td>' +

                /* Rôle */
                '<td><span class="badge-custom ' + (roleClasses[emp.role] || '') + '">' + (roleLabels[emp.role] || emp.role) + '</span></td>' +

                /* Embauche */
                '<td>' + formatDate(emp.hireDate) + '</td>' +

                /* Statut */
                '<td><span class="badge-custom ' + (emp.statut === 'active' ? 'status-active' : 'status-inactive') + '">' +
                    (emp.statut === 'active' ? 'Actif' : 'Inactif') + '</span></td>' +

                /* Actions */
                '<td><div class="actions">' +
                    '<button class="action-btn action-view" data-id="' + emp.id + '" title="Voir"><i class="bi bi-eye"></i></button>' +
                    '<button class="action-btn action-edit" data-id="' + emp.id + '" title="Modifier"><i class="bi bi-pencil"></i></button>' +
                    '<button class="action-btn action-delete" data-id="' + emp.id + '" title="Supprimer"><i class="bi bi-trash"></i></button>' +
                '</div></td>';

            tbody.appendChild(row);
        });

        updateStats();
    }


    /* =====================================================
       GET FILTERED
    ===================================================== */

    function getFiltered() {
        var emps = getEmployees();
        var search = searchInput ? searchInput.value.toLowerCase().trim() : '';
        var role = roleFilter ? roleFilter.value : 'all';
        var status = statusFilter ? statusFilter.value : 'all';

        return emps.filter(function (e) {
            var matchSearch = !search ||
                ((e.prenom + ' ' + e.nom).toLowerCase().includes(search)) ||
                (e.telephone || '').includes(search) ||
                (e.email || '').toLowerCase().includes(search);

            var matchRole = role === 'all' || e.role === role;
            var matchStatus = status === 'all' || e.statut === status;

            return matchSearch && matchRole && matchStatus;
        });
    }


    /* =====================================================
       UPDATE STATS
    ===================================================== */

    function updateStats() {
        var emps = getEmployees();
        var total = emps.length;
        var active = emps.filter(function (e) { return e.statut === 'active'; }).length;
        var inactive = total - active;
        var admins = emps.filter(function (e) { return e.role === 'admin'; }).length;

        var totalEl = document.getElementById('totalEmployees');
        var activeEl = document.getElementById('activeEmployees');
        var inactiveEl = document.getElementById('inactiveEmployees');
        var adminEl = document.getElementById('adminEmployees');

        if (totalEl) totalEl.textContent = total;
        if (activeEl) activeEl.textContent = active;
        if (inactiveEl) inactiveEl.textContent = inactive;
        if (adminEl) adminEl.textContent = admins;
    }


    /* =====================================================
       VIEW EMPLOYEE
    ===================================================== */

    function viewEmployee(id) {
        var emps = getEmployees();
        var emp = emps.find(function (e) { return e.id === id; });
        if (!emp) return;

        var html = '<div class="detail-grid">' +
            '<div class="detail-item"><span class="detail-label">Prénom</span><span class="detail-value">' + escHtml(emp.prenom) + '</span></div>' +
            '<div class="detail-item"><span class="detail-label">Nom</span><span class="detail-value">' + escHtml(emp.nom) + '</span></div>' +
            '<div class="detail-item"><span class="detail-label">Téléphone</span><span class="detail-value">' + escHtml(emp.telephone) + '</span></div>' +
            '<div class="detail-item"><span class="detail-label">Email</span><span class="detail-value">' + escHtml(emp.email || '—') + '</span></div>' +
            '<div class="detail-item"><span class="detail-label">Rôle</span><span class="detail-value"><span class="badge-custom ' + (roleClasses[emp.role] || '') + '">' + (roleLabels[emp.role] || emp.role) + '</span></span></div>' +
            '<div class="detail-item"><span class="detail-label">Statut</span><span class="detail-value"><span class="badge-custom ' + (emp.statut === 'active' ? 'status-active' : 'status-inactive') + '">' + (emp.statut === 'active' ? 'Actif' : 'Inactif') + '</span></span></div>' +
            '<div class="detail-item"><span class="detail-label">Date d\'embauche</span><span class="detail-value">' + formatDate(emp.hireDate) + '</span></div>' +
            '<div class="detail-item"><span class="detail-label">Salaire</span><span class="detail-value">' + (emp.salary ? Number(emp.salary).toLocaleString('fr-FR') + ' FCFA' : '—') + '</span></div>' +
            '<div class="detail-item full"><span class="detail-label">Adresse</span><span class="detail-value">' + escHtml(emp.address || '—') + '</span></div>' +
            '<div class="detail-item full"><span class="detail-label">Notes</span><span class="detail-value">' + escHtml(emp.notes || '—') + '</span></div>' +
            '</div>';

        document.getElementById('detailsContent').innerHTML = html;
        getDetailsModal().show();
    }


    /* =====================================================
       EDIT EMPLOYEE
    ===================================================== */

    function editEmployee(id) {
        var emps = getEmployees();
        var emp = emps.find(function (e) { return e.id === id; });
        if (!emp) return;

        document.getElementById('employeeId').value = emp.id;
        document.getElementById('firstName').value = emp.prenom || '';
        document.getElementById('lastName').value = emp.nom || '';
        document.getElementById('phone').value = emp.telephone || '';
        document.getElementById('email').value = emp.email || '';
        document.getElementById('role').value = emp.role || '';
        document.getElementById('status').value = emp.statut || 'active';
        document.getElementById('hireDate').value = emp.hireDate || '';
        document.getElementById('salary').value = emp.salary || '';
        document.getElementById('address').value = emp.address || '';
        document.getElementById('notes').value = emp.notes || '';
        document.getElementById('modalTitle').textContent = 'Modifier l\'employé';

        getEmpModal().show();
    }


    /* =====================================================
       DELETE EMPLOYEE
    ===================================================== */

    function deleteEmployee(id) {
        var emps = getEmployees();
        var emp = emps.find(function (e) { return e.id === id; });
        if (!emp) return;

        if (!confirm('Supprimer l\'employé ' + emp.prenom + ' ' + emp.nom + ' ?')) return;

        emps = emps.filter(function (e) { return e.id !== id; });
        saveEmployees(emps);
        renderTable();
        showToast('Employé supprimé.', 'success');
    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(msg, type) {
        type = type || 'success';
        var t = document.createElement('div');
        t.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;padding:14px 22px;border-radius:10px;color:white;font-weight:700;font-size:14px;box-shadow:0 4px 15px rgba(0,0,0,0.2);font-family:system-ui;display:flex;align-items:center;gap:10px;transition:opacity 0.3s;';
        var colors = { success: '#198754', info: '#0d6efd', warning: '#fd7e14', error: '#dc3545' };
        t.style.background = colors[type] || colors.success;
        t.innerHTML = '<i class="bi bi-check-circle-fill"></i> ' + msg;
        document.body.appendChild(t);
        setTimeout(function () { t.style.opacity = '0'; }, 2500);
        setTimeout(function () { t.remove(); }, 3000);
    }


    /* =====================================================
       EVENTS
    ===================================================== */

    /* New Employee */
    if (newEmployeeBtn) {
        newEmployeeBtn.addEventListener('click', function () {
            employeeForm.reset();
            document.getElementById('employeeId').value = '';
            document.getElementById('modalTitle').textContent = 'Nouvel employé';
            getEmpModal().show();
        });
    }

    /* Save Employee */
    if (employeeForm) {
        employeeForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var id = document.getElementById('employeeId').value;
            var prenom = document.getElementById('firstName').value.trim();
            var nom = document.getElementById('lastName').value.trim();
            var telephone = document.getElementById('phone').value.trim();
            var email = document.getElementById('email').value.trim();
            var role = document.getElementById('role').value;
            var statut = document.getElementById('status').value;
            var hireDate = document.getElementById('hireDate').value;
            var salary = document.getElementById('salary').value;
            var address = document.getElementById('address').value.trim();
            var notes = document.getElementById('notes').value.trim();

            if (!prenom || !nom || !telephone || !role || !hireDate) {
                showToast('Veuillez remplir les champs obligatoires.', 'warning');
                return;
            }

            var emps = getEmployees();

            if (id) {
                /* Edit */
                var emp = emps.find(function (e) { return e.id === id; });
                if (emp) {
                    emp.prenom = prenom;
                    emp.nom = nom;
                    emp.telephone = telephone;
                    emp.email = email;
                    emp.role = role;
                    emp.statut = statut;
                    emp.hireDate = hireDate;
                    emp.salary = salary ? parseInt(salary) : 0;
                    emp.address = address;
                    emp.notes = notes;
                }
                showToast('Employé mis à jour !', 'success');
            } else {
                /* Add */
                emps.unshift({
                    id: generateId(),
                    prenom: prenom,
                    nom: nom,
                    telephone: telephone,
                    email: email,
                    role: role,
                    statut: statut,
                    hireDate: hireDate,
                    salary: salary ? parseInt(salary) : 0,
                    address: address,
                    notes: notes
                });
                showToast('Employé ajouté !', 'success');
            }

            saveEmployees(emps);
            getEmpModal().hide();
            renderTable();
        });
    }

    /* Table delegation */
    if (tbody) {
        tbody.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-id]');
            if (!btn) return;

            var id = btn.getAttribute('data-id');

            if (btn.classList.contains('action-view')) {
                viewEmployee(id);
            } else if (btn.classList.contains('action-edit')) {
                editEmployee(id);
            } else if (btn.classList.contains('action-delete')) {
                deleteEmployee(id);
            }
        });
    }

    /* Search & Filters */
    if (searchInput) searchInput.addEventListener('input', renderTable);
    if (roleFilter) roleFilter.addEventListener('change', renderTable);
    if (statusFilter) statusFilter.addEventListener('change', renderTable);
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            if (searchInput) searchInput.value = '';
            if (roleFilter) roleFilter.value = 'all';
            if (statusFilter) statusFilter.value = 'all';
            renderTable();
        });
    }


    /* =====================================================
       INIT
    ===================================================== */

    seedEmployees();
    renderTable();

})();
