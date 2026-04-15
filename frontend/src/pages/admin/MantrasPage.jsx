import AdminLayout from "../../components/admin/AdminLayout";
import CrudManager from "../../components/admin/CrudManager";
import { adminApi } from "../../services/api";

export default function MantrasPage() {
  return (
    <AdminLayout title="Mantras Manager">
      <CrudManager
        title="Mantras"
        description="Manage mantra text, phonetic pronunciation, and usage guidance."
        loadItems={adminApi.getMantras}
        createItem={adminApi.createMantra}
        updateItem={adminApi.updateMantra}
        deleteItem={adminApi.deleteMantra}
        columns={[
          { key: "title", label: "Title" },
          { key: "repetitions", label: "Repetitions" },
          { key: "usageNotes", label: "Usage Notes" },
          { key: "isActive", label: "Active" },
        ]}
        fields={[
          { name: "chakraId", label: "Chakra ID", type: "text" },
          { name: "title", label: "Title", type: "text", required: true },
          { name: "mantraText", label: "Mantra Text", type: "textarea", fullWidth: true },
          { name: "phoneticText", label: "Phonetic Text", type: "textarea", fullWidth: true },
          { name: "usageNotes", label: "Usage Notes", type: "textarea", fullWidth: true },
          { name: "repetitions", label: "Repetitions", type: "text" },
          { name: "isActive", label: "Active", type: "checkbox" },
        ]}
      />
    </AdminLayout>
  );
}