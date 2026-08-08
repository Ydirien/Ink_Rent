import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/Footer/Footer.tsx";
import Header from "../../components/Header/Header.tsx";
import type {
    AvailabilityResponse,
    ManagerAvailability,
    ManagerWorkstationDetail,
    ManagerWorkstationResponse,
    WorkstationFormErrors,
} from "../../types/workstation.types.ts";

function ManageWorkstation() {
    const navigate = useNavigate();
    const { posteId } = useParams();
    const [workstation, setWorkstation] =
        useState<ManagerWorkstationDetail | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [equipment, setEquipment] = useState("");
    const [dailyPrice, setDailyPrice] = useState("");
    const [newDate, setNewDate] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingDate, setIsAddingDate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [removingAvailabilityId, setRemovingAvailabilityId] = useState<
        number | null
    >(null);
    const [errors, setErrors] = useState<WorkstationFormErrors>({});
    const [actionError, setActionError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const workstationId = Number(posteId);

    useEffect(() => {
        if (!Number.isInteger(workstationId) || workstationId <= 0) {
            navigate("/page-introuvable", { replace: true });
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate(`/connexion?retour=/gerant/postes/${workstationId}`, {
                replace: true,
            });
            return;
        }

        async function loadWorkstation() {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/manager/workstations/${workstationId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    },
                );

                if (response.status === 401) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    navigate(
                        `/connexion?retour=/gerant/postes/${workstationId}`,
                        { replace: true },
                    );
                    return;
                }

                if (response.status === 403 || response.status === 404) {
                    navigate("/acces-interdit", { replace: true });
                    return;
                }

                if (!response.ok) {
                    throw new Error();
                }

                const result =
                    (await response.json()) as ManagerWorkstationResponse;

                setWorkstation(result.data);
                fillForm(result.data);
            } catch {
                setActionError(
                    "Impossible de charger le poste. Veuillez réessayer plus tard.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadWorkstation();
    }, [navigate, workstationId]);

    function fillForm(data: ManagerWorkstationDetail) {
        setName(data.name);
        setDescription(data.description ?? "");
        setEquipment(data.equipment ?? "");
        setDailyPrice((data.dailyPriceCents / 100).toString());
    }

    function validateForm() {
        const formErrors: WorkstationFormErrors = {};
        const normalizedPrice = dailyPrice.trim().replace(",", ".");
        const priceNumber = Number(normalizedPrice);

        if (!name.trim()) {
            formErrors.name = "Le nom est obligatoire.";
        } else if (name.trim().length < 2) {
            formErrors.name = "Le nom doit contenir au moins 2 caractères.";
        }

        if (description.trim().length > 1000) {
            formErrors.description =
                "La description ne doit pas dépasser 1000 caractères.";
        }

        if (equipment.trim().length > 1000) {
            formErrors.equipment =
                "Les équipements ne doivent pas dépasser 1000 caractères.";
        }

        if (!dailyPrice.trim()) {
            formErrors.dailyPrice = "Le prix est obligatoire.";
        } else if (!Number.isFinite(priceNumber)) {
            formErrors.dailyPrice = "Le prix est invalide.";
        } else if (priceNumber < 0) {
            formErrors.dailyPrice = "Le prix ne peut pas être négatif.";
        } else if (!/^\d+(\.\d{1,2})?$/.test(normalizedPrice)) {
            formErrors.dailyPrice =
                "Le prix doit contenir au maximum 2 décimales.";
        } else if (priceNumber > 999999.99) {
            formErrors.dailyPrice = "Le prix est trop élevé.";
        }

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    }

    async function handleUpdate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate(`/connexion?retour=/gerant/postes/${workstationId}`);
            return;
        }

        const priceNumber = Number(dailyPrice.trim().replace(",", "."));
        setIsSaving(true);
        setActionError("");
        setSuccessMessage("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/manager/workstations/${workstationId}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        description: description.trim(),
                        equipment: equipment.trim(),
                        dailyPriceCents: Math.round(priceNumber * 100),
                    }),
                },
            );

            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                navigate(`/connexion?retour=/gerant/postes/${workstationId}`);
                return;
            }

            if (response.status === 403 || response.status === 404) {
                navigate("/acces-interdit");
                return;
            }

            if (response.status === 400) {
                setErrors({
                    form: "Certaines informations du poste sont invalides.",
                });
                return;
            }

            if (!response.ok) {
                throw new Error();
            }

            const result =
                (await response.json()) as ManagerWorkstationResponse;

            setWorkstation({
                ...result.data,
                availabilities: workstation?.availabilities ?? [],
            });
            setIsEditing(false);
            setSuccessMessage("Le poste a bien été modifié.");
        } catch {
            setActionError(
                "Impossible de modifier le poste. Veuillez réessayer plus tard.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleAddDate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!newDate) {
            setActionError("La date est obligatoire.");
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate(`/connexion?retour=/gerant/postes/${workstationId}`);
            return;
        }

        setIsSaving(true);
        setActionError("");
        setSuccessMessage("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/manager/workstations/${workstationId}/availabilities`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ date: newDate }),
                },
            );

            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                navigate(`/connexion?retour=/gerant/postes/${workstationId}`);
                return;
            }

            if (response.status === 403 || response.status === 404) {
                navigate("/acces-interdit");
                return;
            }

            if (response.status === 400) {
                setActionError("La date doit être future.");
                return;
            }

            if (response.status === 409) {
                setActionError("Cette date est déjà disponible.");
                return;
            }

            if (!response.ok) {
                throw new Error();
            }

            const result = (await response.json()) as AvailabilityResponse;

            setWorkstation((currentWorkstation) => {
                if (!currentWorkstation) {
                    return currentWorkstation;
                }

                const availabilities = [
                    ...currentWorkstation.availabilities,
                    result.data,
                ].sort((first, second) =>
                    first.availableOn.localeCompare(second.availableOn),
                );

                return { ...currentWorkstation, availabilities };
            });
            setNewDate("");
            setIsAddingDate(false);
            setSuccessMessage("La date a bien été ajoutée.");
        } catch {
            setActionError(
                "Impossible d'ajouter la date. Veuillez réessayer plus tard.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleRemoveAvailability(
        availability: ManagerAvailability,
    ) {
        const confirmed = window.confirm(
            `Retirer la disponibilité du ${formatDate(availability.availableOn)} ?`,
        );

        if (!confirmed) {
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate(`/connexion?retour=/gerant/postes/${workstationId}`);
            return;
        }

        setRemovingAvailabilityId(availability.id);
        setActionError("");
        setSuccessMessage("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/manager/workstations/${workstationId}/availabilities/${availability.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );

            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                navigate(`/connexion?retour=/gerant/postes/${workstationId}`);
                return;
            }

            if (response.status === 403 || response.status === 404) {
                navigate("/acces-interdit");
                return;
            }

            if (response.status === 409) {
                setActionError(
                    "Cette disponibilité ne peut plus être supprimée.",
                );
                return;
            }

            if (!response.ok) {
                throw new Error();
            }

            setWorkstation((currentWorkstation) => {
                if (!currentWorkstation) {
                    return currentWorkstation;
                }

                return {
                    ...currentWorkstation,
                    availabilities: currentWorkstation.availabilities.filter(
                        (item) => item.id !== availability.id,
                    ),
                };
            });
            setSuccessMessage("La disponibilité a bien été retirée.");
        } catch {
            setActionError(
                "Impossible de retirer la disponibilité. Veuillez réessayer plus tard.",
            );
        } finally {
            setRemovingAvailabilityId(null);
        }
    }

    async function handleDeleteWorkstation() {
        const confirmed = window.confirm(
            "Voulez-vous vraiment supprimer définitivement ce poste ?",
        );

        if (!confirmed) {
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate(`/connexion?retour=/gerant/postes/${workstationId}`);
            return;
        }

        setIsDeleting(true);
        setActionError("");
        setSuccessMessage("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/manager/workstations/${workstationId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );

            if (response.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                navigate(`/connexion?retour=/gerant/postes/${workstationId}`);
                return;
            }

            if (response.status === 403 || response.status === 404) {
                navigate("/acces-interdit");
                return;
            }

            if (response.status === 409) {
                setActionError(
                    "Suppression impossible : une demande en attente ou une réservation future concerne ce poste.",
                );
                return;
            }

            if (!response.ok) {
                throw new Error();
            }

            navigate("/gerant/postes");
        } catch {
            setActionError(
                "Impossible de supprimer le poste. Veuillez réessayer plus tard.",
            );
        } finally {
            setIsDeleting(false);
        }
    }

    function cancelEdit() {
        if (workstation) {
            fillForm(workstation);
        }

        setErrors({});
        setIsEditing(false);
    }

    function formatPrice(priceInCents: number) {
        return (priceInCents / 100).toLocaleString("fr-FR", {
            maximumFractionDigits: 2,
        });
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        });
    }

    function getStatusLabel(status: ManagerAvailability["status"]) {
        if (status === "pending") {
            return "En attente";
        }

        if (status === "booked") {
            return "Réservée";
        }

        return "Ouverte";
    }

    function getTomorrow() {
        const tomorrow = new Date();
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        return tomorrow.toISOString().slice(0, 10);
    }

    const equipmentList =
        workstation?.equipment
            ?.split(/[,;\n]/)
            .map((item) => item.trim())
            .filter(Boolean) ?? [];

    return (
        <div className="manage-workstation-page">
            <Header />

            <main className="manage-workstation-main">
                <a href="/gerant/postes">← Retour aux postes</a>

                {isLoading && <p>Chargement...</p>}

                {actionError && (
                    <p className="form-error" role="alert">
                        {actionError}
                    </p>
                )}

                {successMessage && (
                    <p className="form-success" role="status">
                        {successMessage}
                    </p>
                )}

                {!isLoading && workstation && (
                    <>
                        <header className="manage-workstation-header">
                            <h1>{workstation.name}</h1>
                            <p>
                                {formatPrice(workstation.dailyPriceCents)} € /
                                jour
                            </p>

                            <div className="manage-workstation-actions">
                                <button
                                    className="button button--secondary"
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setIsAddingDate(false);
                                        setActionError("");
                                        setSuccessMessage("");
                                    }}
                                >
                                    Modifier
                                </button>
                                <button
                                    className="button button--secondary"
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={handleDeleteWorkstation}
                                >
                                    {isDeleting
                                        ? "Suppression..."
                                        : "Supprimer"}
                                </button>
                            </div>
                        </header>

                        {isEditing && (
                            <section aria-labelledby="edit-workstation-title">
                                <h2 id="edit-workstation-title">
                                    Modifier le poste
                                </h2>

                                {errors.form && (
                                    <p className="form-error" role="alert">
                                        {errors.form}
                                    </p>
                                )}

                                <form onSubmit={handleUpdate} noValidate>
                                    <div className="form-field">
                                        <label htmlFor="workstation-name">
                                            Nom du poste
                                        </label>
                                        <input
                                            id="workstation-name"
                                            type="text"
                                            value={name}
                                            maxLength={120}
                                            aria-invalid={Boolean(errors.name)}
                                            onChange={(event) => {
                                                setName(event.target.value);
                                                setErrors({
                                                    ...errors,
                                                    name: undefined,
                                                    form: undefined,
                                                });
                                            }}
                                            required
                                        />
                                        {errors.name && (
                                            <p className="form-field__error">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="workstation-description">
                                            Description
                                        </label>
                                        <textarea
                                            id="workstation-description"
                                            value={description}
                                            maxLength={1000}
                                            rows={5}
                                            aria-invalid={Boolean(
                                                errors.description,
                                            )}
                                            onChange={(event) => {
                                                setDescription(
                                                    event.target.value,
                                                );
                                                setErrors({
                                                    ...errors,
                                                    description: undefined,
                                                    form: undefined,
                                                });
                                            }}
                                        />
                                        {errors.description && (
                                            <p className="form-field__error">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="workstation-equipment">
                                            Équipements
                                        </label>
                                        <textarea
                                            id="workstation-equipment"
                                            value={equipment}
                                            maxLength={1000}
                                            rows={5}
                                            aria-invalid={Boolean(
                                                errors.equipment,
                                            )}
                                            onChange={(event) => {
                                                setEquipment(event.target.value);
                                                setErrors({
                                                    ...errors,
                                                    equipment: undefined,
                                                    form: undefined,
                                                });
                                            }}
                                        />
                                        {errors.equipment && (
                                            <p className="form-field__error">
                                                {errors.equipment}
                                            </p>
                                        )}
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="workstation-price">
                                            Prix journalier en euros
                                        </label>
                                        <input
                                            id="workstation-price"
                                            type="number"
                                            value={dailyPrice}
                                            min="0"
                                            max="999999.99"
                                            step="0.01"
                                            aria-invalid={Boolean(
                                                errors.dailyPrice,
                                            )}
                                            onChange={(event) => {
                                                setDailyPrice(
                                                    event.target.value,
                                                );
                                                setErrors({
                                                    ...errors,
                                                    dailyPrice: undefined,
                                                    form: undefined,
                                                });
                                            }}
                                            required
                                        />
                                        {errors.dailyPrice && (
                                            <p className="form-field__error">
                                                {errors.dailyPrice}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        className="button button--primary"
                                        type="submit"
                                        disabled={isSaving}
                                    >
                                        {isSaving
                                            ? "Enregistrement..."
                                            : "Enregistrer"}
                                    </button>
                                    <button
                                        className="button button--secondary"
                                        type="button"
                                        onClick={cancelEdit}
                                    >
                                        Annuler
                                    </button>
                                </form>
                            </section>
                        )}

                        {isAddingDate && (
                            <section aria-labelledby="new-date-title">
                                <h2 id="new-date-title">
                                    Nouvelle date disponible
                                </h2>
                                <form onSubmit={handleAddDate} noValidate>
                                    <label htmlFor="new-availability-date">
                                        Date
                                    </label>
                                    <input
                                        id="new-availability-date"
                                        type="date"
                                        value={newDate}
                                        min={getTomorrow()}
                                        onChange={(event) => {
                                            setNewDate(event.target.value);
                                            setActionError("");
                                        }}
                                        required
                                    />
                                    <button
                                        className="button button--primary"
                                        type="submit"
                                        disabled={isSaving}
                                    >
                                        {isSaving
                                            ? "Ajout..."
                                            : "Ajouter la date"}
                                    </button>
                                    <button
                                        className="button button--secondary"
                                        type="button"
                                        onClick={() => {
                                            setIsAddingDate(false);
                                            setNewDate("");
                                            setActionError("");
                                        }}
                                    >
                                        Annuler
                                    </button>
                                </form>
                            </section>
                        )}

                        <section aria-labelledby="workstation-info-title">
                            <h2 id="workstation-info-title">
                                Informations du poste
                            </h2>
                            <p>
                                {workstation.description ||
                                    "Aucune description renseignée."}
                            </p>

                            {equipmentList.length > 0 ? (
                                <ul>
                                    {equipmentList.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Aucun équipement renseigné.</p>
                            )}
                        </section>

                        <section aria-labelledby="availabilities-title">
                            <h2 id="availabilities-title">Disponibilités</h2>
                            <button
                                className="button button--primary"
                                type="button"
                                onClick={() => {
                                    setIsAddingDate(true);
                                    setIsEditing(false);
                                    setActionError("");
                                    setSuccessMessage("");
                                }}
                            >
                                Ajouter une date
                            </button>

                            {workstation.availabilities.length === 0 && (
                                <p>Aucune disponibilité ajoutée.</p>
                            )}

                            <div className="availability-list">
                                {workstation.availabilities.map(
                                    (availability) => (
                                        <article key={availability.id}>
                                            <h3>
                                                {formatDate(
                                                    availability.availableOn,
                                                )}
                                            </h3>
                                            <p>
                                                {getStatusLabel(
                                                    availability.status,
                                                )}
                                            </p>

                                            {availability.status === "open" ? (
                                                <button
                                                    className="button button--secondary"
                                                    type="button"
                                                    disabled={
                                                        removingAvailabilityId ===
                                                        availability.id
                                                    }
                                                    onClick={() =>
                                                        handleRemoveAvailability(
                                                            availability,
                                                        )
                                                    }
                                                >
                                                    {removingAvailabilityId ===
                                                    availability.id
                                                        ? "Retrait..."
                                                        : "Retirer"}
                                                </button>
                                            ) : (
                                                <p>
                                                    <span aria-hidden="true">
                                                        ●
                                                    </span>{" "}
                                                    Non modifiable
                                                </p>
                                            )}
                                        </article>
                                    ),
                                )}
                            </div>
                        </section>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default ManageWorkstation;
