import React from "react";
import Text from "../components/Text";
import "./Relations.css";

// Exemple de données fictives
const relations = [
  {
    id: 1,
    name: "Alice Dupont",
    status: "En ligne",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 2,
    name: "Jean Martin",
    status: "Absent",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    name: "Sophie Bernard",
    status: "Occupé",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

const Relations: React.FC = () => {
  return (
    <div className="relations-root">
      <div className="relations-container">
        <Text size={32} bold color="primary" className="relations-title">
          Relations
        </Text>
        <Text size={16} color="secondary" className="relations-subtitle">
          Retrouvez ici vos relations et contacts.
        </Text>
        <div className="relations-list">
          {relations.map((relation) => (
            <div className="relation-card" key={relation.id}>
              <img
                src={relation.avatar}
                alt={relation.name}
                className="relation-avatar"
              />
              <div className="relation-info">
                <span className="relation-name">{relation.name}</span>
                <span className="relation-status">{relation.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Relations;