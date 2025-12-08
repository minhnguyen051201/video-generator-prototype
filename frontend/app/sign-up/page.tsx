"use client";

import Button from "../../components/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import { registerUser } from "../../services/user/userService";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await registerUser({ username: name, email, password });
      router.push("/log-in");
    } catch (signUpError) {
      if (signUpError instanceof Error) {
        setError(signUpError.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#5D4A3C] to-[#3E2F25] px-4 relative">
      {/* Home Icon */}
      <Home
        className="w-8 h-8 text-[#D89F5C] absolute top-6 left-6 cursor-pointer hover:opacity-80"
        onClick={() => router.push("/")}
      />

      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#D89F5C]/20 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#A7612B]/20 rounded-full filter blur-3xl animate-pulse" />

      {/* Sign Up Card */}
      <div className="relative w-full max-w-md bg-[#4F3D32] rounded-xl p-8 shadow-lg z-10">
        <h1 className="text-4xl font-bold text-[#EFDECD] mb-2 text-center">
          Sign Up
        </h1>
        <p className="text-white/80 text-center mb-6">
          Create your account and start generating videos.
        </p>

        {/* Form Inputs */}
        <input
          type="text"
          style={{ color: "black" }}
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-md bg-white/10 placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-[#D89F5C] focus:bg-white/20"
        />
        <input
          type="email"
          placeholder="Email"
          style={{ color: "black" }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-md bg-white/10 placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-[#D89F5C] focus:bg-white/20"
        />
        <input
          type="password"
          style={{ color: "black" }}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-2 rounded-md bg-white/10 placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-[#D89F5C] focus:bg-white/20"
        />

        {error ? (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        ) : null}

        {/* Sign Up Button */}
        <Button
          className="!bg-[#D89F5C] !text-[#4A392C] w-full py-2 rounded-md text-lg font-semibold hover:opacity-90"
          onClick={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </Button>

        {/* Login Link */}
        <p className="text-white/70 text-sm text-center mt-4">
          Already have an account?{" "}
          <span
            className="text-[#D89F5C] cursor-pointer"
            onClick={() => router.push("/log-in")}
          >
            Login
          </span>
        </p>
      </div>
    </main>
  );
}
