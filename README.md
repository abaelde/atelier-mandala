# Atelier Mandala

Application de coloriage pour enfants : mandalas générés, personnages détaillés, animaux, scènes et dessin libre. Fonctionne sur iPad, téléphone et ordinateur, sans installation.

## Fichiers

- `index.html` : la page, la mise en page et les styles.
- `app.js` : la logique (palette, coloriage, dessin libre, sauvegarde, export PNG).
- `kit.js` : les briques de dessin, les animaux, les scènes et les véhicules.
- `people.js` : le moteur de personnages et les groupes Métiers, Héros et légendes, Sports et loisirs.
- `test.js` : les vérifications automatiques (`node test.js`).

## Déploiement

À chaque modification poussée sur la branche `main`, GitHub Actions vérifie le code (`.github/workflows/deploy.yml`) puis publie le site sur GitHub Pages. Rien à faire à la main.

## Tester en local

```bash
python3 -m http.server 8790
```

puis ouvrir http://localhost:8790.
