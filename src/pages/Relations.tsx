import React, { useEffect, useState } from "react";
import Text from "../components/Text";
import "./Relations.css";
import supabase from "../supabaseClient";

// Remplace ceci par la vraie logique pour récupérer les relations de l'utilisateur connecté
const getUserRelations = async (userEmail: string) => {
  // On récupère les emails des amis où user_email = email de l'utilisateur courant
  const { data, error } = await supabase
    .from("relations")
    .select("friend_email")
    .eq("user_email", userEmail); // <-- correction ici
  if (error) return [];
  return data.map((r: any) => r.friend_email);
};

const Relations: React.FC = () => {
  const [relations, setRelations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <Text size={32} bold color="primary" className="relations-title">
          Relations
        </Text>
        <Text size={16} color="secondary" className="relations-subtitle">
          Retrouvez ici vos relations et tous les utilisateurs actifs.
        </Text>

        {/* Section Relations ajoutées */}
        <div className="settings-section-title">
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
              <div className="relation-card" key={relation.id}>
                <img
                  src={
                    relation.picture_url ||
                    "https://randomuser.me/api/portraits/lego/1.jpg"
                  }
                  alt={relation.first_name}
                  className="relation-avatar"
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

        {/* Section Tous les utilisateurs */}
        <div className="settings-section-title" style={{ marginTop: 32 }}>
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
  );
};

export default Relations;