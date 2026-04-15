import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";

const defaultForm = {
  name: "",
  key: "new_seeker_basic",
  audienceType: "newSeeker",
  description: "",
  introText: "",
  resultStyle: "simple",
  sortOrder: 1,
  isActive: true,
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  const loadTemplates = async () => {
    try {
      const data = await adminApi.getTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load templates.");
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm(defaultForm);
  };

  const startEdit = (template) => {
    setEditing(template);
    setForm({
      name: template.name || "",
      key: template.key || "new_seeker_basic",
      audienceType: template.audienceType || "newSeeker",
      description: template.description || "",
      introText: template.introText || "",
      resultStyle: template.resultStyle || "simple",
      sortOrder: template.sortOrder ?? 1,
      isActive: Boolean(template.isActive),
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder || 0),
      };

      if (editing) {
        await adminApi.updateTemplate(editing._id, payload);
        setMessage("Template updated successfully.");
      } else {
        await adminApi.createTemplate(payload);
        setMessage("Template created successfully.");
      }

      resetForm();
      await loadTemplates();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to save template.");
    }
  };

  const remove = async (template) => {
    if (!window.confirm("Delete this template?")) return;

    try {
      await adminApi.deleteTemplate(template._id);
      setMessage("Template deleted successfully.");
      await loadTemplates();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to delete template.");
    }
  };

  return (
    <AdminLayout title="Template Manager">
      <div className="space-y-6">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
            Questionnaire Templates
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-slate-900">
            Manage User Guidance Paths
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
            Create and manage different questionnaire paths for new seekers,
            beginner Sahajayogis, regular Sahajayogis, and advanced users.
          </p>

          {message ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          ) : null}
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-slate-900">
            {editing ? "Edit Template" : "Create Template"}
          </h3>

          <form onSubmit={submit} className="mt-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Template Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full rounded-2xl border border-[#eadfcb] px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Template Key
                </label>
                <select
                  value={form.key}
                  disabled={Boolean(editing)}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, key: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-[#eadfcb] px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-100"
                >
                  <option value="new_seeker_basic">new_seeker_basic</option>
                  <option value="beginner_sahajayogi">beginner_sahajayogi</option>
                  <option value="regular_sahajayogi">regular_sahajayogi</option>
                  <option value="advanced_vibration_guidance">
                    advanced_vibration_guidance
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Audience Type
                </label>
                <select
                  value={form.audienceType}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      audienceType: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[#eadfcb] px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                >
                  <option value="newSeeker">New Seeker</option>
                  <option value="beginner">Beginner Sahajayogi</option>
                  <option value="regular">Regular Sahajayogi</option>
                  <option value="advanced">Advanced Sahajayogi</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Result Style
                </label>
                <select
                  value={form.resultStyle}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      resultStyle: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[#eadfcb] px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                >
                  <option value="simple">Simple</option>
                  <option value="guided">Guided</option>
                  <option value="detailed">Detailed</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sortOrder: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-[#eadfcb] px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="flex items-end">
                <label className="flex w-full items-center gap-3 rounded-2xl border border-[#eadfcb] bg-[#fbf7ef] px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-orange-600"
                  />
                  Active Template
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[#eadfcb] px-4 py-3 text-sm leading-7 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Intro Text
                </label>
                <textarea
                  rows={3}
                  value={form.introText}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, introText: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-[#eadfcb] px-4 py-3 text-sm leading-7 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-[#eadfcb] pt-5">
              <Button type="submit">
                {editing ? "Update Template" : "Create Template"}
              </Button>

              {editing ? (
                <Button type="button" variant="soft" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-slate-900">
            Template Records
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <div
                key={template._id}
                className="rounded-2xl border border-[#eadfcb] bg-[#fbf7ef] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
                      {template.key}
                    </p>
                    <h4 className="mt-2 font-serif text-2xl font-bold text-slate-900">
                      {template.name}
                    </h4>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      template.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {template.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {template.description || "No description added."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                    {template.audienceType}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                    {template.resultStyle}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-slate-700">
                    Order {template.sortOrder}
                  </span>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(template)}
                    className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(template)}
                    className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}