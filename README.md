# QR//GEN

> Générateur de QR codes 100% côté client — aucune donnée envoyée à un serveur.

Interface cyberpunk/terminal pour générer, personnaliser et exporter des QR codes directement dans le navigateur. Pas de backend, pas de tracking, pas de cookies.

## Fonctionnalités

- Génération live pendant la saisie
- Presets rapides : URL, MAILTO, TEL, WIFI, SMS, GEO
- Taille ajustable (128 → 768 px)
- Niveau de correction d'erreur (L / M / Q / H)
- Couleurs avant-plan et arrière-plan personnalisables
- Export **PNG**, **SVG** vectoriel, ou copie directe dans le presse-papier
- Responsive mobile
- 100% client-side — tout tourne dans le navigateur

## Stack

- HTML / CSS / JavaScript vanilla
- [qrcodejs](https://github.com/davidshimjs/qrcodejs) pour la génération
- Google Fonts (JetBrains Mono, Space Mono)

## Utilisation locale

Aucune build step, aucun serveur requis. Ouvre simplement `index.html` :

```bash
git clone https://github.com/<ton-user>/qr-generator.git
cd qr-generator
# Ouvre index.html dans un navigateur
# ou lance un petit serveur local :
python3 -m http.server 8080
```

Puis visite `http://localhost:8080`.

## Déploiement sur GitHub Pages

1. Push ce dépôt sur GitHub
2. `Settings` → `Pages` → Branch : `main` / root `/`
3. Le site sera disponible sur `https://<ton-user>.github.io/qr-generator/`

## Structure

```
.
├── index.html      # Structure
├── styles.css      # Styles (thème terminal/cybersec)
├── script.js       # Logique + export PNG/SVG
├── favicon.svg     # Favicon
└── README.md
```

## Licence

MIT — voir [LICENSE](LICENSE).

---

Développé par [Lucas GARCIA](https://www.linkedin.com/in/lucas-garcia-203706330/)
