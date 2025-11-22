import { useState, useEffect } from "react";
import ThreeViewer from "./ThreeViewer";

export default function App() {
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetch("/models/models.json")
      .then((r) => r.json())
      .then((data) => {
        const filtered = data.filter((f) =>
          f.endsWith(".glb") || f.endsWith(".gltf") || f.endsWith(".obj")
        );
        setModels(filtered);
        if (filtered.length > 0) setCurrentModel(filtered[0]);
      });
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(models.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedModels = models.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="p-4 md:p-8 h-screen flex flex-col">
      <h1 className="text-3xl font-bold text-center mb-6">
        QCULAND Asset Viewer
      </h1>

      {/* MAIN LAYOUT */}
      <div className="flex flex-col md:flex-row gap-6 grow">

        {/* LEFT PANEL */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-base-200 rounded-xl p-4 shadow-md overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Available Models</h2>

          {/* GRID: 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            {paginatedModels.map((m) => (
              <div
                key={m}
                className={`card border cursor-pointer hover:shadow-md transition-all p-3 text-sm
                  ${currentModel === m ? "bg-primary text-primary-content" : "bg-base-100"}`}
                onClick={() => setCurrentModel(m)}
              >
                <p className="font-medium break-all">{m}</p>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-4">
            <button
              className="btn btn-sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>

            <span className="text-sm opacity-70">
              Page {page} / {totalPages}
            </span>

            <button
              className="btn btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 bg-base-100 shadow-md p-2">
          {currentModel ? (
            <ThreeViewer file={currentModel} />
          ) : (
            <div className="flex items-center justify-center h-full text-lg opacity-60">
              Select a model to preview
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
