import React, { useState } from 'react';

const QUESTIONS = [
  { id: 'name', prompt: "Let’s start with your name or your organization’s name. And how would you describe yourself? Pick one: 1. Solopreneur, 2. Team, 3. Business, 4. Nonprofit, 5. Church" },
  { id: 'industry', prompt: "What industry or space do you work in? Examples: Church, Education, Healthcare, Creator, Ecommerce, Consulting…" },
  { id: 'tools', prompt: "What AI tools do you or your team plan to use? (e.g., ChatGPT, Claude, Midjourney). Also, do you want to allow: 1. Any AI tools, 2. Only pre-approved ones?" },
  { id: 'brand', prompt: "Should AI-generated content follow your brand guide? (Yes or No). If yes, can you share the link?" },
  { id: 'who', prompt: "Who should be allowed to use AI tools? 1. Anyone on the team, 2. Only trained staff, 3. Leadership only. Should users sign this policy before they start using AI? (Yes or No)" },
  { id: 'images', prompt: "Should AI-made images include a small note or label saying they were AI-generated? (Yes or No)" },
  { id: 'prohibited', prompt: "Are there any areas where AI should not be used in your work? I’ll suggest a list based on your industry—you can say numbers or type ‘none’." }
];

export default function App() {
  const [chat, setChat] = useState([{ role: 'bot', text: "Hi there! I’m your AI Policy Agent—excited to help you create a customized AI Use Policy. Ready to begin?" }]);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState({});
  const [policy, setPolicy] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const q = QUESTIONS[step];
    const newAnswers = { ...answers, [q.id]: input };
    setChat([...chat, { role: 'user', text: input }, { role: 'bot', text: QUESTIONS[step + 1]?.prompt || 'Great! Generating your policy now…' }]);
    setInput('');
    setAnswers(newAnswers);
    if (step + 1 === QUESTIONS.length) {
      setLoading(true);
      const res = await fetch('https://your-backend-url.repl.co/generate-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'session-' + Date.now(), answers: Object.entries(newAnswers).map(([question, answer]) => ({ question, answer })) })
      });
      const data = await res.json();
      setPolicy(data.policy);
      setLoading(false);
    }
    setStep(step + 1);
  };

  return (
    <div className="bg-cardBackground min-h-screen p-6 text-olive font-sans">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-serif text-navy">AI Policy Agent</h1>
        <div className="space-y-3">
          {chat.map((msg, i) => (
            <div key={i} className={`p-3 rounded-xl ${msg.role === 'bot' ? 'bg-cardBackground' : 'bg-circuitryBlue text-white'} w-fit max-w-[80%]`}>
              {msg.text}
            </div>
          ))}
        </div>
        {policy ? (
          <div>
            <h2 className="text-lg font-semibold text-navy mt-4">Your Custom Policy</h2>
            <textarea
              className="w-full h-96 p-4 border border-gray-300 rounded-lg mt-2 font-mono"
              value={policy}
              readOnly
            />
            <button
              className="bg-circuitryBlue hover:bg-candleGold hover:text-navy text-white px-4 py-2 mt-4 rounded"
              onClick={() => {
                navigator.clipboard.writeText(policy);
                alert('✅ Policy copied to clipboard!');
              }}
            >
              📋 Copy to Clipboard
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="border border-gray-300 p-2 rounded flex-grow"
              placeholder="Type your answer..."
              disabled={loading}
            />
            <button
              onClick={handleSubmit}
              className="bg-circuitryBlue hover:bg-candleGold hover:text-navy text-white px-4 py-2 rounded"
              disabled={loading}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

