import React, { useEffect, useState } from "react";
import Text from "../components/Text";
import "./Relations.css";
import supabase from "../supabaseClient";
import ProfilePreviewModal from "../components/ProfilePreviewModal";

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

  useEffect(() => {
    const fetchRelationsAndUsers = async () => {
      setLoading(true);
      // Récupère l'utilisateur connecté
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !user.email) {
        setLoading(false);
        return;
      }
      // Récupère les emails des relations
      const relationEmails = await getUserRelations(user.email);

      // Récupère tous les utilisateurs actifs
      const { data: usersData } = await supabase
        .from("users")
        .select("*")
        .eq("isActive", true);

      // Sépare les relations et les autres utilisateurs
      const relationsList =
        usersData?.filter((u: any) => relationEmails.includes(u.email)) || [];
      const allUsersList = usersData || [];

      setRelations(relationsList);
      setAllUsers(allUsersList);
      setLoading(false);
    };
    fetchRelationsAndUsers();
  }, []);

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
              allUsers.map((user) => (
                <div className="relation-card" key={user.id}>
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
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {previewUser && (
        <ProfilePreviewModal user={previewUser} onClose={() => setPreviewUser(null)} />
      )}
    </div>
  );
};

export default Relations;