function Header() {
    return (
        <header className="site-header">
            <a className="site-logo" href="/" aria-label="Ink Rent - Accueil">
                <span className="site-logo__icon" aria-hidden="true"></span>
                INK RENT
            </a>

            <details className="site-menu">
                <summary>Menu</summary>
                <nav aria-label="Navigation principale">
                    <ul>
                        <li>
                            <a href="/">Accueil</a>
                        </li>
                        <li>
                            <a href="#search">Rechercher un poste</a>
                        </li>
                        <li>
                            <a href="/connexion">Se connecter</a>
                        </li>
                        <li>
                            <a href="/inscription">Créer un compte</a>
                        </li>
                    </ul>
                </nav>
            </details>
        </header>
    );
}

export default Header;
