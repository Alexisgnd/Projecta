import React, { useEffect, useState } from "react";
import Text from "../components/Elements/Text";
import "./Relations.css";
import supabase from "../supabaseClient";
import ProfilePreviewModal from "../components/Modals/ProfilePreviewModal";
import { FaUserPlus, FaHourglassHalf, FaCheck, FaTimes } from "react-icons/fa";
import Alert from "../components/Elements/Alert"; // Pour afficher l'alerte
import { UserStatusDot } from "../components/User Profile/UserStatus";

// Récupère les emails des relations approuvées
const getUserRelations = async (userEmail: string) => {
  const { data, error } = await supabase
    .from("user_friends")
    .select("friend_email")
    .eq("user_email", userEmail);
  if (error) return [];
  return data.map((r: any) => r.friend_email);
};

const Relations: React.FC = () => {
  const [relations, setRelations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUser, setPreviewUser] = useState<any | null>(null);
  // On stocke les demandes avec leur status
  const [pendingRequests, setPendingRequests] = useState<{ email: string, status: string }[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<{ email: string, status: string }[]>([]);
  const [alert, setAlert] = useState<{
    type: "error" | "success" | "info" | "warning";
    title: string;
    message: React.ReactNode;
    key?: string;
  } | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Fonction utilitaire pour afficher une alerte
  function showAlert(type: "error" | "success" | "info" | "warning", title: string, message: React.ReactNode) {
    setAlert({ type, title, message, key: Date.now().toString() });
  }

  useEffect(() => {
    const fetchRelationsAndUsers = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !user.email) {
        setLoading(false);
        return;
      }
      setCurrentUserEmail(user.email);

      // Relations approuvées
      const relationEmails = await getUserRelations(user.email);

      // Tous les utilisateurs actifs
      const { data: usersData } = await supabase
        .from("users")
        .select("*")
        .eq("isActive", true);

      // Demandes envoyées (status != approved)
      const { data: pending } = await supabase
        .from("relations")
        .select("receiver_email, status")
        .eq("sender_email", user.email)
        .not("status", "eq", "approved");

      // Demandes reçues (status != approved)
      const { data: received } = await supabase
        .from("relations")
        .select("sender_email, status")
        .eq("receiver_email", user.email)
        .not("status", "eq", "approved");

      const pendingList = pending?.map((r: any) => ({
        email: r.receiver_email,
        status: r.status,
      })) || [];
      const receivedList = received?.map((r: any) => ({
        email: r.sender_email,
        status: r.status,
      })) || [];

      const relationsList =
        usersData?.filter((u: any) => relationEmails.includes(u.email)) || [];
      const allUsersList = usersData || [];

      setRelations(relationsList);
      setAllUsers(allUsersList);
      setPendingRequests(pendingList);
      setReceivedRequests(receivedList);
      setLoading(false);
    };
    fetchRelationsAndUsers();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      supabase.auth.getUser().then(({ data }) => {
        if (!data?.user?.email) return;

        supabase
          .from("users")
          .update({ status: "offline" })
          .eq("email", data.user.email);
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Ajout d'une demande de relation
  const handleAddRelation = async (receiverEmail: string) => {
    setPendingRequests((prev) => [...prev, { email: receiverEmail, status: "pending" }]);
    showAlert("info", "Demande envoyée", "Votre demande de relation a été envoyée.");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !user.email) return;
    // Ajoute la demande dans la table relations
    await supabase
      .from("relations")
      .insert([{ sender_email: user.email, receiver_email: receiverEmail, status: "pending" }]);
  };

  // Fonction pour retirer un ami
  const handleRemoveFriend = async (friendEmail: string) => {
    if (!currentUserEmail) return;
    await supabase
      .from("user_friends")
      .delete()
      .or(
        `and(user_email.eq.${currentUserEmail},friend_email.eq.${friendEmail}),and(user_email.eq.${friendEmail},friend_email.eq.${currentUserEmail})`
      );
    setRelations((prev) => prev.filter((r) => r.email !== friendEmail));
    showAlert("success", "Relation supprimée", "L'ami a été retiré de vos relations.");
  };

  return (
    <div className="relations-root">
      <div className="relations-container">
        <div className="relations-left">
          <Text size={32} bold color="primary" className="relations-title">
            Relations
          </Text>
          <div className="relations-section-title">
            <Text size={20} bold>
              Relations ajoutées
            </Text>
          </div>
          <div className="relations-list">
            {loading ? (
              <Text size={16} color="secondary">
                Chargement...
              </Text>
            ) : relations.length === 0 ? (
              <Text size={16} color="secondary">
                Aucune relation ajoutée.
              </Text>
            ) : (
              relations.map((relation) => (
                <div className="relation-card" key={relation.id || relation.email}>
                  {relation.picture_url ? (
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <img
                        src={relation.picture_url}
                        alt={relation.first_name}
                        className="relation-avatar"
                        onClick={() => setPreviewUser(relation)}
                      />
                      <UserStatusDot status={relation.status} />
                    </div>
                  ) : (
                    <div
                      className="relation-avatar"
                      style={{ position: "relative", display: "inline-block" }}
                      onClick={() => setPreviewUser(relation)}
                    >
                      <UserStatusDot status={relation.status} />
                    </div>
                  )}
                  <div className="relation-info">
                    <span className="relation-name">
                      {relation.first_name} {relation.last_name}
                    </span>
                    <span className="relation-status">
                      {relation.special_status || "Utilisateur"}
                    </span>
                  </div>
                  {/* Bouton retirer l'ami */}
                  <button
                    className="relation-action-btn remove"
                    title="Retirer cet ami"
                    onClick={() => handleRemoveFriend(relation.email)}
                  >
                    <FaTimes />
                  </button>
                </div>
              )))
            }
          </div>
          <div className="relations-section-title" style={{ marginTop: 32 }}>
            <Text size={20} bold>
              Demandes reçues
            </Text>
          </div>
          <div className="relations-list">
            {receivedRequests.filter(r => r.status === "pending").length === 0 ? (
              <Text size={16} color="secondary">
                Aucune demande reçue.
              </Text>
            ) : (
              receivedRequests
                .filter(r => r.status === "pending")
                .map((req) => {
                  const user = allUsers.find((u: any) => u.email === req.email);
                  if (!user) return null;
                  return (
                    <div className="relation-card" key={user.id}>
                      {user.picture_url ? (
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <img
                            src={user.picture_url}
                            alt={user.first_name}
                            className="relation-avatar"
                            onClick={() => setPreviewUser(user)}
                          />
                          <UserStatusDot status={user.status} />
                        </div>
                      ) : (
                        <div
                          className="relation-avatar"
                          style={{ position: "relative", display: "inline-block" }}
                          onClick={() => setPreviewUser(user)}
                        >
                          <UserStatusDot status={user.status} />
                        </div>
                      )}
                      <div className="relation-info">
                        <span className="relation-name">
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="relation-status">
                          {user.special_status || "Utilisateur"}
                        </span>
                      </div>
                      <div className="relation-actions">
                        {/* Bouton accepter */}
                        <button
                          className="relation-action-btn accept"
                          title="Accepter"
                          onClick={async () => {
                            // 1. Met à jour la demande en "approved"
                            await supabase
                              .from("relations")
                              .update({ status: "approved" })
                              .eq("sender_email", user.email)
                              .eq("receiver_email", currentUserEmail);

                            // 2. Ajoute la relation dans user_friends (dans les deux sens)
                            await supabase
                              .from("user_friends")
                              .insert([
                                { user_email: currentUserEmail, friend_email: user.email },
                                { user_email: user.email, friend_email: currentUserEmail }
                              ]);

                            // 3. Supprime la demande de la liste locale
                            setReceivedRequests((prev) =>
                              prev.filter((r) => r.email !== user.email)
                            );
                            setRelations((prev) => [...prev, user]);
                            showAlert("success", "Relation acceptée", "Vous êtes maintenant en relation.");
                          }}
                        >
                          <FaCheck />
                        </button>
                        {/* Bouton refuser */}
                        <button
                          className="relation-action-btn reject"
                          title="Refuser"
                          onClick={async () => {
                            // 1. Met à jour la demande en "refused"
                            await supabase
                              .from("relations")
                              .update({ status: "refused" })
                              .eq("sender_email", user.email)
                              .eq("receiver_email", currentUserEmail);

                            // 2. Supprime la demande de la liste locale
                            setReceivedRequests((prev) =>
                              prev.filter((r) => r.email !== user.email)
                            );
                            showAlert("info", "Demande refusée", "La demande a été refusée.");
                          }}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
          <div className="relations-section-title" style={{ marginTop: 32 }}>
            <Text size={20} bold>
              Demandes envoyées
            </Text>
          </div>
          <div className="relations-list">
            {pendingRequests.filter(r => r.status === "pending").length === 0 ? (
              <Text size={16} color="secondary">
                Aucune demande envoyée.
              </Text>
            ) : (
              pendingRequests
                .filter(r => r.status === "pending")
                .map((req) => {
                  const user = allUsers.find((u: any) => u.email === req.email);
                  if (!user) return null;
                  return (
                    <div className="relation-card" key={user.id}>
                      {user.picture_url ? (
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <img
                            src={user.picture_url}
                            alt={user.first_name}
                            className="relation-avatar"
                            onClick={() => setPreviewUser(user)}
                          />
                          <UserStatusDot status={user.status} />
                        </div>
                      ) : (
                        <div
                          className="relation-avatar"
                          style={{ position: "relative", display: "inline-block" }}
                          onClick={() => setPreviewUser(user)}
                        >
                          <UserStatusDot status={user.status} />
                        </div>
                      )}
                      <div className="relation-info">
                        <span className="relation-name">
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="relation-status">
                          {user.special_status || "Utilisateur"}
                        </span>
                      </div>
                      <span className="relation-status-text" data-btncolor="#f59e42">
                        Demande envoyée
                      </span>
                    </div>
                  );
                })
            )}
          </div>
          <div className="relations-section-title" style={{ marginTop: 32 }}>
            <Text size={20} bold>
              Tous les utilisateurs actifs
            </Text>
          </div>
          <div className="relations-list">
            {loading ? (
              <Text size={16} color="secondary">
                Chargement...
              </Text>
            ) : allUsers.length === 0 ? (
              <Text size={16} color="secondary">
                Aucun utilisateur actif.
              </Text>
            ) : (
              allUsers.map((user) => {
                const isRelation = relations.some((r) => r.email === user.email);
                const sentRequest = pendingRequests.find((r) => r.email === user.email);
                const receivedRequest = receivedRequests.find((r) => r.email === user.email);
                const isSelf = currentUserEmail === user.email;

                let btnState = null;
                let btnLabel = "Ajouter comme relation";
                let btnIcon = <FaUserPlus />;
                let btnColor = "#22c55e";
                let btnDisabled = false;
                let statusText = "";

                if (sentRequest) {
                  if (sentRequest.status === "pending") {
                    btnState = "pending";
                    btnLabel = "Demande envoyée";
                    btnIcon = <FaHourglassHalf />;
                    btnColor = "#f59e42";
                    btnDisabled = true;
                    statusText = "Demande envoyée";
                  } else if (sentRequest.status === "approved") {
                    btnState = "approved";
                    btnLabel = "Déjà en relation";
                    btnIcon = <FaCheck />;
                    btnColor = "#22c55e";
                    btnDisabled = true;
                    statusText = "Relation approuvée";
                  } else if (sentRequest.status === "rejected") {
                    btnState = "rejected";
                    btnLabel = "Demande refusée";
                    btnIcon = <FaTimes />;
                    btnColor = "#dc3545";
                    btnDisabled = true;
                    statusText = "Demande refusée";
                  }
                } else if (receivedRequest) {
                  if (receivedRequest.status === "pending") {
                    btnState = "received";
                    btnLabel = "Demande reçue";
                    btnIcon = <FaHourglassHalf />;
                    btnColor = "#f59e42";
                    btnDisabled = true;
                    statusText = "Demande reçue";
                  } else if (receivedRequest.status === "approved") {
                    btnState = "approved";
                    btnLabel = "Déjà en relation";
                    btnIcon = <FaCheck />;
                    btnColor = "#22c55e";
                    btnDisabled = true;
                    statusText = "Relation approuvée";
                  } else if (receivedRequest.status === "rejected") {
                    btnState = "rejected";
                    btnLabel = "Demande refusée";
                    btnIcon = <FaTimes />;
                    btnColor = "#dc3545";
                    btnDisabled = true;
                    statusText = "Demande refusée";
                  }
                }

                return (
                  <div className="relation-card" key={user.id}>
                    {user.picture_url ? (
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <img
                          src={user.picture_url}
                          alt={user.first_name}
                          className="relation-avatar"
                          onClick={() => setPreviewUser(user)}
                        />
                        <UserStatusDot status={user.status} />
                      </div>
                    ) : (
                      <div
                        className="relation-avatar"
                        style={{ position: "relative", display: "inline-block" }}
                        onClick={() => setPreviewUser(user)}
                      >
                        <UserStatusDot status={user.status} />
                      </div>
                    )}
                    <div className="relation-info">
                      <span className="relation-name">
                        {user.first_name} {user.last_name}
                      </span>
                      <span className="relation-status">
                        {user.special_status || "Utilisateur"}
                      </span>
                    </div>
                    {/* Désactive le bouton si c'est soi-même */}
                    {!isRelation && !isSelf && (
                      <button
                        className={
                          "relation-add-btn" +
                          (btnState === "pending" || btnState === "received"
                            ? " pending"
                            : "") +
                          (btnState === "rejected" ? " rejected" : "")
                        }
                        disabled={btnDisabled}
                        onClick={() => handleAddRelation(user.email)}
                        title={btnLabel}
                        data-btncolor={btnColor}
                      >
                        {btnIcon}
                      </button>
                    )}
                    {statusText && !isSelf && (
                      <span
                        className={
                          "relation-status-text" +
                          (btnState === "pending" || btnState === "received"
                            ? " pending"
                            : "") +
                          (btnState === "rejected" ? " rejected" : "")
                        }
                        data-btncolor={btnColor}
                      >
                        {statusText}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      {previewUser && (
        <ProfilePreviewModal user={previewUser} onClose={() => setPreviewUser(null)} />
      )}
      {/* Affichage de l'alerte flottante */}
      {alert && (
        <Alert
          key={alert.key}
          type={alert.type}
          title={alert.title}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}
    </div>
  );
};

export default Relations;