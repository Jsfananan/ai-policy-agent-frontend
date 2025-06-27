import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi there! I'm here to help you create a customized AI Use Policy.\n\nLet's get started—what's the name of the organization or individual this policy is for?"
    }
  ]);
  const [input, setInput] = useState('');
  const [sessionId] = useState('session-' + Date.now());
  const [policyGenerated, setPolicyGenerated] = useState(false);
const [formattedPolicy, setFormattedPolicy] = useState('');
const [isLoading, setIsLoading] = useState(false); // ADD THIS LINE
const bottomRef = useRef(null);
const hasInteracted = useRef(false);
  useEffect(() => {
  // Scroll to top when component mounts
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  
  // Set body styles to eliminate blank space
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.height = '100vh';
  document.body.style.overflow = 'hidden';
}, []);


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
  if (!hasInteracted.current) return; // skip scrolling on initial load
  setTimeout(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
}, 100);
}, [messages]);


  // Function to format the policy text into structured HTML
const formatPolicyText = (text) => {
  return `<pre class="whitespace-pre-wrap font-sans text-gray-800 text-base leading-relaxed">${text.trim()}</pre>`;
};


  const sendMessage = async () => {
    hasInteracted.current = true;

    if (!input.trim()) return;

    if (policyGenerated) {
      setMessages([...messages, { role: 'user', text: input }, { role: 'bot', text: '✅ This session is complete. Please copy your policy below.' }]);
      setInput('');
      return;
    }

const newMessages = [...messages, { role: 'user', text: input }];
setMessages(newMessages);
setInput('');
setIsLoading(true); // ADD THIS LINE

    try {
      const res = await fetch('https://ai-policy-agent.onrender.com/chat', {
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

if (reply.includes('AI Use Policy for')) {
  setPolicyGenerated(true);
  setFormattedPolicy(reply.trim());
  reply = '✅ Policy generated below — Brought to you by [Leadership in Change](https://leadershipinchange10.substack.com)';
}


setMessages([...newMessages, { role: 'bot', text: reply }]);
} catch (err) {
  console.error('Error:', err);
  setMessages([...newMessages, { role: 'bot', text: '⚠️ Something went wrong. Please try again.' }]);
} finally {
  setIsLoading(false); // ADD THIS FINALLY BLOCK
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
              color: #1a365d; 
              text-align: center;
              font-size: 28px;
              margin-bottom: 30px;
              padding-bottom: 15px;
              border-bottom: 3px solid #d69e2e;
            }
            h2 { 
              color: #1a365d; 
              font-size: 20px;
              margin-top: 35px;
              margin-bottom: 15px;
              padding-left: 15px;
              border-left: 4px solid #d69e2e;
            }
            h3 {
              color: #1a365d;
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
              color: #d69e2e;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            p { 
              text-align: justify;
              margin-bottom: 15px;
              color: #4a5568;
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

// Loading dots component
const LoadingDots = () => (
  <div className={`flex items-start gap-2 p-3 rounded-xl w-fit max-w-[80%]`}
       style={{
         backgroundColor: colors.warmCream,
         color: colors.olive
       }}>
    <img src="/bot-icon.png" alt="AI Agent" className="w-8 h-8 rounded-full shadow-md mt-1" />
    <div className="flex items-center space-x-1 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
      <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
    </div>
  </div>
);

return (
<div style={{
  backgroundColor: colors.cardBackground,
  color: colors.olive,
  height: '100vh',
  padding: '12px'
}} className="font-sans flex flex-col">
<div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-4 flex flex-col h-full">
        <h1 className="text-2xl font-serif" style={{color: colors.navy}}>AI Policy Agent</h1>
        
<div className="flex flex-col space-y-3 overflow-auto flex-1 pr-1 mb-4">
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
{isLoading && <LoadingDots />}
<div ref={bottomRef}></div>
</div>

        {!policyGenerated && (
<div className="flex w-full items-center gap-2 px-1">
<input
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
  placeholder="Type your answer..."
  disabled={isLoading}
  className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-sm"
  style={{fontSize: '16px'}}
/>
<button
  onClick={sendMessage}
  disabled={isLoading}
  className="shrink-0 px-5 py-3 rounded-lg text-white text-sm font-medium transition-all duration-200 disabled:opacity-50"
  style={{ backgroundColor: isLoading ? '#9ca3af' : colors.circuitryBlue }}
  onMouseEnter={(e) => {
    if (!isLoading) {
      e.target.style.backgroundColor = colors.candleGold;
      e.target.style.color = colors.navy;
    }
  }}
  onMouseLeave={(e) => {
    if (!isLoading) {
      e.target.style.backgroundColor = colors.circuitryBlue;
      e.target.style.color = 'white';
    }
  }}
>
  {isLoading ? '...' : 'Send'}
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
            

            
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <div className="text-white p-4" 
                   style={{background: `linear-gradient(to right, ${colors.navy}, ${colors.circuitryBlue})`}}>
                <h3 className="text-lg font-semibold flex items-center">
                  <span className="mr-2">📄</span>
                  Your Custom AI Use Policy
                </h3>
              </div>
              <div className="p-8 bg-gradient-to-br from-white to-gray-50">
                <div 
                  className="prose prose-lg max-w-none policy-document"
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
