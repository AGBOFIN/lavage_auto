# 🚗 BIDÈ — Lavage Automobile Professionnel

![BIDÈ Logo](images/bide-wash-logo-no-bg.png)

Site web professionnel de lavage automobile pour **BIDÈ**, basé au Togo. Plateforme complète comprenant un site vitrine public, un espace client et un panneau d'administration.

🌐 **[Démo en ligne](https://akimfakolavage.vercel.app)**

---

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Aperçu](#-aperçu)
- [Architecture](#-architecture)
- [Technologies utilisées](#-technologies-utilisées)
- [Installation](#-installation)
- [Structure du projet](#-structure-du-projet)
- [Fonctionnement](#-fonctionnement)
- [Pages et modules](#-pages-et-modules)
- [Optimisations](#-optimisations)
- [Roadmap](#-roadmap)
- [Contribuer](#-contribuer)
- [Auteur](#-auteur)
- [Licence](#-licence)

---

## ✨ Fonctionnalités

### 🌍 Site Public (One Page)
- **Hero vidéo** en arrière-plan avec effet parallaxe et bouton play/pause
- **Section Services** — 6 services détaillés avec images et durées
- **Tarifs** — 4 formules (Essentiel, Confort, Premium, VIP) + services complémentaires
- **Galerie** — Galerie filtrable avec lightbox (Extérieur, Intérieur, Équipements, Équipe)
- **Témoignages** clients avec étoiles
- **FAQ** — 8 questions/réponses avec barre de recherche
- **Contact** — Coordonnées, horaires, formulaire, carte Google Maps
- **Navbar sticky** avec effet au scroll et navigation active
- **Animations** — Fade-in au scroll, compteurs animés, smooth scroll

### 👤 Espace Client
- **Inscription / Connexion** — Vérification des comptes existants
- **Dashboard** — Aperçu des réservations, véhicules et factures
- **Véhicules** — Enregistrement et gestion des véhicules
- **Factures** — Consultation et paiement des factures (Mobile Money, Carte, Espèces)
- **Avis** — Déposer des avis et étoiles
- **Notifications** — Notifications en temps réel
- **Profil** — Gestion des informations personnelles
- **Paramètres** — Configuration du compte

### 🔧 Panel Admin
- **Dashboard** — Statistiques globales (clients, revenus, véhicules, taux satisfaction)
- **Gestion des Clients** — CRUD complet (Ajouter, Voir, Modifier, Supprimer avec corbeille)
- **Gestion des Services** — CRUD avec modales interactives
- **Gestion des Véhicules** — CRUD avec images et détails
- **Gestion des Réservations** — Suivi des statuts (en attente → en cours → terminée)
- **Gestion des Paiements** — Historique et recherche
- **Messages** — Messagerie avec modales
- **Avis Clients** — Consultation des avis
- **Gestion des Employés** — CRUD complet avec rôles et salaires
- **Paramètres** — Configuration admin

---

## 🖼 Aperçu

| Page | Capture |
|------|---------|
| **Accueil** | Hero vidéo, services, tarifs, galerie |
| **Espace Client** | Dashboard, factures, véhicules |
| **Panel Admin** | Dashboard avec KPIs, gestion CRUD |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────┐
│              SITE PUBLIC (index.html)        │
│  Hero vidéo → Services → Tarifs → FAQ →     │
│  Galerie → Contact                           │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  CLIENT     │  │   ADMIN    │
│  (9 pages)  │  │  (11 pages)│
│             │  │            │
│ • Connexion │  │ • Dashboard│
│ • Profil    │  │ • Clients  │
│ • Dashboard │  │ • Services │
│ • Véhicules │  │ • Véhicules│
│ • Factures  │  │ • Réserv.  │
│ • Avis      │  │ • Paiements│
│ • Notifs    │  │ • Messages │
│ • Params    │  │ • Avis     │
│ • Déconnexion│ │ • Employés │
│             │  │ • Admins   │
│             │  │ • Params   │
└──────┬──────┘  └─────┬──────┘
       │               │
       └───────┬───────┘
               │
        ┌──────▼──────┐
        │  BIDE.js    │
        │ (localStorage│
        │  Engine)    │
        └─────────────┘
```

---

## 🛠 Technologies utilisées

| Catégorie | Technologie |
|-----------|------------|
| **Structure** | HTML5 sémantique |
| **Style** | CSS3 custom properties, Bootstrap 5.3, Bootstrap Icons 1.11 |
| **Interactivité** | JavaScript vanilla (ES5-compatible) |
| **Stockage** | localStorage (base de données côté client) |
| **Images** | Cloudinary (CDN), Unsplash |
| **Vidéo** | Cloudinary (hosting vidéo hero) |
| **Déploiement** | Vercel |

---

## 🚀 Installation

### Prérequis

- Un navigateur web moderne (Chrome, Firefox, Edge, Safari)
- Un serveur HTTP local (pour éviter les erreurs CORS avec localStorage)

### Avec Node.js

```bash
# Cloner le projet
git clone https://github.com/ton-username/bide-lavage.git
cd bide-lavage

# Installer et lancer un serveur local
npx serve . -l 3000

# Ouvrir http://localhost:3000
```

### Avec Python

```bash
# Depuis la racine du projet
python3 -m http.server 3000

# Ouvrir http://localhost:3000
```

### Avec PHP

```bash
php -S localhost:3000
```

> ⚠️ **Important** : Le projet utilise `localStorage` pour le stockage de données. Un serveur HTTP local est nécessaire pour que toutes les fonctionnalités fonctionnent correctement.

---

## 📂 Structure du projet

```
bide-lavage/
├── index.html                    # Page d'accueil (One Page)
│
├── css/
│   ├── style.css                 # Styles globaux (accueil, navbar, hero, sections)
│   └── connexion.css             # Styles pages de connexion/inscription
│
├── js/
│   ├── main.js                   # Logique page d'accueil (scroll, animations, navbar)
│   ├── bide.js                   # ⭐ Core — CRUD, invoices, payments, session
│   ├── session.js                # Gestion de session utilisateur
│   ├── inscrit.js                # Logique inscription/connexion modale
│   ├── faq.js                    # Recherche dans la FAQ
│   └── gallery.js                # Galerie + filtres + lightbox
│
├── images/
│   ├── bide-wash-logo-no-bg.png  # Logo principal
│   ├── bide-wash-logo.png        # Logo (avec fond)
│   ├── bide-wash-logo-transparent.png
│   ├── equipe-bide.png           # Photo équipe
│   ├── notre-histoire.png        # Section À propos
│   └── wash.jpg                  # Image de fond
│
├── video/
│   └── (hero-bide.mp4)           # Vidéo hero (Cloudinary hébergée)
│
├── client/                       # 📱 Espace client
│   ├── connexion.html            # Page connexion
│   ├── inscription.html          # Page inscription (via modale)
│   ├── dashboard.html            # Tableau de bord client
│   ├── vehicules.html            # Mes véhicules
│   ├── factures.html             # Mes factures
│   ├── avis.html                 # Mes avis
│   ├── notifications.html        # Notifications
│   ├── profil.html               # Mon profil
│   ├── parametres.html           # Paramètres
│   ├── deconnexion.html          # Déconnexion
│   ├── css/
│   │   └── client-responsive.css # Styles responsive client
│   └── js/
│       └── factures.js           # Logique factures
│
├── admin/                        # 🔧 Panel d'administration
│   ├── dashboard.html            # Dashboard admin
│   ├── clients.html              # Gestion clients (CRUD)
│   ├── services.html             # Gestion services
│   ├── vehicules.html            # Gestion véhicules
│   ├── reservations.html         # Gestion réservations
│   ├── paiements.html            # Gestion paiements
│   ├── messages.html             # Messagerie
│   ├── avis.html                 # Avis clients
│   ├── employes.html             # Gestion employés (CRUD)
│   ├── utilisateurs.html         # Gestion administrateurs
│   ├── parametres.html           # Paramètres admin
│   ├── css/
│   │   ├── dashboard.css         # Styles globaux admin
│   │   ├── client.css            # Styles spécifiques clients admin
│   │   ├── employes.css          # Styles employés
│   │   └── messages.css          # Styles messagerie
│   └── js/
│       ├── dashboard.js          # Logique dashboard admin
│       ├── clients.js            # CRUD clients
│       ├── reservations.js       # Logique réservations
│       ├── messages.js           # Logique messagerie
│       ├── paiement.js           # Logique paiements
│       └── employes.js           # CRUD employés
│
└── README.md                     # 📖 Ce fichier
```

---

## ⚙️ Fonctionnement

### 💾 Stockage des données (localStorage)

Toutes les données sont stockées côté client via `localStorage` :

| Clé | Description |
|-----|------------|
| `bide_session` | Session utilisateur connectée |
| `bide_users` | Base de données des utilisateurs inscrits |
| `bide_requests` | Réservations de lavage |
| `bide_clients` | Base de données clients |
| `bide_invoices` | Factures générées |
| `bide_services` | Services disponibles |
| `bide_vehicles` | Véhicules enregistrés |
| `bide_employees` | Employés |
| `bide_messages` | Messages |
| `bide_reviews` | Avis clients |
| `bide_payments` | Paiements |

### 🔄 Synchronisation multi-onglets

Le module `bide.js` utilise l'événement `storage` pour synchroniser les données en temps réel entre plusieurs onglets du navigateur.

### 🎬 Vidéo Hero

La vidéo du hero est hébergée sur **Cloudinary** et intègre :
- Autoplay, muted, loop (obligatoire pour l'autoplay navigateur)
- Poster image en fallback
- Bouton play/pause
- Effet parallaxe au scroll
- Détection mobile (vitesse réduite à 0.75x)
- Mode économie de données
- Pause automatique si onglet caché

---

## 📄 Pages et modules

### Site Public (`index.html`)
| Section | Description |
|---------|------------|
| Hero | Vidéo plein écran, parallaxe, CTA |
| Services | 6 services avec images Cloudinary |
| Avantages | 4 arguments de vente |
| Comment ça marche | 3 étapes |
| Tarifs | 4 formules + 3 services complémentaires |
| Stats | Compteurs animés |
| À propos | Histoire, mission, vision, valeurs |
| Galerie | 10 photos filtrables + lightbox |
| Témoignages | 7 avis clients |
| FAQ | 8 Q&R + recherche |
| Contact | Coordonnées, horaires, formulaire, carte |

### Espace Client
| Page | Fonctionnalités |
|------|----------------|
| **Connexion** | Vérification email/téléphone, redirection inscription si pas de compte |
| **Inscription** | Formulaire complet, validation, sauvegarde dans `bide_users` |
| **Dashboard** | Stats personnelles, dernières réservations |
| **Véhicules** | Ajout, modification, suppression |
| **Factures** | Liste, détails, paiement (Mobile Money, Carte, Espèces) |
| **Avis** | Soumettre un avis avec étoiles |
| **Notifications** | Liste des notifications |
| **Profil** | Voir/modifier les informations personnelles |

### Panel Admin
| Page | Fonctionnalités |
|------|----------------|
| **Dashboard** | KPIs : clients, revenus, véhicules, satisfaction |
| **Clients** | CRUD complet, recherche, filtres, pagination, corbeille |
| **Services** | Voir, Modifier, Supprimer avec modales |
| **Véhicules** | Ajouter, Voir, Supprimer |
| **Réservations** | Suivi des statuts, annulation |
| **Paiements** | Historique, recherche, détails |
| **Messages** | Envoi et réception de messages |
| **Avis** | Consultation des avis clients |
| **Employés** | CRUD complet, rôles, salaires, recherche |
| **Administrateurs** | Gestion des accès admin |
| **Paramètres** | Configuration |

---

## 📱 Optimisations

### Responsive Design
- **Desktop** : Navigation complète, grille 3-4 colonnes
- **Tablette** (≤992px) : Menu burger, grille 2 colonnes
- **Mobile** (≤768px) : Sidebar glissante avec overlay, colonne unique
- **Petit mobile** (≤576px) : Tailles optimisées, padding réduit

### Performance
- **Lazy loading** sur les images (`loading="lazy"`)
- **Images Cloudinary** avec optimisation automatique (format WebP, redimensionnement)
- **Vidéo** : Version réduite sur mobile, pause auto si onglet caché
- **CSS** : Custom properties pour un thème cohérent et maintenable
- **JavaScript** : Vanilla JS sans framework, compatible ES5

### Accessibilité
- `aria-label` sur les boutons et contrôles
- Sémantique HTML5 (sections, nav, header, footer)
- Contraste suffisant sur les textes
- Support clavier dans la galerie et les modales

### Cross-browser
- Compatible Chrome, Firefox, Edge, Safari
- `-webkit-backdrop-filter` pour Safari
- `object-fit: cover` pour les images/vidéos

---

## 🗺 Roadmap

- [ ] 🌐 Traduction multilingue (Français / Ewe / English)
- [ ] 💳 Intégration paiement réel (MoovMoney, TMoney)
- [ ] 🔔 Notifications push (Web Push API)
- [ ] 📊 Dashboard admin avec graphiques (Chart.js)
- [ ] 🗄️ Backend réel (Node.js / Express + MongoDB)
- [ ] 🔐 Authentification sécurisée (JWT)
- [ ] 📱 Application mobile (React Native / PWA)
- [ ] 🌙 Mode sombre
- [ ] 📧 Emails transactionnels (Nodemailer / SendGrid)
- [ ] 📍 Géolocalisation temps réel des véhicules

---

## 🤝 Contribuer

1. **Fork** le projet
2. **Créer** une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. **Commit** vos changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

### Convention de code

- JavaScript : syntaxe ES5-compatible (pas de `const`/`let`/`=>` dans les fichiers partagés)
- CSS : utiliser les custom properties `var(--*)` du thème
- HTML : sémantique Bootstrap 5 + classes utilitaires
- Nommage : `snake_case` pour les classes CSS, `camelCase` pour JS

---

## 👤 Auteur

**BIDÈ** — Lavage Automobile Professionnel
📍 Lomé, Togo
📧 contact@bide-lavage.com
📞 +228 79 06 06 05

---

## 📝 Licence

Ce projet est propriétaire. Tous droits réservés © 2026 BIDÈ.

---

> *Fait avec ❤️ pour les véhicules qui méritent le meilleur lavage.*
