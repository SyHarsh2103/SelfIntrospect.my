import AdminLayout from "../../components/admin/AdminLayout";
import CrudManager from "../../components/admin/CrudManager";
import { adminApi } from "../../services/api";

export default function NadisPage() {
  return (
    <AdminLayout title="Nadis Manager">
      <CrudManager
        title="Nadis"
        description="Edit nadi descriptions, characteristics, indicators, and colors."
        loadItems={adminApi.getNadis}
        updateItem={adminApi.updateNadi}
        deleteItem={null}
        createItem={async () => {
          throw new Error("Nadis are seed-based and should not be created from admin.");
        }}
        columns={[
          { key: "displayName", label: "Display Name" },
          { key: "name", label: "Key" },
          { key: "color", label: "Color" },
          { key: "description", label: "Description" },
        ]}
        fields={[
          { name: "displayName", label: "Display Name", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea", fullWidth: true },
          { name: "characteristics", label: "Characteristics", type: "textarea-array", fullWidth: true },
          { name: "catchingIndicators", label: "Catching Indicators", type: "textarea-array", fullWidth: true },
          { name: "color", label: "Color", type: "text" },
        ]}
      />
    </AdminLayout>
  );
}