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
  const inputRef = useRef(null); // Add this line
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
  
  // Warm up the server on component mount
  fetch('https://ai-policy-agent.onrender.com/warmup', {
    method: 'GET'
  }).catch(() => {
    // Ignore errors, this is just to wake up the server
  });
}, []);


  // Define your brand colors
  const colors = {
    cardBackground: '#F2D6CB', // beige/cream background
    olive: '#6b7280', // olive text color
    navy: '#1e3a8a', // navy blue for headers
    circuitryBlue: '#3b82f6', // blue for buttons/accents
    candleGold: '#f59e0b', // gold for highlights
    warmCream: '#ffffff' // warm cream for bot messages
  };

useEffect(() => {
  if (!hasInteracted.current) return; // skip scrolling on initial load
  setTimeout(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    // Auto-focus input after bot response
    if (messages[messages.length - 1]?.role === 'bot' && !policyGenerated && !isLoading) {
      inputRef.current?.focus();
    }
  }, 100);
}, [messages, policyGenerated, isLoading]);


  // Function to format the policy text into structured HTML
const formatPolicyText = (text) => {
  let formattedText = text.trim();
  
  // Convert markdown-style headers
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formattedText = formattedText.replace(/^\*\*(.*?)\*\*$/gm, '<h2>$1</h2>');
  
  // Convert bullet points
  formattedText = formattedText.replace(/^- (.*$)/gm, '<li>$1</li>');
  formattedText = formattedText.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  
  // Add proper spacing between sections
  formattedText = formattedText.replace(/\n\n/g, '</p><div class="section-break"></div><p>');
  
  // Handle signature section specially
  formattedText = formattedText.replace(
    /Signature Section:(.*?)$/gms, 
    '<div class="signature-section"><h3>Signature Section:</h3>$1</div>'
  );
  
  // Format signature fields on separate lines
  formattedText = formattedText.replace(
    /Name:\s*_+\s*Title\/Role:\s*_+\s*Signature:\s*_+\s*Date:\s*_+/g,
    '<div class="signature-fields">' +
    '<div class="signature-line">Name: ________________________</div>' +
    '<div class="signature-line">Title/Role: ________________________</div>' +
    '<div class="signature-line">Signature: ________________________</div>' +
    '<div class="signature-line">Date: ________________________</div>' +
    '</div>'
  );
  
  formattedText = '<p>' + formattedText + '</p>';
  
  // Clean up
  formattedText = formattedText.replace(/<p><\/p>/g, '');
  formattedText = formattedText.replace(/<p><h2>/g, '<h2>');
  formattedText = formattedText.replace(/<\/h2><\/p>/g, '</h2>');
  formattedText = formattedText.replace(/<p><ul>/g, '<ul>');
  formattedText = formattedText.replace(/<\/ul><\/p>/g, '</ul>');
  formattedText = formattedText.replace(/<p><div class="signature-section">/g, '<div class="signature-section">');
  formattedText = formattedText.replace(/<\/div><\/p>/g, '</div>');
  
  return `<div class="policy-content font-sans text-gray-800 text-base leading-relaxed">${formattedText}</div>`;
};


const sendMessage = async () => {
  hasInteracted.current = true;

  if (!input.trim()) {
    alert('⚠️ Please enter a response before continuing.');
    return;
  }

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
  // Clean the policy text by removing unwanted parts
  let cleanedPolicy = reply.trim();
  
  // Remove "Great! Generating your policy now..." and similar text
  cleanedPolicy = cleanedPolicy.replace(/Great[!]?\s*Generating your policy now[.\s]*/gi, '');
  cleanedPolicy = cleanedPolicy.replace(/---[\s\n]*/g, '');
  
  // Remove any thank you messages at the end
  cleanedPolicy = cleanedPolicy.replace(/\n*.*thank you.*creating.*$/gi, '');
  cleanedPolicy = cleanedPolicy.replace(/\n*.*brought to you by.*$/gi, '');
  
  setFormattedPolicy(cleanedPolicy.trim());
  reply = '✅ Policy generated below';
}


