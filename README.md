# 🧠 SMART-DECIDE  
**AI-Powered Decision-Making Platform with Hedera Integration**

![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)
![NodeJS](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)
![Hedera](https://img.shields.io/badge/Blockchain-Hedera-purple?logo=hedera)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-Building%20For%20Hedera%20Hackathon-orange)

---

## 🚀 Overview

**Smart-Decide** is a web platform that helps teams and individuals make smarter, fairer, and more transparent decisions.

💬 Users can:
- Create or join **discussion sessions**
- Share and debate **ideas**
- Let **AI analyze** contributions
- Store the **winning idea** on **Hedera Hashgraph** for immutable transparency

---

## 🎯 Problem Statement

Group decisions are often biased, unstructured, or forgotten.  
**Smart-Decide** introduces transparency, automation, and blockchain-backed trust into collaborative idea evaluation.

---

## ✨ Key Features

✅ **AI-Powered Idea Analysis** — Uses TensorFlow Universal Sentence Encoder to analyze and score ideas.  
✅ **Hedera Integration** — Stores verified decisions on Hedera’s network for transparency.  
✅ **Authentication** — Secure login with JWT and bcrypt.  
✅ **Session System** — Create, join, and manage idea discussion sessions.  
✅ **File Uploads** — Attach supporting documents to your ideas.  
✅ **SQLite Database** — Fast and simple local storage.  
✅ **Responsive UI** — Built with React and modern design principles.

---

## 💡 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React, React Router, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite |
| **AI / ML** | TensorFlow.js, Universal Sentence Encoder |
| **Blockchain** | Hedera SDK (`@hashgraph/sdk`) |
| **Auth** | JWT, bcrypt |
| **Dev Tools** | Nodemon, Concurrently |
| **Styling** | Tailwind CSS, custom components |

---

## 🌐 Hedera Integration

Smart-Decide integrates with **Hedera Hashgraph** for verifiable, tamper-proof record storage.

Example of recording a session result:

```js
import { Client, TopicCreateTransaction } from "@hashgraph/sdk";

const client = Client.forTestnet()
  .setOperator(process.env.MY_ACCOUNT_ID, process.env.MY_PRIVATE_KEY);

async function recordDecision(summary) {
  const tx = await new TopicCreateTransaction()
    .setMemo(`Smart-Decide: ${summary}`)
    .execute(client);
  console.log("✅ Decision recorded on Hedera:", tx);
}


```
System Architecture

React Frontend (UI)
   ↓
Express Backend (API)
   ↓
AI Module (TensorFlow)
   ↓
SQLite Database
   ↓
Hedera Network (Blockchain Storage)


```

```
Clone Repository

git clone https://github.com/12ahm-c/smart-decide.git
cd smart-decide


```

```
Install Dependencies

npm install

```

```
Run Backend & Frontend Together

npm run dev


```
```

✅ Frontend → http://localhost:3000

✅ Backend → http://localhost:5000


```
```

🛡️ Security

Passwords hashed with bcrypt

Authentication with JWT

Environment variables in .env

CORS & input validation on backend



```
```
🏆 Why Smart-Decide Stands Out

💡 Innovation: Combines AI & Blockchain for transparent decision-making.
🧩 Practical: Useful for schools, hackathons, startups, and organizations.
⚙️ Technical Depth: Full-stack implementation with AI + Hedera.
🌍 Impact: Promotes fairness, accountability, and transparency.


```
```

🧑‍💻 Team Smart-Decide

| Name                | Role                 | Focus               |
| ------------------- | -------------------- | ------------------- |
| **Sidahmed**        | Full Stack Developer | Frontend & Backend  |
| **[Teammate Name]** | AI Engineer          | TensorFlow Analysis |
| **[Teammate Name]** | Blockchain Developer | Hedera Integration  |



---

## 🪪 Hedera Proof & Certificate

Smart-Decide has been officially built and verified for the **Hedera Hackathon**.

🎓 **Certificate of Participation:**  
[View My Hedera Certificate](https://drive.google.com/file/d/1nkCqUF7SH9xUq6lB4DptphUbaXI5w4F6/view)
[view the seconde hedera Certficate](https://drive.google.com/file/d/16QRQPTsvCqQ1c63nQ1MmnTh2fFWebyLg/view?usp=sharing)
[view the third hedera Certficate](https://drive.google.com/file/d/1lhsVNxHTEvo7fAXgFNMLGK21kcqe-VR6/view?usp=sharing)
```
```

🪙 Future Roadmap

✅ AI-powered summaries of discussions

✅ Hedera Consensus Service (HCS) for full transparency

🕹️ Real-time chat & voice sessions

🌐 Global leaderboard for session winners

📱 Mobile app version using React Native



```
```

