# Plan de Migration Progressive : Config.js → WooCommerce

## Contexte de Migration

### Situation Actuelle
- **Config.js** : Utilisé historiquement (sans backend)
- **WooCommerce** : Nouveau backend avec 19 produits
- **Objectif** : Migration GRADUELLE vers WooCommerce
- **Stratégie** : Dépréciation PROGRESSIVE de config.js

### Données Disponibles

#### WooCommerce (header.php ligne 122-123)
```javascript
const products = <?php echo json_encode($product_data); ?>;
// 19 produits organisés par catégories
```

#### Config.js (structure existante)
```javascript
const config = {
  products: { cd, livret, aquarelles, bougies },
  // Autres configurations...
};
```

## Plan de Migration Progressive

### Phase 1 : Utilisation Immédiate des Prix WooCommerce (30 min)

#### Objectif
Remplacer les prix de config.js par ceux de WooCommerce SANS changer la structure.

#### Implémentation
```javascript
// Dans script.js, après l'initialisation
function overridePricesWithWooCommerce() {
  const wooProducts = window.products; // Données WooCommerce

  // Grouper les produits WooCommerce par catégorie
  const wooByCategory = {};
  wooProducts.forEach(product => {
    product.categories.forEach(category => {
      if (!wooByCategory[category]) wooByCategory[category] = [];
      wooByCategory[category].push(product);
    });
  });

  // Mettre à jour les prix dans config.products
  Object.keys(config.products).forEach(configKey => {
    const wooCategory = getWooCategoryFromConfigKey(configKey);
    if (wooByCategory[wooCategory]) {
      const wooProduct = wooByCategory[wooCategory][0];
      config.products[configKey].price = parseFloat(wooProduct.price);
    }
  });
}

function getWooCategoryFromConfigKey(configKey) {
  const mapping = {
    'cd': 'CD',
    'livret': 'Livret',
    'aquarelles': 'Aquarelles',
    'bougies': 'Bougies'
  };
  return mapping[configKey] || configKey;
}
```

### Phase 2 : Extension des Produits WooCommerce (2h)

#### Objectif
Ajouter TOUS les produits WooCommerce à config.js SANS casser l'existant.

#### Stratégie
1. **Préserver** la structure config.js existante
2. **Ajouter** les produits WooCommerce manquants
3. **Utiliser** les catégories pour l'affichage différencié

#### Implémentation
```javascript
function extendConfigWithWooCommerce() {
  const wooProducts = window.products;

  // Ajouter les produits manquants à config.products
  wooProducts.forEach(wooProduct => {
    const configKey = generateConfigKey(wooProduct);

    if (!config.products[configKey]) {
      config.products[configKey] = createConfigProduct(wooProduct);
    }
  });
}

function generateConfigKey(wooProduct) {
  // Générer une clé basée sur le slug WooCommerce
  return wooProduct.slug.replace(/[^a-z0-9]/g, '-').toLowerCase();
}

function createConfigProduct(wooProduct) {
  return {
    id: wooProduct.id,
    title: wooProduct.name,
    description: wooProduct.description,
    price: parseFloat(wooProduct.price),
    image: wooProduct.image,
    gallery: wooProduct.gallery,
    category: wooProduct.categories[0], // Catégorie principale
    addToCartText: "Ajouter au panier"
  };
}
```

### Phase 3 : Migration Complète des Sections (4h)

#### Objectif
Remplacer la génération des sections par les données WooCommerce.

#### Stratégie
1. **Grouper** les produits WooCommerce par catégorie
2. **Générer** les sections dynamiquement
3. **Préserver** les fonctionnalités existantes

#### Implémentation
```javascript
function generateSectionsFromWooCommerce() {
  const wooProducts = window.products;
  const sections = groupProductsByCategory(wooProducts);

  Object.entries(sections).forEach(([category, products]) => {
    const section = createSectionFromCategory(category, products);
    document.querySelector('main').appendChild(section);
  });
}

function groupProductsByCategory(products) {
  const sections = {};
  products.forEach(product => {
    product.categories.forEach(category => {
      if (!sections[category]) sections[category] = [];
      sections[category].push(product);
    });
  });
  return sections;
}

function createSectionFromCategory(category, products) {
  const section = document.createElement('section');
  section.className = 'product';
  section.id = category.toLowerCase();

  // Titre basé sur la catégorie
  const title = document.createElement('h2');
  title.textContent = getCategoryDisplayName(category);
  section.appendChild(title);

  // Contenu basé sur le type de catégorie
  const content = generateCategoryContent(category, products);
  section.appendChild(content);

  return section;
}
```

### Phase 4 : Dépréciation Finale de Config.js (2h)

#### Objectif
Supprimer config.js quand plus nécessaire.

#### Stratégie
1. **Identifier** les dépendances restantes
2. **Migrer** les configurations essentielles
3. **Supprimer** config.js

#### Configuration Finale
```javascript
// Nouveau fichier de configuration minimal
const siteConfig = {
  site: window.config.site, // Conserver les paramètres généraux
  texts: window.config.texts, // Conserver les textes d'interface
  navigation: window.config.navigation, // Conserver la navigation
  // products: supprimé, remplacé par WooCommerce
};
```

