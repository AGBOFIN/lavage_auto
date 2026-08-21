/**
 * BIDE — Session Manager
 * Reads user data from bide_session and updates all display elements
 */
(function() {
    try {
        var session = JSON.parse(localStorage.getItem('bide_session'));
        if (!session) return;

        // Build display name from nom/prenom
        var prenom = (session.prenom || '').trim();
        var nom = (session.nom || '').trim();
        var fullName = (nom + ' ' + prenom).trim();
        var displayName = prenom || nom || '';
        if (!displayName && session.email) {
            displayName = session.email.split('@')[0];
            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        }
        if (!displayName) displayName = 'Client';
        if (!fullName) fullName = displayName;

        var initials = fullName.split(' ').map(function(w) {
            return w.charAt(0).toUpperCase();
        }).join('').substring(0, 2);

        // Welcome message (dashboard)
        var welcomeEl = document.querySelector('.welcome h2');
        if (welcomeEl) welcomeEl.textContent = 'Bonjour, ' + displayName + ' 👋';

        // Welcome by ID
        var welcomeById = document.getElementById('welcomeMsg');
        if (welcomeById) welcomeById.textContent = 'Bonjour, ' + displayName + ' 👋';

        // Topbar profile name — update ALL strong elements in user/profile areas
        var strongEls = document.querySelectorAll('.topbar-right strong, .profile strong, .user-text strong, .user-info strong');
        strongEls.forEach(function(el) {
            el.textContent = fullName;
        });

        // Header name by ID
        var headerName = document.getElementById('headerName');
        if (headerName) headerName.textContent = 'Bonjour, ' + displayName;

        var topbarName = document.getElementById('topbarName');
        if (topbarName) topbarName.textContent = fullName;

        // Avatar initials — update ALL avatar elements
        var avatarEls = document.querySelectorAll('.avatar, .user-avatar, .review-avatar');
        avatarEls.forEach(function(el) {
            var text = el.textContent.trim();
            // Only replace placeholder initials
            if (text === 'KA' || text === 'KK' || text === '--' || text === '') {
                el.textContent = initials;
            }
        });

        // Avatar by ID
        var headerAvatar = document.getElementById('headerAvatar');
        if (headerAvatar && (headerAvatar.textContent.trim() === '--' || headerAvatar.textContent.trim() === '')) {
            headerAvatar.textContent = initials;
        }

        var topbarAvatar = document.getElementById('topbarAvatar');
        if (topbarAvatar && (topbarAvatar.textContent.trim() === '--' || topbarAvatar.textContent.trim() === '')) {
            topbarAvatar.textContent = initials;
        }

        // Profile page — name
        var profileFullName = document.getElementById('profileFullName');
        if (profileFullName) profileFullName.textContent = fullName;

        var profileNameEl = document.getElementById('profileName');
        if (profileNameEl) {
            var badge = profileNameEl.querySelector('.client-badge');
            profileNameEl.innerHTML = fullName;
            if (badge) profileNameEl.appendChild(badge);
        }

        // Profile page — contact info
        var profileEmailVal = document.getElementById('profileEmailVal');
        if (profileEmailVal) profileEmailVal.textContent = session.email || '-';

        var profileTelVal = document.getElementById('profileTelVal');
        if (profileTelVal) profileTelVal.textContent = session.telephone || '-';

        // Info list
        var profilNom = document.getElementById('profilNom');
        if (profilNom) profilNom.textContent = fullName;

        var profilEmail = document.getElementById('profilEmail');
        if (profilEmail) profilEmail.textContent = session.email || '-';

        var profilTel = document.getElementById('profilTel');
        if (profilTel) profilTel.textContent = session.telephone || '-';

        var profilDate = document.getElementById('profilDate');
        if (profilDate) profilDate.textContent = session.dateNaissance || '-';

        // Deconnexion page
        var logoutName = document.querySelector('.user-details strong');
        if (logoutName) logoutName.textContent = fullName;

        var logoutEmail = document.querySelector('.user-details span');
        if (logoutEmail && session.email) logoutEmail.textContent = session.email;

        var logoutAvatar = document.querySelector('.avatar');
        if (logoutAvatar) {
            var txt = logoutAvatar.textContent.trim();
            if (txt === 'KK' || txt === 'KA' || txt === '--') {
                logoutAvatar.textContent = initials;
            }
        }

    } catch(e) {}
})();
