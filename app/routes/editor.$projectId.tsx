import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@remix-run/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import Split from "react-split";
import TextareaAutosize from 'react-textarea-autosize';

export default function Editor() {
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [output, setOutput] = useState("");
  const [projectName, setProjectName] = useState("");
  const { projectId } = useParams();
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchCode = async () => {
      if (projectId !== "new" && projectId) {
        try {
          const response = await fetch(`https://pws-0h89.onrender.com/getCode?projectId=${projectId}`);
          const data = await response.json();
          if (data.success) {
            setHtml(data.code || "");
          } else {
            console.error("Error fetching code:", data.error);
          }
        } catch (error) {
          console.error("Error fetching code:", error);
        }
      }
    };

    fetchCode();
  }, [projectId]);

  useEffect(() => {
    updateOutput();
  }, [html, css, js]);

  const updateOutput = () => {
    setOutput(`
      <!DOCTYPE html>
      <html>
      <head>
      <style>${css}</style>
      </head>
      <body>
      ${html}
      <script>${js}</script>
      </body>
      </html>
    `);
  };

  const handleSave = async () => {
    if (user) {
      try {
        const response = await fetch("https://pws-0h89.onrender.com/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: html,
            uid: user.uid,
            projectName: projectName || "Untitled Project",
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log("Code saved successfully:", data.projectId);
          navigate(`/editor/${data.projectId}`);
        } else {
          console.error("Error saving code:", data.error);
        }
      } catch (error) {
        console.error("Error saving code:", error);
      }
    }
  };

  const handleUpdate = async () => {
    if (projectId !== "new" && projectId) {
      try {
        const response = await fetch("https://pws-0h89.onrender.com/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: projectId,
            code: html,
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log("Code updated successfully");
        } else {
          console.error("Error updating code:", data.error);
        }
      } catch (error) {
        console.error("Error updating code:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (projectId !== "new" && projectId) {
      try {
        const response = await fetch("https://pws-0h89.onrender.com/delCode", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: projectId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log("Code deleted successfully");
          navigate("/dashboard");
        } else {
          console.error("Error deleting code:", data.error);
        }
      } catch (error) {
        console.error("Error deleting code:", error);
      }
    }
  };

  const handleGenerateCode = async () => {
    if (user) {
      try {
        const response = await fetch("https://pws-0h89.onrender.com/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: user.uid,
            message: "Generate HTML, CSS, and JS code",
          }),
        });

        const data = await response.json();

        if (data) {
          setHtml(data.html || "");
          setCss(data.css || "");
          setJs(data.js || "");
        } else {
          console.error("Error generating code:", data.error);
        }
      } catch (error) {
        console.error("Error generating code:", error);
      }
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="h-screen overflow-hidden">
      <div className="bg-gray-800 text-white p-2 flex justify-between items-center">
        <input
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-gray-700 text-white px-2 py-1 rounded"
        />
        <div>
          <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
            Save
          </button>
          {projectId !== "new" && (
            <>
              <button onClick={handleUpdate} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
                Update
              </button>
              <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2">
                Delete
              </button>
            </>
          )}
          <button onClick={handleGenerateCode} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Generate Code
          </button>
        </div>
      </div>
      <Split className="h-[calc(100vh-50px)] flex" sizes={[33, 33, 34]} gutterSize={5} minSize={100}>
        <div className="flex flex-col">
          <h3 className="bg-gray-200 p-2">HTML</h3>
          <TextareaAutosize
            className="w-full h-full p-2 font-mono text-sm resize-none outline-none"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <h3 className="bg-gray-200 p-2">CSS</h3>
          <TextareaAutosize
            className="w-full h-full p-2 font-mono text-sm resize-none outline-none"
            value={css}
            onChange={(e) => setCss(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <h3 className="bg-gray-200 p-2">JavaScript</h3>
          <TextareaAutosize
            className="w-full h-full p-2 font-mono text-sm resize-none outline-none"
            value={js}
            onChange={(e) => setJs(e.target.value)}
          />
        </div>
      </Split>
      <div className="h-64">
        <iframe
          srcDoc={output}
          title="Output"
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
}
