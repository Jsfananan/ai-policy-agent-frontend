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

  // Define your brand colors
  const colors = {
    cardBackground: '#f5f5dc', // beige/cream background
    olive: '#6b7280', // olive text color
    navy: '#1e3a8a', // navy blue for headers
    circuitryBlue: '#3b82f6', // blue for buttons/accents
    candleGold: '#f59e0b', // gold for highlights
    warmCream: '#f9eae1' // warm cream for bot messages
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to format the policy text into structured HTML
  const formatPolicyText = (text) => {
  if (!text) return '';

  const cleanText = text
    .replace(/Great! Generating your policy now\.\.\./gi, '')
    .replace(/Thank you for creating your AI Use Policy.*$/gi, '')
    .replace(/If you need further adjustments or have any questions, feel free to ask\./gi, '')
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
      html += '<br />';
      return;
    }

    if (/^AI Use Policy for/i.test(trimmed)) {
      html += `<h1>${trimmed}</h1>`;
    } else if (/^(Purpose|Scope|Definitions|Guidelines|Implementation|Review|Signature|Permitted Uses|Prohibited Uses|Training Requirements|Compliance|Monitoring|User Authorization|User Access|Image Disclaimers|Policy Statement|Human Review|Verification Statement|Review and Updates)[:]?$/i.test(trimmed)) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<h2>${trimmed.replace(':', '')}</h2>`;
    } else if (/^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${trimmed.replace(/^[-*•\d.]+\s*/, '')}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `<p>${trimmed}</p>`;
    }
  });

  if (inList) {
    html += '</ul>';
  }

  // Add simple signature section
  html += `
    <h2>Signature</h2>
    <p>__________________________</p>
    <p>Name (Print)</p><br />
    <p>__________________________</p>
    <p>Signature</p><br />
    <p>__________________________</p>

    
    // Add single signature section at the end
    if (!signatureAdded) {
      formattedHtml += `
        <div class="mt-12 pt-8 border-t-2 border-gray-300">
          <h2 class="text-2xl font-semibold pl-4 mb-6" style="color: black; border-left: 4px solid black;">Signature</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <div class="border-b-2 border-gray-400 pb-1 mb-2 min-h-[40px]"></div>
              <p class="text-sm" style="color: black;">Name (Print)</p>
            </div>
            <div>
              <div class="border-b-2 border-gray-400 pb-1 mb-2 min-h-[40px]"></div>
              <p class="text-sm" style="color: black;">Signature</p>
            </div>
            <div>
              <div class="border-b-2 border-gray-400 pb-1 mb-2 min-h-[40px]"></div>
              <p class="text-sm" style="color: black;">Date</p>
            </div>
          </div>
        </div>`;
    }
    
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
              line-height: 1.8; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px;
              color: #2c3e50;
              background: white;
            }
            h1 { 
              color: black; 
              text-align: center;
              font-size: 28px;
              margin-bottom: 30px;
              padding-bottom: 15px;
              border-bottom: 3px solid black;
            }
            h2 { 
              color: black; 
              font-size: 20px;
              margin-top: 35px;
              margin-bottom: 15px;
              padding-left: 15px;
              border-left: 4px solid black;
            }
            h3 {
              color: black;
              font-size: 16px;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            ul { 
              margin: 20px 0;
              padding-left: 0;
            }
            li { 
              margin: 12px 0;
              padding-left: 20px;
              list-style: none;
              position: relative;
            }
            li:before {
              content: "•";
              color: black;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            p { 
              text-align: justify;
              margin-bottom: 15px;
              color: black;
            }
            .signature-section {
              margin-top: 50px;
              padding-top: 30px;
              border-top: 2px solid #e2e8f0;
            }
            .signature-line {
              border-bottom: 2px solid black;
              height: 40px;
              margin-bottom: 8px;
            }
            .signature-label {
              font-size: 12px;
              color: black;
            }
            @media print {
              body { 
                padding: 20px; 
                font-size: 12px;
              }
              h1 { font-size: 24px; }
              h2 { font-size: 18px; }
              .no-print { display: none; }
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
    // Create a clean text version for clipboard
    const cleanText = formattedPolicy
      .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
      .trim();
    
    navigator.clipboard.writeText(cleanText);
    alert('✅ Policy copied to clipboard!');
  };

  return (
    <div style={{backgroundColor: colors.cardBackground}} className="min-h-screen p-6 font-sans" 
         style={{color: colors.olive}}>
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-serif" style={{color: colors.navy}}>AI Policy Agent</h1>
        
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'} w-full`}
            >
              <div className={`flex items-start gap-2 p-3 rounded-xl w-fit max-w-[80%]`}
                   style={{
                     backgroundColor: msg.role === 'bot' ? colors.warmCream : colors.circuitryBlue,
                     color: msg.role === 'bot' ? colors.olive : 'white'
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
              style={{focusRingColor: colors.circuitryBlue}}
              placeholder="Type your answer..."
            />
            <button
              onClick={sendMessage}
              className="text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
              style={{backgroundColor: colors.circuitryBlue}}
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
                style={{backgroundColor: colors.circuitryBlue}}
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
                style={{backgroundColor: colors.circuitryBlue}}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.candleGold;
                  e.target.style.color = colors.navy;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.circuitryBlue;
                  e.target.style.color = 'white';
                }}
                onClick={handlePrint}
              >
                🖨️ Print Policy
              </button>
              <button
                className="text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                style={{backgroundColor: colors.navy}}
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
                  setMessages([{
                    role: 'bot',
                    text: "Hi there! I'm your AI Policy Agent—here to help you create a clear, customized AI Use Policy.\n\nWith the rise of tools like ChatGPT and Midjourney, it's more important than ever to set healthy boundaries and expectations.\n\nLet's get started—what's the name of the organization or individual this policy is for?"
                  }]);
                }}
              >
                🔄 Create New Policy
              </button>
            </div>
            
            <div className="mt-4 border-t pt-4">
  <h2 className="text-xl font-semibold mb-4 text-black">📄 Your Custom AI Use Policy</h2>
  <div
    className="text-black leading-relaxed space-y-4"
    style={{ whiteSpace: 'pre-wrap' }}
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
