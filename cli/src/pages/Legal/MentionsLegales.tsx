import "./Legal.css";
import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";

function MentionsLegales() {
    return (
        <div className="legal-page">
            <Header />

            <main className="legal-main">
                <article aria-labelledby="legal-notice-title">
                    <header className="legal-header">
                        <h1 id="legal-notice-title">Mentions légales</h1>
                        <p>
                            Dernière mise à jour : à renseigner avant la mise en
                            ligne.
                        </p>

                        <nav aria-label="Sommaire des mentions légales">
                            <ol>
                                <li>
                                    <a href="#editeur">Éditeur</a>
                                </li>
                                <li>
                                    <a href="#hebergement">Hébergement</a>
                                </li>
                                <li>
                                    <a href="#responsabilite">
                                        Responsabilité
                                    </a>
                                </li>
                                <li>
                                    <a href="#contact">Contact</a>
                                </li>
                            </ol>
                        </nav>
                    </header>

                    <div className="legal-content">
                        <section id="editeur">
                            <h2>Éditeur</h2>
                            <p>
                                Ink Rent est un projet réalisé dans un cadre
                                pédagogique. Il permet la mise en relation de
                                tatoueurs invités et de gérants de salons de
                                tatouage.
                            </p>
                            <p>
                                Nom ou raison sociale de l'éditeur : à
                                renseigner avant la mise en ligne.
                            </p>
                            <p>
                                Adresse et directeur de la publication : à
                                renseigner avant la mise en ligne.
                            </p>
                        </section>

                        <section id="hebergement">
                            <h2>Hébergement</h2>
                            <p>
                                Le nom, l'adresse et les coordonnées de
                                l'hébergeur seront ajoutés avant la mise en
                                ligne publique du site.
                            </p>
                            <p>
                                Pendant son développement, Ink Rent fonctionne
                                localement avec Docker Compose.
                            </p>
                        </section>

                        <section id="responsabilite">
                            <h2>Responsabilité</h2>
                            <p>
                                Ink Rent facilite la publication de postes de
                                travail et l'envoi de demandes de réservation
                                entre professionnels. Chaque utilisateur reste
                                responsable de l'exactitude des informations
                                qu'il publie et des engagements qu'il prend.
                            </p>
                            <p>
                                Malgré le soin apporté au site, une erreur ou
                                une interruption temporaire peut survenir. Les
                                textes, la structure et le code du site ne
                                peuvent pas être reproduits sans autorisation.
                            </p>
                            <p>
                                Les présentes mentions sont soumises au droit
                                français.
                            </p>
                        </section>

                        <section id="contact">
                            <h2>Contact</h2>
                            <p>
                                Adresse e-mail de contact : à renseigner avant
                                la mise en ligne.
                            </p>
                        </section>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}

export default MentionsLegales;
