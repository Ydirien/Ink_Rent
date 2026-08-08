import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";
import type {
    CurrentUser,
    CurrentUserResponse,
} from "../../types/user.types.ts";

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/connexion?retour=/mon-compte", { replace: true });
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/users`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then(async (response) => {
                if (response.status === 401) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    navigate("/connexion?retour=/mon-compte", {
                        replace: true,
                    });
                    return null;
                }

                if (!response.ok) {
                    throw new Error("Impossible de charger votre compte.");
                }

                return (await response.json()) as CurrentUserResponse;
            })
            .then((result) => {
                if (result) {
                    setUser(result.data);
                }
            })
            .catch(() => {
                setError("Impossible de charger votre compte.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [navigate]);

    async function handleLogout() {
        const accessToken = localStorage.getItem("accessToken");

        try {
            if (accessToken) {
                await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            }
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            navigate("/connexion");
        }
    }

    async function handleDeleteAccount() {
        const confirmed = window.confirm(
            "Supprimer votre compte ? Cette action est irréversible.",
        );

        if (!confirmed) {
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/connexion?retour=/mon-compte");
            return;
        }

        setDeleteError("");
        setIsDeleting(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/users`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );

            if (response.status === 409) {
                setDeleteError(
                    "Suppression impossible : une réservation active est liée à ce compte.",
                );
                return;
            }

            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                navigate("/connexion?retour=/mon-compte");
                return;
            }

            if (!response.ok) {
                throw new Error();
            }

            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            navigate("/");
        } catch {
            setDeleteError(
                "Impossible de supprimer le compte. Veuillez réessayer plus tard.",
            );
        } finally {
            setIsDeleting(false);
        }
    }

    function getRoleLabel() {
        if (user?.role === "SHOP_MANAGER") {
            return "Gérant de salon";
        }

        return "Tatoueur invité";
    }

    return (
        <div className="profile-page">
            <Header />

            <main className="profile-main">
                <section
                    className="profile-card"
                    aria-labelledby="profile-title"
                >
                    <div className="profile-card__header">
                        <h1 id="profile-title">Mon compte</h1>
                        <p>Informations liées à votre session.</p>

                        <button
                            className="button button--secondary"
                            type="button"
                            onClick={handleLogout}
                        >
                            Se déconnecter
                        </button>
                    </div>

                    {isLoading && <p>Chargement...</p>}

                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}

                    {user && (
                        <dl className="profile-information">
                            <div className="profile-information__item">
                                <dt>Nom affiché</dt>
                                <dd>{user.displayName}</dd>
                            </div>

                            <div className="profile-information__item">
                                <dt>Adresse e-mail</dt>
                                <dd>{user.email}</dd>
                            </div>

                            <div className="profile-information__item">
                                <dt>Rôle</dt>
                                <dd>{getRoleLabel()}</dd>
                            </div>
                        </dl>
                    )}

                    {user && (
                        <section
                            className="profile-delete"
                            aria-labelledby="delete-account-title"
                        >
                            <h2 id="delete-account-title">
                                Supprimer mon compte
                            </h2>
                            <p>
                                Cette action supprimera définitivement votre
                                compte.
                            </p>

                            {deleteError && (
                                <p className="form-error" role="alert">
                                    {deleteError}
                                </p>
                            )}

                            <button
                                className="button button--secondary"
                                type="button"
                                disabled={isDeleting}
                                onClick={handleDeleteAccount}
                            >
                                {isDeleting
                                    ? "Suppression..."
                                    : "Demander la suppression"}
                            </button>
                        </section>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Profile;
