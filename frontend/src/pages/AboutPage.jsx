import { Link } from "react-router-dom";
import PageShell from "../components/common/PageShell";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

export default function AboutPage() {
  return (
    <PageShell
      title="About this guidance tool"
      subtitle="A gentle Sahajayoga reflection tool for seekers and Sahajayogis."
      actions={
        <div className="flex flex-wrap gap-3">
          <Link to="/center">
            <Button>Begin Questionnaire</Button>
          </Link>
          <Link to="/">
            <Button variant="soft">Go Home</Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            What this tool does
          </h2>
          <p className="mt-3 leading-8 text-slate-700">
            This tool offers supportive guidance based on your answers to a calm,
            structured questionnaire. It may help you reflect on possible chakra
            attention areas, likely nadi imbalance, simple Sahajayoga remedies,
            and mantra support.
          </p>
        </Card>

        <Card>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            What this tool does not do
          </h2>
          <p className="mt-3 leading-8 text-slate-700">
            This is not a medical tool and not a definitive spiritual
            assessment. It does not replace direct guidance from experienced
            Sahajayogis. The result depends on the answers provided and may not
            always fully reflect a person’s actual subtle condition.
          </p>
        </Card>

        <Card>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            How to use it
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li>Take a moment to become calm before answering.</li>
            <li>Choose neutral options whenever you are unsure.</li>
            <li>Answer honestly and simply.</li>
            <li>Read the result gently as reflective guidance.</li>
            <li>
              Use regular meditation, footsoak, Kundalini raising, and bandhan
              as general support.
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Spiritual note
          </h2>
          <p className="mt-3 leading-8 text-slate-700">
            Sahajayoga teaches that real subtle understanding deepens through
            actual meditation, vibrations, and collective guidance. This tool is
            best used as a starting point for reflection and not as a final
            conclusion.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}