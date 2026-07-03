# 🎫 Ticket Bot

Un bot Discord complet pour gérer les tickets de support, inspiré de DraftBot. Créez, gérez et fermez des tickets facilement sur votre serveur Discord !

## 📋 Fonctionnalités

- ✅ **Création de tickets** via boutons et commandes slash
- ✅ **Catégorisation** des tickets (Support, Signalement, Appel, Partenariat)
- ✅ **Gestion des utilisateurs** - Ajouter/retirer des utilisateurs aux tickets
- ✅ **Fermeture sécurisée** des tickets avec confirmation
- ✅ **Système de logs** complètes
- ✅ **Panneau de contrôle** avec boutons
- ✅ **Modal personnalisé** pour création de tickets détaillée
- ✅ **Permissions gérées** automatiquement

## 🚀 Installation

### Prérequis
- **Node.js** 18.0.0 ou supérieur
- **npm** ou **yarn**
- Un serveur Discord
- Un bot Discord configuré sur [Discord Developer Portal](https://discord.com/developers/applications)

### Étapes d'installation

1. **Clone le repository**
```bash
git clone https://github.com/Narutsuu/ticket-bot.git
cd ticket-bot
```

2. **Installe les dépendances**
```bash
npm install
```

3. **Configure les variables d'environnement**
```bash
cp .env.example .env
```

4. **Remplis le fichier `.env`**
```env
DISCORD_TOKEN=ton_token_bot_ici
CLIENT_ID=ton_client_id_ici
GUILD_ID=ton_guild_id_ici
DATABASE_URL=mongodb://localhost:27017/ticket-bot
BOT_PREFIX=!
BOT_OWNER_ID=ton_user_id_ici
```

5. **Lance le bot**
```bash
npm start
```

Pour le développement avec rechargement automatique :
```bash
npm run dev
```

## 📝 Commandes

### `/ticket setup`
Configure le panneau de création de tickets dans le canal actuel.
```
Utilisation: /ticket setup
```

### `/ticket create`
Crée un nouveau ticket avec une catégorie spécifique.
```
Utilisation: /ticket create <category> <subject>
```

### `/ticket close`
Ferme le ticket actuel (avec confirmation).
```
Utilisation: /ticket close [transcript: true/false]
```

### `/ticket add`
Ajoute un utilisateur au ticket.
```
Utilisation: /ticket add @user
```

### `/ticket remove`
Retire un utilisateur du ticket.
```
Utilisation: /ticket remove @user
```

### `/ticket help`
Affiche l'aide des commandes de tickets.
```
Utilisation: /ticket help
```

## 🎨 Catégories de tickets

Par défaut, le bot inclut 4 catégories :

| Emoji | Nom | Description |
|-------|------|-------------|
| 🆘 | Support | Demande d'aide générale |
| 📋 | Signalement | Signaler un problème/utilisateur |
| ⚖️ | Appel | Appel de décision |
| 🤝 | Partenariat | Demande de partenariat |

## 📁 Structure du projet

```
ticket-bot/
├── src/
│   ├── commands/              # Commandes slash
│   │   └── ticket.js          # Commande principale des tickets
│   ├── buttons/               # Gestionnaires de boutons
│   │   ├── createTicket.js    # Bouton création
│   │   └── closeTicket.js     # Bouton fermeture
│   ├── modals/                # Gestionnaires de modals
│   │   └── ticketModal.js     # Modal création de ticket
│   ├── events/                # Gestionnaires d'événements
│   │   ├── ready.js           # Événement de connexion
│   │   └── interactionCreate.js # Gestion des interactions
│   ├── utils/                 # Fonctions utilitaires
│   │   ├── logger.js          # Système de logs
│   │   └── permissions.js     # Gestion des permissions
│   └── index.js               # Point d'entrée principal
├── logs/                       # Fichiers de logs
├── .env.example               # Template d'environnement
├── .gitignore
├── config.json                # Configuration du bot
├── package.json               # Dépendances
└── README.md                  # Documentation
```

## ⚙️ Configuration

Modifie `config.json` pour personnaliser :

```json
{
  "colors": {
    "primary": "#5865F2",
    "success": "#57F287",
    "error": "#ED4245",
    "warning": "#FEE75C",
    "info": "#00B0F4"
  },
  "categories": [
    {
      "name": "support",
      "label": "Support",
      "emoji": "🆘"
    }
  ],
  "limits": {
    "maxOpenTickets": 3,
    "ticketTimeout": 604800000
  }
}
```

## 🔐 Permissions requises

Le bot a besoin des permissions suivantes :
- ✅ Gérer les canaux (créer les tickets)
- ✅ Gérer les messages
- ✅ Envoyer des messages
- ✅ Intégrations d'applications
- ✅ Utiliser les commandes slash

## 🐛 Dépannage

### Le bot ne répond pas
- Vérifiez que le token est correct dans `.env`
- Assurez-vous que le bot est en ligne sur Discord
- Vérifiez que le bot a les permissions nécessaires

### Les commandes slash n'apparaissent pas
- Attendez 15-30 secondes après le lancement du bot
- Utilisez `/` pour rafraîchir les commandes
- Vérifiez que le bot a les permissions "Intégrations d'applications"

### Erreur "Repository not found"
- Vérifiez votre token Discord
- Assurez-vous d'être connecté à Internet

## 📊 Logs

Les logs sont automatiquement créés dans le dossier `logs/` :
- `info.log` - Informations générales
- `error.log` - Erreurs
- `warn.log` - Avertissements
- `tickets.log` - Activités des tickets

## 🎓 Exemples d'utilisation

### Configurer le panneau de tickets
```bash
/ticket setup
```
Cela créera un message avec des boutons pour créer un ticket.

### Créer un ticket via commande
```bash
/ticket create support Mon problème
```

### Ajouter un modérateur au ticket
```bash
/ticket add @Moderateur
```

### Fermer un ticket
```bash
/ticket close
```

## 🔄 Mises à jour futures

- [ ] Système de transcriptions PDF
- [ ] Modération intégrée
- [ ] Système de notes/commentaires
- [ ] Dashboard web
- [ ] Support des bases de données MongoDB
- [ ] Système de notation des tickets
- [ ] Auto-fermeture après inactivité

## 🤝 Contribution

Les contributions sont bienvenues ! Pour contribuer :

1. Fork le repository
2. Crée une branche pour ta fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit tes changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvre une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 💬 Support

Pour obtenir de l'aide :
- 📧 Ouvre une [issue](https://github.com/Narutsuu/ticket-bot/issues)
- 💬 Crée une [discussion](https://github.com/Narutsuu/ticket-bot/discussions)
- 🐛 Signale un bug en créant une issue détaillée

## 👨‍💻 Auteur

Développé par **Narutsuu** avec ❤️

---

**Star ⭐ le repository si tu trouves ce bot utile !**
