/*
 * =================================================================
 * FICHIER : replyManager.js
 * -----------------------------------------------------------------
 * RÔLE :
 * Ce module est un utilitaire spécialisé dans la gestion des réponses
 * à envoyer sur Discord.
 * Sa fonction principale est de prendre un texte, de le découper
 * s'il dépasse la limite de caractères de Discord, et de l'envoyer
 * en utilisant la méthode appropriée (editReply, followUp).
 * =================================================================
 */

/**
 * Découpe un texte en plusieurs morceaux de taille maximale définie.
 * C'est une fonction "privée" du module, elle n'est pas exportée.
 * @param {string} text Le texte à découper.
 * @param {number} [maxLength=2000] La longueur maximale de chaque morceau.
 * @returns {string[]} Un tableau contenant les morceaux de texte.
 */
function splitMessage(text, maxLength = 2000) {
  const chunks = [];
  if (!text) return chunks; // S'il n'y a pas de texte, on retourne un tableau vide.

  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.substring(i, i + maxLength));
  }
  return chunks;
}

/**
 * Gère l'envoi d'une réponse à une interaction, en la découpant si nécessaire.
 * C'est la fonction principale que nous exporterons et utiliserons dans index.js.
 * @param {import('discord.js').CommandInteraction} interaction L'objet d'interaction Discord.
 * @param {string} text Le texte complet de la réponse à envoyer.
 */
async function sendLongReply(interaction, text) {
  // On s'assure que l'interaction est valide et qu'on peut y répondre.
  if (!interaction || !interaction.deferred) {
    console.error("Tentative de réponse à une interaction invalide ou non différée.");
    return;
  }

  const messageChunks = splitMessage(text, 2000);

  // S'il n'y a aucun morceau (texte vide), on envoie un message par défaut.
  if (messageChunks.length === 0) {
    await interaction.editReply("L'IA n'a fourni aucune réponse.");
    return;
  }

  // On envoie le premier morceau avec editReply pour valider l'interaction initiale.
  await interaction.editReply(messageChunks[0]);

  // S'il y a d'autres morceaux, on les envoie avec followUp.
  // On commence la boucle à 1, car le morceau 0 a déjà été envoyé.
  for (let i = 1; i < messageChunks.length; i++) {
    await interaction.followUp(messageChunks[i]);
  }
}

// On exporte notre fonction principale pour qu'elle puisse être utilisée
// par d'autres fichiers (notamment index.js).
module.exports = {
  sendLongReply,
};