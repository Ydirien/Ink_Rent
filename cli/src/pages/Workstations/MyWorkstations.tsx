import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";
import type { ShopResponse } from "../../types/shop.types.ts";
import type {
    ManagerWorkstation,
    ManagerWorkstationsResponse,
} from "../../types/workstation.types.ts";

const limit = 12;

function MyWorkstations() {
    const navigate = useNavigate();
    const [workstations, setWorkstations] = useState<ManagerWorkstation[]>([]);
    const [shopName, setShopName] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/connexion?retour=/gerant/postes", { replace: true });
            return;
        }

        async function loadWorkstations() {
            setIsLoading(true);
            setError("");

            try {
                const shopResponse = await fetch(
                    `${import.meta.env.VITE_API_URL}/manager/shop`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    },
                );

                if (shopResponse.status === 401) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    navigate("/connexion?retour=/gerant/postes", {
                        replace: true,
                    });
                    return;
                }

                if (shopResponse.status === 403) {
                    navigate("/acces-interdit", { replace: true });
                    return;
                }

                if (shopResponse.status === 404) {
                    navigate("/gerant/salon", { replace: true });
                    return;
                }

                if (!shopResponse.ok) {
                    throw new Error("Impossible de charger votre salon.");
                }

                const shopResult =
                    (await shopResponse.json()) as ShopResponse;
                setShopName(shopResult.data.name);

                const workstationsResponse = await fetch(
                    `${import.meta.env.VITE_API_URL}/manager/workstations?page=${page}&limit=${limit}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    },
                );

                if (workstationsResponse.status === 401) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    navigate("/connexion?retour=/gerant/postes", {
                        replace: true,
                    });
                    return;
                }

                if (workstationsResponse.status === 403) {
                    navigate("/acces-interdit", { replace: true });
                    return;
                }

                if (!workstationsResponse.ok) {
                    throw new Error("Impossible de charger vos postes.");
                }

                const result =
                    (await workstationsResponse.json()) as ManagerWorkstationsResponse;

                setWorkstations(result.data);
                setTotal(result.meta.total);
            } catch (requestError) {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Impossible de charger vos postes.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadWorkstations();
    }, [navigate, page]);

    function formatPrice(priceInCents: number) {
        return (priceInCents / 100).toLocaleString("fr-FR", {
            maximumFractionDigits: 2,
        });
    }

    const pageCount = Math.ceil(total / limit);

    return (
        <div className="my-workstations-page">
            <Header />

            <main className="my-workstations-main">
                <section aria-labelledby="my-workstations-title">
                    <header className="my-workstations-header">
                        <h1 id="my-workstations-title">Mes postes</h1>
                        {shopName && <p>{shopName}</p>}

                        <a
                            className="button button--primary"
                            href="/gerant/postes/nouveau"
                        >
                            Nouveau poste
                        </a>
                    </header>

                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}

                    {isLoading && <p>Chargement...</p>}

                    {!isLoading && !error && workstations.length === 0 && (
                        <div className="my-workstations-empty">
                            <h2>Aucun poste publié</h2>
                            <p>
                                Créez votre premier poste, puis ajoutez une date
                                disponible.
                            </p>
                            <a
                                className="button button--primary"
                                href="/gerant/postes/nouveau"
                            >
                                Créer un poste
                            </a>
                        </div>
                    )}

                    {!isLoading && workstations.length > 0 && (
                        <div className="my-workstations-list">
                            {workstations.map((workstation) => (
                                <article
                                    className="workstation-card"
                                    key={workstation.id}
                                >
                                    <h2>{workstation.name}</h2>
                                    <p>
                                        {formatPrice(
                                            workstation.dailyPriceCents,
                                        )}{" "}
                                        € / jour ·{" "}
                                        {workstation.openAvailabilityCount}{" "}
                                        date(s) ouverte(s)
                                    </p>
                                    <a
                                        className="button button--secondary"
                                        href={`/gerant/postes/${workstation.id}`}
                                    >
                                        Gérer
                                    </a>
                                </article>
                            ))}
                        </div>
                    )}

                    {pageCount > 1 && (
                        <nav
                            className="pagination"
                            aria-label="Pagination des postes"
                        >
                            <button
                                type="button"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Précédent
                            </button>
                            <span>
                                Page {page} sur {pageCount}
                            </span>
                            <button
                                type="button"
                                disabled={page === pageCount}
                                onClick={() => setPage(page + 1)}
                            >
                                Suivant
                            </button>
                        </nav>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default MyWorkstations;
