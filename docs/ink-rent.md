# Ink Rent

## Présentation générale

**Quoi ?** Développement d’une application web permettant à un tatoueur sans salon résident de réserver, à la journée, un poste de tatouage disponible dans un salon partenaire.

**Qui ?** Ink Rent est un projet fictif. La plateforme met en relation deux types d’utilisateurs :

- le **gérant**, qui publie un poste disponible dans son salon et traite les demandes de réservation ;
- le **tatoueur invité**, qui recherche un poste et demande à le réserver pour une date donnée.

**Pour qui ?** Les tatoueurs indépendants, itinérants ou invités qui ont besoin d’un espace de travail ponctuel, ainsi que les gérants de salons qui souhaitent rentabiliser un poste inoccupé.

**Comment ?** Le projet est réalisé individuellement, en méthode agile simplifiée avec un tableau Kanban, des issues GitHub, des sprints courts et un journal de bord. Le développement est organisé autour d’un MVP volontairement réduit.

**Quand ?** En quatre sprints :

1. **Sprint 0 - conception** : besoins, récits utilisateur, maquettes, architecture et base de données ;
2. **Sprint 1 - socle** : environnement, authentification et gestion du salon ;
3. **Sprint 2 - métier** : postes, disponibilités, recherche et réservations ;
4. **Sprint 3 - qualité** : sécurité, tests, documentation, CI/CD et mise en production.

**Pourquoi ?** Réaliser un projet personnel exploitable comme pratique professionnelle dans le dossier professionnel du titre **Concepteur développeur d’applications**, en produisant des preuves pour les 11 compétences du REAC CDA validé le 2 juillet 2024.

## Présentation du projet de développement

### Principe du MVP

Le MVP couvre un seul parcours métier complet :

1. un gérant crée la fiche de son salon ;
2. il ajoute un poste de tatouage et ouvre une date disponible ;
3. un tatoueur recherche un poste par ville et par date ;
4. il consulte le détail du poste et envoie une demande de réservation ;
5. le gérant accepte ou refuse la demande ;
6. les deux utilisateurs consultent le statut de la réservation dans leur tableau de bord.

Le MVP ne gère **ni paiement en ligne, ni messagerie, ni avis, ni carte interactive**. Le prix affiché est informatif et le règlement est organisé en dehors de l’application.

### Acteurs et droits

| Acteur | Droits dans le MVP |
| --- | --- |
| Visiteur | Rechercher les postes disponibles et consulter leur détail |
| Tatoueur | Créer un compte, se connecter, demander une réservation, consulter ses demandes et annuler une demande encore en attente |
| Gérant | Créer son salon, gérer ses postes et leurs dates disponibles, consulter les demandes, les accepter ou les refuser |

Un compte possède un seul rôle dans le MVP : `TATTOO_ARTIST` ou `SHOP_MANAGER`. Un gérant ne peut administrer que son propre salon et ses propres postes. Un tatoueur ne peut agir que sur ses propres réservations.

### Règles métier essentielles

- Un gérant possède au maximum un salon dans le MVP.
- Un salon peut contenir plusieurs postes de tatouage.
- Un poste ne peut avoir qu’un créneau par date.
- Un créneau est dans l’état `OPEN`, `PENDING` ou `BOOKED`.
- Une réservation ne peut être créée que sur un créneau `OPEN` et sur une date future.
- La création de la réservation et le passage du créneau à `PENDING` sont exécutés dans une transaction afin d’empêcher une double réservation.
- Seul le gérant propriétaire du salon peut accepter ou refuser une demande.
- Une acceptation passe le créneau à `BOOKED` ; un refus ou une annulation le rend à nouveau `OPEN`.
- Le prix est stocké en centimes d’euro afin d’éviter les erreurs d’arrondi.

## Besoins fonctionnels - Minimum Viable Product (MVP)

### 1. Authentification et compte

- Inscription avec choix du rôle `tatoueur` ou `gérant`.
- Connexion, déconnexion et conservation sécurisée de la session.
- Consultation du profil connecté.
- Suppression du compte après confirmation, pour faciliter l’exercice du droit à l’effacement.
- Contrôle des rôles et de la propriété des ressources côté serveur.

### 2. Espace gérant

