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
    let signatureAdded = false;
    
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
      
      // Skip signature sections that appear in the middle - we'll add one at the end
      if (trimmedLine.toLowerCase().includes('signature') && trimmedLine.length < 50) {
        return;
      }
      
      // Main title - looks for "AI Use Policy for" or similar
      if (trimmedLine.toLowerCase().includes('ai use policy for') && 
          (trimmedLine.startsWith('####') || trimmedLine.startsWith('#') || sectionCount === 0)) {
        const cleanTitle = trimmedLine.replace(/^#+\s*/, '');
        formattedHtml += `
          <div class="border-b-3 pb-4 mb-8" style="border-bottom: 3px solid black;">
            <h1 class="text-4xl font-bold text-center mb-2" style="color: black;">${cleanTitle}</h1>
            <div class="w-24 h-1 mx-auto" style="background-color: black;"></div>
          </div>`;
        sectionCount++;
        return;
      }
      
      // Section headers - comprehensive list of all possible subtitles
      if (trimmedLine.startsWith('####') || 
          /^\*\*(Purpose|Scope|Industry Context|AI Tools|Definitions|Guidelines|Implementation|Review|Signature|Policy Statement|Permitted Uses|Prohibited Uses|Training Requirements|Compliance|Monitoring|Brand Guidelines|User Authorization|User Access|Image Disclaimers|Image Disclaimers|Statement|Policy Review|Human Review|Prohibited Use|Verification Statement|Review and Updates):\*\*$/i.test(trimmedLine) ||
          /^(Purpose|Scope|Industry Context|AI Tools|Definitions|Guidelines|Implementation|Review|Signature|Policy Statement|Permitted Uses|Prohibited Uses|Training Requirements|Compliance|Monitoring|Brand Guidelines|User Authorization|User Access|Image Disclaimers|Statement|Policy Review|Human Review|Prohibited Use|Verification Statement|Review and Updates):?\s*$/i.test(trimmedLine)) {
        if (inList) {
          formattedHtml += '</ul>';
          inList = false;
        }
        const cleanHeader = trimmedLine.replace(/^#+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/:$/, '');
        sectionCount++;
        formattedHtml += `
          <div class="mt-8 mb-4">
            <h2 class="text-2xl font-semibold pl-4 mb-3" style="color: black; border-left: 4px solid black;">${cleanHeader}</h2>
          </div>`;
        return;
      }
      
      // Subsection headers (lines ending with colon but not main sections)
      if (trimmedLine.endsWith(':') && trimmedLine.length < 50 && !trimmedLine.startsWith('####')) {
        if (inList) {
          formattedHtml += '</ul>';
          inList = false;
        }
        formattedHtml += `<h3 class="text-lg font-medium mt-4 mb-2" style="color: black;">${trimmedLine}</h3>`;
        return;
      }
      
      // List items (lines starting with bullet points, numbers, or dashes)
      if (/^[\s]*[-•*]\s/.test(trimmedLine) || /^[\s]*\d+\.\s/.test(trimmedLine)) {
        if (!inList) {
          formattedHtml += '<ul class="list-none mb-6 space-y-3 ml-4">';
          inList = true;
        }
        const cleanItem = trimmedLine.replace(/^[\s]*[-•*]\s/, '').replace(/^[\s]*\d+\.\s/, '');
        formattedHtml += `<li class="flex items-start"><span style="color: black;" class="mr-3 font-bold">•</span><span style="color: black;" class="leading-relaxed text-justify">${cleanItem}</span></li>`;
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
          <div class="rounded-lg p-4 mb-6 shadow-sm" style="background: #f9f9f9; border: 1px solid black;">
            <p class="font-medium flex items-center" style="color: black;">
              <span style="color: black;" class="mr-2">⚠️</span>${trimmedLine}
            </p>
          </div>`;
      } else {
        formattedHtml += `<p class="mb-4 leading-relaxed text-justify" style="color: black;">${trimmedLine}</p>`;
      }
    });
    
    // Close any remaining list
    if (inList) {
      formattedHtml += '</ul>';
    }
    
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
