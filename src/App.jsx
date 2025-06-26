import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi there! I’m your AI Policy Agent—here to help you create a clear, customized AI Use Policy.\n\nWith the rise of tools like ChatGPT and Midjourney, it’s more important than ever to set healthy boundaries and expectations.\n\nLet’s get started—what’s the name of the organization or individual this policy is for?"
    }
  ]);
  const [input, setInput] = useState('');
  const [sessionId] = useState('session-' + Date.now());
  const [policyGenerated, setPolicyGenerated] = useState(false);
  const [formattedPolicy, setFormattedPolicy] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (policyGenerated) {
      setMessages([...messages, { role: 'user', text: input }, { role: 'bot', text: '✅ This session is complete. Please copy your policy below.' }]);
      setInput('');
      return;
    }

    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await fetch('https://b0171f93-2067-4348-814a-806bd385a885-00-pe0wbytc9iis.riker.replit.dev/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages: newMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
        })
      });

      const data = await res.json();
      let reply = data.reply;

      if (reply.includes('Brought to you by Leadership in Change')) {
        setPolicyGenerated(true);
        const cleanReply = reply
          .replace('✅ Done! See below for your custom policy.', '')
          .replace(/.*Brought to you by Leadership in Change.*/gi, '')
          .trim();
        setFormattedPolicy(cleanReply);
        reply = '✅ Done! See below for your custom policy.';
      }

      setMessages([...newMessages, { role: 'bot', text: reply }]);
    } catch (err) {
      console.error('Error:', err);
      setMessages([...newMessages, { role: 'bot', text: '⚠️ Something went wrong. Please try again.' }]);
    }
  };

  return (
    <div className="bg-cardBackground min-h-screen p-6 text-olive font-sans">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-serif text-navy">AI Policy Agent</h1>

        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'} w-full`}
            >
              <div className={`flex items-start gap-2 ${msg.role === 'bot' ? 'bg-[#f9eae1]' : 'bg-circuitryBlue text-white'} p-3 rounded-xl w-fit max-w-[80%]`}>
                {msg.role === 'bot' && (
                  <img src="/bot-icon.png" alt="AI Agent" className="w-8 h-8 rounded-full shadow-md mt-1" />
                )}
                <span className="whitespace-pre-line leading-relaxed">{msg.text}</span>
              </div>
            </div>
          ))}
          <div ref={bottomRef}></div>
        </div>

        {!policyGenerated && (
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="border border-gray-300 p-2 rounded flex-grow"
              placeholder="Type your answer..."
            />
            <button
              onClick={sendMessage}
              className="bg-circuitryBlue hover:bg-candleGold hover:text-navy text-white px-4 py-2 rounded"
            >
              Send
            </button>
          </div>
        )}

        {policyGenerated && (
          <div className="mt-6">
            <button
              className="bg-circuitryBlue hover:bg-candleGold hover:text-navy text-white px-4 py-2 mb-4 rounded"
              onClick={() => {
                navigator.clipboard.writeText(formattedPolicy);
                alert('✅ Policy copied to clipboard!');
              }}
            >
              📋 Copy to Clipboard
            </button>

            <div className="prose prose-lg font-serif max-w-none bg-white p-6 rounded shadow-sm">
              <pre className="whitespace-pre-wrap text-olive font-sans">{formattedPolicy}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
