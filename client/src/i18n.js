import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Default language resources (English)
const resources = {
  en: {
    translation: {
      // Common
      profile: "Profile",
      wallet: "Wallet",
      assets: "Assets",
      verification: "Verification",
      help: "Help Center",
      about: "About Us",
      history: "Transaction & Trades history",
      lang: "Language",
      appearance: "Appearance",
      theme: "Theme",
      light: "Light",
      dark: "Dark",

      // Maintenance Popup
      "Scheduled Maintenance Notice": "Scheduled Maintenance Notice",
      "To ensure a faster, more reliable experience for all our users, our website will undergo essential maintenance from":
        "To ensure a faster, more reliable experience for all our users, our website will undergo essential maintenance from",
      May: "May",
      at: "at",
      to: "to",
      "We're currently experiencing exceptionally high traffic volumes, which may result in temporary access limitations.":
        "We're currently experiencing exceptionally high traffic volumes, which may result in temporary access limitations.",
      "In some cases, you may need to use a":
        "In some cases, you may need to use a",
      "VPN (Virtual Private Network)": "VPN (Virtual Private Network)",
      "to access the site during this period.":
        "to access the site during this period.",
      "We're working hard behind the scenes to improve performance and truly appreciate your patience and understanding.":
        "We're working hard behind the scenes to improve performance and truly appreciate your patience and understanding.",

      // Profile page
      id: "ID",
      verification_status: "Verification Status",
      my_wallet: "My Wallet",
      view_manage_wallet: "View and manage Your Wallet Here.",
      history_desc: "View Your transactions and trades history here.",
      about_desc: "Learn more about our platform and our mission.",
      assets_desc: "View and manage your assets.",
      id_verification: "ID Verification",
      kyc_desc: "Complete KYC for full platform access.",
      help_desc: "Tell us your problem.",
      appearance_settings: "Appearance Settings",
      select_language: "Select Language",
      select_theme: "Select Theme",
      language_settings: "Language Settings",
      save: "Save",
      cancel: "Cancel",

      // Navbar
      home: "Home",
      market: "Market",
      trade: "Trade",
      spot: "Spot",
      trading: "Trading",
      perpetual: "Perpetual",
      login: "Login",
      register: "Register",
      admin_panel: "Admin Panel",
      assets_wallet: "Assets Wallet",
      logout: "Logout",
      sign_out_of_your_account: "Sign out of your account",
      logout_confirmation: "Are you sure you want to logout from this account?",
      confirm: "Confirm",

      // Footer
      company: "Company",
      careers: "Careers",
      contact_us: "Contact Us",
      support: "Support",
      faq: "FAQ",
      terms_of_service: "Terms of Service",
      follow_us: "Follow Us",
      facebook: "Facebook",
      twitter: "Twitter",
      linkedin: "LinkedIn",
      trusted_trading: "The most trusted website for trading.",
      all_rights_reserved: "All rights reserved.",

      // Auth
      email: "Email",
      password: "Password",
      confirm_password: "Confirm Password",
      first_name: "First Name",
      last_name: "Last Name",
      remember_me: "Remember Me",
      forgot_password: "Forgot Password",
      sign_up: "Sign Up",
      sign_in: "Sign In",
      already_have_account: "Already have an account?",
      dont_have_account: "Don't have an account?",

      // Status
      verified: "Verified",
      pending: "Pending",
      rejected: "Rejected",
      not_verified: "Not Verified",

      // Order Book
      price_usdt: "Price (USDT)",
      amount: "Amount",
      total_usdt: "Total (USDT)",

      // Order Form
      buy: "Buy",
      sell: "Sell",
      market_order: "Market",
      limit: "Limit",
      select_limit_price: "Select Limit Price",
      enter_quantity: "Enter Quantity",
      market_price: "Market Price",
      available_balance: "Available Balance",
      order_placed_success: "Order placed successfully!",
      enter_valid_price: "Enter a valid price.",
      enter_valid_usdt: "Enter a valid USDT amount.",
      enter_valid_assets: "Enter a valid Assets amount.",
      enter_amount: "Please enter either Assets Amount or USDT Amount.",
      maximum_usdt: "Maximum USDT",

      // Home page
      hero: "Hero image",
      trade_safely: "Trade safely, quickly and easily",
      trading_volume: "24-hour trading volume",
      integrated_trade: "Integrated Trade",
      users: "Users",
      why_choose_us: "Why Choose Us?",
      secure_trading: "Secure Trading",
      secure_trading_desc:
        "Our platform offers the most secure trading environment with bank-level encryption and cold wallets.",
      fast_transactions: "Fast Transactions",
      fast_transactions_desc:
        "Experience fast transactions with instant deposits and withdrawals, ensuring zero downtime.",
      market_insights: "Live Market Insights",
      market_insights_desc:
        "Stay ahead with real-time price tracking and analytics, providing you with the latest market insights.",
    },
  },
  es: {
    translation: {
      // Common
      profile: "Perfil",
      wallet: "Billetera",
      assets: "Activos",
      verification: "Verificación",
      help: "Centro de Ayuda",
      about: "Sobre Nosotros",
      history: "Historial de Transacciones y Operaciones",
      lang: "Idioma",
      appearance: "Apariencia",
      theme: "Tema",
      light: "Claro",
      dark: "Oscuro",

      // Maintenance Popup
      "Scheduled Maintenance Notice": "Aviso de Mantenimiento Programado",
      "To ensure a faster, more reliable experience for all our users, our website will undergo essential maintenance from":
        "Para garantizar una experiencia más rápida y confiable para todos nuestros usuarios, nuestro sitio web estará en mantenimiento esencial desde el",
      May: "Mayo",
      at: "a las",
      to: "hasta el",
      "We're currently experiencing exceptionally high traffic volumes, which may result in temporary access limitations.":
        "Actualmente estamos experimentando volúmenes de tráfico excepcionalmente altos, lo que puede resultar en limitaciones temporales de acceso.",
      "In some cases, you may need to use a":
        "En algunos casos, es posible que necesite usar una",
      "VPN (Virtual Private Network)": "VPN (Red Privada Virtual)",
      "to access the site during this period.":
        "para acceder al sitio durante este período.",
      "We're working hard behind the scenes to improve performance and truly appreciate your patience and understanding.":
        "Estamos trabajando arduamente para mejorar el rendimiento y agradecemos sinceramente su paciencia y comprensión.",

      // Profile page
      id: "ID",
      verification_status: "Estado de Verificación",
      my_wallet: "Mi Billetera",
      view_manage_wallet: "Ver y administrar tu billetera aquí.",
      history_desc: "Ver tu historial de transacciones y operaciones aquí.",
      about_desc: "Conozca más sobre nuestra plataforma y nuestra misión.",
      assets_desc: "Ver y administrar tus activos.",
      id_verification: "Verificación de ID",
      kyc_desc: "Complete KYC para acceso completo a la plataforma.",
      help_desc: "Cuéntanos tu problema.",
      appearance_settings: "Configuración de Apariencia",
      select_language: "Seleccionar Idioma",
      select_theme: "Seleccionar Tema",
      language_settings: "Configuración de Idioma",
      save: "Guardar",
      cancel: "Cancelar",

      // Navbar
      home: "Inicio",
      market: "Mercado",
      trade: "Operar",
      spot: "Spot",
      trading: "Trading",
      perpetual: "Perpetuo",
      login: "Iniciar Sesión",
      register: "Registrarse",
      admin_panel: "Panel de Administración",
      assets_wallet: "Billetera de Activos",
      logout: "Cerrar Sesión",
      sign_out_of_your_account: "Cerrar sesión de su cuenta",
      logout_confirmation:
        "¿Está seguro de que desea cerrar sesión de esta cuenta?",
      confirm: "Confirmar",

      // Footer
      company: "Empresa",
      careers: "Carreras",
      contact_us: "Contáctenos",
      support: "Soporte",
      faq: "Preguntas Frecuentes",
      terms_of_service: "Términos de Servicio",
      follow_us: "Síguenos",
      facebook: "Facebook",
      twitter: "Twitter",
      linkedin: "LinkedIn",
      trusted_trading: "El sitio web más confiable para trading.",
      all_rights_reserved: "Todos los derechos reservados.",

      // Auth
      email: "Correo electrónico",
      password: "Contraseña",
      confirm_password: "Confirmar Contraseña",
      first_name: "Nombre",
      last_name: "Apellido",
      remember_me: "Recordarme",
      forgot_password: "Olvidé mi Contraseña",
      sign_up: "Registrarse",
      sign_in: "Iniciar Sesión",
      already_have_account: "¿Ya tienes una cuenta?",
      dont_have_account: "¿No tienes una cuenta?",

      // Status
      verified: "Verificado",
      pending: "Pendiente",
      rejected: "Rechazado",
      not_verified: "No Verificado",

      // Order Book
      price_usdt: "Precio (USDT)",
      amount: "Cantidad",
      total_usdt: "Total (USDT)",

      // Order Form
      buy: "Comprar",
      sell: "Vender",
      market_order: "Mercado",
      limit: "Límite",
      select_limit_price: "Seleccionar Precio Límite",
      enter_quantity: "Ingrese Cantidad",
      market_price: "Precio de Mercado",
      available_balance: "Saldo Disponible",
      order_placed_success: "¡Orden colocada exitosamente!",
      enter_valid_price: "Ingrese un precio válido.",
      enter_valid_usdt: "Ingrese una cantidad de USDT válida.",
      enter_valid_assets: "Ingrese una cantidad de activos válida.",
      enter_amount:
        "Por favor ingrese la cantidad de activos o cantidad de USDT.",
      maximum_usdt: "USDT Máximo",

      // Home page
      hero: "Imagen de héroe",
      trade_safely: "Opera de forma segura, rápida y fácil",
      trading_volume: "Volumen de operaciones en 24 horas",
      integrated_trade: "Comercio Integrado",
      users: "Usuarios",
      why_choose_us: "¿Por qué elegirnos?",
      secure_trading: "Comercio Seguro",
      secure_trading_desc:
        "Nuestra plataforma ofrece el entorno de comercio más seguro con cifrado de nivel bancario y billeteras frías.",
      fast_transactions: "Transacciones Rápidas",
      fast_transactions_desc:
        "Experimente transacciones rápidas con depósitos y retiros instantáneos, garantizando cero tiempo de inactividad.",
      market_insights: "Análisis de Mercado en Vivo",
      market_insights_desc:
        "Manténgase a la vanguardia con seguimiento de precios en tiempo real y análisis, proporcionándole las últimas perspectivas del mercado.",
    },
  },
  fr: {
    translation: {
      // Common
      profile: "Profil",
      wallet: "Portefeuille",
      assets: "Actifs",
      verification: "Vérification",
      help: "Centre d'Aide",
      about: "À Propos",
      history: "Historique des Transactions et Trades",
      lang: "Langue",
      appearance: "Apparence",
      theme: "Thème",
      light: "Clair",
      dark: "Sombre",

      // Profile page
      id: "ID",
      verification_status: "Statut de Vérification",
      my_wallet: "Mon Portefeuille",
      view_manage_wallet: "Consultez et gérez votre portefeuille ici.",
      history_desc: "Consultez l'historique de vos transactions et trades ici.",
      about_desc: "En savoir plus sur notre plateforme et notre mission.",
      assets_desc: "Consultez et gérez vos actifs.",
      id_verification: "Vérification d'Identité",
      kyc_desc: "Complétez KYC pour un accès complet à la plateforme.",
      help_desc: "Dites-nous votre problème.",
      appearance_settings: "Paramètres d'Apparence",
      select_language: "Sélectionner la Langue",
      select_theme: "Sélectionner le Thème",
      language_settings: "Paramètres de Langue",
      save: "Enregistrer",
      cancel: "Annuler",

      // Navbar
      home: "Accueil",
      market: "Marché",
      trade: "Trader",
      spot: "Spot",
      trading: "Trading",
      perpetual: "Perpetuel",
      login: "Connexion",
      register: "S'inscrire",
      admin_panel: "Panneau d'Administration",
      assets_wallet: "Portefeuille d'Actifs",
      logout: "Déconnexion",
      sign_out_of_your_account: "Se déconnecter de votre compte",
      logout_confirmation:
        "Êtes-vous sûr de vouloir vous déconnecter de ce compte?",
      confirm: "Confirmer",

      // Footer
      company: "Entreprise",
      careers: "Carrières",
      contact_us: "Nous Contacter",
      support: "Support",
      faq: "FAQ",
      terms_of_service: "Conditions d'Utilisation",
      follow_us: "Suivez-nous",
      facebook: "Facebook",
      twitter: "Twitter",
      linkedin: "LinkedIn",
      trusted_trading: "Le site web le plus fiable pour le trading.",
      all_rights_reserved: "Tous droits réservés.",

      // Auth
      email: "Email",
      password: "Mot de passe",
      confirm_password: "Confirmer le mot de passe",
      first_name: "Prénom",
      last_name: "Nom",
      remember_me: "Se souvenir de moi",
      forgot_password: "Mot de passe oublié",
      sign_up: "S'inscrire",
      sign_in: "Se connecter",
      already_have_account: "Vous avez déjà un compte ?",
      dont_have_account: "Vous n'avez pas de compte ?",

      // Status
      verified: "Vérifié",
      pending: "En attente",
      rejected: "Rejeté",
      not_verified: "Non vérifié",

      // Order Book
      price_usdt: "Prix (USDT)",
      amount: "Montant",
      total_usdt: "Total (USDT)",

      // Order Form
      buy: "Acheter",
      sell: "Vendre",
      market_order: "Marché",
      limit: "Limite",
      select_limit_price: "Sélectionner le Prix Limite",
      enter_quantity: "Entrez la Quantité",
      market_price: "Prix du Marché",
      available_balance: "Solde Disponible",
      order_placed_success: "Ordre placé avec succès!",
      enter_valid_price: "Entrez un prix valide.",
      enter_valid_usdt: "Entrez un montant USDT valide.",
      enter_valid_assets: "Entrez un montant d'actifs valide.",
      enter_amount:
        "Veuillez entrer soit le montant d'actifs soit le montant USDT.",
      maximum_usdt: "USDT Maximum",

      // Home page
      hero: "Image héro",
      trade_safely: "Tradez en toute sécurité, rapidement et facilement",
      trading_volume: "Volume de trading sur 24 heures",
      integrated_trade: "Trading Intégré",
      users: "Utilisateurs",
      why_choose_us: "Pourquoi Nous Choisir?",
      secure_trading: "Trading Sécurisé",
      secure_trading_desc:
        "Notre plateforme offre l'environnement de trading le plus sécurisé avec un cryptage de niveau bancaire et des portefeuilles froids.",
      fast_transactions: "Transactions Rapides",
      fast_transactions_desc:
        "Profitez de transactions rapides avec des dépôts et des retraits instantanés, garantissant zéro temps d'arrêt.",
      market_insights: "Analyses de Marché en Direct",
      market_insights_desc:
        "Restez en avance avec le suivi des prix en temps réel et les analyses, vous fournissant les dernières informations sur le marché.",
    },
  },
  de: {
    translation: {
      // Common
      profile: "Profil",
      wallet: "Wallet",
      assets: "Vermögenswerte",
      verification: "Verifizierung",
      help: "Hilfecenter",
      about: "Über uns",
      history: "Transaktions- und Handelshistorie",
      lang: "Sprache",
      appearance: "Erscheinungsbild",
      theme: "Thema",
      light: "Hell",
      dark: "Dunkel",

      // Profile page
      id: "ID",
      verification_status: "Verifizierungsstatus",
      my_wallet: "Mein Wallet",
      view_manage_wallet: "Sehen und verwalten Sie Ihre Wallet hier.",
      history_desc: "Sehen Sie Ihre Transaktions- und Handelshistorie hier.",
      about_desc: "Erfahren Sie mehr über unsere Plattform und unsere Mission.",
      assets_desc: "Sehen und verwalten Sie Ihre Vermögenswerte.",
      id_verification: "ID-Verifizierung",
      kyc_desc: "Schließen Sie KYC für vollen Plattformzugriff ab.",
      help_desc: "Erzählen Sie uns Ihr Problem.",
      appearance_settings: "Erscheinungsbild-Einstellungen",
      select_language: "Sprache auswählen",
      select_theme: "Thema auswählen",
      language_settings: "Spracheinstellungen",
      save: "Speichern",
      cancel: "Abbrechen",

      // Navbar
      home: "Startseite",
      market: "Markt",
      trade: "Handel",
      spot: "Spot",
      trading: "Trading",
      perpetual: "Perpetual",
      login: "Anmelden",
      register: "Registrieren",
      admin_panel: "Admin-Panel",
      assets_wallet: "Vermögenswerte-Wallet",
      logout: "Abmelden",
      sign_out_of_your_account: "Abmelden von Ihrem Konto",
      logout_confirmation:
        "Sind Sie sicher, dass Sie sich von diesem Konto abmelden möchten?",
      confirm: "Bestätigen",

      // Footer
      company: "Unternehmen",
      careers: "Karriere",
      contact_us: "Kontakt",
      support: "Support",
      faq: "FAQ",
      terms_of_service: "Nutzungsbedingungen",
      follow_us: "Folgen Sie uns",
      facebook: "Facebook",
      twitter: "Twitter",
      linkedin: "LinkedIn",
      trusted_trading: "Die vertrauenswürdigste Website für den Handel.",
      all_rights_reserved: "Alle Rechte vorbehalten.",

      // Auth
      email: "E-Mail",
      password: "Passwort",
      confirm_password: "Passwort bestätigen",
      first_name: "Vorname",
      last_name: "Nachname",
      remember_me: "Angemeldet bleiben",
      forgot_password: "Passwort vergessen",
      sign_up: "Registrieren",
      sign_in: "Anmelden",
      already_have_account: "Haben Sie bereits ein Konto?",
      dont_have_account: "Haben Sie kein Konto?",

      // Status
      verified: "Verifiziert",
      pending: "Ausstehend",
      rejected: "Abgelehnt",
      not_verified: "Nicht verifiziert",

      // Order Book
      price_usdt: "Preis (USDT)",
      amount: "Menge",
      total_usdt: "Gesamt (USDT)",

      // Order Form
      buy: "Kaufen",
      sell: "Verkaufen",
      market_order: "Markt",
      limit: "Limit",
      select_limit_price: "Limitpreis auswählen",
      enter_quantity: "Menge eingeben",
      market_price: "Marktpreis",
      available_balance: "Verfügbares Guthaben",
      order_placed_success: "Auftrag erfolgreich platziert!",
      enter_valid_price: "Geben Sie einen gültigen Preis ein.",
      enter_valid_usdt: "Geben Sie einen gültigen USDT-Betrag ein.",
      enter_valid_assets: "Geben Sie einen gültigen Vermögenswert-Betrag ein.",
      enter_amount:
        "Bitte geben Sie entweder den Vermögenswert-Betrag oder den USDT-Betrag ein.",
      maximum_usdt: "Maximales USDT",

      // Home page
      hero: "Hero-Bild",
      trade_safely: "Handeln Sie sicher, schnell und einfach",
      trading_volume: "24-Stunden-Handelsvolumen",
      integrated_trade: "Integrierter Handel",
      users: "Benutzer",
      why_choose_us: "Warum uns wählen?",
      secure_trading: "Sicherer Handel",
      secure_trading_desc:
        "Unsere Plattform bietet die sicherste Handelsumgebung mit Verschlüsselung auf Bankniveau und Cold Wallets.",
      fast_transactions: "Schnelle Transaktionen",
      fast_transactions_desc:
        "Erleben Sie schnelle Transaktionen mit sofortigen Ein- und Auszahlungen, die Null Ausfallzeiten garantieren.",
      market_insights: "Live-Markteinblicke",
      market_insights_desc:
        "Bleiben Sie mit Echtzeit-Preisverfolgung und Analysen auf dem Laufenden, die Ihnen die neuesten Markteinblicke bieten.",
    },
  },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
