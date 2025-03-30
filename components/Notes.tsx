"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase"; // ✅ Import Supabase client
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// Load MDEditor dynamically to prevent SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), { ssr: false });
import MarkdownPreview from "@uiw/react-markdown-preview"; // Import Markdown Preview

interface Note {
  id: string;
  content: string;
  created_at: string;
}

export default function Notes() {
  const [content, setContent] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);

  // Fetch notes from Supabase on mount
  useEffect(() => {
    async function fetchNotes() {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false }); // Ensure newest notes appear first

      if (!error) setNotes(data || []);
    }
    fetchNotes();
  }, []);

  // Save note with timestamp
  const saveNote = async () => {
    if (!content.trim()) return;

    const newNote = {
      content,
      created_at: new Date().toISOString(), // Save current timestamp
    };

    // Save to Supabase
    const { data, error } = await supabase.from("notes").insert([newNote]).select().single();

    if (!error && data) {
      setNotes((prev) => [data, ...prev]);
      setContent("");
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded w-full">
      <h2 className="text-lg font-semibold mb-2">📝 Notes</h2>
      
      {/* Fix: Remove preview mode inside editor */}
      <MDEditor 
        value={content} 
        onChange={(value = "") => setContent(value)} 
        className="bg-gray-900 text-white" 
        height={200} 
        preview="edit" // ✅ No preview inside editor
      />

      <button className="mt-4 bg-blue-500 px-4 py-2 rounded" onClick={saveNote}>Save Note</button>

      <div className="mt-4">
        <h3 className="text-md font-semibold">📜 Notes History</h3>
        <ul className="mt-2 space-y-2">
          {notes.map((note) => (
            <li key={note.id} className="p-3 bg-gray-700 rounded">
              <small className="text-gray-400">{new Date(note.created_at).toLocaleString()}</small> {/* Format and show date */}
              <MarkdownPreview
                source={note.content} // ✅ Correctly converts Markdown to HTML
                className="bg-gray-800 p-2 rounded text-white"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
