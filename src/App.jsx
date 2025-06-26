import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi there! I'm your AI Policy Agent—here to help you create a clear, customized AI Use Policy.\n\nWith the rise of tools like ChatGPT and Midjourney, it's more important than ever to set healthy boundaries and expectations.\n\nLet's get started—what's the name of the organization or individual this policy is for?"
    }
  ]);
  const [input, setInput] = useState('');
  const [sessionId] = useState('session-' + Date.now());
  const [policyGenerated, setPolicyGenerated] = useState(false);
  const [formattedPolicy, setFormattedPolicy] = useState('');
  const [isLoadingPolicy, setIsLoadingPolicy] = useState(false);
  const bottomRef = useRef(null);

  const colors = {
    cardBackground: '#f5f5dc',
    olive: '#6b7280',
    navy: '#1e3a8a',
    circuitryBlue: '#3b82f6',
    candleGold: '#f59e0b',
    warmCream: '#f9eae1'
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatPolicyText = (text) => {
    if (!text) return '';

    let cleanText = text
      .replace(/Great! Generating your policy now\.{3}/gi, '')
      .replace(/Thank you for creating your AI Use Policy.*$/gi, '')
      .trim();

    const lines = cleanText.split('\n');
    let formattedHtml = '';
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      if (trimmedLine.toLowerCase().includes('ai use policy for')) {
        formattedHtml += `<h1 class="text-2xl font-bold text-center mb-6" style="color: ${colors.navy};">${trimmedLine}</h1>`;
      } else if (/^(Purpose|Scope|Industry Context|AI Tools Used|Tool Access Policy|Brand Guidelines|Who Can Use AI|Human Review Requirement|Fact\/Quote Verification|Prohibited Use Areas|Policy Review Schedule|Image Disclaimers|Data Privacy and Member Protection|Responsible Innovation|Definitions|User Acknowledgement & Signature)$/i.test(trimmedLine)) {
        formattedHtml += `<h2 class="text-xl font-semibold mt-6 mb-2" style="color: ${colors.navy};">${trimmedLine}</h2>`;
      } else if (trimmedLine.includes('Name:')) {
        formattedHtml += `<p class="mt-8">Name: _______________________</p>`;
      } else if (trimmedLine.includes('Title/Role:')) {
        formattedHtml += `<p>Title/Role: _______________________</p>`;
      } else if (trimmedLine.includes('Signature:')) {
        formattedHtml += `<p>Signature: _______________________</p>`;
      } else if (trimmedLine.includes('Date:')) {
        formattedHtml += `<p>Date: _______________________</p>`;
      } else {
        formattedHtml += `<p class="text-justify mb-4" style="color: ${colors.olive};">${trimmedLine}</p>`;
      }
    });
    return formattedHtml;
  };

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
    setIsLoadingPolicy(true);

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

      setIsLoadingPolicy(false);
      setMessages([...newMessages, { role: 'bot', text: reply }]);
    } catch (err) {
      console.error('Error:', err);
      setIsLoadingPolicy(false);
      setMessages([...newMessages, { role: 'bot', text: '⚠️ Something went wrong. Please try again.' }]);
    }
  };

  return (
    <div style={{backgroundColor: colors.cardBackground}} className="min-h-screen p-6 font-sans" style={{color: colors.olive}}>
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-serif" style={{color: colors.navy}}>AI Policy Agent</h1>

        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'} w-full`}>
              <div className={`flex items-start gap-2 p-3 rounded-xl w-fit max-w-[80%]`} style={{ backgroundColor: msg.role === 'bot' ? colors.warmCream : colors.circuitryBlue, color: msg.role === 'bot' ? colors.olive : 'white' }}>
                {msg.role === 'bot' && (<img src="/bot-icon.png" alt="AI Agent" className="w-8 h-8 rounded-full shadow-md mt-1" />)}
                <span className="whitespace-pre-line leading-relaxed">{msg.text}</span>
              </div>
            </div>
          ))}
          <div ref={bottomRef}></div>

          {isLoadingPolicy && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-600"></span>
              Generating your policy...
            </div>
          )}
        </div>

        {/* ... input and policy display logic remains unchanged ... */}
      </div>
    </div>
  );
}
