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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatPolicyText = (text) => {
    if (!text) return '';

    const cleanText = text
      .replace(/Great! Generating your policy now\.{3}/gi, '')
      .replace(/Thank you for creating your AI Use Policy.*$/gi, '')
      .replace(/If you need further adjustments or have any questions, feel free to ask\./gi, '')
      .trim();

    const lines = cleanText.split('\n');
    let html = '';
    let sectionNumber = 1;
    let inList = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += '<br />';
        return;
      }

      if (/^AI Use Policy for/i.test(trimmed)) {
        html += `<h1>${trimmed}</h1>`;
        return;
      }

      if (/^•|^-|^\*/.test(trimmed)) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${trimmed.replace(/^[-•*]\s*/, '')}</li>`;
        return;
      }

      const sectionHeaders = [
        'Purpose', 'Scope', 'Industry Context', 'AI Tools Used',
        'Tool Access Policy', 'Brand Guidelines', 'Who Can Use AI',
        'Human Review Requirement', 'Fact/Quote Verification',
        'Prohibited Use Areas', 'Policy Review Schedule',
        'Image Disclaimers', 'Data Privacy and Member Protection',
        'Responsible Innovation'
      ];

      if (sectionHeaders.some(h => trimmed.startsWith(h))) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<h2>${sectionNumber++}. ${trimmed}</h2>`;
        return;
      }

      if (/^Definitions$/i.test(trimmed)) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<h2>${sectionNumber++}. ${trimmed}</h2>`;
        return;
      }

      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p>${trimmed}</p>`;
    });

    if (inList) {
      html += '</ul>';
    }

    html += `
      <h2>User Acknowledgement & Signature</h2>
      <p>By signing below, I acknowledge that I have read, understood, and agreed to follow the AI Use Policy outlined above.</p>
      <p>Name: ___________________________</p>
      <p>Title/Role: ___________________________</p>
      <p>Signature: ___________________________</p>
      <p>Date: ___________________________</p>
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const formattedHtml = formatPolicyText(formattedPolicy);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AI Use Policy</title>
          <style>
            body {
              font-family: 'Georgia', 'Times New Roman', serif;
              color: #2c3e50;
              line-height: 1.8;
              max-width: 700px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            h1 {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 40px;
            }
            h2 {
              font-size: 18px;
              font-weight: bold;
              margin-top: 30px;
              margin-bottom: 10px;
            }
            p {
              margin-bottom: 12px;
            }
            ul {
              margin-left: 20px;
              margin-bottom: 12px;
            }
            li {
              margin-bottom: 8px;
            }
            @media print {
              body {
                font-size: 12pt;
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          ${formattedHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const copyToClipboard = () => {
    const cleanText = formattedPolicy.replace(/\n\s*\n/g, '\n\n').trim();
    navigator.clipboard.writeText(cleanText);
    alert('✅ Policy copied to clipboard!');
  };

  return (
    <div className="min-h-screen p-6 font-sans bg-[#f5f5dc] text-[#6b7280]">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-serif text-[#1e3a8a]">AI Policy Agent</h1>

        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'} w-full`}>
              <div
                className={`flex items-start gap-2 p-3 rounded-xl w-fit max-w-[80%]`}
                style={{
                  backgroundColor: msg.role === 'bot' ? '#f9eae1' : '#3b82f6',
                  color: msg.role === 'bot' ? '#6b7280' : 'white'
                }}>
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
              style={{ backgroundColor: '#3b82f6' }}>
              Send
            </button>
          </div>
        )}

        {policyGenerated && (
          <div className="mt-6">
            <div className="flex gap-3 mb-6 flex-wrap">
              <button
                className="text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                style={{ backgroundColor: '#3b82f6' }}
                onClick={copyToClipboard}>
                📋 Copy to Clipboard
              </button>
              <button
                className="text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                style={{ backgroundColor: '#3b82f6' }}
                onClick={handlePrint}>
                🖨️ Print Policy
              </button>
              <button
                className="text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                style={{ backgroundColor: '#1e3a8a' }}
                onClick={() => {
                  setPolicyGenerated(false);
                  setFormattedPolicy('');
                  setMessages([messages[0]]);
                }}>
                🔄 Create New Policy
              </button>
            </div>

            <div className="mt-4 border-t pt-4">
              <h2 className="text-xl font-semibold mb-4 text-black">📄 Your Custom AI Use Policy</h2>
              <div
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#2c3e50',
                  whiteSpace: 'pre-wrap',
                  padding: '20px'
                }}
                dangerouslySetInnerHTML={{ __html: formatPolicyText(formattedPolicy) }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
