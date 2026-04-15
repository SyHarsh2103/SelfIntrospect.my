import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "contentManager",
    isActive: true,
  });

  const loadUsers = async () => {
    try {
      const data = await adminApi.getAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load admin users.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const reset = () => {
    setEditing(null);
    setForm({
      email: "",
      password: "",
      role: "contentManager",
      isActive: true,
    });
  };

  const startEdit = (user) => {
    setEditing(user);
    setForm({
      email: user.email || "",
      password: "",
      role: user.role || "contentManager",
      isActive: Boolean(user.isActive),
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (editing) {
        const payload = {
          role: form.role,
          isActive: form.isActive,
        };

        if (form.password) payload.password = form.password;

        await adminApi.updateAdminUser(editing._id, payload);
        setMessage("Admin user updated successfully.");
      } else {
        await adminApi.createAdminUser(form);
        setMessage("Admin user created successfully.");
      }

      reset();
      await loadUsers();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to save admin user.");
    }
  };

  const remove = async (user) => {
    if (!window.confirm("Delete this admin user?")) return;

    try {
      await adminApi.deleteAdminUser(user._id);
      setMessage("Admin user deleted successfully.");
      await loadUsers();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to delete admin user.");
    }
  };

  return (
    <AdminLayout title="Admin Users">
      <div className="space-y-6">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
            Super Admin
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-slate-900">
            Create Admin User
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Create dashboard users with either Super Admin or Content Manager access.
          </p>

          {message && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}
        </Card>

        <Card>
          <form onSubmit={submit} className="space-y-5">
            <h3 className="text-xl font-semibold text-slate-900">
              {editing ? "Edit Admin User" : "New Admin Signup"}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  disabled={Boolean(editing)}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  required
                  className="w-full rounded-2xl border border-[#eadfcb] px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password {editing ? "(leave blank to keep same)" : ""}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required={!editing}
                  className="w-full rounded-2xl border border-[#eadfcb] px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  className="w-full rounded-2xl border border-[#eadfcb] px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                >
                  <option value="contentManager">Content Manager</option>
                  <option value="superAdmin">Super Admin</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-3 rounded-2xl border border-[#eadfcb] bg-[#fbf7ef] px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isActive: e.target.checked }))
                    }
                    className="h-4 w-4 accent-orange-600"
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit">
                {editing ? "Update Admin" : "Create Admin"}
              </Button>
              {editing && (
                <Button type="button" variant="soft" onClick={reset}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-slate-900">Admin Users</h3>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-[#eadfcb]">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="bg-[#fbf7ef] text-slate-700">
                  <th className="px-4 py-4 font-semibold">Email</th>
                  <th className="px-4 py-4 font-semibold">Role</th>
                  <th className="px-4 py-4 font-semibold">Active</th>
                  <th className="px-4 py-4 font-semibold">Last Login</th>
                  <th className="px-4 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-slate-100">
                    <td className="px-4 py-4">{user.email}</td>
                    <td className="px-4 py-4">{user.role}</td>
                    <td className="px-4 py-4">{user.isActive ? "Yes" : "No"}</td>
                    <td className="px-4 py-4">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(user)}
                          className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(user)}
                          className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      No admin users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}