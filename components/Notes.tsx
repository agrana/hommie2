"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// Load MDEditor dynamically to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), { ssr: false });
const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview").then((mod) => mod.default), {
  ssr: false,
});

interface Note {
  content: string;
  timestamp: number;
}

export default function Notes() {
  const [content, setContent] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (typeof window !== "undefined") {
      const savedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
      setNotes(savedNotes);
    }
  }, []);

  const saveNote = () => {
    if (!content.trim()) return;

    const newNote = {
      content,
      timestamp: Date.now(),
    };

    const updatedNotes = [newNote, ...notes]; // 👈 Add new note at the start (most recent first)
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
    setContent(""); // Clear editor
  };

  if (!hydrated) return null; // Prevents hydration issues

  return (
    <div className="bg-gray-800 p-4 rounded w-full">
      <h2 className="text-lg font-semibold mb-2">📝 Markdown Notes</h2>

      {/* Markdown Editor (Only editor, no preview) */}
      <MDEditor
        value={content}
        onChange={(value = "") => setContent(value)}
        className="bg-gray-900 text-white"
        height={200}
        preview="edit"
      />

      {/* Save Button */}
      <button className="mt-4 bg-blue-500 px-4 py-2 rounded" onClick={saveNote}>
        Save Note
      </button>

      {/* Notes Log */}
      <div className="mt-4">
        <h3 className="text-md font-semibold">📜 Notes History</h3>
        {notes.length === 0 ? (
          <p className="text-gray-400">No saved notes yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {notes.map((note, index) => (
              <li key={index} className="p-3 bg-gray-700 rounded">
                <small className="text-gray-400">{new Date(note.timestamp).toLocaleString()}</small>
                <MarkdownPreview
                  source={note.content} // 👈 Properly renders Markdown
                  className="mt-2 bg-gray-800 p-2 rounded text-white"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
