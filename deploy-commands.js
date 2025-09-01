/*
 * =================================================================
 * FICHIER : deploy-commands.js
 * -----------------------------------------------------------------
 * Ce script est un outil à usage unique (ou à ré-exécuter
 * seulement quand on modifie les commandes).
 * Son unique but est de se connecter à l'API de Discord et de
 * lui envoyer la liste de toutes les commandes slash (/) que
 * notre bot doit avoir.
 * Discord enregistre alors ces commandes pour notre application.
 *
 * COMMENT L'UTILISER :
 * Exécutez ce fichier manuellement depuis le Shell avec la commande :
 * > node deploy-commands.js
 * =================================================================
 */

// Importe les modules nécessaires de discord.js pour communiquer avec l'API
const { REST, Routes } = require('discord.js');

// --- CONFIGURATION ---
// Remplacez cette valeur par l'ID de votre application (aussi appelé Client ID).
// Vous le trouverez dans le portail développeur Discord > votre app > General Information.
const clientId = '1412053659503689848';

// Récupère le token du bot depuis les secrets de Replit.
const token = process.env.DISCORD_TOKEN;

// --- DÉFINITION DES COMMANDES ---
// C'est ici que nous listons toutes les commandes de notre bot.
// Pour l'instant, nous n'avons qu'une seule commande : /chat.
const commands = [
  {
    name: 'chat',
    description: "Discuter avec l'IA Gemini.",
    // 'options' définit les arguments que la commande peut prendre.
    options: [
        {
            name: 'message', // Le nom de l'argument
            type: 3,        // Le type de l'argument. 3 = String (chaîne de caractères).
            description: "Le message à envoyer à l'IA",
            required: true, // L'utilisateur est obligé de fournir cet argument.
        },
    ],
  },
  // Vous pourriez ajouter d'autres commandes ici à l'avenir.
  // { name: 'ping', description: 'Répond Pong!' },
];

// --- DÉPLOIEMENT ---
// Crée une instance de l'objet REST pour faire des requêtes à l'API de Discord.
const rest = new REST({ version: '10' }).setToken(token);

// C'est une fonction qui s'exécute toute seule (pattern IIFE).
// Elle est déclarée "async" pour pouvoir utiliser "await".
(async () => {
  try {
    console.log('Début du rafraîchissement des commandes (/).');

    // On envoie la liste de nos commandes à l'API de Discord.
    // La méthode 'put' remplace toutes les commandes existantes par la nouvelle liste.
    await rest.put(
      // L'URL de l'API pour les commandes globales de notre application.
      Routes.applicationCommands(clientId),
      // Le corps de la requête, qui contient notre liste de commandes.
      { body: commands },
    );

    console.log('Les commandes (/) ont été rechargées avec succès.');
  } catch (error) {
    // S'il y a une erreur pendant le processus, elle sera affichée ici.
    console.error('Une erreur est survenue lors du déploiement :', error);
  }
})();