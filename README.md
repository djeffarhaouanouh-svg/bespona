# Bespona Mannequin

Mini-plugin WordPress fournissant le shortcode `[bespona_mannequin]` pour afficher un mannequin interactif avec hotspots cliquables (face, poitrine, hanche, cuisse, pieds).

## Installation

1. Copier le dossier `bespona-mannequin` dans le répertoire `wp-content/plugins/` de votre site WordPress.
2. Activer l'extension **Bespona Mannequin** depuis l'administration WordPress.
3. Insérer le shortcode suivant dans vos pages ou modèles Elementor :

```
[bespona_mannequin preset="default"]
```

### Options

- `preset` : nom du preset (fichier JSON situé dans `assets/presets/`). Valeur par défaut `default`.
- `mode` : `single` (par défaut) pour une sélection exclusive ou `multi` pour autoriser plusieurs points actifs.

## Snippet autonome (sans plugin)

Copier les fichiers `bp-mannequin.css`, `bp-mannequin.js`, `mannequin.svg` et le dossier `presets/` (avec le JSON) dans un répertoire accessible, par exemple `/wp-content/uploads/`, puis insérer dans Elementor (widget HTML) :

```html
<link rel="stylesheet" href="/wp-content/uploads/bp-mannequin.css">
<div class="bp-mannequin" data-preset="default">
  <img class="bp-mannequin__img" src="/wp-content/uploads/mannequin.svg" alt="Silhouette de mannequin"/>
  <ul class="bp-mannequin__points" aria-label="Zones du corps"></ul>
</div>
<script src="/wp-content/uploads/bp-mannequin.js" defer></script>
```

Le script chargera automatiquement `/wp-content/uploads/presets/default.json` et initialisera le composant.

## Hotspots + sélection de cartes (Elementor)

Le fichier [`assets/q-hotspots-cards-snippet.html`](bespona-mannequin/assets/q-hotspots-cards-snippet.html) contient un bloc unique `<style>…</style><script>…</script>` prêt à être collé dans **Elementor → Custom Code** (ou un widget HTML). Il combine :

- l'affichage conditionnel des sections `.q-section` via les hotspots `href="#q-…"` ou `data-target="q-…"` ;
- la sélection exclusive des cartes `.q-card` par groupe `data-field` avec mise en évidence visuelle.

Le JavaScript est idempotent, fonctionne en délégation d'évènements (mode capture) et conserve l'état même si Elementor réinjecte du DOM.
