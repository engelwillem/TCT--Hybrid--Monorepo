"use client";

import { useEffect, useRef } from "react";

type MessageTemplateEditorProps = {
  value: string;
  onChange: (value: string) => void;
  customerName: string;
  storeName?: string;
  error?: string;
};

const TOKEN_NAMA = "{nama}";
const TOKEN_TOKO = "{toko}";

type Segment =
  | { type: "text"; value: string }
  | { type: "token"; token: typeof TOKEN_NAMA | typeof TOKEN_TOKO };

function tokenizeTemplate(input: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /(\{nama\}|\{toko\})/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: input.slice(lastIndex, match.index) });
    }
    const token = match[0] === TOKEN_NAMA ? TOKEN_NAMA : TOKEN_TOKO;
    segments.push({ type: "token", token });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < input.length || segments.length === 0) {
    segments.push({ type: "text", value: input.slice(lastIndex) });
  }

  return segments;
}

function tokenLabel(token: string): string {
  if (token === TOKEN_NAMA) return "Customer Name";
  return "Store Name";
}

function clearEditor(el: HTMLElement) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function renderTemplateToEditor(el: HTMLElement, template: string) {
  clearEditor(el);
  const segments = tokenizeTemplate(template);

  segments.forEach((segment) => {
    if (segment.type === "token") {
      const chip = document.createElement("span");
      chip.className = "message-token-chip";
      chip.setAttribute("data-token", segment.token);
      chip.setAttribute("contenteditable", "false");
      chip.textContent = `[${tokenLabel(segment.token)}]`;
      el.appendChild(chip);
      return;
    }

    const textNode = document.createTextNode(segment.value);
    el.appendChild(textNode);
  });
}

function extractTemplateFromNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as HTMLElement;
  const token = element.getAttribute("data-token");
  if (token === TOKEN_NAMA || token === TOKEN_TOKO) {
    return token;
  }

  if (element.tagName === "BR") {
    return "\n";
  }

  let result = "";
  element.childNodes.forEach((child) => {
    result += extractTemplateFromNode(child);
  });
  return result;
}

function extractTemplate(el: HTMLElement): string {
  let result = "";
  el.childNodes.forEach((node) => {
    result += extractTemplateFromNode(node);
  });
  return result;
}

function isRangeInsideEditor(range: Range, editor: HTMLElement): boolean {
  const container = range.commonAncestorContainer;
  return editor.contains(container) || container === editor;
}

function insertTokenAtCursor(editor: HTMLElement, token: string) {
  editor.focus();

  const selection = window.getSelection();
  const chip = document.createElement("span");
  chip.className = "message-token-chip";
  chip.setAttribute("data-token", token);
  chip.setAttribute("contenteditable", "false");
  chip.textContent = `[${tokenLabel(token)}]`;

  const spacer = document.createTextNode("");

  if (!selection || selection.rangeCount === 0) {
    editor.appendChild(chip);
    editor.appendChild(spacer);
    return;
  }

  const range = selection.getRangeAt(0);
  if (!isRangeInsideEditor(range, editor)) {
    editor.appendChild(chip);
    editor.appendChild(spacer);
    return;
  }

  range.deleteContents();
  range.insertNode(spacer);
  range.insertNode(chip);

  const nextRange = document.createRange();
  nextRange.setStart(spacer, 0);
  nextRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(nextRange);
}

function buildPreview(template: string, customerName: string, storeName?: string): string {
  return template
    .replaceAll(TOKEN_NAMA, customerName || "-")
    .replaceAll(TOKEN_TOKO, storeName || "");
}

export function MessageTemplateEditor({
  value,
  onChange,
  customerName,
  storeName,
  error,
}: MessageTemplateEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastValueRef = useRef<string>("");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (value !== lastValueRef.current) {
      renderTemplateToEditor(editor, value);
      lastValueRef.current = value;
    }
  }, [value]);

  const syncChange = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const next = extractTemplate(editor);
    lastValueRef.current = next;
    onChange(next);
  };

  return (
    <div className="stack">
      <label htmlFor="message-editor">
        <strong>WhatsApp Message Content</strong>
      </label>
      <div style={{ fontSize: 13, color: "#475569" }}>
        Use the buttons below so customer and store names are automatically filled when the message is sent.
      </div>

      <div className="actions-row">
        <button
          type="button"
          className="token-button"
          onClick={() => {
            const editor = editorRef.current;
            if (!editor) return;
            insertTokenAtCursor(editor, TOKEN_NAMA);
            syncChange();
          }}
        >
          Customer Name
        </button>
        <button
          type="button"
          className="token-button"
          onClick={() => {
            const editor = editorRef.current;
            if (!editor) return;
            insertTokenAtCursor(editor, TOKEN_TOKO);
            syncChange();
          }}
        >
          Store Name
        </button>
      </div>

      <div
        id="message-editor"
        ref={editorRef}
        className={`message-editor${error ? " message-editor-error" : ""}`}
        contentEditable
        suppressContentEditableWarning
        onInput={syncChange}
      />

      {error ? <div className="error">{error}</div> : null}

      <div className="card" style={{ background: "#f8fafc", borderColor: "#cbd5e1" }}>
        <strong>Message Preview</strong>
        <div style={{ marginTop: 8, whiteSpace: "pre-wrap", fontSize: 14 }}>
          {buildPreview(value, customerName.trim(), storeName?.trim()) || "-"}
        </div>
      </div>
    </div>
  );
}
