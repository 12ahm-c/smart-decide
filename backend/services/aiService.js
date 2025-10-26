const axios = require('axios');

async function callPythonAI(input) {
  try {
    const aiResponse = await axios.post('http://127.0.0.1:5001/api/decision', { input });
    return aiResponse.data.result || '';
  } catch (err) {
    console.warn('AI service call failed:', err.message);
    return '[AI service unavailable]';
  }
}

module.exports = { callPythonAI };

// ============================================
// 9. backend/services/analysisService.js
// // ============================================
// const openai = require('../config/openai');

// async function analyzeSessionAI(session, opinions) {
//   if (!opinions || opinions.length === 0) {
//     return { summary: "لا توجد آراء", recommended: null, blockchainHash: null };
//   }

//   const topic = session.title;
//   const description = session.description;
//   const opinionsText = opinions.map(o => `- ${o.fullName || 'مجهول'}: ${o.opinion}`).join('\n');

//   const prompt = `
// You are analyzing a group discussion session.

// 📌 Session title: "${topic}"
// 📝 Description: "${description}"

// 💬 Participants' opinions:
// ${opinionsText}

// ⚙ Analysis method: "${session.analysisMethod}"
// - If "majority": choose the opinion most frequently shared among participants.
// - If "preference": choose the opinion that is most balanced, logical, and insightful.

// 🎯 Your task:
// 1. Provide a concise and objective summary of the discussion.
// 2. Determine the final decision based on the specified analysis method.
// 3. Generate a short symbolic blockchain stamp (e.g., HEDERA-9F2C87).

// 🪶 Output the result in a clear, human-readable format with three sections:
// - *Summary*
// - *Final Decision*
// - *Blockchain Stamp*
// `;

//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 300
//     });

//     const resultText = response.choices[0].message.content;
//     let result = {};

//     try {
//       result = JSON.parse(resultText);
//     } catch {
//       result = { summary: resultText, recommended: null, blockchainHash: null };
//     }

//     return result;
//   } catch (err) {
//     console.error("AI analysis failed:", err);
//     return { summary: "فشل تحليل AI", recommended: null, blockchainHash: null };
//   }
// }

// module.exports = { analyzeSessionAI };
