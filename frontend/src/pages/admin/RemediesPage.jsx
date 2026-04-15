import AdminLayout from "../../components/admin/AdminLayout";
import CrudManager from "../../components/admin/CrudManager";
import { adminApi } from "../../services/api";

export default function RemediesPage() {
  return (
    <AdminLayout title="Remedies Manager">
      <CrudManager
        title="Remedies"
        description="Create and maintain supportive cleansing guidance."
        loadItems={adminApi.getRemedies}
        createItem={adminApi.createRemedy}
        updateItem={adminApi.updateRemedy}
        deleteItem={adminApi.deleteRemedy}
        columns={[
          { key: "title", label: "Title" },
          { key: "duration", label: "Duration" },
          { key: "priority", label: "Priority" },
          { key: "isActive", label: "Active" },
        ]}
        fields={[
          { name: "title", label: "Title", type: "text", required: true },
          { name: "steps", label: "Steps", type: "textarea-array", fullWidth: true },
          { name: "duration", label: "Duration", type: "text" },
          { name: "notes", label: "Notes", type: "textarea", fullWidth: true },
          { name: "priority", label: "Priority", type: "number" },
          { name: "isActive", label: "Active", type: "checkbox" },
        ]}
      />
    </AdminLayout>
  );
}