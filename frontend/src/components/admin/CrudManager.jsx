import { useEffect, useState } from "react";
import { Edit3, Plus, RefreshCw, Trash2, X } from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";

const emptyToArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
};

const arrayToText = (value) => {
  if (!value) return "";
  if (Array.isArray(value)) return value.join("\n");
  return value;
};

const formatCell = (value) => {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Active" : "Inactive";
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value ?? "—");
};

export default function CrudManager({
  title,
  description,
  columns,
  fields,
  loadItems,
  createItem,
  updateItem,
  deleteItem,
  readOnlyCreate = false,
}) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await loadItems();
      setItems(Array.isArray(data) ? data : data?.items || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({});
    setShowForm(false);
    setMessage("");
  };

  const startCreate = () => {
    setEditing(null);
    setForm({});
    setShowForm(true);
    setMessage("");
  };

  const startEdit = (item) => {
    setEditing(item);
    const next = {};

    fields.forEach((field) => {
      const value = item[field.name];

      if (field.type === "textarea-array") {
        next[field.name] = arrayToText(value);
      } else if (field.type === "json") {
        next[field.name] =
          typeof value === "object" ? JSON.stringify(value, null, 2) : value || "";
      } else {
        next[field.name] = value ?? "";
      }
    });

    setForm(next);
    setShowForm(true);
    setMessage("");
  };

  const handleChange = (name, value, type) => {
    let nextValue = value;

    if (type === "number") nextValue = Number(value);
    if (type === "checkbox") nextValue = Boolean(value);

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const buildPayload = () => {
    const payload = {};

    fields.forEach((field) => {
      let value = form[field.name];

      if (field.type === "textarea-array") value = emptyToArray(value);

      if (field.type === "json") {
        try {
          value = value ? JSON.parse(value) : {};
        } catch {
          value = {};
        }
      }

      payload[field.name] = value;
    });

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = buildPayload();

      if (editing) {
        await updateItem(editing._id, payload, editing);
        setMessage("Record updated successfully.");
      } else {
        await createItem(payload);
        setMessage("Record created successfully.");
      }

      resetForm();
      await fetchItems();
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Save failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm("Are you sure you want to delete this record?");
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteItem(item._id, item);
      setMessage("Record deleted successfully.");
      await fetchItems();
    } catch (error) {
      setMessage(error.response?.data?.message || "Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const value = form[field.name] ?? "";

    if (field.type === "textarea" || field.type === "textarea-array" || field.type === "json") {
      return (
        <textarea
          value={value}
          rows={field.rows || 5}
          onChange={(e) => handleChange(field.name, e.target.value, field.type)}
          className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          placeholder={field.placeholder || field.label}
          required={field.required}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          value={value}
          onChange={(e) => handleChange(field.name, e.target.value, field.type)}
          className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          required={field.required}
        >
          <option value="">Select {field.label}</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="flex items-center gap-3 rounded-2xl border border-[#eadfcb] bg-[#fbf7ef] px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => handleChange(field.name, e.target.checked, field.type)}
            className="h-4 w-4 accent-orange-600"
          />
          {field.label}
        </label>
      );
    }

    return (
      <input
        type={field.type || "text"}
        value={value}
        onChange={(e) => handleChange(field.name, e.target.value, field.type)}
        className="w-full rounded-2xl border border-[#eadfcb] bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
        placeholder={field.placeholder || field.label}
        required={field.required}
      />
    );
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
              Admin Manager
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-slate-900">
              {title}
            </h2>
            {description && (
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                {description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fetchItems}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            {!readOnlyCreate && (
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
              >
                <Plus size={16} />
                New Record
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}
      </Card>

      {showForm && (
        <Card>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {editing ? "Edit Record" : "Create Record"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Fill the fields carefully. Public content should remain gentle and clear.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
                  {field.type !== "checkbox" && (
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      {field.label}
                    </label>
                  )}
                  {renderField(field)}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 border-t border-[#eadfcb] pt-5">
              <Button type="submit" disabled={loading}>
                {editing ? "Update Record" : "Create Record"}
              </Button>
              <Button type="button" variant="soft" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="mb-5 flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Records</h3>
            <p className="mt-1 text-sm text-slate-500">
              {items.length} record{items.length === 1 ? "" : "s"} found.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading records...</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#eadfcb]">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="bg-[#fbf7ef] text-slate-700">
                  {columns.map((column) => (
                    <th key={column.key} className="px-4 py-4 font-semibold">
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {items.map((item) => (
                  <tr key={item._id} className="border-t border-slate-100 transition hover:bg-slate-50">
                    {columns.map((column) => (
                      <td key={column.key} className="max-w-[280px] px-4 py-4 align-top text-slate-700">
                        <span className="line-clamp-3">{formatCell(item[column.key])}</span>
                      </td>
                    ))}
                    <td className="px-4 py-4 align-top">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="inline-flex items-center gap-1 rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>

                        {deleteItem && (
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}