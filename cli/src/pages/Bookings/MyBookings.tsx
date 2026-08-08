import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";
import type {
    BookingStatus,
    MyBooking,
    MyBookingsResponse,
} from "../../types/booking.types.ts";

const limit = 12;

function MyBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<MyBooking[]>([]);
    const [bookingToCancel, setBookingToCancel] =
        useState<MyBooking | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/connexion?retour=/tatoueur/demandes", {
                replace: true,
            });
            return;
        }

        setIsLoading(true);
        setError("");

        fetch(
            `${import.meta.env.VITE_API_URL}/bookings/me?page=${page}&limit=${limit}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        )
            .then(async (response) => {
                if (response.status === 401) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    navigate("/connexion?retour=/tatoueur/demandes", {
                        replace: true,
                    });
                    return null;
                }

                if (response.status === 403) {
                    navigate("/acces-interdit", { replace: true });
                    return null;
                }

                if (!response.ok) {
                    throw new Error("Impossible de charger vos demandes.");
                }

                return (await response.json()) as MyBookingsResponse;
            })
            .then((result) => {
                if (result) {
                    setBookings(result.data);
                    setTotal(result.meta.total);
                }
            })
            .catch((requestError) => {
                setError(
                    requestError instanceof Error
                        ? requestError.message
                        : "Impossible de charger vos demandes.",
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [navigate, page]);

    function getStatusLabel(status: BookingStatus) {
        if (status === "PENDING") {
            return "En attente";
        }

        if (status === "CONFIRMED") {
            return "Confirmée";
        }

        if (status === "REJECTED") {
            return "Refusée";
        }

        return "Annulée";
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        });
    }

    async function confirmCancellation() {
        if (!bookingToCancel) {
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/connexion?retour=/tatoueur/demandes");
            return;
        }

        setIsCancelling(true);
        setError("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/bookings/${bookingToCancel.id}/cancel`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );

            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                navigate("/connexion?retour=/tatoueur/demandes");
                return;
            }

            if (response.status === 409) {
                setError("Cette demande ne peut plus être annulée.");
                setBookingToCancel(null);
                return;
            }

            if (!response.ok) {
                throw new Error();
            }

            setBookings((currentBookings) =>
                currentBookings.map((booking) => {
                    if (booking.id === bookingToCancel.id) {
                        return {
                            ...booking,
                            status: "CANCELLED",
                            availability: {
                                ...booking.availability,
                                status: "OPEN",
                            },
                        };
                    }

                    return booking;
                }),
            );
            setBookingToCancel(null);
        } catch {
            setError(
                "Impossible d'annuler la demande. Veuillez réessayer plus tard.",
            );
        } finally {
            setIsCancelling(false);
        }
    }

    const pageCount = Math.ceil(total / limit);

    return (
        <div className="my-bookings-page">
            <Header />

            <main className="my-bookings-main">
                <section aria-labelledby="my-bookings-title">
                    <header className="my-bookings-header">
                        <h1 id="my-bookings-title">Mes demandes</h1>
                        <p>Suivez l'état de vos demandes de réservation.</p>
                        <a className="button button--primary" href="/#search">
                            Nouvelle recherche
                        </a>
                    </header>

                    {bookingToCancel && (
                        <section
                            className="booking-cancellation"
                            aria-labelledby="cancellation-title"
                        >
                            <p id="cancellation-title">
                                Annuler la demande pour le{" "}
                                {formatDate(
                                    bookingToCancel.availability.availableOn,
                                )}{" "}
                                ?
                            </p>
                            <button
                                className="button button--primary"
                                type="button"
                                disabled={isCancelling}
                                onClick={confirmCancellation}
                            >
                                {isCancelling
                                    ? "Annulation..."
                                    : "Confirmer l'annulation"}
                            </button>
                            <button
                                className="button button--secondary"
                                type="button"
                                disabled={isCancelling}
                                onClick={() => setBookingToCancel(null)}
                            >
                                Conserver
                            </button>
                        </section>
                    )}

                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}

                    {isLoading && <p>Chargement...</p>}

                    {!isLoading && !error && bookings.length === 0 && (
                        <div className="my-bookings-empty">
                            <h2>Vous n'avez encore aucune demande</h2>
                            <p>
                                Recherchez un poste disponible pour commencer.
                            </p>
                            <a
                                className="button button--primary"
                                href="/#search"
                            >
                                Rechercher un poste
                            </a>
                        </div>
                    )}

                    {!isLoading && bookings.length > 0 && (
                        <div className="my-bookings-list">
                            {bookings.map((booking) => (
                                <article
                                    className="booking-card"
                                    key={booking.id}
                                >
                                    <h2>
                                        {booking.availability.workstation.name}
                                    </h2>
                                    <p>
                                        {
                                            booking.availability.workstation
                                                .shop.name
                                        }{" "}
                                        ·{" "}
                                        {formatDate(
                                            booking.availability.availableOn,
                                        )}
                                    </p>
                                    <p>{getStatusLabel(booking.status)}</p>

                                    <div className="booking-card__actions">
                                        <span
                                            className={`booking-status booking-status--${booking.status.toLowerCase()}`}
                                        >
                                            {getStatusLabel(booking.status)}
                                        </span>

                                        {booking.status === "PENDING" && (
                                            <button
                                                className="button button--secondary"
                                                type="button"
                                                onClick={() =>
                                                    setBookingToCancel(booking)
                                                }
                                            >
                                                Annuler
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {pageCount > 1 && (
                        <nav
                            className="pagination"
                            aria-label="Pagination des demandes"
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

export default MyBookings;
