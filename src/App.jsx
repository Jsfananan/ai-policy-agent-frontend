import React, { useState, useEffect, useRef, useCallback } from 'react';
// Add this BEFORE export default function App()
const BRAND_COLORS = {
  cardBackground: '#F2D6CB',
  olive: '#6b7280', 
  navy: '#1e3a8a',
  circuitryBlue: '#3b82f6',
  candleGold: '#f59e0b',
  warmCream: '#ffffff'
};
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
  const [questionCount, setQuestionCount] = useState(0);
const [estimatedQuestions] = useState(9);
  const [orgName, setOrgName] = useState('Your Organization');
  // ADD these handlers right after your state declarations and before useEffect
  
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !isLoading && input.trim()) {
    sendMessage();
  }
};

const handleInputChange = (e) => {
  setInput(e.target.value);
};

const handleSendMessage = () => {
  sendMessage();
};

const copyToClipboard = async () => {
  try {
    const cleanText = formattedPolicy
      .replace(/<[^>]*>/g, '')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
    
    await navigator.clipboard.writeText(cleanText);
    
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '✅ Copied!';
    button.style.backgroundColor = colors.candleGold;
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.backgroundColor = colors.circuitryBlue;
    }, 2000);
    
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = formattedPolicy.replace(/<[^>]*>/g, '');
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('✅ Policy copied to clipboard!');
  }
};
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


const colors = BRAND_COLORS;

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
  
  // Add spacing between numbered sections (1., 2., 3., etc.)
  formattedText = formattedText.replace(/(\d+\.\s)/g, '<div class="section-break"></div>$1');
  
  // Format section headers (numbers + text)
  formattedText = formattedText.replace(/^(\d+\.\s)(.+?)$/gm, '<h3 class="section-header">$1$2</h3>');
  
  // Convert markdown-style headers and bold text
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle prohibited use items - convert to bullet points
  formattedText = formattedText.replace(
    /The following uses of AI are prohibited:\s*([^\.]+)/g, 
    'The following uses of AI are prohibited:<ul class="prohibited-list">$1</ul>'
  );
  
  // Convert comma-separated prohibited items to list items
  formattedText = formattedText.replace(
    /<ul class="prohibited-list">([^<]+)<\/ul>/g,
    (match, items) => {
      const listItems = items.split(',').map(item => 
        `<li>${item.trim()}</li>`
      ).join('');
      return `<ul class="prohibited-list">${listItems}</ul>`;
    }
  );
  
  // Convert regular bullet points
  formattedText = formattedText.replace(/^- (.*$)/gm, '<li>$1</li>');
  formattedText = formattedText.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  
  // Handle signature section specially
  formattedText = formattedText.replace(
    /(\d+\.\s)?User Acknowledgement.*?Signature Section:(.*?)$/gms, 
    '<div class="signature-section"><h3>User Acknowledgement & Signature Section:</h3>$2</div>'
  );
  
  // Format signature fields
  formattedText = formattedText.replace(
    /Name:\s*_+\s*Title\/Role:\s*_+\s*Signature:\s*_+\s*Date:\s*_+/g,
    '<div class="signature-fields">' +
    '<div class="signature-line">Name: ________________________</div>' +
    '<div class="signature-line">Title/Role: ________________________</div>' +
    '<div class="signature-line">Signature: ________________________</div>' +
    '<div class="signature-line">Date: ________________________</div>' +
    '</div>'
  );
  
  // Add proper spacing between paragraphs
  formattedText = formattedText.replace(/\n\n/g, '</p><div class="paragraph-break"></div><p>');
  
  // Clean up and wrap
  formattedText = '<p>' + formattedText + '</p>';
  
  // Clean up empty paragraphs and fix nesting
  formattedText = formattedText.replace(/<p><\/p>/g, '');
  formattedText = formattedText.replace(/<p><h3/g, '<h3');
  formattedText = formattedText.replace(/<\/h3><\/p>/g, '</h3>');
  formattedText = formattedText.replace(/<p><ul>/g, '<ul>');
  formattedText = formattedText.replace(/<\/ul><\/p>/g, '</ul>');
  formattedText = formattedText.replace(/<p><div class="signature-section">/g, '<div class="signature-section">');
  formattedText = formattedText.replace(/<\/div><\/p>/g, '</div>');
  
  return `<div class="policy-content font-sans text-gray-800 text-base leading-relaxed">${formattedText}</div>`;
};


