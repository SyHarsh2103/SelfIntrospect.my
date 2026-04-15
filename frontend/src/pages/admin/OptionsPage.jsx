import AdminLayout from "../../components/admin/AdminLayout";
import CrudManager from "../../components/admin/CrudManager";
import { adminApi } from "../../services/api";

export default function OptionsPage() {
  return (
    <AdminLayout title="Options Manager">
      <CrudManager
        title="Options"
        description="Manage answer options and scoring mappings. Scores should be JSON objects."
        loadItems={adminApi.getOptions}
        createItem={adminApi.createOption}
        updateItem={adminApi.updateOption}
        deleteItem={adminApi.deleteOption}
        columns={[
          { key: "label", label: "Label" },
          { key: "value", label: "Value" },
          { key: "questionId", label: "Question ID" },
          { key: "isNeutral", label: "Neutral" },
        ]}
        fields={[
          { name: "questionId", label: "Question ID", type: "text", required: true },
          { name: "label", label: "Label", type: "text", required: true },
          { name: "value", label: "Internal Value", type: "text", required: true },
          { name: "sortOrder", label: "Sort Order", type: "number" },
          { name: "description", label: "Admin Description", type: "textarea", fullWidth: true },
          {
            name: "chakraScores",
            label: "Chakra Scores JSON",
            type: "textarea",
            fullWidth: true,
            placeholder: '{"agnya":2,"sahasrara":1}',
          },
          {
            name: "nadiScores",
            label: "Nadi Scores JSON",
            type: "textarea",
            fullWidth: true,
            placeholder: '{"leftNadi":2,"rightNadi":0,"centerNadi":0}',
          },
          { name: "isNeutral", label: "Neutral Option", type: "checkbox" },
        ]}
      />
    </AdminLayout>
  );
}