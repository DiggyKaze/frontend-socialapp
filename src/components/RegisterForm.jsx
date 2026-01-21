import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {API_BASE_URL} from "../config/api.js";
import "./LoginForm.css"; // återanvänd gärna samma CSS

const RegisterForm = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        role: "USER",
        displayName: "",
        bio: "",
        profileImagePath: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                throw new Error("Registrering misslyckades");
            }

            // Efter lyckad registrering → till login
            navigate("/login");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="login-form">
            <h2>Registrera konto</h2>

            <input name="username" placeholder="Username" onChange={handleChange}/>
            <input name="email" placeholder="Email" onChange={handleChange}/>
            <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
            />
            <input
                name="displayName"
                placeholder="Display name"
                onChange={handleChange}
            />
            <input
                name="bio"
                placeholder="Bio"
                onChange={handleChange}
            />
            <input
                name="profileImagePath"
                placeholder="Profile image path"
                onChange={handleChange}
            />

            <button onClick={handleRegister}>Registrera</button>
        </div>
    );
};

export default RegisterForm;
