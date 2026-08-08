import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Register.css";
import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";
import type {
    RegisterResponse,
    UserRole,
} from "../../types/auth.types.ts";

const emptyErrors = {
    displayName: "",
    email: "",
    password: "",
    form: "",
};

function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<UserRole>("TATTOO_ARTIST");
    const [errors, setErrors] = useState(emptyErrors);
    const [isLoading, setIsLoading] = useState(false);

    function validateForm() {
        const newErrors = { ...emptyErrors };
        const trimmedName = displayName.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) {
            newErrors.displayName = "Le nom est obligatoire.";
        } else if (trimmedName.length < 2) {
            newErrors.displayName = "Le nom doit contenir au moins 2 caractères.";
        }

        if (!trimmedEmail) {
            newErrors.email = "L'adresse e-mail est obligatoire.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newErrors.email = "L'adresse e-mail n'est pas valide.";
        }

        const passwordIsValid =
            password.length >= 12 &&
            password.length <= 30 &&
            /[a-z]/.test(password) &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password);

        if (!password) {
            newErrors.password = "Le mot de passe est obligatoire.";
        } else if (!passwordIsValid) {
            newErrors.password =
                "Le mot de passe ne respecte pas les critères.";
        }

        setErrors(newErrors);

        return (
            !newErrors.displayName &&
            !newErrors.email &&
            !newErrors.password
        );
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        displayName: displayName.trim(),
                        email: email.trim(),
                        password,
                        confirm: password,
                        role,
                    }),
                },
            );

            if (!response.ok) {
                setErrors({
                    ...emptyErrors,
                    form:
                        response.status === 409
                            ? "Cette adresse e-mail est déjà utilisée."
                            : "Les informations saisies ne sont pas valides.",
                });
                return;
            }

            const result = (await response.json()) as RegisterResponse;

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
            setErrors({
                ...emptyErrors,
                form: "Le serveur est indisponible. Veuillez réessayer plus tard.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="register-page">
            <Header />

            <main className="register-main">
                <section
                    className="register-card"
                    aria-labelledby="register-title"
                >
                    <header className="register-card__header">
                        <h1 id="register-title">Créer un compte</h1>
                        <p>Choisissez le rôle correspondant à votre activité.</p>
                    </header>

                    {errors.form && (
                        <p className="form-error" role="alert">
                            {errors.form}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-field">
                            <label htmlFor="displayName">Nom affiché</label>
                            <input
                                id="displayName"
                                name="displayName"
                                type="text"
                                value={displayName}
                                placeholder="Alex Martin"
                                autoComplete="name"
                                aria-invalid={Boolean(errors.displayName)}
                                aria-describedby={
                                    errors.displayName
                                        ? "display-name-error"
                                        : undefined
                                }
                                onChange={(event) =>
                                    setDisplayName(event.target.value)
                                }
                            />
                            {errors.displayName && (
                                <p
                                    id="display-name-error"
                                    className="field-error"
                                >
                                    {errors.displayName}
                                </p>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="registerEmail">
                                Adresse e-mail
                            </label>
                            <input
                                id="registerEmail"
                                name="email"
                                type="email"
                                value={email}
                                placeholder="alex@exemple.fr"
                                autoComplete="email"
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={
                                    errors.email ? "email-error" : undefined
                                }
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                            />
                            {errors.email && (
                                <p id="email-error" className="field-error">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="registerPassword">
                                Mot de passe
                            </label>
                            <input
                                id="registerPassword"
                                name="password"
                                type="password"
                                value={password}
                                autoComplete="new-password"
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={
                                    errors.password
                                        ? "password-error"
                                        : undefined
                                }
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                            />
                            {errors.password && (
                                <p id="password-error" className="field-error">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <fieldset>
                            <legend>Je suis</legend>

                            <label>
                                <input
                                    type="radio"
                                    name="role"
                                    value="TATTOO_ARTIST"
                                    checked={role === "TATTOO_ARTIST"}
                                    onChange={() => setRole("TATTOO_ARTIST")}
                                />
                                Tatoueur invité
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="role"
                                    value="SHOP_MANAGER"
                                    checked={role === "SHOP_MANAGER"}
                                    onChange={() => setRole("SHOP_MANAGER")}
                                />
                                Gérant de salon
                            </label>
                        </fieldset>

                        <p className="register-card__privacy">
                            En créant un compte, vous pouvez consulter notre{" "}
                            <a href="/politique-de-confidentialite">
                                politique de confidentialité
                            </a>
                            .
                        </p>

                        <button
                            className="button button--primary"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Création..."
                                : "Créer mon compte"}
                        </button>
                    </form>

                    <p>
                        Déjà inscrit ?{" "}
                        <a href="/connexion">Se connecter</a>
                    </p>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Register;
