import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Checking backend connection...");

  useEffect(() => {
    // Detect environment (browser vs Docker internal)
    const apiUrl = "http://localhost:8000";
    console.log("🌐 Checking API URL:", apiUrl);

    // Fetch the health endpoint
    fetch(`${apiUrl}/api/v1/user/health`)
      .then((res) => {
        if (!res.ok) throw new Error("Response not OK");
        return res.json();
      })
      .then((data) => {
        console.log("✅ Backend response:", data);
        setStatus(`✅ Backend Connected: ${data.status}`);
      })
      .catch((err) => {
        console.error("❌ Connection error:", err.message);
        setStatus(`❌ Failed to connect to backend (${apiUrl})`);
      });
  }, []);

  return (
    <div style={{ textAlign: "center", paddingTop: "50px", fontSize: "20px" }}>
      <h1>🚀 FastAPI + Next.js Integration</h1>
      <h1>Hello </h1>
      <p>{status}</p>
    </div>
  );
}
