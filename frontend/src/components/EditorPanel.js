"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export default function EditorPanel({ roomId }) {
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("javascript");

  const handleEditorMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      window.monaco = monaco;

      let provider, binding;

      const initYjs = async () => {
        const Y = await import("yjs");
        const { SocketIOProvider } = await import("y-socket.io");
        const { MonacoBinding } = await import("y-monaco");

        const ydoc = new Y.Doc();
        provider = new SocketIOProvider(
          process.env.NEXT_PUBLIC_BACKEND_URL,
          roomId,
          ydoc,
          { autoConnect: true },
        );
        const yText = ydoc.getText("monaco");
        binding = new MonacoBinding(
          yText,
          editor.getModel(),
          new Set([editor]),
          provider.awareness,
        );
      };

      initYjs();
      editorRef._cleanup = () => {
        if (binding) binding.destroy();
        if (provider) provider.destroy();
      };
    },
    [roomId],
  );

  useEffect(() => {
    return () => {
      if (editorRef._cleanup) editorRef._cleanup();
    };
  }, []);

  return (
    <div className="w-1/2 flex flex-col bg-black">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1e1e] border-b border-gray-700">
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            window.monaco?.editor.setModelLanguage(
              editorRef.current.getModel(),
              e.target.value,
            );
          }}
          className="bg-[#2d2d2d] text-gray-200 text-xs px-2 py-1 rounded border border-gray-600 outline-none cursor-pointer"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="c">C</option>
        </select>
      </div>

      <MonacoEditor
        height="calc(100vh - 36px)"
        language={language}
        theme="vs-dark"
        onMount={handleEditorMount}
      />
    </div>
  );
}
