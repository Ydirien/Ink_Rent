import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";
import type { CurrentUser } from "../../types/user.types.ts";

function AccessDenied() {
    let userSpaceUrl = "/";
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
        try {
            const user = JSON.parse(storedUser) as CurrentUser;

            if (user.role === "SHOP_MANAGER") {
                userSpaceUrl = "/gerant/postes";
            } else if (user.role === "TATTOO_ARTIST") {
                userSpaceUrl = "/tatoueur/demandes";
            }
        } catch {
            userSpaceUrl = "/";
        }
    }

    return (
        <div className="error-page">
            <Header />

            <main className="error-main">
                <section
                    className="error-card"
                    aria-labelledby="access-denied-title"
                >
                    <p className="error-card__code">403</p>
                    <h1 id="access-denied-title">Accès interdit</h1>
                    <p>
                        Votre compte n'est pas autorisé à consulter cet espace.
                    </p>

                    <div className="error-card__actions">
                        <a
                            className="button button--primary"
                            href={userSpaceUrl}
                        >
                            Revenir à mon espace
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

export default AccessDenied;
