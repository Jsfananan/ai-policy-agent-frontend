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
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to format the policy text into structured HTML
  const formatPolicyText = (text) => {
    if (!text) return '';
    
    // Clean the text first - remove unwanted lines
    let cleanText = text
      .replace(/Great! Generating your policy now\.\.\./gi, '')
      .replace(/Thank you for creating your AI Use Policy.*$/gi, '')
      .trim();
    
    // Split into lines and process
    const lines = cleanText.split('\n').filter(line => line.trim());
    let formattedHtml = '';
    let inList = false;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) return;
      
      // Skip unwanted lines
      if (trimmedLine.toLowerCase().includes('generating your policy') || 
          trimmedLine.toLowerCase().includes('thank you for creating')) {
        return;
      }
      
      // Main title - looks for "AI Use Policy for" or similar
      if (trimmedLine.toLowerCase().startsWith('ai use policy for') || 
          trimmedLine.toLowerCase().startsWith('# ai use policy for') ||
          trimmedLine.toLowerCase().startsWith('#### ai use policy for')) {
        const cleanTitle = trimmedLine.replace(/^#+\s*/, '');
        formattedHtml += `<h1 class="text-3xl font-bold text-center mb-8 text-navy">${cleanTitle}</h1>`;
        return;
      }
      
      // Section headers - look for #### format or specific section names
      if (trimmedLine.startsWith('####') || 
          /^(Scope|Industry Context|AI Tools|Definitions|Guidelines|Implementation|Review|Signature):?\s*$/i.test(trimmedLine)) {
        if (inList) {
          formattedHtml += '</ul>';
          inList = false;
        }
        const cleanHeader = trimmedLine.replace(/^#+\s*/, '').replace(/:$/, '');
        formattedHtml += `<h2 class="text-xl font-semibold mt-6 mb-3 text-navy">${cleanHeader}</h2>`;
        return;
      }
      
      // List items (lines starting with bullet points, numbers, or dashes)
      if (/^[\s]*[-•*]\s/.test(trimmedLine) || /^[\s]*\d+\.\s/.test(trimmedLine)) {
        if (!inList) {
          formattedHtml += '<ul class="list-disc list-inside mb-4 space-y-2">';
          inList = true;
        }
        const cleanItem = trimmedLine.replace(/^[\s]*[-•*]\s/, '').replace(/^[\s]*\d+\.\s/, '');
        formattedHtml += `<li class="text-olive leading-relaxed">${cleanItem}</li>`;
        return;
      }
      
      // Regular paragraphs
      if (inList) {
        formattedHtml += '</ul>';
        inList = false;
      }
      
      // Check if it's a subsection or important note
      if (trimmedLine.length < 100 && (trimmedLine.includes('Note:') || trimmedLine.includes('Important:') || trimmedLine.includes('Remember:'))) {
        formattedHtml += `<div class="bg-[#f9eae1] border-l-4 border-candleGold p-3 mb-4"><p class="text-navy font-medium">${trimmedLine}</p></div>`;
      } else {
        formattedHtml += `<p class="mb-4 text-olive leading-relaxed">${trimmedLine}</p>`;
      }
    });
    
    // Close any remaining list
    if (inList) {
      formattedHtml += '</ul>';
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
              font-family: 'Times New Roman', serif; 
              line-height: 1.6; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              color: #333;
            }
            h1 { 
              color: #2c3e50; 
              border-bottom: 2px solid #3498db; 
              padding-bottom: 10px; 
            }
            h2 { 
              color: #34495e; 
              margin-top: 30px; 
            }
            ul { 
              margin: 15px 0; 
            }
            li { 
              margin: 8px 0; 
            }
            p { 
              text-align: justify; 
            }
            .note { 
              background: #ecf0f1; 
              padding: 15px; 
              border-left: 4px solid #3498db; 
              margin: 20px 0; 
            }
            @media print {
              body { padding: 0; }
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
    <div className="bg-cardBackground min-h-screen p-6 text-olive font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-serif text-navy">AI Policy Agent</h1>
        
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'} w-full`}
            >
              <div className={`flex items-start gap-2 ${
                msg.role === 'bot' 
                  ? 'bg-[#f9eae1]' 
                  : 'bg-circuitryBlue text-white'
              } p-3 rounded-xl w-fit max-w-[80%]`}>
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
              className="border border-gray-300 p-3 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-circuitryBlue"
              placeholder="Type your answer..."
            />
            <button
              onClick={sendMessage}
              className="bg-circuitryBlue hover:bg-candleGold hover:text-navy text-white px-6 py-3 rounded-lg font-medium"
            >
              Send
            </button>
          </div>
        )}

        {policyGenerated && (
          <div className="mt-6">
            <div className="flex gap-3 mb-6">
              <button
                className="bg-circuitryBlue hover:bg-candleGold hover:text-navy text-white px-6 py-3 rounded-lg font-medium"
                onClick={copyToClipboard}
              >
                📋 Copy to Clipboard
              </button>
              <button
                className="bg-circuitryBlue hover:bg-candleGold hover:text-navy text-white px-6 py-3 rounded-lg font-medium"
                onClick={handlePrint}
              >
                🖨️ Print Policy
              </button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-8">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatPolicyText(formattedPolicy) }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
