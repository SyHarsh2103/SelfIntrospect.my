import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { adminApi } from "../../services/api";

export default function ContentPage() {
  const [blocks, setBlocks] = useState([]);
  const [activeKey, setActiveKey] = useState("");
  const [form, setForm] = useState({ title: "", content: "" });
  const [message, setMessage] = useState("");

  const load = async () => {
    const data = await adminApi.getContentBlocks();
    const list = Array.isArray(data) ? data : [];
    setBlocks(list);
    if (list.length && !activeKey) {
      setActiveKey(list[0].key);
      setForm({
        title: list[0].title || "",
        content: list[0].content || "",
      });
    }
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const selectBlock = (block) => {
    setActiveKey(block.key);
    setForm({
      title: block.title || "",
      content: block.content || "",
    });
    setMessage("");
  };

  const save = async (e) => {
    e.preventDefault();
    await adminApi.updateContent(activeKey, form);
    setMessage("Content updated successfully.");
    await load();
  };

  return (
    <AdminLayout title="Content Manager">
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <Card>
          <h3 className="mb-4 font-semibold text-slate-900">Content Blocks</h3>
          <div className="space-y-2">
            {blocks.map((block) => (
              <button
                key={block.key}
                type="button"
                onClick={() => selectBlock(block)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm ${
                  activeKey === block.key
                    ? "bg-orange-600 text-white"
                    : "bg-amber-50 text-slate-700"
                }`}
              >
                {block.title}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <form onSubmit={save} className="space-y-4">
            <h3 className="font-semibold text-slate-900">Edit Content</h3>

            {message && (
              <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
                {message}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-xl border border-amber-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Content
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                rows={14}
                className="w-full rounded-xl border border-amber-200 px-4 py-3 text-sm leading-7 outline-none focus:border-orange-500"
              />
            </div>

            <Button type="submit">Save Content</Button>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}