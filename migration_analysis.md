# Migration Analysis: config.js → WooCommerce Products

## Date: 2025-10-09

## Overview
This document analyzes the migration from `config.js` static data to WooCommerce dynamic product data.

---

## Current WooCommerce Products Structure

### Products Available (19 total):
- **CD**: 1 product with gallery (5 images)
- **Livret**: 4 products (1 main + 3 color variants)
- **Bougies**: 2 products (petite, grande)
- **Aquarelles**: 12 products (6 songs × 2 versions each)

---

## Migration Issues Identified

### ✅ ALREADY WORKING
1. **Prices**: Successfully migrated via `overridePricesWithWooCommerce()` function
   - CD: 10€
   - Livret variants: 15€ each
   - Bougies: petite 5€, grande 8€
   - Aquarelles: 3€ each

### ❌ PROBLEMS FOUND

#### 1. **Product Titles Mismatch**
**Issue**: WooCommerce product names are too specific, config.js uses generic titles

| Category | config.js | WooCommerce | Problem |
|----------|-----------|-------------|---------|
| CD | "CD Inter" | "CD Physique" | Different name |
| Livret | "Livret de paroles et poèmes" | Same + variants | OK but variants need handling |
| Bougies | "Bougies" | "Bougie fleurie - Petite/Grande" | Too specific |
| Aquarelles | "Aquarelles" | "Aquarelle - [Song] (couleur/noire)" | Individual products, not grouped |

**Solution**: Use WooCommerce names for cart items, keep config.js titles for section headers

---

#### 2. **Product Descriptions**
**Issue**: WooCommerce descriptions are minimal

| Product | WooCommerce Description | config.js Description |
|---------|------------------------|----------------------|
| CD | "Mini-album de 6 titres. Photographie : Alicia Aubrée. Graphisme : Eva Urbany" | "CD de l'album Inter." |
| Livret | "Carnet relié à la main par Laoriane. Contient les paroles des chansons et une vingtaine de poèmes. Dimensions A6 : 10,5 x 15cm." | "Carnet contenant les paroles et poèmes." + "Disponible en différentes couleurs." |
| Bougies | "Bougie petite (pot de yaourt)" / "Bougie grande (pot de confiture)" | "Bougies parfumées inspirées de l'album." |
| Aquarelles | "Carte postale - version couleur/noire" | "Aquarelles inspirées des chansons de l'album." |

**Solution**: WooCommerce descriptions are MORE detailed! Use them instead of config.js

---

#### 3. **Image URLs**
**Issue**: Images are available in WooCommerce but structure differs

**WooCommerce provides**:
- `image`: Main featured image URL
- `gallery`: Array of gallery image URLs

**config.js structure**:
```javascript
images: [
  { src: "url", alt: "description" }
]
```

**Solution**: Map WooCommerce image/gallery to config.js structure

---

#### 4. **Gallery Images**
**Current state**:
- CD: Has 5 gallery images in WooCommerce ✅
- Livret main: Has 5 gallery images in WooCommerce ✅
- Livret variants: No gallery (only main image) ⚠️
- Bougies: No gallery ⚠️
- Aquarelles: No gallery ⚠️

**Solution**: Use gallery when available, fallback to single image

---

#### 5. **Variant Handling**

##### **Livret (Dropdown Selection)**
**config.js**: 3 variants with keys: "vert-bleu", "violet-fleuri", "bordeaux"
**WooCommerce**: 4 separate products:
- Main: "Livret de paroles et poèmes" (sku: "livret")
- Variant 1: "Livret de paroles et poèmes - Vert Bleu" (sku: "livret-vert-bleu")
- Variant 2: "Livret de paroles et poèmes - Bordeaux" (sku: "livret-bordeaux")
- Variant 3: "Livret de paroles et poèmes - Violet Fleuris" (sku: "livret-violet-fleuris")

**Problem**: Need to group these 4 products into 1 product with 3 variants

**Solution**: 
- Use main product for section display
- Map other 3 products as variants using SKU matching
- Extract variant name from product name (after " - ")

---

