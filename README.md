# 🧠 SMART-DECIDE

<div align="center">

AI-Powered Decision-Making Platform with Hedera Blockchain Integration

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Hedera](https://img.shields.io/badge/Blockchain-Hedera-9F1FFF?style=for-the-badge&logo=hedera&logoColor=white)](https://hedera.com/)
[![TensorFlow](https://img.shields.io/badge/AI-TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Hedera%20Hackathon-orange?style=for-the-badge)](https://hedera.com/)

Making collaborative decisions smarter, fairer, and blockchain-verified

[Features](#-key-features) • [Demo](#-screenshots) • [Installation](#-installation--setup) • [Tech Stack](#-tech-stack) • [Roadmap](#-future-roadmap)

</div>

---

## 🌟 Overview

Smart-Decide revolutionizes group decision-making by combining artificial intelligence with blockchain transparency. Teams can collaboratively discuss ideas, let AI objectively analyze contributions, and store winning decisions on Hedera Hashgraph for immutable verification.

### 🎯 Problem Statement

Traditional group decisions suffer from:
- Bias - Dominant voices overshadow good ideas
- Lack of Structure - Unorganized discussions lead to poor outcomes
- No Accountability - Decisions are forgotten or disputed later

Smart-Decide solves these challenges through AI-powered analysis and blockchain-backed transparency.

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🤖 AI-Powered Analysis
Uses TensorFlow Universal Sentence Encoder to objectively score and rank ideas based on quality, relevance, and innovation.

### 🔗 Hedera Integration
Stores verified decisions on Hedera's fast, secure, and eco-friendly blockchain network.

### 🔐 Secure Authentication
JWT-based authentication with bcrypt password hashing ensures user data protection.

</td>
<td width="50%">

### 💬 Session Management
Create or join discussion sessions with unique codes. Real-time collaboration made simple.

### 📎 File Attachments
Support your ideas with documents, images, and other files.

### 📊 Smart Analytics
View AI-generated insights, comparison metrics, and decision summaries.

</td>
</tr>
</table>

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React, React Router, Lucide Icons | Dynamic, responsive UI |
| Backend | Node.js, Express.js | RESTful API server |
| Database | SQLite | Fast local data storage |
| AI/ML | TensorFlow.js, USE | Semantic idea analysis |
| Blockchain | Hedera SDK | Immutable record storage |
| Authentication | JWT, bcrypt | Secure user management |
| Styling | Tailwind CSS | Modern, utility-first design |

---

## 🏗 System Architecture


┌─────────────────────┐
│   React Frontend    │
│  (Port 3000)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Express Backend    │
│  (Port 5000)        │
└─────┬───────┬───────┘
      │       │
      ▼       ▼
┌──────────┐ ┌──────────────┐
│ SQLite   │ │ TensorFlow   │
│ Database │ │ AI Engine    │
└──────────┘ └──────────────┘
      │
      ▼
┌─────────────────────┐
│  Hedera Network     │
│  (Testnet/Mainnet)  │
└─────────────────────┘


---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Hedera Testnet account ([get one free](https://portal.hedera.com/register))

### 1️⃣ Clone the Repository

bash
git clone https://github.com/YOUR_USERNAME/smart-decide.git
cd smart-decide


### 2️⃣ Install Dependencies

bash
# Install root dependencies
npm install




### 3️⃣ Environment Configuration

Create a .env file in the root directory:

env
# Hedera Configuration
MY_ACCOUNT_ID=0.0.xxxxxx
MY_PRIVATE_KEY=302e020100300506032b657004220420...

# Authentication
JWT_SECRET=your_super_secret_key_here

# Database
DATABASE_PATH=./backend/database.sqlite

# Server
PORT=5000


### 4️⃣ Run the Application

Development Mode (Recommended):

bash
npm run dev


This runs both frontend and backend concurrently.



### 5️⃣ Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🔗 Hedera Integration

Smart-Decide leverages Hedera Hashgraph for transparent, tamper-proof record keeping.

### Recording Decisions on Hedera

javascript
import { Client, TopicCreateTransaction, TopicMessageSubmitTransaction } from "@hashgraph/sdk";

// Initialize Hedera client
const client = Client.forTestnet()
  .setOperator(
    process.env.MY_ACCOUNT_ID,
    process.env.MY_PRIVATE_KEY
  );

// Create a topic for the session
async function createSessionTopic(sessionName) {
  const transaction = await new TopicCreateTransaction()
    .setMemo(Smart-Decide Session: ${sessionName})
    .execute(client);
  
  const receipt = await transaction.getReceipt(client);
  return receipt.topicId;
}

// Record winning decision
async function recordDecision(topicId, decisionData) {
  const transaction = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(JSON.stringify(decisionData))
    .execute(client);
  
  console.log("✅ Decision recorded on Hedera");
  return transaction.transactionId;
}


### Why Hedera?

- ⚡ Fast - 10,000+ TPS with 3-5 second finality
- 💰 Low Cost - $0.0001 per transaction
- 🌱 Eco-Friendly - Carbon-negative network
- 🔒 Secure - aBFT consensus mechanism

---

## 📸 Screenshots

<div align="center">

### Login & Registration
<img width="1136" height="855" alt="image" src="https://github.com/user-attachments/assets/861546c9-4ac7-4dc2-bc41-98977584c523" />
<img width="1253" height="876" alt="image" src="https://github.com/user-attachments/assets/1479a79e-a86d-4842-a97a-2e32a7dd5c38" />


### Dashboard
<img width="1811" height="899" alt="image" src="https://github.com/user-attachments/assets/578e143f-8a87-4474-8ab7-e75dde9ad137" />


### AI Analysis Results
<img width="1684" height="943" alt="image" src="https://github.com/user-attachments/assets/7342ef4d-42da-4c2c-89ab-a3796d65ec78" />


</div>

---

## 🔄 Example Workflow


1. User Registration/Login
          ↓
2. Create or Join Session
          ↓
3. Participants Submit Ideas
          ↓
4. AI Analyzes & Ranks Ideas
          ↓
5. Team Reviews AI Insights
          ↓
6. Best Idea Selected
          ↓
7. Decision Recorded on Hedera
          ↓
8. Immutable Proof Generated


---

## 🛡 Security Features

| Feature | Implementation |
|---------|----------------|
| Password Security | bcrypt hashing with salt rounds |
| Authentication | JWT with secure HTTP-only cookies |
| API Protection | CORS configuration & rate limiting |
| Input Validation | Express-validator middleware |
| Environment Variables | Sensitive data in .env (gitignored) |
| SQL Injection Prevention | Parameterized queries |

---

## 🏆 What Makes Smart-Decide Special?

<table>
<tr>
<td width="33%" align="center">

### 💡 Innovation
First platform to combine AI semantic analysis with blockchain verification for group decisions

</td>
<td width="33%" align="center">

### 🎓 Practical
Perfect for schools, startups, hackathons, and organizations needing transparent decision-making

</td>
<td width="33%" align="center">

### 🔬 Technical
Full-stack implementation showcasing modern web development with cutting-edge technologies

</td>
</tr>
</table>

---

## 👥 Team

<table>
<tr>
<td align="center">
<img src="https://github.com/sidahmed.png" width="100px;" alt="Sidahmed"/><br />
<b>Sidahmed</b><br />
<sub>Full Stack Developer</sub><br />
<sub>Frontend & Backend</sub>
</td>
<td align="center">
<img src="https://via.placeholder.com/100" width="100px;" alt="AI Engineer"/><br />
<b>[Teammate Name]</b><br />
<sub>AI Engineer</sub><br />
<sub>TensorFlow Analysis</sub>
</td>
<td align="center">
<img src="https://via.placeholder.com/100" width="100px;" alt="Blockchain Dev"/><br />
<b>[Teammate Name]</b><br />
<sub>Blockchain Developer</sub><br />
<sub>Hedera Integration</sub>
</td>
</tr>
</table>

---

## 🗺 Future Roadmap

- [ ] Phase 1 (Q1 2025)
  - [ ] AI-powered discussion summaries
  - [ ] Hedera Consensus Service (HCS) integration
  - [ ] Enhanced analytics dashboard

- [ ] Phase 2 (Q2 2025)
  - [ ] Real-time chat & voice sessions
  - [ ] Multi-language support
  - [ ] Mobile app (React Native)

- [ ] Phase 3 (Q3 2025)
  - [ ] Global leaderboard system
  - [ ] Integration with Slack/Discord
  - [ ] Advanced AI models (GPT integration)

- [ ] Phase 4 (Q4 2025)
  - [ ] Enterprise features & SaaS model
  - [ ] Custom AI training per organization
  - [ ] Hedera Token Service (HTS) rewards

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Hedera Hashgraph](https://hedera.com/) for blockchain infrastructure
- [TensorFlow.js](https://www.tensorflow.org/js) for AI capabilities
- [React](https://reactjs.org/) community for amazing tools
- All contributors and testers who helped shape this project

---

## 📞 Contact & Support

<div align="center">

Have questions or suggestions?

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-red?style=for-the-badge&logo=github)](https://github.com/YOUR_USERNAME/smart-decide/issues)
[![Discord](https://img.shields.io/badge/Discord-Join%20Us-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/YOUR_INVITE)
[![Email](https://img.shields.io/badge/Email-Contact-blue?style=for-the-badge&logo=gmail)](mailto:your.email@example.com)

### ⭐ If you find this project helpful, please give it a star!

Made with ❤ for the Hedera Hackathon

</div>

---

<div align="center">
<sub>Built with React, Node.js, TensorFlow.js, and Hedera Hashgraph</sub>
</div>