- Création et modification de la fiche du salon : nom, description, adresse, code postal et ville.
- Création, consultation, modification et suppression d’un poste : nom, description, équipements disponibles et prix journalier.
- Ajout et suppression d’une date disponible pour un poste.
- Liste des demandes reçues avec leur statut.
- Acceptation ou refus d’une demande en attente.

### 3. Recherche publique

- Recherche des postes disponibles par **ville** et **date**.
- Affichage d’une liste contenant le salon, le poste, les équipements principaux et le prix journalier.
- Page de détail d’un poste avec les informations utiles sur le poste et le salon.
- États d’interface explicites : chargement, résultat vide, erreur et résultats disponibles.

### 4. Espace tatoueur

- Envoi d’une demande de réservation depuis la page de détail.
- Ajout facultatif d’un court message de présentation.
- Consultation de ses demandes et de leur statut : `PENDING`, `CONFIRMED`, `REJECTED` ou `CANCELLED`.
- Annulation d’une demande tant qu’elle est en attente.

### 5. Pages d’information

- Mentions légales.
- Politique de confidentialité précisant les données collectées, leur finalité, leur durée de conservation et les droits des utilisateurs.
- Page d’erreur 404.
- Aucun traceur publicitaire et aucun cookie non essentiel dans le MVP ; le cookie de session est strictement nécessaire au fonctionnement.

### Critères d’acceptation du MVP

Le MVP est terminé lorsque les scénarios suivants fonctionnent sur l’environnement de production :

- un gérant publie un poste et une date sans intervenir directement dans la base ;
- un visiteur retrouve ce poste avec la ville et la date attendues ;
- un tatoueur connecté envoie une demande ;
- deux demandes simultanées ne peuvent pas réserver le même créneau ;
- le gérant accepte la demande et le créneau disparaît des résultats disponibles ;
- un utilisateur non autorisé reçoit une réponse `401` ou `403` sans accès aux données ;
- la chaîne CI exécute les contrôles de qualité, les tests et la construction des images sans erreur ;
- l’application est accessible en HTTPS et une procédure documentée permet son redéploiement.

## Propositions d’évolutions possibles

Ces fonctionnalités sont volontairement exclues du MVP :

- paiement d’un acompte et gestion des remboursements ;
- messagerie entre le tatoueur et le gérant ;
- notifications par courriel ;
- calendrier avec périodes récurrentes et export iCalendar ;
- carte interactive et recherche par distance ;
- galerie de réalisations et profil public détaillé du tatoueur ;
- dépôt et vérification de justificatifs professionnels ;
- évaluations et commentaires après une location ;
- gestion de plusieurs salons par un même gérant ;
- espace d’administration et modération des comptes ou annonces ;
- statistiques d’occupation et de revenus ;
- application mobile ou Progressive Web App.

## Contraintes techniques, notamment liées au titre professionnel

### Stack minimale recommandée

| Partie | Choix proposé | Justification |
| --- | --- | --- |
| Front-end | React, TypeScript, Vite, React Router | Technologies déjà adaptées à une SPA responsive et à la consommation d’une API REST |
| Back-end | Node.js, Express, TypeScript | API simple, typée et organisée en couches |
| Validation | Zod | Validation partagée des données entrantes et messages d’erreur contrôlés |
| Données SQL | PostgreSQL et Prisma ORM | Modèle relationnel, migrations, contraintes, transactions et requêtes paramétrées |
| Données NoSQL | Redis | Stockage clé/valeur des sessions avec durée de vie et cache court des recherches |
| Tests | Vitest, Supertest, Testing Library, Playwright et k6 ou Artillery | Tests unitaires, intégration, interface, système et charge |
| Qualité | ESLint, Prettier, TypeScript, couverture de tests et `npm audit` | Contrôles automatisables dans la CI |
| Conteneurs | Docker et Docker Compose | Environnements reproductibles pour le développement, les tests et la production |
| CI/CD | GitHub Actions et registre d’images GitHub | Lint, tests, build, images versionnées et déploiement documenté |

### Architecture attendue

L’application reste un **monolithe modulaire organisé en couches**, plus rapide à terminer qu’une architecture en microservices :

- **présentation** : application React et composants d’interface ;
- **API** : routes, contrôleurs HTTP et middlewares ;
- **métier** : services contenant les règles de réservation et les autorisations ;
- **accès aux données** : repositories Prisma pour PostgreSQL et adaptateurs Redis ;
- **infrastructure** : configuration, journalisation, conteneurs et scripts de déploiement.

