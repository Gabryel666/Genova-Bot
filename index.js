/*
 * =================================================================
 * FICHIER : index.js
 * -----------------------------------------------------------------
 * RÔLE :
 * C'est le fichier principal et le point d'entrée de notre bot.
 * Il est responsable de :
 *   1. Se connecter à Discord.
 *   2. Écouter les événements (comme les nouvelles interactions).
 *   3. Déléguer la logique de réponse à des modules spécialisés.
 * Ce fichier doit tourner en permanence pour que le bot reste en ligne.
 *
 * COMMENT L'UTILISER :
 * Exécutez ce fichier avec le bouton "Run" de Replit.
 * =================================================================
 */

// --- IMPORTS ---
// Importe les classes nécessaires depuis la bibliothèque discord.js.
const { Client, GatewayIntentBits } = require('discord.js');
// Importe le client Groq.
const Groq = require('groq-sdk');
// On importe notre module de gestion des réponses longues.
const { sendLongReply } = require('./replyManager.js');

// --- INITIALISATION ---
// Crée une nouvelle instance du bot Discord.
const client = new Client({
  // Les "intents" sont les permissions dont notre bot a besoin pour fonctionner.
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// Récupère les clés secrètes depuis l'environnement de Replit.
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
// MODIFIÉ : On récupère maintenant aussi le nom du modèle depuis les secrets.
const GROQ_MODEL_NAME = process.env.GROQ_MODEL_NAME;


// Initialise le client de l'API Groq avec notre clé.
const groq = new Groq({ apiKey: GROQ_API_KEY });


// --- ÉVÉNEMENTS DISCORD ---

// 1. Événement 'clientReady'
// Cet événement se déclenche une seule fois, lorsque le bot a réussi à se connecter.
client.once('clientReady', () => {
  console.log(`Connexion réussie ! Le bot est en ligne en tant que ${client.user.tag}.`);
  // On affiche le modèle utilisé au démarrage pour faciliter le débogage.
  console.log(`Modèle Groq utilisé : ${GROQ_MODEL_NAME}`);
});


// 2. Événement 'interactionCreate'
// Cet événement se déclenche à chaque fois qu'un utilisateur interagit avec le bot.
client.on('interactionCreate', async interaction => {
  // On vérifie que l'interaction est bien une commande slash.
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'chat') {
    // On met en attente la réponse pour que Discord ne considère pas le bot comme inactif.
    await interaction.deferReply();
    const message = interaction.options.getString('message');

    try {
      // On appelle l'API de Groq.
      const chatCompletion = await groq.chat.completions.create({
        // MODIFIÉ : On utilise la variable qui contient le nom du modèle lu depuis les secrets.
        // C'est beaucoup plus flexible !
        model: GROQ_MODEL_NAME,
        // Groq attend un tableau de messages pour simuler une conversation.
        messages: [
          {
            role: "user",     // C'est le message de l'utilisateur.
            content: message, // Le contenu du message.
          },
        ],
      });

      // On récupère le texte de la réponse.
      const text = chatCompletion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";

      // On utilise notre module externe pour envoyer la réponse, qu'elle soit longue ou courte.
      await sendLongReply(interaction, text);

    } catch (error) {
      console.error("Erreur lors de la communication avec Groq ou Discord:", error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply("Oups ! Une erreur s'est produite avec l'IA de Groq.");
      }
    }
  }
});


// --- CONNEXION ---
// Lance la connexion du bot à Discord en utilisant le token.
client.login(DISCORD_TOKEN).catch(error => {
  console.error("ERREUR LORS DE LA CONNEXION : Le token est-il valide ?");
  console.error(error);
});