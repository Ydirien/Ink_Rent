import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";

interface LoginResponse {
    data: {
        accessToken: {
            token: string;
        };
        user: {
            id: number;
            displayName: string;
            email: string;
            role: "TATTOO_ARTIST" | "SHOP_MANAGER";
        };
    };
}

function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password,
                    }),
                },
            );

            if (!response.ok) {
                setError("Adresse e-mail ou mot de passe incorrect.");
                return;
            }

            const result = (await response.json()) as LoginResponse;

            localStorage.setItem(
                "accessToken",
                result.data.accessToken.token,
            );
            localStorage.setItem("user", JSON.stringify(result.data.user));

            const returnUrl = searchParams.get("retour");

            if (
                returnUrl &&
                returnUrl.startsWith("/") &&
                !returnUrl.startsWith("//")
            ) {
                navigate(returnUrl);
            } else if (result.data.user.role === "SHOP_MANAGER") {
                navigate("/gerant/salon");
            } else {
                navigate("/tatoueur/demandes");
            }
        } catch {
            setError(
                "Le serveur est indisponible. Veuillez réessayer plus tard.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="login-page">
            <Header />

            <main className="login-main">
                <section className="login-card" aria-labelledby="login-title">
                    <header className="login-card__header">
                        <h1 id="login-title">Se connecter</h1>
                        <p>Accédez à votre espace Ink Rent.</p>
                    </header>

                    {error && (
                        <p id="login-error" className="form-error" role="alert">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label htmlFor="email">Adresse e-mail</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                placeholder="tatoueur@exemple.fr"
                                autoComplete="email"
                                aria-invalid={Boolean(error)}
                                aria-describedby={error ? "login-error" : undefined}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="password">Mot de passe</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                autoComplete="current-password"
                                aria-invalid={Boolean(error)}
                                aria-describedby={error ? "login-error" : undefined}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                required
                            />
                        </div>

                        <button
                            className="button button--primary"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Connexion..." : "Se connecter"}
                        </button>
                    </form>

                    <p>
                        Pas encore de compte ?{" "}
                        <a href="/inscription">S'inscrire</a>
                    </p>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Login;
