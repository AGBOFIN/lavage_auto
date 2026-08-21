# 🚗 BIDÈ — Lavage Automobile Professionnel

> Site public **one-page** du lavage automobile **BIDÈ**, réalisé par **AKIMMAKO**.

## 📋 Description

**BIDÈ** est une plateforme web de gestion d'un lavage automobile. Ce dépôt contient le **site public** — une seule page (`index.html`) que le visiteur peut parcourir sans changer de page.

## 🛠️ Technologies

- **HTML5** — Structure sémantique
- **CSS3** — Design system personnalisé
- **Bootstrap 5** — Composants responsive
- **JavaScript** — Interactions UI (pas de logique métier)
- **Git / GitHub** — Versioning

## 📁 Structure

```
bide/
├── index.html              ← Page unique (one-page)
├── assets/
│   ├── css/
│   │   └── style.css       ← Design system unifié
│   ├── js/
│   │   ├── main.js         ← Interactions + navigation ancres
│   │   ├── gallery.js      ← Filtres + lightbox galerie
│   │   └── faq.js          ← Recherche FAQ
│   └── images/
├── README.md
└── .gitignore
```

## 🚀 Démarrage

```bash
# Ouvrir directement
start index.html

# Ou avec un serveur local
python -m http.server 3000
```

## 🎨 Sections du One Page

1. Hero / Accueil
2. Présentation rapide
3. Services (6 prestations)
4. Avantages (Pourquoi nous choisir)
5. Comment ça marche (3 étapes)
6. Tarifs (4 formules + compléments)
7. Statistiques
8. À propos (histoire, mission, valeurs)
9. Galerie (filtres + lightbox)
10. Témoignages
11. FAQ (8 questions + recherche)
12. Contact (coordonnées, formulaire, carte)
13. Call-to-action
14. Footer

## 🔗 Navigation

Tous les liens de la navbar et du footer utilisent des **ancres** (`#services`, `#tarifs`, etc.).

Le seul bouton externe est **« Se connecter »** → `login.html` (fourni par le coéquipier auth).

## 📍 Contact

- **Localisation** : Lomé, Togo
- **Devise** : FCFA

## 👥 Équipe

Projet réalisé par une équipe de **4 développeurs** — du **17/08/2026 au 24/08/2026**.
