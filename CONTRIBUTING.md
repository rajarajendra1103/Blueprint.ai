# Contributing to Blueprint.ai 📐

Thank you for your interest in contributing to **Blueprint.ai**! Community contributions help make this tool better for developers and architects worldwide.

---

## 🛠️ How to Contribute

### 1. Reporting Bugs
- Search existing issues to ensure the bug hasn't already been reported.
- If not, create a new issue detailing:
  - Clear, descriptive title
  - Steps to reproduce
  - Expected vs. actual behavior
  - Browser and OS version

### 2. Suggesting Enhancements
- Propose feature requests or architecture improvements via GitHub Issues.
- Explain the motivation and use case for the proposed feature.

### 3. Pull Requests (PRs)
1. **Fork** the repository to your own GitHub account.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Blueprint.ai.git
   cd Blueprint.ai
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Make your changes and test locally**:
   ```bash
   npm run dev
   ```
6. **Commit your changes**:
   ```bash
   git commit -m "feat: add support for new feature"
   ```
7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request** against the `main` branch of this repository.

---

## 🔒 Security Best Practices
- Never commit private API keys or personal access tokens.
- Keep all credentials client-side using `sessionStorage` in alignment with Blueprint.ai's stateless BYOK policy.

---

## 📄 License
By contributing to Blueprint.ai, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