Les contrôleurs ne contiennent pas de règle métier et les services ne dépendent pas directement du protocole HTTP. Un schéma d’architecture et une courte décision d’architecture justifient ces choix ainsi que les besoins de sécurité et d’écoconception.

### Modèle de données minimal

| Entité | Données principales | Contraintes principales |
| --- | --- | --- |
| `User` | identifiant, nom affiché, e-mail, mot de passe haché, rôle, dates de création et mise à jour | e-mail unique ; rôle obligatoire |
| `Salon` | identifiant, propriétaire, nom, description, adresse, code postal, ville | propriétaire unique dans le MVP |
| `Workstation` | identifiant, salon, nom, description, équipements, prix en centimes | appartient à un salon |
| `AvailabilitySlot` | identifiant, poste, date, statut | couple poste/date unique |
| `Booking` | identifiant, créneau, tatoueur, statut, message, dates | appartient à un tatoueur et à un créneau |

Le dossier de conception comprend un dictionnaire de données, un MCD, un MLD ou schéma physique, les contraintes d’intégrité, les migrations, un jeu d’essai et les procédures de sauvegarde et de restauration de la base de test.

### API REST interne minimale

Le front consomme l’API REST interne ; aucune API externe n’est nécessaire au MVP.

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` ;
- `GET /api/me`, `DELETE /api/me` ;
- `GET /api/workstations?city=&date=` et `GET /api/workstations/:id` ;
- routes protégées de création et modification du salon ;
- routes CRUD protégées des postes et des créneaux ;
- `POST /api/bookings`, `GET /api/bookings/me`, `PATCH /api/bookings/:id/cancel` ;
- `GET /api/manager/bookings`, `PATCH /api/manager/bookings/:id/status`.

### Sécurité obligatoire

- Hachage des mots de passe avec Argon2id et politique de mot de passe documentée.
- Sessions opaques stockées dans Redis avec expiration ; cookie `HttpOnly`, `SameSite=Lax` et `Secure` en production.
- Jeton anti-CSRF pour les requêtes qui modifient des données.
- Validation de toutes les entrées côté serveur avec Zod.
- Autorisation fondée sur le rôle et la propriété de la ressource.
- Requêtes paramétrées via l’ORM et transaction pour la réservation.
- Invalidation du cache de recherche à chaque création, modification ou réservation d’un créneau.
- En-têtes HTTP de sécurité avec Helmet, CORS limité à l’origine du front et limitation de débit sur l’authentification.
- Secrets placés dans des variables d’environnement ; seuls les fichiers `.env.example` sont versionnés.
- Messages d’erreur non bavards, journaux sans mot de passe, cookie ou donnée personnelle inutile.
- Tests dédiés aux accès interdits, à la validation, au CSRF, à la limitation de débit et au conflit de réservation.
- Journal de veille consacré au minimum à l’OWASP Top 10, aux recommandations de l’ANSSI, à la CNIL et aux avis de sécurité des dépendances.

### Responsive, accessibilité, SEO et écoconception

- Conception **mobile first** et vérification sur mobile, tablette et ordinateur.
- HTML sémantique, navigation au clavier, focus visible, labels associés aux champs, messages d’erreur accessibles, contrastes suffisants et zone `aria-live` pour les retours asynchrones.
- Audit avec Lighthouse et axe ; anomalies corrigées ou documentées.
- Titres et descriptions de pages, hiérarchie de titres cohérente, URLs compréhensibles, fichier `robots.txt` et plan de site pour les pages publiques.
- Images redimensionnées et converties en WebP ou AVIF, chargement différé, pagination ou limitation des résultats, dépendances limitées et cache de recherche court.

### Gestion de projet et versionnement

- Dépôt Git et GitHub avec commits explicites en anglais.
- Tableau GitHub Projects : `Backlog`, `Ready`, `In progress`, `Review`, `Done`.
- Une issue par récit utilisateur ou tâche technique, avec critères d’acceptation.
- Branches courtes, pull requests relues avant fusion et historique conservé.
- Journal de bord personnel mis à jour à chaque séance : tâche, décision, difficulté, diagnostic et résultat.
- Compte rendu court à la fin de chaque sprint : réalisé, écarts, corrections et reste à faire.

### Tests

Le plan de tests couvre au minimum :

- **unitaires** : règles du service de réservation et autorisations ;
- **composants front** : formulaire de recherche et affichage des différents états ;
- **intégration** : authentification, accès PostgreSQL/Redis et endpoints de réservation ;
- **système E2E** : publication, recherche, demande puis acceptation ;
- **non-régression** : exécution automatique de la suite à chaque pull request ;
- **sécurité** : entrées invalides, droits, CSRF, rate limit et recherche de dépendances vulnérables ;
- **fuzzing léger** : envoi automatisé de chaînes aléatoires, trop longues ou mal formées aux principaux champs de l’API ;
- **charge** : scénario court sur la recherche publique ;
- **acceptation** : jeu d’essai manuel présentant données d’entrée, résultat attendu, résultat obtenu et écart éventuel.

Une base PostgreSQL et un Redis distincts sont utilisés pour les tests. Le rapport final indique la date, l’environnement, les versions, les résultats et les anomalies corrigées.

### Déploiement et DevOps

- Dockerfile multi-étapes pour le front et l’API.
- Fichiers Docker Compose séparés ou profils distincts pour développement, test et production.
- PostgreSQL et Redis non exposés publiquement.
- Compte PostgreSQL de l’application limité aux droits nécessaires, distinct du compte utilisé pour les migrations.
- Reverse proxy avec HTTPS et vérification de santé de l’API.
- Procédure `docs/deployment.md` : prérequis, variables, migrations, seed éventuel, démarrage, vérifications, sauvegarde, restauration et retour arrière.
- Pipeline GitHub Actions : installation reproductible, lint, vérification des types, tests, couverture, audit, build et création des images.
- Publication d’images versionnées dans un registre, puis déploiement contrôlé sur le serveur.
- Conservation et interprétation des rapports de CI pour corriger au moins un échec documenté.

## Informations et ressources complémentaires

### Arborescence documentaire minimale

```text
ink-rent/
├── frontend/
├── backend/
├── docs/
│   ├── needs-and-user-stories.md
│   ├── architecture.md
│   ├── data-design.md
│   ├── security-watch.md
│   ├── test-plan.md
│   ├── test-report.md
│   ├── deployment.md
│   └── project-log.md
├── docker-compose.yml
├── .env.example
└── README.md
```

Le `README.md`, les commentaires techniques utiles et les messages de commit sont rédigés en anglais afin de fournir des preuves simples de compréhension de l’anglais technique.

### Preuves à produire pour les 11 compétences du REAC

| CP | Réalisation Ink Rent | Preuves à conserver pour le dossier professionnel |
| --- | --- | --- |
| **CP1 - Installer et configurer son environnement** | Docker Compose pour le front, l’API, PostgreSQL et Redis ; variables d’environnement ; Git | `docker-compose.yml`, Dockerfiles, `.env.example`, extraits du README en anglais et capture des conteneurs actifs |
| **CP2 - Développer des interfaces utilisateur** | Recherche, détail, formulaires et tableaux de bord React responsive et accessibles consommant l’API | Maquettes, captures mobile/desktop, extrait d’un composant et de l’appel asynchrone, résultats axe/Lighthouse et test de composant |
| **CP3 - Développer des composants métier** | Service de réservation, règles d’état, autorisations et gestion des erreurs | Extrait du service, test unitaire, exemple de validation et fiche de résolution d’une anomalie |
| **CP4 - Contribuer à la gestion d’un projet** | Kanban, sprints, issues, pull requests, suivi des écarts et comptes rendus | Capture du tableau, issue avec critères, planning, compte rendu de sprint, historique Git et journal de bord |
| **CP5 - Analyser les besoins et maquetter** | Acteurs, limites, récits utilisateur, cas d’utilisation, parcours et maquettes | Cahier des charges court, user stories, diagramme de cas d’utilisation, diagramme de séquence de la réservation, wireframes et enchaînement des écrans |
| **CP6 - Définir l’architecture logicielle** | Architecture multicouche, responsabilités, stratégie de sécurité et besoins d’écoconception | Schéma d’architecture, description des couches et décision d’architecture justifiant frameworks, ORM, Redis et protections DICP |
| **CP7 - Concevoir et mettre en place une BDD relationnelle** | PostgreSQL, modèle relationnel, contraintes, migrations, seed, sauvegarde et restauration | Dictionnaire, MCD, MLD, schéma Prisma, migration SQL, jeu d’essai et preuve de restauration de la base de test |
| **CP8 - Développer des accès SQL et NoSQL** | Repositories Prisma, transaction anti-double réservation, sessions et cache Redis | Extraits CRUD, transaction, adaptateur Redis, validation des entrées et tests d’intégration SQL/NoSQL |
| **CP9 - Préparer et exécuter les plans de tests** | Tests unitaires, intégration, système, sécurité, charge, non-régression et acceptation | Plan de tests, jeu d’essai de la réservation, commandes exécutées, rapport de résultats et correction d’une anomalie |
| **CP10 - Préparer et documenter le déploiement** | Conteneurs de production, environnements définis, scripts et procédure de déploiement | `docs/deployment.md`, scripts, configuration de production anonymisée, procédure de migration, sauvegarde et rollback |
| **CP11 - Contribuer à la mise en production DevOps** | CI GitHub Actions, qualité, tests automatiques, images versionnées et déploiement | Workflow YAML, capture d’un pipeline réussi, rapports interprétés, image publiée et preuve de l’application accessible en HTTPS |

### Répartition conseillée dans le dossier professionnel

Pour respecter la limite de trois exemples par activité type, Ink Rent peut être présenté ainsi :

| Activité type | Exemples de pratique professionnelle proposés |
| --- | --- |
| **AT1 - Développer une application sécurisée** | 1. Environnement conteneurisé (CP1) ; 2. Interface et service sécurisé de réservation (CP2-CP3) ; 3. Gestion agile du projet (CP4) |
| **AT2 - Concevoir et développer une application sécurisée organisée en couches** | 1. Analyse et maquettage du parcours de réservation (CP5) ; 2. Architecture multicouche sécurisée (CP6) ; 3. Modèle PostgreSQL et accès PostgreSQL/Redis (CP7-CP8) |
| **AT3 - Préparer le déploiement d’une application sécurisée** | 1. Plan et exécution des tests (CP9) ; 2. Déploiement conteneurisé et pipeline CI/CD (CP10-CP11) |

Pour chaque exemple, décrire uniquement ce qui a réellement été réalisé à la première personne, préciser les moyens utilisés, le contexte et les personnes avec qui le travail a été effectué. Conserver des captures ciblées en thème clair et expliquer chaque extrait de code. Les informations complémentaires du modèle de DP restent facultatives et sont limitées à dix lignes.

Chaque exemple du dossier professionnel est limité à trois pages. Les documents illustrant la pratique professionnelle sont facultatifs et limités à deux par activité type ; les extraits directement placés dans les exemples doivent donc être courts et ciblés.

### Ordre de réalisation pour aller au plus vite

1. Finaliser les user stories, les maquettes et le modèle de données avant de coder.
2. Mettre en place Docker, PostgreSQL, Redis, les migrations et le pipeline minimal.
3. Terminer l’authentification et les autorisations.
4. Développer le parcours métier complet sans fonctionnalité secondaire.
5. Écrire les tests en même temps que les règles métier importantes.
6. Déployer une première version très tôt, puis corriger la procédure.
7. Compléter le journal, le plan de tests et les preuves au fur et à mesure.

### Documents de référence utilisés

- `REAC_CDA_V04_02072024.pdf`, référentiel officiel du titre Concepteur développeur d’applications, validé le 2 juillet 2024 ;
- `checklist_cda.md` ;
- `eBook Titre Pro CDA 2023 (1).pdf` ;
- `Atelier DP 03-04-2026.pptx` ;
- `[PEDA_TP] Matinée certif CDA.pdf` ;
- `DP-Vierge-pre-rempli-CDA.docx`.

## Pour terminer

Le projet est volontairement restreint à une seule valeur métier : **louer un poste disponible à une date donnée**. Toute fonctionnalité qui n’aide pas directement à publier, rechercher, demander ou traiter cette réservation reste en dehors du MVP.

Les documents pédagogiques fournis indiquent que le dossier professionnel doit couvrir toutes les compétences avec des réalisations individuelles et qu’un même exemple ne doit pas être inventé ou simplement observé. Il faut donc conserver les preuves pendant le développement et ne décrire dans le DP que les opérations réellement effectuées.

> **Point de vigilance :** l’e-book fourni interdit d’utiliser dans le dossier professionnel le projet présenté dans le dossier de projet. Ink Rent convient donc comme projet support du dossier professionnel seulement s’il n’est pas également choisi comme projet principal du dossier de projet.