setMessages([...newMessages, { role: 'bot', text: reply }]);
} catch (err) {
  console.error('Error:', err);
  let errorMessage = '⚠️ Connection error. Please check your internet and try again.';
  
  if (err.message.includes('fetch')) {
    errorMessage = '⚠️ Unable to connect to our servers. Please try again in a moment.';
  } else if (err.message.includes('timeout')) {
    errorMessage = '⚠️ Request timed out. Please try again.';
  }
  
  setMessages([...newMessages, { role: 'bot', text: errorMessage }]);
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
        .section-break {
  height: 20px;
}

.signature-section {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
}

.signature-section h3 {
  color: #1a365d;
  font-size: 18px;
  margin-bottom: 15px;
  border-bottom: 2px solid #d69e2e;
  padding-bottom: 8px;
}

.signature-fields {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.signature-line {
  font-size: 14px;
  color: #4a5568;
  padding: 8px 0;
}
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
          
          .policy-content {
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
          }

          .policy-content h2 {
            color: #1a365d;
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            padding: 0;
            border: none;
          }

          .policy-content ul {
            margin: 15px 0;
            padding-left: 20px;
          }

          .policy-content li {
            margin: 8px 0;
            list-style-type: disc;
          }

          .policy-content p {
            margin: 12px 0;
            line-height: 1.6;
          }

          @media (max-width: 640px) {
            .policy-content {
              font-size: 14px;
              line-height: 1.5;
            }
            
            .policy-content h2 {
              font-size: 16px;
            }
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

 const copyToClipboard = async () => {
  try {
    const cleanText = formattedPolicy
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
    
    await navigator.clipboard.writeText(cleanText);
    
    // Show better success feedback
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '✅ Copied!';
    button.style.backgroundColor = colors.success;
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.backgroundColor = colors.circuitryBlue;
    }, 2000);
    
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = formattedPolicy.replace(/<[^>]*>/g, '');
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('✅ Policy copied to clipboard!');
  }
};

const downloadAsWord = () => {
  const cleanText = formattedPolicy.replace(/<[^>]*>/g, '').trim();
  const blob = new Blob([cleanText], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AI_Use_Policy.doc';
  a.click();
  URL.revokeObjectURL(url);
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
<div className="max-w-4xl mx-auto bg-white shadow-lg rounded-3xl p-4 sm:p-8 flex flex-col h-full overflow-hidden">
<div className="text-center mb-6 pb-4 border-b border-gray-200">
  <h1 className="text-2xl font-bold text-gray-800 mb-1">AI Policy Generator</h1>
  <p className="text-sm text-gray-500">Create professional AI use policies in minutes</p>
</div>
        
<div className="flex flex-col space-y-3 overflow-auto flex-1 pr-1 mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'} w-full`}
            >
              <div className={`flex items-start gap-2 p-3 rounded-xl w-fit max-w-[80%]`}
style={{
  backgroundColor: msg.role === 'bot' ? colors.warmCream : colors.circuitryBlue,
  color: msg.role === 'bot' ? colors.olive : 'white',
  border: msg.role === 'bot' ? '1px solid #e5e7eb' : 'none'
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
<div className="flex w-full items-center gap-3 px-1 pt-4 border-t border-gray-100">
<input
  ref={inputRef} // Add this line
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !isLoading && input.trim()) {
      sendMessage();
    }
  }}
  placeholder="Type your answer here..."
  disabled={isLoading}
  autoComplete="off"
  autoCapitalize="sentences"
  className="flex-grow px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-all duration-200"
  style={{
    fontSize: '16px',
    backgroundColor: isLoading ? '#f9fafb' : 'white'
  }}
/>
<button
  onClick={sendMessage}
  disabled={isLoading}
className="shrink-0 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 shadow-sm"
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
<div className="p-4 sm:p-8 bg-gradient-to-br from-white to-gray-50 max-h-96 overflow-y-auto">
  <div 
    className="policy-document text-sm sm:text-base"
    style={{
      maxWidth: '100%',
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    }}
    dangerouslySetInnerHTML={{ __html: formatPolicyText(formattedPolicy) }}
  />
  <style>{`
    .policy-content h2 { margin: 20px 0 10px 0; }
    .policy-content p { margin: 12px 0; }
    .policy-content .section-break { height: 20px; }
  `}</style>
</div>
    <div 
      className="policy-document text-sm sm:text-base"
      style={{
        maxWidth: '100%',
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
      }}
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
