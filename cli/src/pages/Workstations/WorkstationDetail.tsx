import { useEffect, useState, type FormEvent } from "react";
import {
    useLocation,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";
import type { CurrentUser } from "../../types/user.types.ts";
import type {
    PublicWorkstation,
    PublicWorkstationResponse,
} from "../../types/workstation.types.ts";

function WorkstationDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const { posteId } = useParams();
    const [searchParams] = useSearchParams();
    const requestedDate = searchParams.get("date") ?? "";
    const [workstation, setWorkstation] =
        useState<PublicWorkstation | null>(null);
    const [availabilityId, setAvailabilityId] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [requestError, setRequestError] = useState("");

    const accessToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    let currentUser: CurrentUser | null = null;

    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser) as CurrentUser;
        } catch {
            currentUser = null;
        }
    }

    useEffect(() => {
        if (!posteId || !Number.isInteger(Number(posteId))) {
            navigate("/page-introuvable", { replace: true });
            return;
        }

        setIsLoading(true);
        setError("");

        const detailParams = new URLSearchParams();

        if (requestedDate) {
            detailParams.set("date", requestedDate);
        }

        const query = detailParams.toString();
        const detailUrl = `${import.meta.env.VITE_API_URL}/workstations/${posteId}${query ? `?${query}` : ""}`;

        fetch(detailUrl)
            .then(async (response) => {
                if (response.status === 404) {
                    navigate("/page-introuvable", { replace: true });
                    return null;
                }

                if (response.status === 400) {
                    throw new Error("La date demandée est invalide.");
                }

                if (!response.ok) {
                    throw new Error("Impossible de charger ce poste.");
                }

                return (await response.json()) as PublicWorkstationResponse;
            })
            .then((result) => {
                if (!result) {
                    return;
                }

                setWorkstation(result.data);

                if (result.data.availabilities.length > 0) {
                    setAvailabilityId(
                        String(result.data.availabilities[0].id),
                    );
                } else {
                    setAvailabilityId("");
                }
            })
            .catch((requestErrorValue) => {
                setError(
                    requestErrorValue instanceof Error
                        ? requestErrorValue.message
                        : "Impossible de charger ce poste.",
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [navigate, posteId, requestedDate]);

    function formatDate(value: string) {
        return new Date(value).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        });
    }

    function formatPrice(priceInCents: number) {
        return (priceInCents / 100).toLocaleString("fr-FR", {
            maximumFractionDigits: 2,
        });
    }

    function getReturnUrl() {
        if (!workstation) {
            return "/recherche";
        }

        const params = new URLSearchParams({
            ville: workstation.shop.city,
        });

        if (requestedDate) {
            params.set("date", requestedDate);
        }

        return `/recherche?${params.toString()}`;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setRequestError("");

        if (!availabilityId) {
            setRequestError("Choisissez une date disponible.");
            return;
        }

        if (!accessToken) {
            const returnUrl = encodeURIComponent(
                location.pathname + location.search,
            );
            navigate(`/connexion?retour=${returnUrl}`);
            return;
        }

        if (currentUser?.role !== "TATTOO_ARTIST") {
            navigate("/acces-interdit");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/bookings`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        availabilityId: Number(availabilityId),
                        message: message.trim() || undefined,
                    }),
                },
            );

            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                const returnUrl = encodeURIComponent(
                    location.pathname + location.search,
                );
                navigate(`/connexion?retour=${returnUrl}`);
                return;
            }

            if (response.status === 403) {
                navigate("/acces-interdit");
                return;
            }

            if (response.status === 404 || response.status === 409) {
                setRequestError(
                    "Cette date n'est plus disponible. Choisissez une autre journée.",
                );
                return;
            }

            if (!response.ok) {
                throw new Error();
            }

            navigate("/tatoueur/demandes");
        } catch {
            setRequestError(
                "Impossible d'envoyer la demande. Veuillez réessayer plus tard.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    const selectedAvailability = workstation?.availabilities.find(
        (availability) => String(availability.id) === availabilityId,
    );
    const returnAfterAuthentication = encodeURIComponent(
        location.pathname + location.search,
    );

    return (
        <div className="workstation-detail-page">
            <Header />

            <main className="workstation-detail-main">
                {isLoading && <p>Chargement...</p>}

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}

                {!isLoading && workstation && (
                    <>
                        <a
                            className="workstation-detail-back"
                            href={getReturnUrl()}
                        >
                            ← Retour aux résultats
                        </a>

                        <article
                            className="workstation-detail-card"
                            aria-labelledby="workstation-title"
                        >
                            <h1 id="workstation-title">{workstation.name}</h1>
                            <p>
                                {workstation.shop.name} ·{" "}
                                {workstation.shop.address},{" "}
                                {workstation.shop.postalCode}{" "}
                                {workstation.shop.city}
                            </p>

                            {workstation.description && (
                                <p>{workstation.description}</p>
                            )}

                            {workstation.equipment && (
                                <ul className="workstation-equipment">
                                    {workstation.equipment
                                        .split(",")
                                        .map((equipment, index) => (
                                            <li
                                                key={`${equipment.trim()}-${index}`}
                                            >
                                                {equipment.trim()}
                                            </li>
                                        ))}
                                </ul>
                            )}

                            <p>
                                {formatPrice(workstation.dailyPriceCents)} € /
                                jour
                            </p>

                            <section aria-labelledby="shop-information-title">
                                <h2 id="shop-information-title">Le salon</h2>
                                <p>
                                    {workstation.shop.description ??
                                        "Aucune description du salon n'est disponible."}
                                </p>
                            </section>
                        </article>

                        {workstation.availabilities.length === 0 && (
                            <section
                                className="availability-unavailable"
                                aria-labelledby="availability-unavailable-title"
                            >
                                <h2 id="availability-unavailable-title">
                                    Date indisponible
                                </h2>
                                <p>
                                    Cette date n'est plus disponible. Choisissez
                                    une autre journée ouverte pour continuer.
                                </p>
                            </section>
                        )}

                        {workstation.availabilities.length > 0 &&
                            (!accessToken || !currentUser) && (
                                <section
                                    className="booking-login"
                                    aria-labelledby="booking-login-title"
                                >
                                    <h2 id="booking-login-title">
                                        Une date vous intéresse ?
                                    </h2>
                                    <p>
                                        Connectez-vous avec un compte tatoueur
                                        pour envoyer une demande.
                                    </p>
                                    <a
                                        className="button button--primary"
                                        href={`/connexion?retour=${returnAfterAuthentication}`}
                                    >
                                        Se connecter pour demander
                                    </a>
                                    <a
                                        className="button button--secondary"
                                        href={`/inscription?retour=${returnAfterAuthentication}`}
                                    >
                                        Créer un compte tatoueur
                                    </a>
                                </section>
                            )}

                        {workstation.availabilities.length > 0 &&
                            accessToken &&
                            currentUser?.role === "SHOP_MANAGER" && (
                                <section className="booking-manager-information">
                                    <h2>Demande réservée aux tatoueurs</h2>
                                    <p>
                                        Un compte gérant ne peut pas envoyer de
                                        demande de réservation.
                                    </p>
                                    <a
                                        className="button button--secondary"
                                        href="/gerant/postes"
                                    >
                                        Revenir à mes postes
                                    </a>
                                </section>
                            )}

                        {workstation.availabilities.length > 0 &&
                            accessToken &&
                            currentUser?.role === "TATTOO_ARTIST" && (
                                <section
                                    className="booking-request"
                                    aria-labelledby="booking-request-title"
                                >
                                    <h2 id="booking-request-title">
                                        Demander cette journée
                                    </h2>

                                    <form onSubmit={handleSubmit}>
                                        <div className="form-field">
                                            <label htmlFor="availability">
                                                Date disponible
                                            </label>
                                            <select
                                                id="availability"
                                                name="availabilityId"
                                                value={availabilityId}
                                                onChange={(event) => {
                                                    setAvailabilityId(
                                                        event.target.value,
                                                    );
                                                    setRequestError("");
                                                }}
                                                required
                                            >
                                                {workstation.availabilities.map(
                                                    (availability) => (
                                                        <option
                                                            key={
                                                                availability.id
                                                            }
                                                            value={
                                                                availability.id
                                                            }
                                                        >
                                                            {formatDate(
                                                                availability.availableOn,
                                                            )}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>

                                        <div className="form-field">
                                            <label htmlFor="booking-message">
                                                Message au gérant — facultatif
                                            </label>
                                            <textarea
                                                id="booking-message"
                                                name="message"
                                                value={message}
                                                maxLength={500}
                                                rows={5}
                                                onChange={(event) =>
                                                    setMessage(
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        {selectedAvailability && (
                                            <div className="booking-summary">
                                                <p>Récapitulatif</p>
                                                <p>
                                                    {workstation.name} ·{" "}
                                                    {formatDate(
                                                        selectedAvailability.availableOn,
                                                    )}{" "}
                                                    ·{" "}
                                                    {formatPrice(
                                                        workstation.dailyPriceCents,
                                                    )}{" "}
                                                    € la journée
                                                </p>
                                            </div>
                                        )}

                                        {requestError && (
                                            <p
                                                className="form-error"
                                                role="alert"
                                            >
                                                {requestError}
                                            </p>
                                        )}

                                        <button
                                            className="button button--primary"
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting
                                                ? "Envoi..."
                                                : "Confirmer la demande"}
                                        </button>
                                    </form>
                                </section>
                            )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default WorkstationDetail;
