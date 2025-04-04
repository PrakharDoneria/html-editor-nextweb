import { useAuthState } from "react-firebase-hooks/auth";
import { auth, logOut } from "../firebase";
import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";

export default function Dashboard() {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        try {
          const response = await fetch(`https://pws-0h89.onrender.com/check?uid=${user.uid}`);
          const data = await response.json();
          console.log("Check User Status Response:", data); // Debugging
          setIsPremium(data.premium === "YES");
          setPremiumUntil(data.premiumUntil);
        } catch (error) {
          console.error("Error checking user status:", error);
        }
      }
    };

    checkUserStatus();
  }, [user]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (user && isPremium) {
        try {
          const response = await fetch(`https://pws-0h89.onrender.com/fetch?uid=${user.uid}`);
          const data = await response.json();
          console.log("Fetch Projects Response:", data); // Debugging
          if (data.success) {
            setProjects(data.files);
          } else {
            console.error("Error fetching projects:", data.error);
          }
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      }
    };

    fetchProjects();
  }, [user, isPremium]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!user) {
    return <p>Redirecting to login...</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      {user && (
        <div>
          <p>Welcome, {user.email}!</p>
          <p>User ID: {user.uid}</p>
          <p>Premium Status: {isPremium ? "Yes" : "No"}</p>
          {premiumUntil && <p>Premium Until: {premiumUntil}</p>}
          <button
            onClick={logOut}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Log Out
          </button>
        </div>
      )}

      {isPremium ? (
        <div>
          <h3 className="text-xl font-semibold mt-4">Your Projects</h3>
          <ul>
            {projects.map((project) => (
              <li key={project.projectId} className="mb-2">
                <Link to={`/editor/${project.projectId}`}>{project.projectName}</Link>
              </li>
            ))}
          </ul>
          <Link
            to="/editor/new"
            className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Create New Project
          </Link>
        </div>
      ) : (
        <p>You are not a premium user. Please subscribe to access the editor.</p>
      )}
    </div>
  );
}
