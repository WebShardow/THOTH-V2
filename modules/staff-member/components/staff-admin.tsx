"use client";

import { useEffect, useState } from "react";

type StaffRepo = {
  id?: string;
  name: string;
  demoUrl: string;
  sourceUrl: string;
  landingUrl: string;
};

type StaffMember = {
  id: string;
  slug: string;
  name: string;
  role: string;
  email: string | null;
  bio: string;
  avatarUrl: string | null;
  accentColor: string;
  githubUrl: string | null;
  projectUrl: string | null;
  projectHighlights: string[];
  sortOrder: number;
  featured: boolean;
  skills: string[];
  repos: StaffRepo[];
  createdAt: string;
};

type StaffForm = {
  slug: string;
  name: string;
  role: string;
  email: string;
  bio: string;
  avatarUrl: string;
  accentColor: string;
  githubUrl: string;
  projectUrl: string;
  projectHighlights: string;
  sortOrder: string;
  featured: boolean;
  skills: string;
  repos: StaffRepo[];
};

const initialForm: StaffForm = {
  slug: "",
  name: "",
  role: "",
  email: "",
  bio: "",
  avatarUrl: "",
  accentColor: "blue",
  githubUrl: "",
  projectUrl: "",
  projectHighlights: "",
  sortOrder: "0",
  featured: false,
  skills: "",
  repos: [],
};

const accentOptions = ["blue", "pink", "cyan", "violet", "red", "green", "yellow", "orange"];

