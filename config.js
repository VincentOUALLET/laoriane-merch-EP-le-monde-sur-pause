// Configuration for the merchandise page
const config = {
  "site": {
    "title": "Le monde sur pause - Merchandise",
    "headerTitle": "Le monde sur pause",
    "footer": "&copy; 2025 Le monde sur pause. Tous droits réservés.",
    "currency": "€"
  },
  "navigation": {
    "cd": "CD",
    "carnet": "Carnet",
    "aquarelles": "Aquarelles",
    "bougies": "Bougies"
  },
  "cart": {
    "title": "Panier",
    "total": "Total",
    "checkout": "Passer commande",
    "empty": "0"
  },
  "texts": {
    "defaultProduct": "Produit",
    "added": "Ajouté!",
    "addedToCart": "Ajouté au panier!",
    "minus": "-",
    "plus": "+",
    "delete": "✕"
  },
  "componentTypes": {
    "productSection": {
      "template": "section",
      "classes": ["product"],
      "structure": {
        "title": "h2",
        "images": "div.product-images",
        "details": "div.product-details",
        "addToCart": "button.add-to-cart"
      }
    },
    "imageGallery": {
      "template": "div",
      "classes": ["product-images"],
      "structure": {
        "images": "img.product-image"
      }
    },
    "selectionDropdown": {
      "template": "div",
      "classes": ["color-selection"],
      "structure": {
        "label": "label",
        "select": "select"
      }
    },
    "radioSelection": {
      "template": "div",
      "classes": ["text-color"],
      "structure": {
        "options": "label"
      }
    },
    "priceDisplay": {
      "template": "p",
      "classes": ["price"]
    }
  },
  "products": {
    "cd": {
      "id": "cd",
      "title": "CD Physique",
      "description": "Mini-album de 6 titres. Photographie : Alicia Aubrée. Graphisme : Eva Urbany",
      "price": 10,
      "inCarousel": true,
      "componentType": "productSection",
      "images": [
        {
          "src": "PHOTOS MERCH EP/CD RECTO.jpg",
          "alt": "CD Recto"
        },
        {
          "src": "PHOTOS MERCH EP/CD VERSO.jpg",
          "alt": "CD Verso"
        }
      ],
      "addToCartText": "Ajouter au panier"
    },
    "livret": {
      "id": "livret",
      "title": "Livret de paroles et poèmes",
      "description": "Carnet relié à la main par Laoriane. Contient les paroles des chansons et une vingtaine de poèmes. Dimensions A6 : 10,5 x 15cm.",
      "colorOptions": "Existe en 3 coloris : vert bleu, bordeaux, violet fleuris.",
      "price": 15,
      "inCarousel": true,
      "componentType": "productSection",
      "variants": {
        "vert-bleu": {
          "name": "Vert Bleu",
          "image": "PHOTOS MERCH EP/LIVRET DE PAROLES ET POEMES VERT BLEU.jpg"
        },
        "bordeaux": {
          "name": "Bordeaux",
          "image": "PHOTOS MERCH EP/LIVRET BORDEAU.jpg"
        },
        "violet-fleuris": {
          "name": "Violet Fleuris",
          "image": "PHOTOS MERCH EP/livret paroles et poèmes violet fleuris.jpg"
        }
      },
      "selectionType": "dropdown",
      "selectionLabel": "Choisir la couleur :",
      "addToCartText": "Ajouter au panier"
    },
    "aquarelles": {
      "id": "aquarelles",
      "title": "Aquarelles",
      "description": "Format carte postale, A6. 6 illustrations, une par chanson.",
      "description2": "Disponible avec la phrase écrite en noire, ou la phrase écrite en couleur. Aquarelles : Lucie Bigaud. Graphisme : Eva Urbany",
      "price": 3,
      "inCarousel": true,
      "componentType": "productSection",
      "songs": {
        "C'était la Terre": {
          "images": {
            "couleur": "PHOTOS MERCH EP/Aquarelles _C_était la Terre_ - couleur.jpg",
            "noire": "PHOTOS MERCH EP/Aquarelles _C_était la Terre_ - noire.jpg"
          }
        },
        "Les fils": {
          "images": {
            "couleur": "PHOTOS MERCH EP/Aquarelles _Les fils_ - couleur.jpg",
            "noire": "PHOTOS MERCH EP/Aquarelles _Les fils_ - noire.jpg"
          }
        },
        "Regarder le monde de loin": {
          "images": {
            "couleur": "PHOTOS MERCH EP/Aquarelles _Regarder le monde de loin_ - couleur.jpg",
            "noire": "PHOTOS MERCH EP/Aquarelles _Regarder le monde de loin_ - noire.jpg"
          }
        },
        "Ta lumière": {
          "images": {
            "couleur": "PHOTOS MERCH EP/Aquarelles _Ta lumière_ - couleur.jpg",
            "noire": "PHOTOS MERCH EP/Aquarelles _Ta lumière_ - noire.jpg"
          }
        },
        "Tant qu'y a du vent": {
          "images": {
            "couleur": "PHOTOS MERCH EP/Aquarelles _Tant qu_y a du vent_ - couleur.jpg",
            "noire": "PHOTOS MERCH EP/Aquarelles _Tant qu_y a du vent_ - noire.jpg"
          }
        },
        "Tranquille": {
          "images": {
            "couleur": "PHOTOS MERCH EP/Aquarelles _Tranquille_ - couleur.jpg",
            "noire": "PHOTOS MERCH EP/Aquarelles _Tranquille_ - noire.jpg"
          }
        }
      },
      "selectionType": "radio",
      "selectionLabel": "Choisir une chanson :",
      "colorOption": "Phrase en couleur",
      "colorOption2": "Phrase en noire",
      "addToCartText": "Ajouter au panier"
    },
    "bougies": {
      "id": "bougies",
      "title": "Bougies fleuries",
      "description": "Faites main. Bougies réalisées dans des pots de récup. Cire de soja et fleurs séchées au dessus. Mèche en coton. Chaque bougie est unique et les photos en sont un exemple. Deux tailles : petite (pot de yaourt), grande (pot de confiture)",
      "inCarousel": true,
      "componentType": "productSection",
      "variants": {
        "petite": {
          "name": "Petite bougie",
          "price": 5,
          "image": "PHOTOS MERCH EP/bougie petite.jpg"
        },
        "grande": {
          "name": "Grande bougie",
          "price": 8,
          "image": "PHOTOS MERCH EP/bougie grande.jpg"
        }
      },
      "selectionType": "radio",
      "addToCartText": "Ajouter au panier"
    }
  }
};