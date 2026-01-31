/**
 * CONFIGURATION SAINT-VALENTIN ENTRE POTES
 * Personnalisez tout le contenu ici !
 */
export const CONFIG = {
  // Informations personnelles - PERSONNALISEZ CES CHAMPS !
  recipientName: 'les ami.e.s',
  senderName: 'votre admirateur secret',
  dateSuggestion: '14 février 2026',
  locationSuggestion: 'chez Servane et Katia (?)',
  
  // Témoignages drôles pour le slider
  friendQuotes: [
    { text: '"Les meilleurs moments sont ceux passés avec des gens aussi barrés que nous"', author: 'La Sagesse Populaire' },
    { text: '"On n\'a pas besoin de couple pour célébrer l\'amour qu\'on a pour le celery rave"', author: 'Un Philosophe Moderne' },
    { text: '"On va construire une fusée de 11 mètres !"', author: 'Source: Enzo Busson' },
    { text: '"L\'amitié c\'est comme le wifi, on ne le voit pas mais on sait qu\'il est là"', author: 'Un Geek Poète' },
    { text: '"Pourquoi chercher l\'âme sœur quand on a déjà trouvé sa squad ?"', author: 'ChatGPT' }
  ],
  
  // Messages système pour le compte à rebours (faux messages de chargement)
  systemLogs: [
    'Initialisation du protocole amitié v2.14...',
    'Calibrage des capteurs de bonne humeur...',
    'Chargement de la base de données de vannes...',
    'Vérification de la compatibilité apéro...',
    'Réchauffement des fous rires...',
    'Préparation de la révélation dramatique...'
  ],
  
  // Messages quand le bouton Non esquive
  noButtonMessages: [
    'Le bouton semble avoir d\'autres plans... 🏃',
    'Oups ! Il a encore bougé !',
    'Ce bouton a des problèmes d\'engagement',
    'On joue à chat maintenant ?',
    'Le bouton est un peu timide',
    'Il ne fuit pas, il se repositionne stratégiquement',
    'T\'as vraiment cru que ça marcherait ? 😏',
    'Essaie encore, c\'est drôle à regarder'
  ],
  
  // Progression du texte du bouton Non
  noButtonLabels: ['Non', 'Nan', 'Jamais', 'Sérieux ?', 'Tu abandonnes pas ?', '😤'],
  
  // Questions du quiz
  quizQuestions: [
    {
      question: 'Choisis ton activité de soirée idéale :',
      options: [
        { emoji: '🎲', text: 'Soirée jeux de société' },
        { emoji: '🎬', text: 'Marathon films/séries' },
        { emoji: '🍻', text: 'Bar/Restau avec les potes' },
        { emoji: '🎤', text: 'Karaoké (même si on chante mal)' }
      ]
    },
    {
      question: 'Ton style de communication :',
      options: [
        { emoji: '😂', text: 'Spammer de memes' },
        { emoji: '🗣️', text: 'Vocaux de 3 minutes' },
        { emoji: '📍', text: 'Proposer des plans improbables' },
        { emoji: '👻', text: 'Lire sans répondre puis revenir 3j après' }
      ]
    },
    {
      question: 'Le snack ultime pour une soirée :',
      options: [
        { emoji: '🍕', text: 'Pizza (classique indémodable)' },
        { emoji: '🧀', text: 'Plateau fromage/charcuterie' },
        { emoji: '🍿', text: 'Popcorn et bonbons' },
        { emoji: '🌮', text: 'Tacos/burritos' }
      ]
    },
    {
      question: 'Ta qualité n°1 en tant que pote :',
      options: [
        { emoji: '🎉', text: 'Je mets l\'ambiance' },
        { emoji: '👂', text: 'Je sais écouter' },
        { emoji: '🤡', text: 'Je fais rire (exprès ou pas)' },
        { emoji: '🛋️', text: 'Mon canap est toujours dispo' }
      ]
    },
    {
      question: 'La Saint-Valentin pour toi c\'est :',
      options: [
        { emoji: '🤷', text: 'Une excuse pour manger du chocolat' },
        { emoji: '🥳', text: 'Une soirée entre amoureux' },
        { emoji: '💅', text: 'L\'occasion de se faire plaisir' },
        { emoji: '🎊', text: 'Tout ça à la fois !' }
      ]
    }
  ],
  
  // Catégories de résultats du quiz pour le faux graphique
  quizResultCategories: [
    { label: 'Vibes', value: 98 },
    { label: 'Niveau Pote', value: 100 },
    { label: 'Synchro Humour', value: 97 },
    { label: 'Facteur Fiesta', value: 99 },
    { label: 'Dispo Apéro', value: 95 }
  ],
  
  // Clauses des Termes et Conditions
  termsAndConditions: [
    {
      title: 'Article 1 : Dispositions Générales',
      clauses: [
        '1.1 En continuant, tu reconnais que la team est vraiment géniale.',
        '1.2 Cet accord est contraignant pour toutes les soirées et apéros à venir.',
        '1.3 Les participant.e.s se réservent le droit d\'être iconiques à tout moment.'
      ]
    },
    {
      title: 'Article 2 : Exigences des Soirées',
      clauses: [
        '2.1 Au moins trois (3) vrais fous rires sont requis par soirée.',
        '2.2 Raconter des potins est fortement encouragé.',
        '2.3 Les silences doivent être remplis de regards complices.'
      ]
    },
    {
      title: 'Article 3 : Dispositions Alimentaires',
      clauses: [
        '3.1 Le dessert est toujours acceptable, même à 2h du mat.',
        '3.2 "Partager" signifie commander plus pour tout le monde.',
        '3.3 Les runs kebab/tacos à des heures déraisonnables sont soutenues.'
      ]
    },
    {
      title: 'Article 4 : Clause du Soutien',
      clauses: [
        '4.1 On trash-talk les gens ensemble (c\'est la règle).',
        '4.2 On hype les ami.e.s même pour les trucs les plus random.',
        '4.3 Les "t\'es trop beau/belle" sont illimités et obligatoires.'
      ]
    },
    {
      title: 'Article 5 : Activités',
      clauses: [
        '5.1 Les choix de films seront décidés par débat animé.',
        '5.2 Rester en pyjama toute la journée est une activité valide.',
        '5.3 Les sessions vent/ragots comptent comme du self-care.'
      ]
    },
    {
      title: 'Article 6 : Dispositions Finales',
      clauses: [
        '6.1 Cette amitié est renouvelée automatiquement chaque année.',
        '6.2 Aucun remboursement sur les souvenirs inoubliables.',
        '6.3 En acceptant, tu acceptes de passer un moment mémorable. 🎉'
      ]
    }
  ],
  
  // Résultats de l'analyse IA
  aiAnalysisResults: [
    { label: 'Probabilité de fou rire', value: 'Très élevée' },
    { label: 'Compatibilité apéro', value: 'Niveau expert' },
    { label: 'Score best friend', value: '11/10' },
    { label: 'Indice de fiabilité', value: 'Maximum' },
    { label: 'Potentiel de fun', value: 'Illimité' },
    { label: 'Niveau complicité', value: '🤝🤝🤝' }
  ],
  
  // Message sincère final
  sincereMessage: `Ok, blagues à part...

Je suis vraiment content de vous avoir dans ma vie.

La Saint-Valentin c'est aussi l'occasion de célébrer les gens qu'on aime, et vous en faites partie. Alors on se fait une super celery rave party ? 🎉`,
  
  // Options de dates alternatives
  alternativeDates: [
    'Le 15 février (les chocolats sont moins chers !)',
    'Ce week-end (pourquoi attendre ?)',
    'Quand tout le monde est dispo 🎊'
  ],
  
  // Template du message à copier
  copyMessageTemplate: (config) => 
    `Oui ! Je suis de la partie pour la Saint-Valentin celery rave party ! 🎉 RDV le ${config.dateSuggestion} !`
};
