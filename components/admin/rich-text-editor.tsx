'use client';

import { useEffect, useMemo, useRef } from 'react';

type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
};

type ToolbarAction = {
  label: string;
  command?: string;
  value?: string;
  title: string;
  run?: () => void;
};

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = 'Start writing here...',
  minHeight = 260,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef(value);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (value !== lastValueRef.current && editor.innerHTML !== value) {
      editor.innerHTML = value || '';
      lastValueRef.current = value;
    }
  }, [value]);

  function focusEditor() {
    editorRef.current?.focus();
  }

  function runCommand(command: string, commandValue?: string) {
    focusEditor();
    document.execCommand(command, false, commandValue);
    emitChange();
  }

  function insertLink() {
    focusEditor();
    const url = window.prompt('Paste the link URL');
    if (!url) return;
    document.execCommand('createLink', false, url);
    emitChange();
  }

  function insertImage() {
    focusEditor();
    const url = window.prompt('Paste the image URL');
    if (!url) return;
    document.execCommand('insertImage', false, url);
    emitChange();
  }

  function clearFormatting() {
    focusEditor();
    document.execCommand('removeFormat');
    document.execCommand('unlink');
    emitChange();
  }

  function emitChange() {
    const nextValue = editorRef.current?.innerHTML ?? '';
    lastValueRef.current = nextValue;
    onChange(nextValue);
  }

  const actions = useMemo<ToolbarAction[]>(() => [
    { label: 'B', command: 'bold', title: 'Bold' },
    { label: 'I', command: 'italic', title: 'Italic' },
    { label: 'U', command: 'underline', title: 'Underline' },
    { label: 'H1', command: 'formatBlock', value: 'h1', title: 'Heading 1' },
    { label: 'H2', command: 'formatBlock', value: 'h2', title: 'Heading 2' },
    { label: 'H3', command: 'formatBlock', value: 'h3', title: 'Heading 3' },
    { label: 'P', command: 'formatBlock', value: 'p', title: 'Paragraph' },
    { label: '• List', command: 'insertUnorderedList', title: 'Bullet List' },
    { label: '1. List', command: 'insertOrderedList', title: 'Numbered List' },
    { label: 'Quote', command: 'formatBlock', value: 'blockquote', title: 'Quote' },
    { label: 'Link', title: 'Insert Link', run: insertLink },
    { label: 'Image (URL)', title: 'Insert Image from URL', run: insertImage },
    { label: 'Clear', title: 'Clear Formatting', run: clearFormatting },
  ], []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <p className="text-xs text-slate-500">Select text and use the toolbar like a regular document editor.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.28)] backdrop-blur">
        <div className="flex flex-wrap gap-2 border-b border-slate-200/70 bg-slate-50/80 px-3 py-3">
          {actions.map((action) => (
            <button
              key={action.title}
              type="button"
              title={action.title}
              onClick={() => {
                if (action.run) {
                  action.run();
                  return;
                }
                if (action.command) runCommand(action.command, action.value);
              }}
              className="rounded-xl border border-white/40 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:border-indigo-300 hover:text-indigo-700"
            >
              {action.label}
            </button>
          ))}
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={emitChange}
          data-placeholder={placeholder}
          className="admin-rich-editor min-h-[260px] w-full px-5 py-4 text-base leading-8 text-slate-800 outline-none"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
    </div>
  );
}
