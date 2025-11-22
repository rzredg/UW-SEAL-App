import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="container mt-5">
      <h1>Dashboard</h1>

      {user && (
        <>
          <p>Welcome, <strong>{user.full_name}</strong></p>
          <p>Email: {user.email}</p>
        </>
      )}
    </div>
  );
}
