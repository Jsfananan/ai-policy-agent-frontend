import React, { useState, useEffect, useRef } from 'react';

// A simple SVG icon for the bot.
const BotIcon = () => (
  <svg
    className="w-8 h-8 rounded-full shadow-md text-blue-600 bg-gray-200 p-1"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path clipRule="evenodd" fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
  </svg>
);


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
  const [rawPolicyText, setRawPolicyText] = useState('');
  const [notification, setNotification] = useState('');
  const bottomRef = useRef(null);

  // Automatically scroll to the bottom of the message list
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, policyGenerated]);

  /**
   * Formats the raw policy text from the AI into clean, document-style HTML.
   * @param {string} text - The raw text of the policy.
   * @returns {string} - An HTML string representing the formatted policy.
   */
  const formatPolicyText = (text) => {
    if (!text) return '';
    
    // Clean the text from the AI response
    let cleanText = text
      .replace(/Great! Generating your policy now\.\.\./gi, '')
      .replace(/Thank you for creating your AI Use Policy.*$/gi, '')
      .replace(/✅ Done! See below for your custom policy./gi, '')
      .replace(/.*Brought to you by Leadership in Change.*/gi, '')
      .replace(/^#+\s*/gm, '') // Remove markdown heading markers
      .trim();

    const lines = cleanText.split('\n').filter(line => line.trim() !== '');

    let formattedHtml = '';
    
    lines.forEach(line => {
      const trimmedLine = line.trim();

      // Main Title
      if (trimmedLine.toLowerCase().includes('ai use policy for')) {
        formattedHtml += `<h1 class="text-3xl font-bold text-center mb-8 pb-3 border-b-2">${trimmedLine}</h1>`;
      }
      // Section Headers (e.g., "1. Purpose", "Definitions")
      else if (/^\d+\.\s.*/.test(trimmedLine) || /^(Definitions|User Acknowledgement & Signature)/i.test(trimmedLine)) {
         const styledLine = trimmedLine.replace(/^(\d+\.\s)(.*)/, '<strong>$1$2</strong>');
         formattedHtml += `<h2 class="text-xl font-bold mt-6 mb-3">${styledLine}</h2>`;
      }
      // Definition terms (e.g., "AI (Artificial Intelligence): ...")
      else if (/^AI \(Artificial Intelligence\):|Generative AI:|Hallucination:|Human-in-the-loop:/.test(trimmedLine)) {
         const parts = trimmedLine.split(':');
         const term = parts[0];
         const definition = parts.slice(1).join(':');
         formattedHtml += `<p class="ml-4"><strong>${term}:</strong>${definition}</p>`;
      }
      // Default paragraphs
      else {
        formattedHtml += `<p class="mb-3 text-justify">${trimmedLine}</p>`;
      }
    });

    // Ensure the signature section is always present at the end
    if (!formattedHtml.includes('User Acknowledgement & Signature')) {
         formattedHtml += `
            <h2 class="text-xl font-bold mt-8 mb-3">User Acknowledgement & Signature</h2>
            <p class="mb-3 text-justify">By signing below, I acknowledge that I have read, understood, and agreed to follow the AI Use Policy outlined above.</p>
        `;
    }

    // Add the signature lines
     formattedHtml += `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mt-12">
            <div>
                <div class="border-b-2 border-gray-400 pb-1 mb-2 h-10"></div>
                <p class="text-sm text-gray-600">Name</p>
            </div>
             <div>
                <div class="border-b-2 border-gray-400 pb-1 mb-2 h-10"></div>
                <p class="text-sm text-gray-600">Title/Role</p>
            </div>
            <div>
                <div class="border-b-2 border-gray-400 pb-1 mb-2 h-10"></div>
                <p class="text-sm text-gray-600">Signature</p>
            </div>
            <div>
                <div class="border-b-2 border-gray-400 pb-1 mb-2 h-10"></div>
                <p class="text-sm text-gray-600">Date</p>
            </div>
        </div>`;

    return formattedHtml;
  };

  /**
   * Sends the user's message to the backend and handles the AI's response.
   */
  const sendMessage = async () => {
    if (!input.trim() || policyGenerated) return;

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

      // Check if the reply contains the marker for a generated policy
      if (reply.includes('Brought to you by Leadership in Change')) {
        setPolicyGenerated(true);
        setRawPolicyText(reply.trim());
        reply = '✅ Done! Your policy is ready. You can now copy or print it.';
      }

      setMessages([...newMessages, { role: 'bot', text: reply }]);
    } catch (err) {
      console.error('Error:', err);
      setMessages([...newMessages, { role: 'bot', text: '⚠️ Something went wrong. Please try again.' }]);
    }
  };

  /**
   * Displays a short-lived notification message.
   * @param {string} message - The message to display.
   */
  const showNotification = (message) => {
      setNotification(message);
      setTimeout(() => {
          setNotification('');
      }, 3000);
  };

  /**
   * Opens a print dialog for the formatted policy.
   */
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const formattedHtml = formatPolicyText(rawPolicyText);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AI Use Policy</title>
          <script src="https://cdn.tailwindcss.com"></script>
           <style> body { font-family: "Times New Roman", Times, serif; } </style>
        </head>
        <body class="p-12">
          <div class="max-w-4xl mx-auto">
            ${formattedHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  /**
   * Copies a clean text version of the policy to the clipboard.
   */
  const copyToClipboard = () => {
    const policyHtml = formatPolicyText(rawPolicyText);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = policyHtml;
    // Replace block elements with newlines for a cleaner text copy
    tempDiv.querySelectorAll('h1, h2, p, div').forEach(el => el.append('\n'));
    const cleanText = tempDiv.innerText.replace(/\n\s*\n/g, '\n\n').trim();

    const textArea = document.createElement('textarea');
    textArea.value = cleanText;
    textArea.style.position = 'fixed'; // Avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      // Use the recommended clipboard command
      document.execCommand('copy');
      showNotification('✅ Policy copied to clipboard!');
    } catch (err) {
      showNotification('❌ Failed to copy policy.');
      console.error('Failed to copy: ', err);
    }
    
    document.body.removeChild(textArea);
  };

  /**
   * Resets the state to start a new policy from scratch.
   */
  const startNewPolicy = () => {
      setPolicyGenerated(false);
      setRawPolicyText('');
      setMessages([{
          role: 'bot',
          text: "Let's create a new AI Use Policy. What's the name of the organization or individual this policy is for?"
      }]);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 font-sans flex justify-center items-start">
      {notification && (
          <div className="fixed top-5 right-5 z-50 bg-gray-800 text-white py-2 px-5 rounded-lg shadow-lg animate-fade-in-out">
              {notification}
          </div>
      )}
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl p-4 sm:p-8 space-y-6">
        <h1 className="text-3xl font-serif text-gray-800 text-center">AI Policy Agent</h1>
        
        {/* Main content area: switches between chat and policy document */}
        <div className="h-[60vh] overflow-y-auto pr-4 space-y-4">
          {!policyGenerated ? (
             // Chat View
             messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 items-start ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}
              >
                {msg.role === 'bot' && <BotIcon />}
                <div
                  className={`p-3 rounded-xl max-w-[85%] whitespace-pre-line leading-relaxed shadow-sm ${
                    msg.role === 'bot'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <span>{msg.text}</span>
                </div>
              </div>
            ))
          ) : (
            // Policy Document View
            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 font-serif text-gray-800">
                <div
                  className="policy-document"
                  dangerouslySetInnerHTML={{ __html: formatPolicyText(rawPolicyText) }}
                />
            </div>
          )}
           <div ref={bottomRef}></div>
        </div>

        {/* Input area or action buttons */}
        <div className="pt-4 border-t">
            {policyGenerated ? (
                 // Action buttons for the generated policy
                 <div className="flex gap-3 flex-wrap justify-center">
                    <button
                        onClick={copyToClipboard}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                        📋 Copy Policy
                    </button>
                    <button
                        onClick={handlePrint}
                        className="bg-gray-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2">
                        🖨️ Print Policy
                    </button>
                    <button
                        onClick={startNewPolicy}
                        className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                       🔄 Create New
                    </button>
                 </div>
            ) : (
                 // Chat input field
                 <div className="flex items-center gap-3">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type your answer..."
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      disabled={!input.trim()}
                    >
                      Send
                    </button>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
}
