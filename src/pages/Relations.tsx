import React, { useEffect, useState } from "react";
import Text from "../components/Text";
import "./Relations.css";
import supabase from "../supabaseClient";
import ProfilePreviewModal from "../components/ProfilePreviewModal";
import { FaUserPlus, FaHourglassHalf } from "react-icons/fa"; // Ajout des icônes
import Alert from "../components/Alert"; // Pour afficher l'alerte

// Récupère les emails des amis où user_email = email de l'utilisateur courant
const getUserRelations = async (userEmail: string) => {
  const { data, error } = await supabase
    .from("relations")
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
  const [pendingRequests, setPendingRequests] = useState<string[]>([]); // emails des demandes envoyées
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
      // Récupère les emails des relations
      const relationEmails = await getUserRelations(user.email);

      // Récupère tous les utilisateurs actifs
      const { data: usersData } = await supabase
        .from("users")
        .select("*")
        .eq("isActive", true);

      // Récupère les demandes en attente
      const { data: pending } = await supabase
        .from("relations_requests")
        .select("friend_email")
        .eq("user_email", user.email);

      const pendingList = pending?.map((r: any) => r.friend_email) || [];

      // Sépare les relations et les autres utilisateurs
      const relationsList =
        usersData?.filter((u: any) => relationEmails.includes(u.email)) || [];
      const allUsersList = usersData || [];

      setRelations(relationsList);
      setAllUsers(allUsersList);
      setPendingRequests(pendingList);
      setLoading(false);
    };
    fetchRelationsAndUsers();
  }, []);

  // Ajout d'une relation
  const handleAddRelation = async (friendEmail: string) => {
    setPendingRequests((prev) => [...prev, friendEmail]);
    showAlert("info", "Demande envoyée", "Votre demande de relation a été envoyée.");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !user.email) return;
    // Ajoute la demande dans la table relations_requests
    await supabase
      .from("relations_requests")
      .insert([{ user_email: user.email, friend_email: friendEmail }]);
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
                  <img
                    src={
                      relation.picture_url ||
                      "https://randomuser.me/api/portraits/lego/1.jpg"
                    }
                    alt={relation.first_name}
                    className="relation-avatar"
                    style={{ cursor: "pointer" }}
                    onClick={() => setPreviewUser(relation)}
                  />
                  <div className="relation-info">
                    <span className="relation-name">
                      {relation.first_name} {relation.last_name}
                    </span>
                    <span className="relation-status">
                      {relation.special_status || "Utilisateur"}
                    </span>
                  </div>
                </div>
              ))
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
                const isPending = pendingRequests.includes(user.email);
                const isSelf = currentUserEmail === user.email; // <-- Ajout ici
                return (
                  <div className="relation-card" key={user.id} style={{ position: "relative" }}>
                    <img
                      src={
                        user.picture_url ||
                        "https://randomuser.me/api/portraits/lego/2.jpg"
                      }
                      alt={user.first_name}
                      className="relation-avatar"
                      style={{ cursor: "pointer" }}
                      onClick={() => setPreviewUser(user)}
                    />
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
                        className={`relation-add-btn${isPending ? " pending" : ""}`}
                        style={{
                          position: "absolute",
                          right: 18,
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: "none",
                          borderRadius: "50%",
                          width: 44,
                          height: 44,
                          background: isPending ? "#f59e42" : "#22c55e",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          cursor: isPending ? "not-allowed" : "pointer",
                          transition: "background 0.2s",
                        }}
                        disabled={isPending}
                        onClick={() => handleAddRelation(user.email)}
                        title={isPending ? "Demande envoyée" : "Ajouter comme relation"}
                      >
                        {isPending ? <FaHourglassHalf /> : <FaUserPlus />}
                      </button>
                    )}
                    {isPending && !isSelf && (
                      <span
                        style={{
                          position: "absolute",
                          right: 70,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#f59e42",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        Demande envoyée
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