document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById('inscriptionModal');
    var openBtn = document.getElementById('openModal');
    var closeBtn = document.querySelector('.close-btn');
    var closeModalLink = document.getElementById('closeModalLink');
    var modalOverlay = document.querySelector('.modal-overlay');

    if (openBtn) {
        openBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    if (closeModalLink) {
        closeModalLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal();
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var emailOrPhone = document.getElementById('loginEmail').value.trim();
            var password = document.getElementById('loginPassword').value;
            if (!emailOrPhone || !password) {
                showToast('Veuillez remplir tous les champs.', 'warning');
                return;
            }
            var users = [];
            try { users = JSON.parse(localStorage.getItem('bide_users')) || []; } catch(ex) { users = []; }
            var found = users.find(function(u) {
                return (u.email && u.email.toLowerCase() === emailOrPhone.toLowerCase()) || (u.telephone && u.telephone === emailOrPhone);
            });
            if (!found) {
                showToast('Aucun compte trouvé. Créez un compte !', 'warning');
                setTimeout(function() {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }, 500);
                return;
            }
            localStorage.setItem('bide_session', JSON.stringify({
                email: found.email, nom: found.nom, prenom: found.prenom,
                telephone: found.telephone, dateNaissance: found.dateNaissance || '',
                loggedAt: new Date().toISOString()
            }));
            showToast('Connexion réussie !', 'success');
            setTimeout(function() { window.location.href = 'dashboard.html'; }, 800);
        });
    }

    var inscriptionForm = document.getElementById('inscriptionForm');
    if (inscriptionForm) {
        inscriptionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var nom = e.target.querySelector('input[placeholder="Nom"]')?.value.trim() || '';
            var prenom = e.target.querySelector('input[placeholder="Prénom"]')?.value.trim() || '';
            var email = e.target.querySelector('input[type="email"]')?.value.trim() || '';
            var telephone = e.target.querySelector('input[type="tel"]')?.value.trim() || '';
            var dateNaissance = e.target.querySelector('input[type="date"]')?.value || '';
            var password = e.target.querySelector('input[type="password"]')?.value || '';
            if (!nom || !prenom || !email || !telephone || !password) {
                showToast('Veuillez remplir tous les champs.', 'warning');
                return;
            }
            var users = [];
            try { users = JSON.parse(localStorage.getItem('bide_users')) || []; } catch(ex) { users = []; }
            var exists = users.find(function(u) {
                return (u.email && u.email.toLowerCase() === email.toLowerCase()) || (u.telephone && u.telephone === telephone);
            });
            if (exists) {
                showToast('Un compte avec cet email ou téléphone existe déjà.', 'warning');
                return;
            }
            users.push({ id: 'USR' + Math.floor(1000 + Math.random() * 9000), nom: nom, prenom: prenom, email: email, telephone: telephone, dateNaissance: dateNaissance, registeredAt: new Date().toISOString() });
            localStorage.setItem('bide_users', JSON.stringify(users));
            localStorage.setItem('bide_session', JSON.stringify({ email: email, nom: nom, prenom: prenom, telephone: telephone, dateNaissance: dateNaissance, loggedAt: new Date().toISOString() }));
            closeModal();
            showToast('Inscription réussie ! Bienvenue ' + prenom + '.', 'success');
            setTimeout(function() { window.location.href = 'dashboard.html'; }, 800);
        });
    }

    function showToast(message, type) {
        type = type || 'success';
        var toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;padding:15px 25px;border-radius:10px;color:white;font-weight:700;font-size:14px;box-shadow:0 4px 15px rgba(0,0,0,0.2);font-family:Nunito,sans-serif;display:flex;align-items:center;gap:10px;';
        var colors = {success:'#198754',info:'#0d6efd',warning:'#fd7e14',error:'#dc3545'};
        toast.style.background = colors[type] || colors.success;
        var icons = {success:'bi-check-circle-fill',info:'bi-info-circle-fill',warning:'bi-exclamation-triangle-fill',error:'bi-x-circle-fill'};
        toast.innerHTML = '<i class="bi ' + (icons[type]||icons.success) + '"></i> ' + message;
        document.body.appendChild(toast);
        setTimeout(function(){ toast.style.opacity='0'; toast.style.transition='opacity 0.3s'; }, 2500);
        setTimeout(function(){ toast.remove(); }, 3000);
    }
});
