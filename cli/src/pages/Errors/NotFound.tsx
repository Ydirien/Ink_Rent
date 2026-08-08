import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";

function NotFound() {
    return (
        <div className="error-page">
            <Header />

            <main className="error-main">
                <section
                    className="error-card"
                    aria-labelledby="not-found-title"
                >
                    <p className="error-card__code">404</p>
                    <h1 id="not-found-title">Page introuvable</h1>
                    <p>
                        L'adresse demandée n'existe pas ou la ressource n'est
                        plus disponible.
                    </p>

                    <div className="error-card__actions">
                        <a className="button button--primary" href="/">
                            Retour à l'accueil
                        </a>
                        <a
                            className="button button--secondary"
                            href="/#search"
                        >
                            Rechercher un poste
                        </a>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default NotFound;
