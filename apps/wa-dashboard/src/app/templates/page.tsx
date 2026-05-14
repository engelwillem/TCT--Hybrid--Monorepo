"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { clearAuthCookie, getAuthCookie } from "@/lib/auth";
import { createTemplateRequest, deleteTemplateRequest, listTemplatesRequest, meRequest, updateTemplateRequest, WaTemplateItem } from "@/lib/api";
import { isAuthFailure } from "@/lib/session";

export default function TemplatesPage() {
  const router = useRouter();
  const [items, setItems] = useState<WaTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("unknown");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string>("");
  const canManage = role !== "viewer";

  const load = async () => {
    const token = getAuthCookie();
    if (!token) {
      router.replace("/login?next=/templates");
      return;
    }
    setLoading(true);
    setError("");
    const [me, list] = await Promise.all([meRequest(token), listTemplatesRequest(token)]);
    if (me.ok) {
      setRole(String((me.data as { user?: { role?: string } })?.user?.role || "unknown").toLowerCase());
    }
    if (!list.ok) {
      if (isAuthFailure(list.statusCode, list.message)) {
        clearAuthCookie();
        router.replace("/login?next=/templates");
        return;
      }
      setError(list.message || "Failed to load templates.");
      setLoading(false);
      return;
    }
    setItems(list.items);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    const token = getAuthCookie();
    if (!token) return;
    if (!name.trim() || !content.trim()) {
      setError("Template name and content are required.");
      return;
    }
    const result = editingId
      ? await updateTemplateRequest(token, editingId, { name: name.trim(), content: content.trim() })
      : await createTemplateRequest(token, { name: name.trim(), content: content.trim() });
    if (!result.ok) {
      setError(result.message || "Failed to save template.");
      return;
    }
    setName("");
    setContent("");
    setEditingId("");
    await load();
  };

  const onDelete = async (id: string) => {
    if (!canManage) return;
    const token = getAuthCookie();
    if (!token) return;
    const result = await deleteTemplateRequest(token, id);
    if (!result.ok) {
      setError(result.message || "Failed to delete template.");
      return;
    }
    await load();
  };

  return (
    <>
      <Topbar />
      <main>
        <div className="card form-layout-responsive">
          <h1>Message Templates</h1>
          <p>Manage message templates so the team does not need to type from scratch.</p>
          {role === "viewer" ? <p className="error">Viewer role can only view templates.</p> : null}
          {error ? <p className="error">{error}</p> : null}

          <form className="stack" style={{ marginTop: 12 }} onSubmit={onSubmit}>
            <input className="input" placeholder="Template Name" value={name} onChange={(e) => setName(e.target.value)} />
            <textarea className="input" placeholder="Template Content" style={{ minHeight: 120 }} value={content} onChange={(e) => setContent(e.target.value)} />
            <button className="button" disabled={!canManage} style={{ maxWidth: 220 }}>
              {editingId ? "Update Template" : "Save Template"}
            </button>
          </form>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          {loading ? <p>Loading templates...</p> : null}
          {!loading && items.length === 0 ? <p>No templates yet.</p> : null}
          {!loading && items.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th align="left">Name</th>
                    <th align="left">Content</th>
                    <th align="left">Default</th>
                    <th align="left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={String(item.id)}>
                      <td>{item.name}</td>
                      <td style={{ whiteSpace: "pre-wrap" }}>{item.content}</td>
                      <td>{item.is_default ? "Yes" : "-"}</td>
                      <td>
                        {canManage ? (
                          <div className="actions-row">
                            <button type="button" onClick={() => { setEditingId(String(item.id)); setName(item.name); setContent(item.content); }}>Edit</button>
                            <button type="button" onClick={() => void onDelete(String(item.id))}>Delete</button>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
