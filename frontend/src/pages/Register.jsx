import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await register(form);
      navigate("/dashboard");
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2>Register</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={submit}>
        <div className="mb-3">
          <label>Full Name</label>
          <input name="full_name" className="form-control" onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label>Email</label>
          <input name="email" className="form-control" onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input name="password" type="password" className="form-control" onChange={handleChange} required />
        </div>

        <button className="btn btn-success w-100" type="submit">Register</button>
      </form>
    </div>
  );
}
