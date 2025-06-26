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
    
    // Clean the text first - remove unwanted lines
    let cleanText = text
      .replace(/Great! Generating your policy now\.\.\./gi, '')
      .replace(/Thank you for creating your AI Use Policy.*$/gi, '')
      .replace(/Thank you for creating your AI Use Policy with me!.*$/gi, '')
      .replace(/If you need further adjustments or have any questions, feel free to ask\./gi, '')
      .trim();
    
    // Split into lines and process
    const lines = cleanText.split('\n');
    let formattedHtml = '';
    let inList = false;
    let sectionCount = 0;
    let definitionsSection = '';
    let captureDefinitions = false;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines but preserve spacing
      if (!trimmedLine) {
        if (inList) {
          formattedHtml += '</ul>';
          inList = false;
        }
        return;
      }
      
      // Skip unwanted lines
      if (trimmedLine.toLowerCase().includes('generating your policy') || 
          trimmedLine.toLowerCase().includes('thank you for creating')) {
        return;
      }
      
      // Check if we're starting the definitions section
      if (/^\*\*Definitions:\*\*$/i.test(trimmedLine) || /^Definitions:?\s*$/i.test(trimmedLine)) {
        captureDefinitions = true;
        definitionsSection += `
          <div class="mt-8 mb-4">
            <h2 class="text-2xl font-semibold pl-4 mb-3" style="color: ${colors.navy}; border-left: 4px solid ${colors.candleGold};">Definitions</h2>
          </div>`;
        return;
      }
      
      // Check if we're hitting signature section - insert definitions before it
      if (trimmedLine.toLowerCase().includes('signature') && trimmedLine.length < 30) {
        captureDefinitions = false;
        // Insert definitions before signature
        if (definitionsSection) {
          formattedHtml += definitionsSection;
          definitionsSection = '';
        }
        
        // Signature section
        formattedHtml += `
          <div class="mt-12 pt-8 border-t-2 border-gray-300">
            <h3 class="text-lg font-medium mb-6" style="color: ${colors.navy};">${trimmedLine}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div>
                <div class="border-b-2 border-gray-400 pb-1 mb-2 min-h-[40px]"></div>
                <p class="text-sm text-gray-600">Employee Signature</p>
              </div>
              <div>
                <div class="border-b-2 border-gray-400 pb-1 mb-2 min-h-[40px]"></div>
                <p class="text-sm text-gray-600">Date</p>
              </div>
            </div>
          </div>`;
        return;
      }
      
      // If we're capturing definitions, add to definitions section
      if (captureDefinitions) {
        // List items in definitions
        if (/^[\s]*[-•*]\s/.test(trimmedLine) || /^[\s]*\d+\.\s/.test(trimmedLine)) {
          if (!definitionsSection.includes('<ul')) {
            definitionsSection += '<ul class="list-none mb-6 space-y-3 ml-4">';
          }
          const cleanItem = trimmedLine.replace(/^[\s]*[-•*]\s/, '').replace(/^[\s]*\d+\.\s/, '');
          definitionsSection += `<li class="flex items-start"><span style="color: ${colors.candleGold};" class="mr-3 font-bold">•</span><span style="color: ${colors.olive};" class="leading-relaxed text-justify">${cleanItem}</span></li>`;
        } else {
          // Close list if we were in one
          if (definitionsSection.includes('<ul') && !definitionsSection.includes('</ul>')) {
            definitionsSection += '</ul>';
          }
          definitionsSection += `<p class="mb-4 leading-relaxed text-justify" style="color: ${colors.olive};">${trimmedLine}</p>`;
        }
        return;
      }
      
      // Main title - looks for "AI Use Policy for" or similar
      if (trimmedLine.toLowerCase().includes('ai use policy for') && 
          (trimmedLine.startsWith('####') || trimmedLine.startsWith('#') || sectionCount === 0)) {
        const cleanTitle = trimmedLine.replace(/^#+\s*/, '');
        formattedHtml += `
          <div class="border-b-3 pb-4 mb-8" style="border-bottom: 3px solid ${colors.navy};">
            <h1 class="text-4xl font-bold text-center mb-2" style="color: ${colors.navy};">${cleanTitle}</h1>
            <div class="w-24 h-1 mx-auto" style="background-color: ${colors.candleGold};"></div>
          </div>`;
        sectionCount++;
        return;
      }
      
      // Section headers - look for **Header:** format or #### format or specific section names
      if (trimmedLine.startsWith('####') || 
          /^\*\*(Purpose|Scope|Industry Context|AI Tools|Definitions|Guidelines|Implementation|Review|Signature|Policy Statement|Permitted Uses|Prohibited Uses|Training Requirements|Compliance|Monitoring|Brand Guidelines|User Authorization|Image Disclaimers|Statement|Policy Review):\*\*$/i.test(trimmedLine) ||
          /^(Purpose|Scope|Industry Context|AI Tools|Definitions|Guidelines|Implementation|Review|Signature|Policy Statement|Permitted Uses|Prohibited Uses|Training Requirements|Compliance|Monitoring|Brand Guidelines|User Authorization|Image Disclaimers|Statement|Policy Review):?\s*$/i.test(trimmedLine)) {
        if (inList) {
          formattedHtml += '</ul>';
          inList = false;
        }
        const cleanHeader = trimmedLine.replace(/^#+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/:$/, '');
        sectionCount++;
        formattedHtml += `
          <div class="mt-8 mb-4">
            <h2 class="text-2xl font-semibold pl-4 mb-3" style="color: ${colors.navy}; border-left: 4px solid ${colors.candleGold};">${cleanHeader}</h2>
          </div>`;
        return;
      }
      
      // Subsection headers (lines ending with colon but not main sections)
      if (trimmedLine.endsWith(':') && trimmedLine.length < 50 && !trimmedLine.startsWith('####')) {
        if (inList) {
          formattedHtml += '</ul>';
          inList = false;
        }
        formattedHtml += `<h3 class="text-lg font-medium mt-4 mb-2" style="color: ${colors.navy};">${trimmedLine}</h3>`;
        return;
      }
      
      // List items (lines starting with bullet points, numbers, or dashes)
      if (/^[\s]*[-•*]\s/.test(trimmedLine) || /^[\s]*\d+\.\s/.test(trimmedLine)) {
        if (!inList) {
          formattedHtml += '<ul class="list-none mb-6 space-y-3 ml-4">';
          inList = true;
        }
        const cleanItem = trimmedLine.replace(/^[\s]*[-•*]\s/, '').replace(/^[\s]*\d+\.\s/, '');
        formattedHtml += `<li class="flex items-start"><span style="color: ${colors.candleGold};" class="mr-3 font-bold">•</span><span style="color: ${colors.olive};" class="leading-relaxed text-justify">${cleanItem}</span></li>`;
        return;
      }
      
      // Regular paragraphs
      if (inList) {
        formattedHtml += '</ul>';
        inList = false;
      }
      
      // Check if it's a subsection or important note
      if (trimmedLine.includes('Note:') || trimmedLine.includes('Important:') || trimmedLine.includes('Remember:')) {
        formattedHtml += `
          <div class="rounded-lg p-4 mb-6 shadow-sm" style="background: linear-gradient(to right, ${colors.warmCream}, #fdf2e9); border: 1px solid ${colors.candleGold};">
            <p class="font-medium flex items-center" style="color: ${colors.navy};">
              <span style="color: ${colors.candleGold};" class="mr-2">⚠️</span>${trimmedLine}
            </p>
          </div>`;
      } else if (trimmedLine.toLowerCase().includes('signature') && trimmedLine.length < 30) {
        // This is handled above in the definitions section logic
        return;
      } else {
        formattedHtml += `<p class="mb-4 leading-relaxed text-justify" style="color: ${colors.olive};">${trimmedLine}</p>`;
      }
    });
    
    // Close any remaining list
    if (inList) {
      formattedHtml += '</ul>';
    }
    
    // Close definitions list if still open
    if (definitionsSection.includes('<ul') && !definitionsSection.includes('</ul>')) {
      definitionsSection += '</ul>';
    }
    
    // If we still have definitions but no signature was found, append them at the end
    if (definitionsSection && !formattedHtml.includes('Employee Signature')) {
      formattedHtml += definitionsSection;
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
            .signature-section {
              margin-top: 50px;
              padding-top: 30px;
              border-top: 2px solid #e2e8f0;
            }
            .signature-line {
              border-bottom: 2px solid #4a5568;
              height: 40px;
              margin-bottom: 8px;
            }
            .signature-label {
              font-size: 12px;
              color: #718096;
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
