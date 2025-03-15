import { useState } from "react";
import { useAuth } from "../components/AuthProvider";
import Button from "../components/ui/Button";

const Register = () => {
  //const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //await register(email, password, username);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
        <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
          />
          <Button type="submit" variant="primary" className="w-full">Register</Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
