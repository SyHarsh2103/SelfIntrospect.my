import Card from "./Card";

export default function DisclaimerBox({ content, short = false }) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-amber-700 shadow-sm">
          {short ? "Note" : "Important guidance"}
        </div>

        <div className="min-w-0">
          <h3 className="font-serif text-2xl font-bold text-slate-900">
            Spiritual disclaimer
          </h3>
          <p className="mt-3 text-sm leading-8 text-slate-700">
            {content ||
              "This result is based on your selected answers and may not always be fully accurate. For deeper and proper guidance, please connect with experienced Sahajayogis."}
          </p>
        </div>
      </div>
    </Card>
  );
}