## Avantages de cette Approche

### ✅ **Migration Non-Destructive**
- **Préserve** toutes les fonctionnalités existantes
- **Ajoute** progressivement les nouvelles données
- **Permet** un rollback facile

### ✅ **Utilisation des Catégories WooCommerce**
- **Regroupement automatique** par catégorie
- **Affichage différencié** basé sur les catégories
- **Structure flexible** pour nouveaux produits

### ✅ **Performance Optimale**
- **Données WooCommerce** injectées côté serveur
- **Structure config.js** conservée pour la compatibilité
- **Migration progressive** sans rupture

## Risques et Mitigations

### ⚠️ **Risque : Perte de Fonctionnalités**
**Solution :** Tests approfondis à chaque phase

### ⚠️ **Risque : Performance**
**Solution :** Optimisation progressive des requêtes

### ⚠️ **Risque : Incohérence**
**Solution :** Validation des données à chaque étape

## Conclusion

Cette migration progressive permet de :

- ✅ **Préserver** l'existant (config.js)
- ✅ **Utiliser** les nouvelles données (WooCommerce)
- ✅ **Migrer** graduellement sans risque
- ✅ **Tirer parti** des catégories WooCommerce
- ✅ **Maintenir** toutes les fonctionnalités

**Temps total estimé :** 8-10 heures réparties sur plusieurs sessions.

**Recommandation :** Commencer par la Phase 1 (prix) pour un impact immédiat.

### 2. Organisation par Catégories WooCommerce

#### 📂 **Aquarelles** (12 produits)
- **6 chansons** × **2 versions** (couleur/noire)
- Prix : 3€ par produit
- Chansons : C'était la Terre, Les fils, Regarder le monde de loin, Ta lumière, Tant qu'y a du vent, Tranquille

#### 📂 **Bougies** (2 produits)
- Petite : 8€ (config.js) vs 5€ (WooCommerce) ❌
- Grande : 12€ (config.js) vs 8€ (WooCommerce) ❌
- Description : "Bougie fleurie"

#### 📂 **Livret** (4 produits WooCommerce vs 3 config.js)
- Original : 15€ (WooCommerce uniquement) ❌
- Bordeaux : 15€ ✅
- Violet Fleuris : 15€ ✅
- Vert Bleu : 15€ ✅
- Description : "Livret de paroles et poèmes"

#### 📂 **CD** (1 produit)
- Prix : 10€ ✅
- Description : "Mini-album de 6 titres"

#### 📂 **Catégorie Manquante ?**
- À vérifier si toutes les catégories sont représentées dans la navigation

### 3. Mapping Navigation Config.js ↔ WooCommerce

| Config.js | WooCommerce | Statut |
|-----------|-------------|---------|
| `cd` | "CD" | ✅ Match |
| `carnet` | "Livret" | ✅ Match |
| `aquarelles` | "Aquarelles" | ✅ Match |
| `bougies` | "Bougies" | ✅ Match |

### 4. Analyse des Images

#### Structure des Chemins
- **WooCommerce :** `http://192.168.1.175/wp-content/uploads/2025/09/`
- **Config.js :** `THEME_URI + "/photos_merch_ep/"`

#### Mapping des Images (exemples)

**Aquarelles - C'était la Terre :**
- WC : `aquarelles__c_etait_la_terre__couleur.jpg`
- Config : `aquarelles__c_etait_la_terre__couleur.jpg`
- ✅ **Match parfait**

**Livret - Vert Bleu :**
- WC : `livret_de_paroles_et_poemes_vert_bleu-1-scaled.jpg`
- Config : `livret_de_paroles_et_poemes_vert_bleu.jpg`
- ✅ **Match (différence suffixe seulement)**

### 5. Problèmes Identifiés

#### ❌ **Problèmes Majeurs**

1. **Données Partiellement Synchronisées**
   - ✅ Prix CD : 10€ (config.js) = 10€ (WooCommerce)
   - ✅ Prix Livret : 15€ (config.js) = 15€ (WooCommerce)
   - ✅ Prix Aquarelles : 3€ (config.js) = 3€ (WooCommerce)
   - ❌ Prix Bougies : 8€/12€ (config.js) vs 5€/8€ (WooCommerce)

2. **Structure Limitée**
   - Config.js gère 4 produits vs 19 dans WooCommerce
   - Variante "originale" du livret manquante dans config.js
   - Toutes les aquarelles individuelles non gérées

3. **Maintenance Double**
   - Prix bougies à synchroniser
   - Variantes à compléter
   - Structure à étendre pour tous les produits

#### ⚠️ **Problèmes Mineurs**

1. **Chemins d'Images**
   - Nécessité de mapping entre les deux structures
   - Gestion des suffixes différents (`-1-scaled.jpg`)

2. **Structure de Données**
   - Config.js utilise une structure complexe personnalisée
   - WooCommerce fournit une structure standardisée plus simple

### 4. Ce qui Marche Actuellement

#### ✅ **Éléments Fonctionnels**

