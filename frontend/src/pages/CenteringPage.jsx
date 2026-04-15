import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Timer, Wind } from "lucide-react";

import PageShell from "../components/common/PageShell";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { publicApi } from "../services/api";

const fallbackText =
  "Please close your eyes for a moment, place your attention on your Sahasrara, and answer from your heart, not from your mind.";

export default function CenteringPage() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(5);
  const [text, setText] = useState(fallbackText);

  useEffect(() => {
    publicApi
      .getContent("centeringText")
      .then((item) => setText(item?.content || fallbackText))
      .catch(() => setText(fallbackText));
  }, []);

  useEffect(() => {
    if (seconds <= 0) {
      navigate("/questionnaire", { replace: true });
      return;
    }

    const timer = setTimeout(() => setSeconds((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, navigate]);

  return (
    <PageShell title="Before you begin" subtitle="Take a small pause and become centered.">
      <Card className="mx-auto max-w-2xl overflow-hidden text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-700">
          <Wind size={34} />
        </div>

        <p className="mt-6 font-serif text-6xl font-bold text-slate-900">
          {seconds}
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-orange-700">
          <Timer size={17} />
          Centering pause
        </div>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-9 text-slate-700">
          {text}
        </p>

        <div className="mt-8">
          <Button variant="soft" onClick={() => navigate("/questionnaire")}>
            Skip and continue
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}