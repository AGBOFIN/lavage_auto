/**
 * BIDE — Session Manager
 * Reads user data from localStorage and updates all display elements
 */
(function() {
    try {
        var session = JSON.parse(localStorage.getItem('bide_session'));
        if (!session) return;

        var name = '';
        if (session.nom && session.nom.trim()) {
            name = session.nom.trim();
        } else if (session.email) {
            name = session.email.split('@')[0];
            name = name.charAt(0).toUpperCase() + name.slice(1);
        }

        if (!name) return;

        var firstName = name.split(' ')[0];
        var initials = name.split(' ').map(function(w) {
            return w.charAt(0).toUpperCase();
        }).join('').substring(0, 2);

        // Welcome message (dashboard)
        var welcomeEl = document.querySelector('.welcome h2');
        if (welcomeEl) welcomeEl.textContent = 'Bonjour, ' + firstName + ' 👋';

        // Topbar profile name
        var strongEls = document.querySelectorAll('.topbar-right strong, .profile strong, .user-text strong, .user-info strong');
        strongEls.forEach(function(el) {
            if (el.textContent.includes('Kossi')) el.textContent = name;
        });

        // Avatar initials
        var avatarEls = document.querySelectorAll('.avatar, .user-avatar, .review-avatar');
        avatarEls.forEach(function(el) {
            if (el.textContent.trim() === 'KA' || el.textContent.trim() === 'KK') {
                el.textContent = initials;
            }
        });

        // Profile page — name
        var profileName = document.querySelector('.profile-info h2');
        if (profileName) {
            profileName.innerHTML = name + ' <span class="client-badge">' +
                (profileName.querySelector('.client-badge') ? profileName.querySelector('.client-badge').textContent : 'Client') +
                '</span>';
        }

        // Profile page — contact info
        var contactEmail = document.querySelector('.contact-info div:first-child');
        if (contactEmail && session.email) {
            contactEmail.innerHTML = '<i class="bi bi-envelope"></i> ' + session.email;
        }

        // Deconnexion page
        var logoutName = document.querySelector('.user-details strong');
        if (logoutName && session.email) {
            logoutName.textContent = name;
        }
        var logoutEmail = document.querySelector('.user-details span');
        if (logoutEmail && session.email) {
            logoutEmail.textContent = session.email;
        }

        // Deconnexion page — initials
        var logoutAvatar = document.querySelector('.avatar');
        if (logoutAvatar && logoutAvatar.textContent.trim() === 'KK') {
            logoutAvatar.textContent = initials;
        }

    } catch(e) {}
})();
