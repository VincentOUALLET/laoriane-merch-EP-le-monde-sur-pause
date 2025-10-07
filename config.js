// Site configuration
const THEME_URI = window.THEME_URI || '';
const config = {
  site: {
    title: "Laoriane - EP - Le Monde Sur Pause",
    headerTitle: "Le monde sur pause",
    currency: "€",
    footer: "&copy; 2025 Le monde sur pause. Tous droits réservés."
  },
  navigation: {
    cd: "CD",
    carnet: "Carnet",
    aquarelles: "Aquarelles",
    bougies: "Bougies"
  },
  cart: {
    title: "Panier",
    empty: "0",
    checkout: "Passer commande"
  },
  texts: {
    addedToCart: "Ajouté !",
    added: "Ajouté au panier !",
    plus: "+",
    minus: "-",
    delete: "×",
    defaultProduct: "Produit"
  },
  products: {
    cd: {
      id: "cd",
      title: "CD Inter",
      description: "CD de l'album Inter.",
      price: 10,
      addToCartText: "Ajouter au panier",
      images: [
        {
          src: THEME_URI + "/photos_merch_ep/cd_inter.jpg",
          alt: "CD Inter recto"
        },
        {
          src: THEME_URI + "/photos_merch_ep/cd_inter_verso.jpg",
          alt: "CD Inter verso"
        }
      ],
      inCarousel: true
    },
    livret: {
      id: "livret",
      title: "Livret de paroles et poèmes",
      description: "Carnet contenant les paroles et poèmes.",
      description2: "Disponible en différentes couleurs.",
      price: 15,
      selectionType: "dropdown",
      selectionLabel: "Choisir la couleur",
      addToCartText: "Ajouter au panier",
      colorOptions: "Choisissez la couleur de votre livret.",
      variants: {
        "vert-bleu": {
          name: "Vert et bleu",
          price: 15,
          image: THEME_URI + "/photos_merch_ep/livret_de_paroles_et_poemes_vert_bleu.jpg"
        },
        "violet-fleuri": {
          name: "Violet fleuri",
          price: 15,
          image: THEME_URI + "/photos_merch_ep/livret_paroles_et_poemes_violet_fleuris.jpg"
        },
        "bordeaux": {
          name: "Bordeaux",
          price: 15,
          image: THEME_URI + "/photos_merch_ep/livret_bordeau.jpg"
        }
      },
      inCarousel: true
    },
    aquarelles: {
      id: "aquarelles",
      title: "Aquarelles",
      description: "Aquarelles inspirées des chansons de l'album.",
      selectionLabel: "Choisir une chanson",
      addToCartText: "Ajouter au panier",
      price: 3,
      colorOption: "Couleur",
      colorOption2: "Noire",
      songs: {
        "C’était la Terre": {
          images: {
            couleur: THEME_URI + "/photos_merch_ep/aquarelles__c_etait_la_terre__couleur.jpg",
            noire: THEME_URI + "/photos_merch_ep/aquarelles__c_etait_la_terre__noire.jpg"
          }
        },
        "Les fils": {
          images: {
            couleur: THEME_URI + "/photos_merch_ep/aquarelles__les_fils__couleur.jpg",
            noire: THEME_URI + "/photos_merch_ep/aquarelles__les_fils__noire.jpg"
          }
        },
        "Regarder le monde de loin": {
          images: {
            couleur: THEME_URI + "/photos_merch_ep/aquarelles__regarder_le_monde_de_loin__couleur.jpg",
            noire: THEME_URI + "/photos_merch_ep/aquarelles__regarder_le_monde_de_loin__noire.jpg"
          }
        },
        "Ta lumière": {
          images: {
            couleur: THEME_URI + "/photos_merch_ep/aquarelles__ta_lumiere__couleur.jpg",
            noire: THEME_URI + "/photos_merch_ep/aquarelles__ta_lumiere__noire.jpg"
          }
        },
        "Tant qu’y a du vent": {
          images: {
            couleur: THEME_URI + "/photos_merch_ep/aquarelles__tant_qu_y_a_du_vent__couleur.jpg",
            noire: THEME_URI + "/photos_merch_ep/aquarelles__tant_qu_y_a_du_vent__noire.jpg"
          }
        },
        "Tranquille": {
          images: {
            couleur: THEME_URI + "/photos_merch_ep/aquarelles__tranquille__couleur.jpg",
            noire: THEME_URI + "/photos_merch_ep/aquarelles__tranquille__noire.jpg"
          }
        }
      },
      inCarousel: true
    },
    bougies: {
      id: "bougies",
      title: "Bougies",
      description: "Bougies parfumées inspirées de l'album.",
      price: 8, // Default petite
      addToCartText: "Ajouter au panier",
      variants: {
        petite: {
          name: "Petite bougie",
          price: 8,
          image: THEME_URI + "/photos_merch_ep/bougie_petite.jpg"
        },
        grande: {
          name: "Grande bougie",
          price: 12,
          image: THEME_URI + "/photos_merch_ep/bougie_grande.jpg"
        }
      },
      inCarousel: true
    }
  }
};

window.config = config;