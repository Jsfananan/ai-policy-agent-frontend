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
      .replace(/Great! Generating your policy now\.\.\./gi, '')
      .replace(/Thank you for creating your AI Use Policy.*$/gi, '')
      .replace(/Thank you for using the AI Policy Agent.*$/gi, '')
      .replace(/If you need further adjustments.*$/gi, '')
      .trim();

    const lines = cleanText.split('\n');
    let formattedHtml = '';
    let inList = false;
    let sectionCount = 0;
    let signatureAdded = false;

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        if (inList) {
          formattedHtml += '</ul>';
          inList = false;
        }
        return;
      }

      if (trimmedLine.toLowerCase().includes('signature') && trimmedLine.length < 50) return;

      if (trimmedLine.toLowerCase().includes('ai use policy for')) {
        const cleanTitle = trimmedLine.replace(/^#+\s*/, '');
        formattedHtml += `
          <div class="border-b-3 pb-4 mb-8" style="border-bottom: 3px solid black;">
            <h1 class="text-4xl font-bold text-center mb-2" style="color: black;">${cleanTitle}</h1>
            <div class="w-24 h-1 mx-auto" style="background-color: black;"></div>
          </div>`;
        sectionCount++;
        return;
      }

      if (/^(\#{2,}|[*_]{2}|)(Purpose|Scope|Industry Context|AI Tools|Definitions|Guidelines|Implementation|Review|Policy Statement|Permitted Uses|Prohibited Uses|Training Requirements|Compliance|Monitoring|Brand Guidelines|User Authorization|User Access|Image Disclaimers|Verification Statement|Review and Updates|User Guidelines):?(\*{2}|)$/i.test(trimmedLine)) {
        if (inList) {
          formattedHtml += '</ul>';
          inList = false;
        }
        const cleanHeader = trimmedLine.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/:$/, '');
        sectionCount++;
        formattedHtml += `
          <div class="mt-8 mb-4">
            <h2 class="text-2xl font-semibold pl-4 mb-3" style="color: black; border-left: 4px solid black;">${cleanHeader}</h2>
          </div>`;
        return;
      }

      if (trimmedLine.endsWith(':') && trimmedLine.length < 50) {
        if (inList) {
          formattedHtml += '</ul>';
          inList = false;
        }
        formattedHtml += `<h3 class="text-lg font-medium mt-4 mb-2" style="color: black;">${trimmedLine}</h3>`;
        return;
      }

      if (/^[\s]*[-•*]\s/.test(trimmedLine) || /^[\s]*\d+\.\s/.test(trimmedLine)) {
        if (!inList) {
          formattedHtml += '<ul class="list-none mb-6 space-y-3 ml-4">';
          inList = true;
        }
        const cleanItem = trimmedLine.replace(/^[\s]*[-•*]\s/, '').replace(/^[\s]*\d+\.\s/, '');
        formattedHtml += `<li class="flex items-start"><span style="color: black;" class="mr-3 font-bold">•</span><span style="color: black;" class="leading-relaxed text-justify">${cleanItem}</span></li>`;
        return;
      }

      if (inList) {
        formattedHtml += '</ul>';
        inList = false;
      }

      if (/Note:|Important:|Remember:/i.test(trimmedLine)) {
        formattedHtml += `
          <div class="rounded-lg p-4 mb-6 shadow-sm" style="background: #f9f9f9; border: 1px solid black;">
            <p class="font-medium flex items-center" style="color: black;">
              <span style="color: black;" class="mr-2">⚠️</span>${trimmedLine}
            </p>
          </div>`;
      } else {
        const clean = trimmedLine.replace(/\*\*(.*?)\*\*/g, '$1');
        formattedHtml += `<p class="mb-4 leading-relaxed text-justify" style="color: black;">${clean}</p>`;
      }
    });

    if (inList) formattedHtml += '</ul>';

    if (!signatureAdded) {
      formattedHtml += `
        <div class="mt-12 pt-8 border-t-2 border-gray-300">
          <h2 class="text-2xl font-semibold pl-4 mb-6" style="color: black; border-left: 4px solid black;">Signature</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div><div class="border-b-2 border-gray-400 pb-1 mb-2 min-h-[40px]"></div><p class="text-sm" style="color: black;">Name (Print)</p></div>
            <div><div class="border-b-2 border-gray-400 pb-1 mb-2 min-h-[40px]"></div><p class="text-sm" style="color: black;">Signature</p></div>
            <div><div class="border-b-2 border-gray-400 pb-1 mb-2 min-h-[40px]"></div><p class="text-sm" style="color: black;">Date</p></div>
          </div>
        </div>`;
    }

    return formattedHtml;
  };

  const getPlainTextPolicy = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/^#+\s*/gm, '')
      .replace(/^\s*[-•*]\s*/gm, '• ')
      .replace(/\n{2,}/g, '\n\n')
      .replace(/\n\s+/g, '\n')
      .trim();
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
    navigator.clipboard.writeText(getPlainTextPolicy(formattedPolicy));
    alert('✅ Policy copied to clipboard!');
  };

  return (
    <div style={{ backgroundColor: colors.cardBackground }} className="min-h-screen p-6 font-sans" style={{ color: colors.olive }}>
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
              style={{ focusRingColor: colors.circuitryBlue }}
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
              <button
                className="text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                style={{ backgroundColor: colors.navy }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.candleGold;
                  e.target.style.color = colors.navy;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.navy;
                  e.target.style.color = 'white';
                }}
                onClick={() => {
                  setPolicyGenerated(false);
                  setFormattedPolicy('');
                  setMessages([messages[0]]);
                }}
              >
                🔄 Create New Policy
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <div className="text-white p-4" style={{ background: `linear-gradient(to right, ${colors.navy}, ${colors.circuitryBlue})` }}>
                <h3 className="text-lg font-semibold flex items-center">
                  <span className="mr-2">📄</span>
                  Your Custom AI Use Policy
                </h3>
              </div>
              <div className="p-8 bg-gradient-to-br from-white to-gray-50">
                <div className="prose prose-lg max-w-none policy-document" dangerouslySetInnerHTML={{ __html: formatPolicyText(formattedPolicy) }} />
              </div>
            </div>

            <div className="mt-10 bg-gray-100 p-6 rounded-lg shadow-inner">
              <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                🧾 Plain Text Preview
              </h4>
              <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-mono">
                {getPlainTextPolicy(formattedPolicy)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