const sendMessage = async () => {
  hasInteracted.current = true;
  if (!policyGenerated) {
  setQuestionCount(prev => prev + 1);
}

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
  
  // Extract organization name from the policy title
  const orgMatch = reply.match(/AI Use Policy for (.*?)(\n|$)/);
  if (orgMatch && orgMatch[1]) {
    setOrgName(orgMatch[1].trim());
  }
  
  // Clean the policy text by removing unwanted parts
  let cleanedPolicy = reply.trim();
  
  // Remove "Great! Generating your policy now..." and similar text
  cleanedPolicy = cleanedPolicy.replace(/Great[!]?\s*Generating your policy now[.\s]*/gi, '');
  cleanedPolicy = cleanedPolicy.replace(/---[\s\n]*/g, '');
  
  // Remove any thank you messages at the end
  cleanedPolicy = cleanedPolicy.replace(/\n*.*thank you.*creating.*$/gi, '');
  cleanedPolicy = cleanedPolicy.replace(/\n*.*brought to you by.*$/gi, '');
  cleanedPolicy = cleanedPolicy.replace(/If you need further adjustments.*responsible AI Use Policy!/gi, '');
  
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
  
  printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>AI Use Policy</title>
    <style>
      .section-break {
        height: 25px;
      }
      .paragraph-break {
        height: 15px;
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
      .section-header {
        color: #1a365d;
        font-size: 18px;
        font-weight: bold;
        margin: 25px 0 15px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #d69e2e;
      }
      .prohibited-list {
        margin: 15px 0;
        padding-left: 25px;
      }
      .prohibited-list li {
        margin: 8px 0;
        list-style-type: disc;
        color: #e53e3e;
        font-weight: 500;
      }
      .policy-content .section-header {
        color: #1a365d;
        font-size: 18px;
        font-weight: bold;
        margin: 20px 0 10px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #d69e2e;
      }
      .policy-content .prohibited-list {
        margin: 15px 0;
        padding-left: 20px;
      }
      .policy-content .prohibited-list li {
        margin: 8px 0;
        list-style-type: disc;
        color: #e53e3e;
        font-weight: 500;
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
</html>`);
  
  printWindow.document.close();
  printWindow.print();
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
// Add this component RIGHT AFTER LoadingDots
const ProfessionalPolicyDisplay = ({ policyText, orgName, onCopy }) => {
  // Simple clean display - just clean and format the text
  const cleanDisplayText = (text) => {
    return text
      .replace(/AI Use Policy for.*?\n/g, '')
      .replace(/={3,}/g, '')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .trim();
  };

  return (
    <>
      {/* Simple copy button */}
      <div className="flex justify-start mb-6">
        <button
          onClick={onCopy}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          📋 Copy Policy Text
        </button>
      </div>

      <div className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="border-b-2 border-gray-800 p-8 bg-gray-50">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            AI Use Policy
          </h1>
          <h2 className="text-xl text-gray-700 text-center mb-4">
            {orgName || 'Your Organization'}
          </h2>
          <p className="text-sm text-gray-600 text-center">
            Effective Date: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Content - Simple display of full policy */}
<div className="p-8 max-h-[70vh] overflow-y-auto pb-12">
          <div 
            className="text-gray-800 leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{ 
              __html: cleanDisplayText(policyText)
                .replace(/\n\n/g, '</p><p class="mb-4">')
                .replace(/^/, '<p class="mb-4">')
                .replace(/$/, '</p>')
            }}
          />
        </div>
      </div>
    </>
  );
};
  // ADD THIS RIGHT BEFORE YOUR return ( STATEMENT
const ProgressIndicator = () => {
  const progress = Math.min((questionCount / estimatedQuestions) * 100, 95);
  
  return (
    <div className="w-full mb-4">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Building your policy...</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

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
      {questionCount > 0 && !policyGenerated && <ProgressIndicator />}  
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
onChange={handleInputChange}
onKeyDown={handleKeyDown}
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
onClick={handleSendMessage}
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
  <div className="mt-8">
    <ProfessionalPolicyDisplay 
      policyText={formattedPolicy} 
      orgName={orgName}
      onCopy={copyToClipboard}
    />
  </div>
)}
      </div>
    </div>
  );
}
