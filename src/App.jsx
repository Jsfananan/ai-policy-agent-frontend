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
    
    // Split into lines and process
    const lines = text.split('\n').filter(line => line.trim());
    let formattedHtml = '';
    let inList = false;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) return;
      
      // Main title (usually the first substantial line)
      if (index === 0 && trimmedLine.toLowerCase().includes('policy')) {
        formattedHtml += `<h1 class="text-3xl font-bold text-center mb-8 text-gray-800">${trimmedLine}</h1>`;
        return;
      }
      
      // Section headers (lines that end with colon or are all caps)
      if (trimmedLine.endsWith(':') || (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3)) {
        if (inList) {
          formattedHtml += '</ul>';
          inList = false;
        }
        formattedHtml += `<h2 class="text-xl font-semibold mt-6 mb-3 text-gray-700">${trimmedLine}</h2>`;
        return;
      }
      
      // List items (lines starting with bullet points, numbers, or dashes)
      if (/^[\s]*[-•*]\s/.test(trimmedLine) || /^[\s]*\d+\.\s/.test(trimmedLine)) {
        if (!inList) {
          formattedHtml += '<ul class="list-disc list-inside mb-4 space-y-2">';
          inList = true;
        }
        const cleanItem = trimmedLine.replace(/^[\s]*[-•*]\s/, '').replace(/^[\s]*\d+\.\s/, '');
        formattedHtml += `<li class="text-gray-600 leading-relaxed">${cleanItem}</li>`;
        return;
      }
      
      // Regular paragraphs
      if (inList) {
        formattedHtml += '</ul>';
        inList = false;
      }
      
      // Check if it's a subsection or important note
      if (trimmedLine.length < 100 && (trimmedLine.includes('Note:') || trimmedLine.includes('Important:') || trimmedLine.includes('Remember:'))) {
        formattedHtml += `<div class="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4"><p class="text-blue-800 font-medium">${trimmedLine}</p></div>`;
      } else {
        formattedHtml += `<p class="mb-4 text-gray-600 leading-relaxed">${trimmedLine}</p>`;
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
    <div className="bg-gray-50 min-h-screen p-6 text-gray-800 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-serif text-gray-800">AI Policy Agent</h1>
        
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'} w-full`}
            >
              <div className={`flex items-start gap-2 ${
                msg.role === 'bot' 
                  ? 'bg-blue-50 text-gray-700' 
                  : 'bg-blue-600 text-white'
              } p-3 rounded-xl w-fit max-w-[80%]`}>
                {msg.role === 'bot' && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">
                    AI
                  </div>
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
              className="border border-gray-300 p-3 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your answer..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Send
            </button>
          </div>
        )}

        {policyGenerated && (
          <div className="mt-6">
            <div className="flex gap-3 mb-6">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                onClick={copyToClipboard}
              >
                📋 Copy to Clipboard
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
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
