document.addEventListener('DOMContentLoaded', function() {
    // Sélection des éléments du DOM
    const modal = document.getElementById('inscriptionModal');
    const openBtn = document.getElementById('openModal');
    const closeBtn = document.querySelector('.close-btn');
    const closeModalLink = document.getElementById('closeModalLink');
    const modalOverlay = document.querySelector('.modal-overlay');

    // Ouvrir la modale
    if (openBtn) {
        openBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Fermer la modale
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

    // Formulaire de connexion
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var email = document.getElementById('loginEmail').value;
            var password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                showToast('Veuillez remplir tous les champs.', 'warning');
                return;
            }
            
            // Sauvegarder la session
            localStorage.setItem('bide_session', JSON.stringify({
                email: email,
                loggedAt: new Date().toISOString()
            }));
            
            showToast('Connexion réussie !', 'success');
            setTimeout(function() {
                window.location.href = 'dashbord client.html';
            }, 800);
        });
    }

    // Formulaire d'inscription
    var inscriptionForm = document.getElementById('inscriptionForm');
    if (inscriptionForm) {
        inscriptionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupérer le nom pour la session
            var nom = e.target.querySelector('input[placeholder="Nom"]')?.value || 'Client';
            var prenom = e.target.querySelector('input[placeholder="Prénom"]')?.value || '';
            var email = e.target.querySelector('input[type="email"]')?.value || '';
            
            // Sauvegarder la session
            localStorage.setItem('bide_session', JSON.stringify({
                email: email,
                nom: prenom + ' ' + nom,
                registeredAt: new Date().toISOString()
            }));
            
            closeModal();
            showToast('Inscription réussie ! Bienvenue chez BIDÈ.', 'success');
            setTimeout(function() {
                window.location.href = 'dashbord client.html';
            }, 800);
        });
    }

    // Système de toast (si pas déjà défini)
    function showToast(message, type) {
        if (typeof window.showToast === 'function' && window.showToast !== showToast) {
            window.showToast(message, type);
            return;
        }
        type = type || 'success';
        var toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;padding:15px 25px;border-radius:10px;color:white;font-weight:700;font-size:14px;box-shadow:0 4px 15px rgba(0,0,0,0.2);animation:fadeIn 0.3s ease;font-family:Nunito,sans-serif;display:flex;align-items:center;gap:10px;';
        var colors = {success:'#198754',info:'#0d6efd',warning:'#fd7e14',error:'#dc3545'};
        toast.style.background = colors[type] || colors.success;
        var icons = {success:'bi-check-circle-fill',info:'bi-info-circle-fill',warning:'bi-exclamation-triangle-fill',error:'bi-x-circle-fill'};
        toast.innerHTML = '<i class="bi ' + (icons[type]||icons.success) + '"></i> ' + message;
        document.body.appendChild(toast);
        setTimeout(function(){ toast.style.opacity='0'; toast.style.transition='opacity 0.3s'; }, 2500);
        setTimeout(function(){ toast.remove(); }, 3000);
    }
});