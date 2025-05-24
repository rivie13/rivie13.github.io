# Security for Interactive Blog Elements on rivie13.github.io

## Overview
This document outlines the security concerns and recommended solutions for implementing interactive elements in blog posts on rivie13.github.io, especially when leveraging Azure OpenAI and Azure AI Foundry. Special attention is given to the open-source nature of the site and the use of Azure's built-in guardrails and controls.

---

## 1. Security Concerns for Interactive Elements

### a. Input Validation & Content Filtering
- **Risk:** Malicious or inappropriate user input (prompt injection, XSS, offensive content, etc.)
- **Solution:**
  - **Azure AI Foundry Guardrails & Controls:**
    - Use Azure's built-in content filters and guardrails to automatically validate and filter both prompts and completions.
    - Configure severity thresholds for violence, hate, sexual, and self-harm content ([Azure Docs](https://learn.microsoft.com/en-us/azure/ai-foundry/model-inference/how-to/configure-content-filters)).
    - Enable input and output filters at the deployment level in the Azure portal (Guardrails & Controls > Content filters).
    - Optionally enable binary classifiers for jailbreak risk, public code, etc.
  - **Server-side Validation:**
    - Validate and sanitize all user input in Azure Functions before sending to the model.
    - Reject or sanitize any input that does not meet expected format or length.

### b. API Key & Secret Management
- **Risk:** Exposure of sensitive keys in open source codebase.
- **Solution:**
  - Store all API keys and secrets in Azure Key Vault.
  - Never expose keys in the frontend or in the public repository.
  - Access secrets only from secure Azure Functions.

### c. Rate Limiting & Abuse Prevention
- **Risk:** Abuse of interactive features (DoS, excessive usage, spam).
- **Solution:**
  - Implement rate limiting in Azure Functions (per IP or per session).
  - Use Azure Table Storage or similar for tracking usage.
  - Return appropriate error codes (429) when limits are exceeded.

### d. CORS & Origin Restrictions
- **Risk:** Unauthorized domains accessing your Azure Functions.
- **Solution:**
  - Set CORS policies in Azure Functions to only allow requests from `https://rivie13.github.io`.
  - Reject requests from unknown origins.

### e. Output Sanitization
- **Risk:** Model output containing unsafe or inappropriate content.
- **Solution:**
  - Rely on Azure's output content filters (see above).
  - Sanitize and validate all output before returning to the client.
  - Consider additional server-side checks for edge cases.

### f. Open Source Codebase Risks
- **Risk:** Attackers reading your code to find vulnerabilities or secrets.
- **Solution:**
  - Never commit secrets or sensitive configuration to the repository.
  - Document security practices for contributors.
  - Regularly review code for accidental leaks.

### g. Data Privacy
- **Risk:** Collection or exposure of user data (IP, prompts, etc.).
- **Solution:**
  - Minimize data collection; only store what is necessary for rate limiting/analytics.
  - Anonymize or hash IP addresses if possible.
  - Clearly disclose any data collection in your privacy policy.

### h. HTTPS Enforcement
- **Risk:** Data interception or tampering in transit.
- **Solution:**
  - Enforce HTTPS for your GitHub Pages site ([GitHub Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)).
  - Ensure all assets and API calls use HTTPS.

---

## 2. How to Use Azure Guardrails & Controls

- In the Azure AI Foundry portal, go to **Guardrails & Controls** > **Content filters**.
- Create or configure a content filter for your deployment.
- Set severity thresholds for each harm category (violence, hate, sexual, self-harm).
- Associate the filter with your model deployment.
- Optionally enable additional classifiers (jailbreak, public code, etc.).
- When a filter is triggered, Azure will return a 400 error with details—handle this gracefully in your Azure Function and frontend.
- Regularly review and update your filter settings as needed.

---

## 3. Best Practices for Open Source Interactive Features

- Keep all sensitive logic and secrets server-side (Azure Functions).
- Use environment variables and Azure Key Vault for all credentials.
- Document your security approach for contributors.
- Monitor usage and error logs for abuse or attempted attacks.
- Stay up to date with Azure and GitHub Pages security recommendations.

---

## 4. Example Security Workflow

1. **User submits input via blog interactive element.**
2. **Frontend sends request to Azure Function (over HTTPS, with CORS restricted).**
3. **Azure Function:**
   - Validates and sanitizes input.
   - Checks rate limits.
   - Passes input to Azure OpenAI/AI Foundry with content filters enabled.
   - Handles any 400/content filter errors from Azure.
   - Sanitizes and returns output to frontend.
4. **Frontend displays result or error message.**

---

## 5. References
- [Azure AI Foundry: Configure content filters](https://learn.microsoft.com/en-us/azure/ai-foundry/model-inference/how-to/configure-content-filters)
- [GitHub Pages: Securing your site with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)

---

*This document should be reviewed and updated regularly as new features are added or as Azure/GitHub security practices evolve.* 