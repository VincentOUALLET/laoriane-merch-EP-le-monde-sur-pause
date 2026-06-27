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
      description: `Le monde sur pause est mon premier mini-album de 6 titres, sorti en avril 2025. Les chansons ont été écrites par moi-même, et réalisées en tout petit comité, avec Nathan Cocherie. Ce sont des chansons douces, feutrées, contemplatives, qui parlent de la beauté du monde et de ce qui vit dessus.
Tout s’est fait dans une sphère proche et intime : mon amie Alicia Aubrée est à la photographie, mon amie Eva Urbany est au graphisme, mon amoureux Vincent Ouallet m’accompagne au chant.`,
      "price": 8,
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
      description: `Le livret est un complément aux textes des chansons, on y retrouve les aquarelles réalisées par mon amie Lucie Bigaud, les paroles des chansons, et surtout, des poèmes inédits. Les thématiques tournent autour de celles du disque : la beauté et les failles du monde, notre place la dedans entre travail et oisiveté, ambitions et tranquillités.
Le livret est fait et relié à la main par moi-même. Il est disponible en 3 coloris : bordeaux, vert bleu, violet fleuris.
Dimensions A6 : 10,5 x 15cm`,
      "colorOptions": "Existe en 3 coloris : vert bleu, bordeaux, violet fleuris.",
      "price": 13,
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
      "description": `Pour mettre en image chacune des chansons, j’ai fait appel à mon amie aquarelliste Lucie Bigaud. Les phrases sont écrites avec une police originale créée par Eva Urbany et sont extraites des chansons en question.`,
      "description2": `Dimensions : 10,5 x 15cm (format carte postal, A6)
Au choix : phrase écrite en noire ou en couleur`,
      "price": 2,
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
      "description": `Les bougies sont faites mains avec des mèches en coton et de la cire de soja, dans des pots de récup.
Chaque bougie est unique, les couleurs des fleurs et leurs positionnements sont aléatoires et ne correspondent pas forcément aux photos ci-dessus.
Tailles au choix : petite (type pot de yaourt), grande (type pot de confiture)`,
      "inCarousel": true,
      "componentType": "productSection",
      "variants": {
        "petite": {
          "name": "Petite bougie (type pot de yaourt)",
          "price": 4,
          "image": "PHOTOS MERCH EP/bougie petite.jpg"
        },
        "grande": {
          "name": "Grande bougie (type pot de confiture)",
          "price": 7,
          "image": "PHOTOS MERCH EP/bougie grande.jpg"
        }
      },
      "selectionType": "radio",
      "addToCartText": "Ajouter au panier"
    }
  },
  "emailjs": {
    "publicKey": "KbaSCB2NyC-NoQfNo",
    "serviceId": "service_ko6x8au",
    "templateId": "template_b0cocii"
  }
};