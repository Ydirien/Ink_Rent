import "./Home.css";
import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";

function Home() {
    const minDate = new Date().toISOString().split("T")[0];

    return (
        <div className="home-page">
            <Header />

            <main>
                <section className="home-intro" aria-labelledby="home-title">
                    <p className="home-intro__eyebrow">
                        Location de postes entre professionnels
                    </p>

                    <h1 id="home-title">
                        Un poste de tatouage, pour la journée qu'il vous faut.
                    </h1>

                    <p className="home-intro__description">
                        Trouvez un espace disponible ou proposez un poste libre
                        dans votre salon.
                    </p>

                    <div className="home-intro__actions">
                        <a className="button button--primary" href="#search">
                            Rechercher un poste
                        </a>
                        <a
                            className="button button--secondary"
                            href="/gerant/postes/nouveau"
                        >
                            Proposer un poste
                        </a>
                    </div>
                </section>

                <section className="how-it-works" aria-labelledby="how-title">
                    <h2 id="how-title">Comment ça marche ?</h2>

                    <ol>
                        <li>
                            <h3>Rechercher</h3>
                            <p>Une ville et une date suffisent.</p>
                        </li>
                        <li>
                            <h3>Demander</h3>
                            <p>Le tatoueur transmet sa demande au salon.</p>
                        </li>
                        <li>
                            <h3>Décider</h3>
                            <p>Le gérant accepte ou refuse.</p>
                        </li>
                    </ol>
                </section>

                <section
                    id="search"
                    className="workstation-search"
                    aria-labelledby="search-title"
                >
                    <h2 id="search-title">Rechercher un poste</h2>

                    <form action="/recherche" method="get">
                        <div className="form-field">
                            <label htmlFor="city">Ville</label>
                            <input
                                id="city"
                                name="ville"
                                type="text"
                                placeholder="Lyon"
                                autoComplete="address-level2"
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="date">Date</label>
                            <input
                                id="date"
                                name="date"
                                type="date"
                                min={minDate}
                                required
                            />
                        </div>

                        <button className="button button--primary" type="submit">
                            Rechercher
                        </button>
                    </form>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Home;
