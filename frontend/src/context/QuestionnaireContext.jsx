import { createContext, useContext, useMemo, useState } from "react";

const QuestionnaireContext = createContext(null);

export function QuestionnaireProvider({ children }) {
  const [answers, setAnswers] = useState({});
  const [sessionId, setSessionId] = useState(
    localStorage.getItem("sessionId") || ""
  );
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    const raw = localStorage.getItem("selectedTemplate");
    return raw ? JSON.parse(raw) : null;
  });

  const saveAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const resetAnswers = () => {
    setAnswers({});
  };

  const saveSessionId = (value) => {
    setSessionId(value);
    localStorage.setItem("sessionId", value);
  };

  const saveSelectedTemplate = (template) => {
    setSelectedTemplate(template);
    localStorage.setItem("selectedTemplate", JSON.stringify(template));
    setAnswers({});
  };

  const contextValue = useMemo(
    () => ({
      answers,
      setAnswers,
      saveAnswer,
      setAnswer: saveAnswer,
      resetAnswers,
      sessionId,
      saveSessionId,
      selectedTemplate,
      saveSelectedTemplate,
    }),
    [answers, sessionId, selectedTemplate]
  );

  return (
    <QuestionnaireContext.Provider value={contextValue}>
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaire() {
  const context = useContext(QuestionnaireContext);

  if (!context) {
    throw new Error("useQuestionnaire must be used within QuestionnaireProvider");
  }

  return context;
}