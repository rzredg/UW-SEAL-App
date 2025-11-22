import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2>Login</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={submit}>
        <div className="mb-3">
          <label>Email</label>
          <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button className="btn btn-primary w-100" type="submit">Login</button>
      </form>
    </div>
  );
}