export default function StaffAdmin() {
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [form, setForm] = useState<StaffForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    try {
      const response = await fetch("/api/staff");
      const data = (await response.json()) as StaffMember[];
      setMembers(data);
      setError(null);
    } catch {
      setError("Failed to fetch staff members");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function populateForm(member: StaffMember) {
    if (!member) return;
    
    setEditingId(member.id);
    setForm({
      slug: member.slug || "",
      name: member.name || "",
      role: member.role || "",
      email: member.email || "",
      bio: member.bio || "",
      avatarUrl: member.avatarUrl || "",
      accentColor: member.accentColor || "blue",
      githubUrl: member.githubUrl || "",
      projectUrl: member.projectUrl || "",
      projectHighlights: Array.isArray(member.projectHighlights) ? member.projectHighlights.join(", ") : "",
      sortOrder: String(member.sortOrder ?? 0),
      featured: Boolean(member.featured),
      skills: Array.isArray(member.skills) ? member.skills.join(", ") : "",
      repos: (member.repos || []).map((r) => ({
        name: r.name || "",
        demoUrl: r.demoUrl || "",
        sourceUrl: r.sourceUrl || "",
        landingUrl: r.landingUrl || "",
      })),
    });
    
    // Jump to top instantly to ensure user sees the form
    window.scrollTo(0, 0);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      slug: form.slug.trim().toLowerCase(),
      name: form.name.trim(),
      role: form.role.trim(),
      email: form.email.trim(),
      bio: form.bio.trim(),
      avatarUrl: form.avatarUrl.trim(),
      accentColor: form.accentColor,
      githubUrl: form.githubUrl.trim(),
      projectUrl: form.projectUrl.trim(),
      projectHighlights: form.projectHighlights
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      sortOrder: Number(form.sortOrder || 0),
      featured: form.featured,
      skills: form.skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      repos: form.repos.filter(repo => repo.name.trim()),
    };

    try {
      const endpoint = editingId ? `/api/staff/${editingId}` : "/api/staff";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save staff member");
      }

      resetForm();
      await fetchMembers();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to save staff member");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this staff member?")) {
      return;
    }

    try {
      const response = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
      await fetchMembers();
    } catch {
      setError("Failed to delete staff member");
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex flex-col gap-4 rounded-none border-b border-slate-200 bg-white p-8 shrink-0">
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
          Staff Member Module
        </p>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900">Team Directory Control</h1>
        <p className="max-w-3xl text-sm font-medium leading-7 text-slate-600">
          Manage the real staff data source used by the Micro-Team front-end. This module
          keeps team profiles separate from pages and projects while staying inside the CMS.
        </p>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto space-y-10">
          <section className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl">
            <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight">
            {editingId ? "Edit Staff Member" : "Create Staff Member"}
          </h2>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl bg-slate-100 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-200"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Name">
              <input
                required
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setForm((current) => ({
                    ...current,
                    name,
                    slug:
                      current.slug ||
                      name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                  }));
                }}
                className={inputClassName}
              />
            </Field>
            <Field label="Slug">
              <input
                required
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    slug: event.target.value.toLowerCase().replace(/\s+/g, "-"),
                  }))
                }
                className={inputClassName}
              />
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Field label="Role">
              <input
                required
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                className={inputClassName}
              />
            </Field>
            <Field label="Email">
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className={inputClassName}
              />
            </Field>
            <Field label="Accent Color">
              <select
                value={form.accentColor}
                onChange={(event) =>
                  setForm((current) => ({ ...current, accentColor: event.target.value }))
                }
                className={inputClassName}
              >
                {accentOptions.map((accent) => (
                  <option key={accent} value={accent}>
                    {accent}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort Order">
              <input
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sortOrder: event.target.value }))
                }
                className={inputClassName}
              />
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Avatar URL">
              <input
                value={form.avatarUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, avatarUrl: event.target.value }))
                }
                className={inputClassName}
              />
            </Field>
            <Field label="GitHub URL">
              <input
                value={form.githubUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, githubUrl: event.target.value }))
                }
                className={inputClassName}
              />
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Project URL">
              <input
                value={form.projectUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, projectUrl: event.target.value }))
                }
                className={inputClassName}
              />
            </Field>
            <Field label="Skills">
              <input
                value={form.skills}
                onChange={(event) => setForm((current) => ({ ...current, skills: event.target.value }))}
                className={inputClassName}
                placeholder="Next.js, TypeScript, Design Systems"
              />
            </Field>
          </div>

          <Field label="Project Highlights">
            <input
              value={form.projectHighlights}
              onChange={(event) =>
                setForm((current) => ({ ...current, projectHighlights: event.target.value }))
              }
              className={inputClassName}
              placeholder="Staff profile revamp, CMS module system, Neon sync pipeline"
            />
          </Field>

          <Field label="Bio">
            <textarea
              rows={5}
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              className={`${inputClassName} min-h-36`}
            />
          </Field>

          <div className="space-y-4 p-6 border border-slate-200 rounded-[2rem] bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <span className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Repositories & Portfolio</span>
                <p className="ml-1 text-[10px] text-slate-500 font-medium">Add multiple project repos with demo, source, and landing links.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, repos: [...f.repos, { name: "", demoUrl: "", sourceUrl: "", landingUrl: "" }] }))}
                className="text-xs font-bold text-blue-600 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-xl transition shadow-sm"
              >
                + Add Repository
              </button>
            </div>
            
            <div className="space-y-4">
              {form.repos.map((repo, idx) => (
                <div key={idx} className="relative p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <button
                    type="button"
                    onClick={() => {
                      const newRepos = form.repos.filter((_, i) => i !== idx);
                      setForm(f => ({...f, repos: newRepos}));
                    }}
                    className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    ✕
                  </button>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Repo Name">
                      <input
                        value={repo.name}
                        placeholder="e.g. Micro-Account Platform"
                        onChange={(e) => {
                          const newRepos = [...form.repos];
                          newRepos[idx].name = e.target.value;
                          setForm(f => ({ ...f, repos: newRepos }));
                        }}
                        className={subInputClassName}
                      />
                    </Field>
                    <Field label="Demo URL">
                      <input
                        value={repo.demoUrl}
                        placeholder="https://demo.example.com"
                        onChange={(e) => {
                          const newRepos = [...form.repos];
                          newRepos[idx].demoUrl = e.target.value;
                          setForm(f => ({ ...f, repos: newRepos }));
                        }}
                        className={subInputClassName}
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Source Code URL">
                      <input
                        value={repo.sourceUrl}
                        placeholder="https://github.com/..."
                        onChange={(e) => {
                          const newRepos = [...form.repos];
                          newRepos[idx].sourceUrl = e.target.value;
                          setForm(f => ({ ...f, repos: newRepos }));
                        }}
                        className={subInputClassName}
                      />
                    </Field>
                    <Field label="Landing Page URL">
                      <input
                        value={repo.landingUrl}
                        placeholder="https://www.example.com"
                        onChange={(e) => {
                          const newRepos = [...form.repos];
                          newRepos[idx].landingUrl = e.target.value;
                          setForm(f => ({ ...f, repos: newRepos }));
                        }}
                        className={subInputClassName}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
            
            {form.repos.length === 0 && (
              <p className="text-xs text-slate-400 italic py-4 text-center">No repositories added yet. Click "+ Add Repository" to start your portfolio.</p>
            )}
          </div>



          <label className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                setForm((current) => ({ ...current, featured: event.target.checked }))
              }
            />
            Mark as featured on the front-end
          </label>

          <div className="flex items-center gap-4">
            <button
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Update Staff Member" : "Create Staff Member"}
            </button>
            {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
          </div>
        </form>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
            Current Staff Members
          </h2>
          {loading ? <p className="text-sm text-slate-400">Loading...</p> : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <article
              key={member.id}
              className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    /{member.slug}
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-cyan-700">{member.role}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                  {member.accentColor}
                </span>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">{member.bio}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {member.projectHighlights.map((project) => (
                  <span
                    key={project}
                    className="rounded-full bg-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700"
                  >
                    {project}
                  </span>
                ))}
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
                
                {Array.isArray(member.repos) && member.repos.length > 0 && (
                  <div className="w-full space-y-2 mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Staff Portfolio</p>
                    {member.repos.map((repo, i) => (
                      <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-2">
                        <p className="text-[11px] font-bold text-slate-900">{repo.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {repo.demoUrl && (
                            <a href={repo.demoUrl} target="_blank" className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg hover:bg-blue-100">DEMO</a>
                          )}
                          {repo.sourceUrl && (
                            <a href={repo.sourceUrl} target="_blank" className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg hover:bg-slate-200">SOURCE</a>
                          )}
                          {repo.landingUrl && (
                            <a href={repo.landingUrl} target="_blank" className="text-[9px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-lg hover:bg-cyan-100">LANDING</a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                <div className="text-xs font-semibold text-slate-500">
                  Order {member.sortOrder} {member.featured ? "• Featured" : ""}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => populateForm(member)}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 transition hover:bg-cyan-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(member.id)}
                    className="rounded-xl bg-rose-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600 transition hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}

          {!loading && members.length === 0 ? (
            <div className="col-span-full rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 px-8 py-20 text-center text-slate-400">
              No staff members yet.
            </div>
          ) : null}
        </div>
        </section>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="ml-1 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100";

const subInputClassName =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100";