1. **Architecture de Base**
   - Injection des données WooCommerce dans JavaScript ✅
   - Navigation vers les sections ✅
   - Structure HTML/CSS complète ✅

2. **Interface Utilisateur**
   - Sélection des variantes (livret, bougies) ✅
   - Sélection couleur/texte pour aquarelles ✅
   - Panier avec calcul des totaux ✅

3. **Fonctionnalités JavaScript**
   - Ajout au panier ✅
   - Gestion des quantités ✅
   - Lightbox et galeries ✅

### 5. Stratégie de Migration

#### Objectif : Remplacer config.js par les données WooCommerce

#### Phase 1 : Utilisation Immédiate (1-2h)

1. **Utiliser directement les données WooCommerce**
   ```javascript
   // Dans script.js, remplacer l'utilisation de config.products
   // par l'utilisation directe de window.products (injecté depuis PHP)
   const wooProducts = window.products; // Données WooCommerce
   ```

2. **Mapping des Catégories**
   ```javascript
   // Créer le mapping des catégories vers les sections
   const categoryMapping = {
     'CD': 'cd',
     'Livret': 'carnet',
     'Aquarelles': 'aquarelles',
     'Bougies': 'bougies'
   };
   ```

#### Phase 2 : Refactorisation du Code (4-6h)

1. **Fonction de Regroupement par Catégorie**
   ```javascript
   function groupProductsByCategory(products) {
     const sections = {};
     products.forEach(product => {
       product.categories.forEach(category => {
         if (!sections[category]) {
           sections[category] = [];
         }
         sections[category].push(product);
       });
     });
     return sections;
   }
   ```

2. **Génération Dynamique des Sections**
   ```javascript
   function generateSectionsFromWooCommerce() {
     const sections = groupProductsByCategory(window.products);
     const main = document.querySelector('main');

     Object.entries(sections).forEach(([category, products]) => {
       const section = createSectionFromCategory(category, products);
       main.appendChild(section);
     });
   }
   ```

#### Phase 3 : Suppression Progressive de config.js (2-3h)

1. **Identifier les Dépendances**
   - Textes d'interface
   - Configuration générale
   - Paramètres du site

2. **Migration des Textes**
   ```javascript
   // Conserver seulement la configuration nécessaire
   const config = {
     site: window.config.site, // Conserver les paramètres généraux
     texts: window.config.texts, // Conserver les textes d'interface
     // Supprimer products, navigation remplacé par WooCommerce
   };
   ```

### 6. Code d'Exemple pour la Migration

#### Nouvelle Fonction de Génération des Sections

```javascript
function generateProductSections() {
  const main = document.querySelector('main');
  const sections = groupProductsByCategory(window.products);

  Object.entries(sections).forEach(([categoryName, products]) => {
    const section = document.createElement('section');
    section.className = 'product';
    section.id = categoryMapping[categoryName] || categoryName.toLowerCase();

    // Titre de la section
    const title = document.createElement('h2');
    title.textContent = getCategoryDisplayName(categoryName);
    section.appendChild(title);

    // Générer le contenu selon le type de produits
    const content = generateCategoryContent(categoryName, products);
    section.appendChild(content);

    main.appendChild(section);
  });
}

function getCategoryDisplayName(category) {
  const displayNames = {
    'CD': 'CD',
    'Livret': 'Carnet',
    'Aquarelles': 'Aquarelles',
    'Bougies': 'Bougies'
  };
  return displayNames[category] || category;
}
```

### 7. Avantages de la Migration

#### ✅ **Bénéfices Immédiats**

1. **Cohérence des Données**
   - Prix corrects automatiquement
   - Descriptions à jour
   - Images synchronisées

2. **Maintenance Simplifiée**
   - Une seule source de vérité
   - Pas de double saisie
   - Mise à jour automatique

3. **Évolutivité**
   - Ajout de produits automatique
   - Nouvelles catégories gérées
   - Structure flexible

#### ⚠️ **Points d'Attention**

1. **Préservation des Fonctionnalités**
   - Interface de sélection des variantes
   - Logique des aquarelles (chansons + couleurs)
   - Calculs de prix

2. **Performance**
   - 19 produits au lieu de 4
   - Optimisation du rendu nécessaire

### 8. Conclusion

**Migration partielle nécessaire** car :

- ✅ **Prix majoritairement synchronisés** (CD, Livret, Aquarelles OK)
- ✅ **WooCommerce = Source de vérité** pour tous les produits
- ✅ **Images** avec correspondance quasi-parfaite
- ❌ **Prix bougies** à corriger (8€/12€ → 5€/8€)
- ❌ **Variante livret originale** manquante dans config.js
- ❌ **Structure** à étendre pour 19 produits au lieu de 4

**Actions prioritaires :**
1. **Synchroniser prix bougies** (correction rapide)
2. **Ajouter variante livret originale** (extension simple)
3. **Étendre structure** pour tous les produits WooCommerce

**Temps estimé :** 2-4 heures pour corrections prioritaires.

**Risque :** Très faible - corrections mineures sur base fonctionnelle.