import AdminLayout from "../../components/admin/AdminLayout";
import CrudManager from "../../components/admin/CrudManager";
import { adminApi } from "../../services/api";

export default function ChakrasPage() {
  return (
    <AdminLayout title="Chakras Manager">
      <CrudManager
        title="Chakras"
        description="Edit chakra definitions, qualities, catching indicators, colors, and icons."
        loadItems={adminApi.getChakras}
        updateItem={adminApi.updateChakra}
        deleteItem={null}
        readOnlyCreate={false}
        createItem={async () => {
          throw new Error("Chakras are seed-based and should not be created from admin.");
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
          { name: "qualities", label: "Qualities", type: "textarea-array", fullWidth: true },
          { name: "catchingIndicators", label: "Catching Indicators", type: "textarea-array", fullWidth: true },
          { name: "sideNotes", label: "Side Notes", type: "textarea", fullWidth: true },
          { name: "iconName", label: "Icon Name", type: "text" },
          { name: "color", label: "Color", type: "text" },
        ]}
      />
    </AdminLayout>
  );
}