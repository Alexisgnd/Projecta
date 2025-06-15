import React, { useEffect, useState } from "react";
import Text from "../components/Text";
import "./Relations.css";
import supabase from "../supabaseClient";
import ProfilePreviewModal from "../components/ProfilePreviewModal";
import { FaUserPlus, FaHourglassHalf, FaCheck, FaTimes } from "react-icons/fa"; // Ajout des icônes
import Alert from "../components/Alert"; // Pour afficher l'alerte

// Récupère les emails des relations approuvées
const getUserRelations = async (userEmail: string) => {
  const { data, error } = await supabase
    .from("relations")
    .select("sender_email, receiver_email, status")
    .or(`sender_email.eq.${userEmail},receiver_email.eq.${userEmail}`);
  if (error) return [];
  // On ne garde que les relations approuvées
  return data
    .filter((r: any) => r.status === "approved")
    .map((r: any) =>
      r.sender_email === userEmail ? r.receiver_email : r.sender_email
    );
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
                    <img
                      src={relation.picture_url}
                      alt={relation.first_name}
                      className="relation-avatar"
                      onClick={() => setPreviewUser(relation)}
                    />
                  ) : (
                    <div
                      className="relation-avatar"
                      onClick={() => setPreviewUser(relation)}
                    />
                  )}
                  <div className="relation-info">
                    <span className="relation-name">
                      {relation.first_name} {relation.last_name}
                    </span>
                    <span className="relation-status">
                      {relation.special_status || "Utilisateur"}
                    </span>
                  </div>
                </div>
              )))
            }
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
                      <img
                        src={user.picture_url}
                        alt={user.first_name}
                        className="relation-avatar"
                        onClick={() => setPreviewUser(user)}
                      />
                    ) : (
                      <div
                        className="relation-avatar"
                        onClick={() => setPreviewUser(user)}
                      />
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