import React, { useState } from 'react';

const QUESTIONS = [
  {
    id: 'nameAndType',
    prompt:
      "Hi there! I’m your AI Policy Agent. Let’s create your custom AI Use Policy. First—what’s your name or your organization’s name? And how would you describe yourself?\n\nOptions:\n1. Solopreneur\n2. Team\n3. Business\n4. Nonprofit\n5. Church"
  },
  {
    id: 'industry',
    prompt:
      "What industry or space do you work in?\n\nExamples:\n- Church\n- Education\n- Healthcare\n- Influencer/Creator\n- Ecommerce\n- Consulting\n- Tech Startup\n- Other (please specify)"
  },
  {
    id: 'tools',
    prompt:
      "What AI tools do you or your team plan to use? (e.g., ChatGPT, Claude, Midjourney)\n\nDo you want to:\n1. Allow all tools freely\n2. Use only pre-approved tools"
  },
  {
    id: 'brand',
    prompt:
      "Should AI-generated content follow your brand guide? (Yes or No).\nIf yes, can you share the link?"
  },
  {
    id: 'who',
    prompt:
      "Who should be allowed to use AI tools?\n\nOptions:\n1. Anyone on the team\n2. Only trained staff\n3. Leadership only\n\nShould users sign this policy before they start using AI? (Yes or No)"
  },
  {
    id: 'images',
    prompt:
      "Should AI-made images include a small note or label saying they were AI-generated? (Yes or No)"
  },
  {
    id: 'prohibited',
    prompt:
      "Are there any areas where AI should not be used in your work?\nI’ll suggest a list based on your industry—you can say numbers or type ‘none’."
  }
];

export default function App() {
  const [chat, setChat] = useState([
    {
      role: 'bot',
      text: QUESTIONS[0].prompt
    }
  ]);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState({});
  const [policy, setPolicy] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const q = QUESTIONS[step];
    const newAnswers = { ...answers, [q.id]: input };
    const nextPrompt = QUESTIONS[step + 1]?.prompt;

    const updatedChat = [
      ...chat,
      { role: 'user', text: input },
      nextPrompt ? { role: 'bot', text: nextPrompt } : { role: 'bot', text: '✅ Policy generated below — Brought to you by ' + '[Leadership in Change](https://leadershipinchange10.substack.com)' }
    ];

    setChat(updatedChat);
    setInput('');
    setAnswers(newAnswers);
    setStep(step + 1);

    if (!nextPrompt) {
      setLoading(true);
      const res = await fetch('https://YOUR-BACKEND-URL-HERE/generate-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'session-' + Date.now(),
          answers: Object.entries(newAnswers).map(([question, answer]) => ({ question, answer }))
        })
      });
      const data = await res.json();
      setPolicy(data.policy);
      setLoading(false);
    }
  };

  const renderFormattedPolicy = () => {
    const lines = policy.split('\n');
    return lines.map((line, idx) => {
      const content = line.trim();
      if (/^\*\*/.test(content)) {
        return <h3 key={idx} className="text-lg font-semibold mt-4">{content.replace(/\*\*/g, '')}</h3>;
      } else if (content.includes('___________________________')) {
        return <p key={idx} className="mt-2 font-mono text-sm">{content}</p>;
      } else {
        return <p key={idx} className="mt-2">{content}</p>;
      }
    });
  };

  return (
    <div className="bg-cardBackground min-h-screen p-6 text-olive font-sans">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-serif text-navy">AI Policy Agent</h1>
        <div className="space-y-3">
          {chat.map((msg, i) => (
            <div key={i} className={`p-3 rounded-xl ${msg.role === 'bot' ? 'bg-[#FDF6F2]' : 'bg-circuitryBlue text-white'} w-fit max-w-[80%]`}>
              <span dangerouslySetInnerHTML={{ __html: msg.text }} />
            </div>
          ))}
        </div>

        {policy ? (
          <>
            <button
              className="bg-circuitryBlue hover:bg-candleGold hover:text-navy text-white px-4 py-2 rounded"
              onClick={() => {
                navigator.clipboard.writeText(policy);
                alert('✅ Policy copied to clipboard!');
              }}
            >
              📋 Copy to Clipboard
            </button>
            <div className="mt-4 bg-white border border-gray-300 p-4 rounded-xl">
              {renderFormattedPolicy()}
            </div>
          </>
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