##### **Bougies (Radio Selection)**
**config.js**: 2 variants: "petite", "grande"
**WooCommerce**: 2 separate products:
- "Bougie fleurie - Petite" (sku: "bougie-petite", price: 5€)
- "Bougie fleurie - Grande" (sku: "bougie-grande", price: 8€)

**Problem**: Need to group these 2 products into 1 product with 2 size variants

**Solution**:
- Create virtual parent product "Bougies"
- Map both products as variants using SKU matching
- Extract size from product name

---

##### **Aquarelles (Song + Color Selection)**
**config.js**: 6 songs × 2 colors = 12 combinations
**WooCommerce**: 12 separate products with naming pattern:
- "Aquarelle - [Song Name] (couleur)"
- "Aquarelle - [Song Name] (noire)"

**Songs**:
1. C'était la Terre
2. Les fils
3. Regarder le monde de loin
4. Ta lumière
5. Tant qu'y a du vent
6. Tranquille

**Problem**: Need to group 12 products into 6 songs with 2 color options each

**Solution**:
- Parse product names to extract song name and color
- Group by song name
- Create song structure with color variants

---

#### 6. **SKU Mapping**
**Current SKUs in WooCommerce**:
```
cd
livret, livret-vert-bleu, livret-bordeaux, livret-violet-fleuris
bougie-petite, bougie-grande
aquarelle-terre-couleur, aquarelle-terre-noire
aquarelle-fils-couleur, aquarelle-fils-noire
aquarelle-regarder-couleur, aquarelle-regarder-noire
aquarelle-lumiere-couleur, aquarelle-lumiere-noire
aquarelle-vent-couleur, aquarelle-vent-noire
aquarelle-tranquille-couleur, aquarelle-tranquille-noire
```

**Solution**: Use SKU as primary identifier for product matching

---

## Migration Strategy

### Phase 1: ✅ COMPLETED
- Override prices from WooCommerce

### Phase 2: Data Structure Transformation
1. Create product grouping logic:
   - Group livret variants by SKU pattern
   - Group bougie variants by SKU pattern
   - Group aquarelle variants by song name extraction

2. Transform WooCommerce data to match config.js structure:
   - Map images to `{ src, alt }` format
   - Create variant objects with proper keys
   - Preserve gallery images

### Phase 3: Update script.js
1. Create `transformWooCommerceProducts()` function
2. Replace config.js product data with transformed WooCommerce data
3. Keep config.js for:
   - Site configuration (title, currency, footer)
   - Navigation labels
   - Cart texts
   - UI texts (buttons, labels)

### Phase 4: Testing
1. Verify all products display correctly
2. Check variant selection works
3. Verify cart functionality
4. Test lightbox with gallery images

---

## Data to Keep in config.js

```javascript
{
  site: { title, headerTitle, currency, footer },
  navigation: { cd, carnet, aquarelles, bougies },
  cart: { title, empty, checkout },
  texts: { addedToCart, added, plus, minus, delete, defaultProduct }
}
```

## Data to Remove from config.js

```javascript
{
  products: { ... } // All product data will come from WooCommerce
}
```

---

## Implementation Priority

1. **HIGH**: Transform WooCommerce data structure
2. **HIGH**: Update product display logic
3. **MEDIUM**: Handle variant grouping
4. **MEDIUM**: Update image handling
5. **LOW**: Clean up config.js

---

## Expected Benefits

1. ✅ Single source of truth (WooCommerce)
2. ✅ Easy product management via WordPress admin
3. ✅ No code changes needed for product updates
4. ✅ Better descriptions from WooCommerce
5. ✅ Gallery support for CD and Livret

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Product name parsing fails | Products don't display | Add fallback to config.js |
| SKU mismatch | Variants not grouped | Validate SKU patterns |
| Missing images | Broken display | Fallback to config.js images |
| Performance | Slower load | Cache transformed data |

---

## Next Steps

1. Implement `transformWooCommerceProducts()` function
2. Update `generateProductSection()` to use transformed data
3. Test each product category
4. Update config.js to remove product data
5. Document new structure
