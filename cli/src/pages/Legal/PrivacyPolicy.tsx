import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";

function PrivacyPolicy() {
    return (
        <div className="legal-page">
            <Header />

            <main className="legal-main">
                <article aria-labelledby="privacy-policy-title">
                    <header className="legal-header">
                        <h1 id="privacy-policy-title">
                            Politique de confidentialité
                        </h1>
                        <p>
                            Dernière mise à jour : à renseigner avant la mise en
                            ligne.
                        </p>

                        <nav aria-label="Sommaire de la politique de confidentialité">
                            <ol>
                                <li>
                                    <a href="#collected-data">
                                        Données collectées
                                    </a>
                                </li>
                                <li>
                                    <a href="#purposes">Finalités</a>
                                </li>
                                <li>
                                    <a href="#retention">
                                        Durées de conservation
                                    </a>
                                </li>
                                <li>
                                    <a href="#rights">Vos droits</a>
                                </li>
                            </ol>
                        </nav>
                    </header>

                    <div className="legal-content">
                        <section id="collected-data">
                            <h2>Données collectées</h2>
                            <p>Ink Rent utilise uniquement les données utiles au service :</p>
                            <ul>
                                <li>
                                    nom affiché, adresse e-mail, mot de passe
                                    haché et rôle du compte ;
                                </li>
                                <li>
                                    informations du salon, des postes et de
                                    leurs disponibilités ;
                                </li>
                                <li>
                                    demandes de réservation, statut et message
                                    facultatif ;
                                </li>
                                <li>
                                    adresse IP, navigateur, date et chemin de la
                                    requête dans les journaux techniques.
                                </li>
                            </ul>
                            <p>
                                Des jetons d'authentification sont utilisés pour
                                maintenir la session. Aucun cookie publicitaire
                                ou outil de suivi publicitaire n'est utilisé
                                dans le MVP.
                            </p>
                        </section>

                        <section id="purposes">
                            <h2>Finalités</h2>
                            <p>Ces données permettent de :</p>
                            <ul>
                                <li>créer, sécuriser et gérer un compte ;</li>
                                <li>
                                    publier un salon, des postes et des dates
                                    disponibles ;
                                </li>
                                <li>
                                    envoyer, consulter et traiter les demandes
                                    de réservation ;
                                </li>
                                <li>
                                    assurer la sécurité et le bon fonctionnement
                                    technique du service.
                                </li>
                            </ul>
                            <p>
                                Les traitements nécessaires aux comptes et aux
                                réservations reposent sur l'exécution du
                                service. Les journaux techniques répondent à
                                l'intérêt légitime de sécuriser l'application.
                            </p>

                            <h3>Destinataires</h3>
                            <p>
                                Les données sont accessibles uniquement aux
                                personnes qui en ont besoin pour utiliser le
                                service. Un gérant consulte les demandes
                                concernant ses propres postes. Un tatoueur
                                consulte uniquement ses propres demandes.
                            </p>
                            <p>
                                Ink Rent ne vend pas les données personnelles et
                                ne les transmet pas à des fins publicitaires.
                            </p>
                        </section>

                        <section id="retention">
                            <h2>Durées de conservation</h2>
                            <p>
                                Les informations du compte sont conservées tant
                                que le compte reste actif. L'utilisateur peut
                                demander sa suppression depuis la page « Mon
                                compte », sauf lorsqu'une réservation active
                                impose temporairement leur conservation.
                            </p>
                            <p>
                                Les jetons de session expirent ou sont révoqués
                                lors de la déconnexion. La durée exacte de
                                conservation des réservations et des journaux
                                techniques doit être définie avant la mise en
                                production.
                            </p>
                        </section>

                        <section id="rights">
                            <h2>Vos droits</h2>
                            <p>
                                Selon votre situation, vous disposez notamment
                                de droits d'accès, de rectification,
                                d'effacement, de limitation, d'opposition et de
                                portabilité de vos données.
                            </p>
                            <p>
                                Pour exercer ces droits, utilisez l'adresse
                                e-mail de contact qui sera renseignée avant la
                                mise en ligne. Une réponse pourra nécessiter la
                                vérification de votre identité.
                            </p>
                            <p>
                                Vous pouvez également adresser une réclamation à
                                la{" "}
                                <a
                                    href="https://www.cnil.fr"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    CNIL
                                </a>
                                .
                            </p>
                            <p>
                                Le responsable du traitement et ses coordonnées
                                seront précisés dans les{" "}
                                <a href="/mentions-legales">
                                    mentions légales
                                </a>{" "}
                                avant la mise en ligne.
                            </p>
                        </section>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}

export default PrivacyPolicy;
