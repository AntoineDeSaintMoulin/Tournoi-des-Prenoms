import { BabyName } from '../types';

export const INITIAL_NAMES: BabyName[] = [
  // Top Seeds & Classics
  { id: '1', name: 'Jules', gender: 'boy', origin: 'Latin', meaning: 'Appartenant à la noble famille romaine de Iule', style: 'Classique', popularity: 98, syllables: 1, parentFavorite: true, seed: 1 },
  { id: '2', name: 'Éléonore', gender: 'girl', origin: 'Grec / Occitan', meaning: 'Compassion, éclat du soleil ou divine lumière', style: 'Rétro Poétique', popularity: 92, syllables: 4, parentFavorite: true, seed: 2 },
  { id: '3', name: 'Gabriel', gender: 'boy', origin: 'Hébreu', meaning: 'Force de Dieu, héros de la lumière', style: 'Incontournable', popularity: 99, syllables: 3, seed: 3 },
  { id: '4', name: 'Jade', gender: 'girl', origin: 'Espagnol / Pierre', meaning: 'Pierre fine symbolisant la sagesse et la pureté', style: 'Moderne Court', popularity: 97, seed: 4 },
  { id: '5', name: 'Léo', gender: 'boy', origin: 'Latin', meaning: 'Lion, symbole de courage et de force', style: 'Court Chic', popularity: 96, seed: 5 },
  { id: '6', name: 'Louise', gender: 'girl', origin: 'Germanique', meaning: 'Illustre au combat, noble et glorieuse', style: 'Classique Intemporel', popularity: 96, seed: 6 },
  { id: '7', name: 'Camille', gender: 'unisex', origin: 'Latin', meaning: 'Jeune servante du temple sacrée', style: 'Intemporel Mixte', popularity: 91, seed: 7 },
  { id: '8', name: 'Raphaël', gender: 'boy', origin: 'Hébreu', meaning: 'Dieu a guéri, ange gardien', style: 'Classique', popularity: 95, seed: 8 },

  // Seed 9 to 16
  { id: '9', name: 'Ambre', gender: 'girl', origin: 'Arabe / Grec', meaning: 'Pierre précieuse ambrée, immortelle', style: 'Nature Chic', popularity: 94, seed: 9 },
  { id: '10', name: 'Louis', gender: 'boy', origin: 'Germanique', meaning: 'Prince célèbre et glorieux guerrier', style: 'Royal', popularity: 93, seed: 10 },
  { id: '11', name: 'Chloé', gender: 'girl', origin: 'Grec', meaning: 'Jeune pousse, verdure printanière', style: 'Frais & Doux', popularity: 90, seed: 11 },
  { id: '12', name: 'Arthur', gender: 'boy', origin: 'Celtique', meaning: 'Ours fort et roi légendaire de Bretagne', style: 'Légendaire', popularity: 94, seed: 12 },
  { id: '13', name: 'Charlie', gender: 'unisex', origin: 'Germanique', meaning: 'Homme fort et libre', style: 'Moderne Mixte', popularity: 89, seed: 13 },
  { id: '14', name: 'Rose', gender: 'girl', origin: 'Latin', meaning: 'Fleur d’amour et d’élégance', style: 'Nature Rétro', popularity: 91, seed: 14 },
  { id: '15', name: 'Maël', gender: 'boy', origin: 'Celtique / Breton', meaning: 'Prince, chef éclairé', style: 'Breton Doux', popularity: 92, seed: 15 },
  { id: '16', name: 'Mia', gender: 'girl', origin: 'Scandinave / Hébreu', meaning: 'Celle qui est aimée, goutte de mer', style: 'International Short', popularity: 88, seed: 16 },

  // Seed 17 to 24
  { id: '17', name: 'Eden', gender: 'unisex', origin: 'Hébreu', meaning: 'Jardin des délices, paradis sur terre', style: 'Moderne Poétique', popularity: 89, seed: 17 },
  { id: '18', name: 'Lucas', gender: 'boy', origin: 'Grec', meaning: 'Apporteur de lumière, brillant', style: 'Classique', popularity: 91, seed: 18 },
  { id: '19', name: 'Agathe', gender: 'girl', origin: 'Grec', meaning: 'Bonté, gentillesse et noblesse d’âme', style: 'Rétro Chic', popularity: 86, seed: 19 },
  { id: '20', name: 'Hugo', gender: 'boy', origin: 'Germanique', meaning: 'Esprit brillant, intelligence et pensée', style: 'Classique Short', popularity: 90, seed: 20 },
  { id: '21', name: 'Alix', gender: 'unisex', origin: 'Germanique', meaning: 'De noble lignée et de grande valeur', style: 'Rétro Mixte', popularity: 85, seed: 21 },
  { id: '22', name: 'Victoire', gender: 'girl', origin: 'Latin', meaning: 'Victorieuse, triomphe et accomplissement', style: 'Majestueux', popularity: 87, parentFavorite: true, seed: 22 },
  { id: '23', name: 'Sacha', gender: 'unisex', origin: 'Grec', meaning: 'Protecteur de l’humanité', style: 'Moderne Doux', popularity: 88, seed: 23 },
  { id: '24', name: 'Noah', gender: 'boy', origin: 'Hébreu', meaning: 'Repos, apaisement et sérénité', style: 'International', popularity: 93, seed: 24 },

  // Seed 25 to 32
  { id: '25', name: 'Lina', gender: 'girl', origin: 'Arabe / Grec', meaning: 'Tendre, souple ou cascade de lumière', style: 'Mélodieux', popularity: 89, seed: 25 },
  { id: '26', name: 'Paul', gender: 'boy', origin: 'Latin', meaning: 'Humble, petit et sage', style: 'Classique Intemporel', popularity: 87, seed: 26 },
  { id: '27', name: 'Iris', gender: 'girl', origin: 'Grec', meaning: 'Messagère des dieux, arc-en-ciel de couleurs', style: 'Mythologique Nature', popularity: 88, seed: 27 },
  { id: '28', name: 'Léon', gender: 'boy', origin: 'Latin', meaning: 'Audacieux comme le lion', style: 'Rétro Tendance', popularity: 89, seed: 28 },
  { id: '29', name: 'Sora', gender: 'unisex', origin: 'Japonais', meaning: 'Le ciel bleu, vaste et libre', style: 'Escale du Monde', popularity: 72, seed: 29 },
  { id: '30', name: 'Zélie', gender: 'girl', origin: 'Grec', meaning: 'Rivaliser avec zèle et passion', style: 'Pétillant', popularity: 83, seed: 30 },
  { id: '31', name: 'Augustine', gender: 'girl', origin: 'Latin', meaning: 'Vénérable, majestueuse et sacrée', style: 'Rétro Poétique', popularity: 80, seed: 31 },
  { id: '32', name: 'Gabin', gender: 'boy', origin: 'Latin', meaning: 'Originaire de Gabies, ville historique d’Italie', style: 'Terroir & Charme', popularity: 88, seed: 32 },

  // Seed 33 to 40
  { id: '33', name: 'Céleste', gender: 'unisex', origin: 'Latin', meaning: 'Venu des cieux, céleste et angélique', style: 'Poétique', popularity: 82, seed: 33 },
  { id: '34', name: 'Milo', gender: 'boy', origin: 'Slave / Germanique', meaning: 'Bienveillant, pacifique et gracieux', style: 'Moderne Court', popularity: 84, seed: 34 },
  { id: '35', name: 'Margaux', gender: 'girl', origin: 'Grec', meaning: 'Perle rare et précieuse', style: 'Classique Sud-Ouest', popularity: 85, seed: 35 },
  { id: '36', name: 'Marceau', gender: 'boy', origin: 'Latin', meaning: 'Dédié à Mars, courageux et intrépide', style: 'Rétro Tendance', popularity: 87, seed: 36 },
  { id: '37', name: 'Andrea', gender: 'unisex', origin: 'Grec', meaning: 'Force et vaillance', style: 'Italien Mixte', popularity: 81, seed: 37 },
  { id: '38', name: 'Romy', gender: 'girl', origin: 'Latin / Germanique', meaning: 'Rose de la mer ou reine aimée', style: 'Cinéma & Charme', popularity: 91, seed: 38 },
  { id: '39', name: 'Gaspard', gender: 'boy', origin: 'Persan', meaning: 'Gardien des trésors précieux', style: 'Rétro Chic', popularity: 86, seed: 39 },
  { id: '40', name: 'Louna', gender: 'girl', origin: 'Hawaien / Latin', meaning: 'Lune étincelante et bienveillante', style: 'Mélodieux', popularity: 82, seed: 40 },

  // Seed 41 to 48
  { id: '41', name: 'Soren', gender: 'unisex', origin: 'Scandinave', meaning: 'Sévère mais juste, guidé par la vérité', style: 'Nordique', popularity: 76, seed: 41 },
  { id: '42', name: 'Basile', gender: 'boy', origin: 'Grec', meaning: 'Royal et souverain', style: 'Rétro Gourmand', popularity: 81, seed: 42 },
  { id: '43', name: 'Apolline', gender: 'girl', origin: 'Grec', meaning: 'Inspirée par Apollon, dieu de la lumière et des arts', style: 'Artistic Chic', popularity: 82, seed: 43 },
  { id: '44', name: 'Noé', gender: 'boy', origin: 'Hébreu', meaning: 'Sérénité, consolateur', style: 'Doux Short', popularity: 89, seed: 44 },
  { id: '45', name: 'Maxence', gender: 'unisex', origin: 'Latin', meaning: 'Le plus grand, l’excellent', style: 'Élégant', popularity: 84, seed: 45 },
  { id: '46', name: 'Livia', gender: 'girl', origin: 'Latin', meaning: 'Famille romaine antique, olivier de paix', style: 'Solaire', popularity: 85, seed: 46 },
  { id: '47', name: 'Oscar', gender: 'boy', origin: 'Anglo-Saxon / Celtique', meaning: 'Guerrier divin guidé par la lance', style: 'Rétro British', popularity: 83, seed: 47 },
  { id: '48', name: 'Inès', gender: 'girl', origin: 'Grec / Espagnol', meaning: 'Chaste, pure et bienveillante', style: 'Méditerranéen', popularity: 87, seed: 48 },

  // Seed 49 to 56
  { id: '49', name: 'Billie', gender: 'unisex', origin: 'Germanique / Anglais', meaning: 'Protectrice résolue', style: 'Pop & Vintage', popularity: 78, seed: 49 },
  { id: '50', name: 'Achille', gender: 'boy', origin: 'Grec', meaning: 'Héros de l’Iliade, rapide et invincible', style: 'Mythologique', popularity: 79, seed: 50 },
  { id: '51', name: 'Laly', gender: 'girl', origin: 'Latin', meaning: 'Belle parole, douce mélodie', style: 'Court Doux', popularity: 75, seed: 51 },
  { id: '52', name: 'Timothée', gender: 'boy', origin: 'Grec', meaning: 'Qui honore Dieu avec respect', style: 'Doux & Poétique', popularity: 80, seed: 52 },
  { id: '53', name: 'Lou', gender: 'unisex', origin: 'Germanique', meaning: 'Lumière et gloire illustre', style: 'Minimaliste', popularity: 86, seed: 53 },
  { id: '54', name: 'Suzanne', gender: 'girl', origin: 'Hébreu', meaning: 'Lys blanc, fleur de grâce', style: 'Rétro Vintage', popularity: 77, seed: 54 },
  { id: '55', name: 'Léandre', gender: 'boy', origin: 'Grec', meaning: 'Homme-lion, courageux et passionné', style: 'Romantique', popularity: 81, seed: 55 },
  { id: '56', name: 'Colette', gender: 'girl', origin: 'Grec', meaning: 'Victoire du peuple', style: 'Littéraire Rétro', popularity: 71, seed: 56 },

  // Seed 57 to 64
  { id: '57', name: 'Noa', gender: 'unisex', origin: 'Hébreu', meaning: 'Mouvement, repos et liberté', style: 'Moderne', popularity: 83, seed: 57 },
  { id: '58', name: 'Anatole', gender: 'boy', origin: 'Grec', meaning: 'Aurore, lever du soleil à l’Est', style: 'Poétique Rétro', popularity: 73, seed: 58 },
  { id: '59', name: 'Olympe', gender: 'girl', origin: 'Grec', meaning: 'Demeure des dieux, haut sommet vertigineux', style: 'Mythologique Chic', popularity: 76, seed: 59 },
  { id: '60', name: 'Symphorien', gender: 'boy', origin: 'Grec', meaning: 'Accompagné de bonne fortune', style: 'Insolite Rare', popularity: 35, seed: 60 },
  { id: '61', name: 'Noémie', gender: 'girl', origin: 'Hébreu', meaning: 'Agréable, douce et charmante', style: 'Classique Doux', popularity: 81, seed: 61 },
  { id: '62', name: 'Émile', gender: 'boy', origin: 'Latin', meaning: 'Rival passionné, travailleur assidu', style: 'Rétro Gourmand', popularity: 79, seed: 62 },
  { id: '63', name: 'Théodore', gender: 'boy', origin: 'Grec', meaning: 'Cadeau de Dieu, trésor de vie', style: 'Royal & Poétique', popularity: 82, seed: 63 },
  { id: '64', name: 'Zéphir', gender: 'unisex', origin: 'Grec', meaning: 'Le vent doux du printemps', style: 'Nature Rareté', popularity: 65, seed: 64 },
];
