import React, { useState, useEffect, useRef } from 'react';

function App() {
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
      .replace(/Thank you for (creating|taking the time to create).*AI Use Policy.*$/gi, '')
      .replace(/If you need further adjustments.*$/gi, '')
      .trim();

    const lines = cleanText.split('\n');
    let html = '';
    let inList = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        return;
      }

      if (
        trimmed.length < 60 &&
        (trimmed.endsWith(':') ||
          /^(Purpose|Scope|Definitions|Guidelines|Implementation|Review|Permitted Uses|Prohibited Uses|Policy Statement|Signature)$/i.test(trimmed))
      ) {
        html += `<p style="font-size:12pt; color:black;"><strong>${trimmed}</strong></p>`;
        return;
      }

      if (/^[-•*]\s/.test(trimmed)) {
        if (!inList) {
          html += '<ul style="margin-left:1.5em; padding-left:0; margin-bottom:1em;">';
          inList = true;
        }
        const item = trimmed.replace(/^[-•*]\s/, '');
        html += `<li style="font-size:12pt; color:black;">• ${item}</li>`;
        return;
      }

      if (inList) {
        html += '</ul>';
        inList = false;
      }

      html += `<p style="font-size:12pt; color:black;">${trimmed}</p>`;
    });

    if (inList) html += '</ul>';

    html += `
      <div style="margin-top:2em;">
        <p style="font-size:12pt; color:black;"><strong>Signature</strong></p>
        <div style="margin-top:1.5em;">
          <div style="border-bottom:1px solid black; height:2em;"></div>
          <p style="font-size:12pt; color:black;">Name (Print)</p>
        </div>
        <div style="margin-top:1.5em;">
          <div style="border-bottom:1px solid black; height:2em;"></div>
          <p style="font-size:12pt; color:black;">Signature</p>
        </div>
        <div style="margin-top:1.5em;">
          <div style="border-bottom:1px solid black; height:2em;"></div>
          <p style="font-size:12pt; color:black;">Date</p>
        </div>
      </div>
    `;

    return html;
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedPolicy);
    alert('✅ Policy copied to clipboard!');
  };

  return (
    <div style={{ backgroundColor: colors.cardBackground, color: colors.olive }} className="min-h-screen p-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-serif" style={{ color: colors.navy }}>AI Policy Agent</h1>

        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'} w-full`}>
              <div
                className={`flex items-start gap-2 p-3 rounded-xl w-fit max-w-[80%]`}
                style={{
                  backgroundColor: msg.role === 'bot' ? colors.warmCream : colors.circuitryBlue,
                  color: msg.role === 'bot' ? colors.olive : 'white'
                }}
              >
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
              className="border border-gray-300 p-3 rounded-lg flex-grow focus:outline-none focus:ring-2"
              placeholder="Type your answer..."
            />
            <button
              onClick={sendMessage}
              className="text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: colors.circuitryBlue }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.candleGold;
                e.target.style.color = colors.navy;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colors.circuitryBlue;
                e.target.style.color = 'white';
              }}
            >
              Send
            </button>
          </div>
        )}

        {policyGenerated && (
          <div className="mt-6">
            <div className="flex gap-3 mb-6 flex-wrap">
              <button
                className="text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                style={{ backgroundColor: colors.circuitryBlue }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.candleGold;
                  e.target.style.color = colors.navy;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.circuitryBlue;
                  e.target.style.color = 'white';
                }}
                onClick={copyToClipboard}
              >
                📋 Copy to Clipboard
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                <div dangerouslySetInnerHTML={{ __html: formatPolicyText(formattedPolicy) }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
