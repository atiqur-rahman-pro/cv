# 🤖 How to Use Claude API: A Practical Python Developer Guide

**Author:** [Atiqur Rahman](https://github.com/atiqur-rahman-pro) | *Anthropic Claude Certified Specialist & Senior SDET*  
**Repository:** [Atiqur Rahman GitHub CV](https://github.com/atiqur-rahman-pro/cv)

---

## 📌 Executive Overview

The **Anthropic Claude API** enables software engineers to integrate advanced Large Language Models (LLMs) like **Claude 3.5 Sonnet**, **Claude 3 Opus**, and **Claude 3 Haiku** into Python applications, enterprise workflows, and QA automation frameworks.

This guide provides a production-grade blueprint on **how to use Claude API** effectively in Python, covering SDK installation, authentication, prompt engineering, structured JSON outputs, streaming responses, and real-world enterprise automations (such as auto-triaging Jira tickets).

---

## 🛠️ Step 1: Installation & API Key Setup

### 1. Install the Official Anthropic Python SDK
```bash
pip install anthropic
```

### 2. Set Up Environment Variable
Always store your Anthropic API Key securely in environment variables (never hardcode keys in repository files):

**Linux / macOS:**
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

**Windows PowerShell:**
```powershell
$env:ANTHROPIC_API_KEY="your-api-key-here"
```

---

## 🐍 Step 2: Basic Completion Request in Python

```python
import os
import anthropic

# Initialize the Anthropic Client
client = anthropic.Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

# Send a message request to Claude 3.5 Sonnet
message = client.messages.create(
    model="claude-3-5-sonnet-20240620",
    max_tokens=1000,
    temperature=0.3,
    system="You are an expert QA Automation Engineer and Python Developer.",
    messages=[
        {"role": "user", "content": "Explain how to structure a Pytest framework with Page Object Model."}
    ]
)

# Output Claude's response text
print(message.content[0].text)
```

---

## ⚡ Step 3: Streaming Real-Time Responses

For interactive web applications and AI chatbots (such as [OmniAgent](https://github.com/atiqur-rahman-pro/omniagent-ai)), stream tokens in real time:

```python
import anthropic

client = anthropic.Anthropic()

with client.messages.stream(
    model="claude-3-haiku-20240307",
    max_tokens=500,
    system="You are OmniAgent, a customer support triage bot.",
    messages=[{"role": "user", "content": "My payment failed on checkout page with 500 error."}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

---

## 📊 Step 4: Structuring JSON Outputs for Automated Jira Triaging

When integrating Claude with enterprise systems like **Jira REST API**, instruct Claude to return strict JSON payloads:

```python
import json
import anthropic

client = anthropic.Anthropic()

user_query = "The payment checkout page crashed with HTTP 500 error when I clicked submit."

prompt = f"""
Analyze the following customer query and return ONLY a raw JSON object with keys:
"sentiment" (POSITIVE/NEUTRAL/NEGATIVE),
"intent" (BUG_REPORT/GENERAL_INQUIRY),
"priority" (HIGH/MEDIUM/LOW),
"summary" (short 5-word title).

Customer Query: "{user_query}"
"""

response = client.messages.create(
    model="claude-3-5-sonnet-20240620",
    max_tokens=300,
    messages=[{"role": "user", "content": prompt}]
)

# Parse raw text to structured dictionary
result = json.loads(response.content[0].text)
print(f"Priority: {result['priority']} | Intent: {result['intent']}")
```

---

## 🏆 Real-World Production Implementations by Atiqur Rahman

Check out production projects demonstrating Anthropic Claude API integrations:

1. 🤖 **[OmniAgent Platform](https://github.com/atiqur-rahman-pro/omniagent-ai):** Multi-model AI workflow engine bridging Claude API with Jira REST API for zero-touch bug triaging.
2. 🎙️ **[AI Voice Examiner](https://github.com/atiqur-rahman-pro/qa-interview-prep):** Browser-native interview prep tool scoring technical responses out of 10.
3. 🧪 **[12-Point Web Audit Framework](https://github.com/atiqur-rahman-pro/web-audit-automation-framework):** Automated diagnostic framework integrated with Allure & GitHub Actions CI/CD.

---

## 🌐 Connect & Learn More

- 🐙 **GitHub CV:** [https://github.com/atiqur-rahman-pro/cv](https://github.com/atiqur-rahman-pro/cv)
- 💼 **LinkedIn:** [https://www.linkedin.com/in/atiqur-rahman-pro](https://www.linkedin.com/in/atiqur-rahman-pro)
- 🌐 **Portfolio Site:** [https://atiqur-rahman-pro.github.io](https://atiqur-rahman-pro.github.io)
