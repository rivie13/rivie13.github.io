# Planning Document: Interactive Blog Elements (Two Sum Solver & Hack Assistant)

## 1. Goal

To implement the interactive "Two Sum" LeetCode problem solver and the "Hack Assistant" AI chat interface within the blog post: `_posts/codegrind/2025-05-21-enhancing-codegrind-ai-capabilities.md`. This will provide a hands-on demonstration of AI-assisted coding concepts discussed in the post.

## 2. Core Principle

Maximize the reuse of existing infrastructure and services from the CodeGrind platform and current Azure subscriptions to maintain a DRY (Don't Repeat Yourself) architecture.

## 3. Existing Assets for Reuse

The following existing components will be leveraged:

*   **CodeGrind Backend (`server.js`):**
    *   **Endpoint:** `/api/run-code`
    *   **Functionality:** Handles LeetCode problem lookup by `titleSlug` (e.g., "two-sum"), fetches problem details (test cases, code snippets for metadata), wraps user code with appropriate test harnesses for various languages, submits to Judge0 for execution, and returns formatted results.
    *   **Relevance:** Will be the primary engine for executing the user's "Two Sum" solution submitted via the blog.
    *   **IP Filtering:** The CodeGrind backend needs to be configured with IP filtering to allow requests only from `https://rivie13.github.io` and of course codegrind.online.
    *   **Major point of concern:** in rare instances, the backend will send an error of connection refused which will display the public IP address of the VM which is not ideal. the frontend will need to handle this error gracefully, to make sure to regex the error message to remove the IP address.

*   **CodeGrind Judge0 VM Management Azure Functions:**
    *   **Functions:** `GetVmStatusHttpTrigger`, `StartVmHttpTrigger` (HTTP triggered).
    *   **Functionality:** Manage the lifecycle of the Judge0 code execution VM.
    *   **Relevance:** A new proxy Azure Function for the blog will call these to ensure the Judge0 VM is operational before forwarding code execution requests to the CodeGrind backend.

*   **Azure OpenAI Deployment:**
    *   **Functionality:** Provides access to GPT models for AI-powered features.
    *   **Relevance:** The "Hack Assistant" on the blog will use this deployment. A new proxy Azure Function will manage blog-specific prompts and interact with this existing OpenAI endpoint.

*   **Azure Key Vault:**
    *   **Functionality:** Secure storage for secrets like API keys.
    *   **Relevance:** The Azure OpenAI API key needed by the new "Hack Assistant" proxy function will be stored and accessed from Key Vault using Managed Identities.

*   **GitHub API Proxy Azure Function App:**
    *   **Functionality:** Proxies GitHub API requests securely.
    *   **Relevance:** While an existing asset, it's not directly involved in the "Two Sum" solver or "Hack Assistant" demo as currently defined. We will not reuse this asset. We will not add to it for the proper separation of concerns principles. We will create a new Azure Function App for the blog's interactive elements.

## 4. New Components for the Blog

A new Azure Function App (or an existing non-CodeGrind Function App for the blog, if available) will be created/used to host the backend logic for the blog's interactive elements. This app will contain:

*   **Azure Function 1: `ExecuteTwoSumSolutionProxy`**
    *   **Trigger:** HTTP
    *   **Purpose:**
        1.  Accepts the user's JavaScript code for the "Two Sum" problem from the blog frontend.
        2.  Calls the existing `StartVmHttpTrigger` and `GetVmStatusHttpTrigger` to ensure the Judge0 VM is ready.
        3.  Constructs a request payload for the CodeGrind backend, including the user's code, language (JavaScript), and `titleSlug: "two-sum"`.
        4.  Forwards this request to the CodeGrind backend's `/api/run-code` endpoint.
        5.  Receives the execution result from the CodeGrind backend and relays it to the blog frontend.
    *   **Note:** The CodeGrind backend already handles fetching test cases and other metadata for "two-sum" via its `titleSlug`.

*   **Azure Function 2: `GetHackAssistantResponseProxy`**
    *   **Trigger:** HTTP
    *   **Purpose:**
        1.  Accepts the user's query and the selected "assistance level" (e.g., "Hints Only", "Full Solution") from the "Hack Assistant" UI on the blog.
        2.  Retrieves the Azure OpenAI API key securely from Azure Key Vault.
        3.  Formulates a system prompt and user prompt specifically for the "Two Sum" problem context and the requested assistance level.
        4.  Sends the request to the existing Azure OpenAI deployment.
        5.  Receives the AI's response and relays it to the blog frontend.

*   **Frontend JavaScript Enhancements (in the blog post `.md` file):**
    *   The "Test Solution" button's `onclick` handler will be updated to:
        *   Gather the user-built solution code.
        *   Call the `ExecuteTwoSumSolutionProxy` Azure Function.
        *   Display the formatted results (success/failure, output, errors) in the `test-result` div.
    *   The "Hack Assistant" UI's "Transmit" button (`transmit-btn-static`) `onclick` handler will be updated to:
        *   Get the user's input from `hack-input-static`.
        *   Get the selected assistance level from `assist-level-static`.
        *   Call the `GetHackAssistantResponseProxy` Azure Function.
        *   Display the AI's response in the `hack-chat-msg-static` paragraph.

## 5. Security Considerations

Implementation will adhere to the guidelines in `docfiles/SECURITY_FOR_INTERACTIVE_BLOG_ELEMENTS.md`:

*   **CORS:** The new Azure Functions (`ExecuteTwoSumSolutionProxy`, `GetHackAssistantResponseProxy`) will be configured with CORS policies to allow requests exclusively from `https://rivie13.github.io`.
*   **Key Vault & Managed Identities:** The `GetHackAssistantResponseProxy` function will use a Managed Identity to access the Azure OpenAI API key stored in Key Vault.
*   **Input Validation:** Both new Azure Functions will implement basic input validation and sanitization.
*   **Rate Limiting:** Azure API Management or built-in Azure Functions capabilities will be considered for rate limiting on the new functions to prevent abuse.
*   **HTTPS:** All interactions will be over HTTPS (already standard for Azure Functions and GitHub Pages).
*   **Content Filtering:** Azure OpenAI's built-in content filtering will be utilized for the "Hack Assistant" responses.
*   **Authentication:** No user login/authentication is required for these blog interactive elements, as they are intended for public demonstration.

## 6. Data Flow Summary

*   **"Test Solution" Flow:**
    Blog Frontend (User clicks "Test Solution")
    -> `ExecuteTwoSumSolutionProxy` Azure Function
        -> Calls `StartVmHttpTrigger`/`GetVmStatusHttpTrigger` (if needed)
        -> Sends request to CodeGrind Backend (`/api/run-code` with `titleSlug="two-sum"`)
    <- Receives result from CodeGrind Backend
    <- Returns result to Blog Frontend

*   **"Hack Assistant" Flow:**
    Blog Frontend (User clicks "Transmit")
    -> `GetHackAssistantResponseProxy` Azure Function
        -> Retrieves OpenAI API Key from Key Vault
        -> Sends composed prompt to Azure OpenAI Deployment
    <- Receives response from Azure OpenAI
    <- Returns AI response to Blog Frontend

## 7. Deployment

*   The new Azure Functions will be created, likely in a new Azure Function App. This could reside in the `portfolio_website-affe` resource group (assuming this RG is for the blog's Azure assets) or another suitable resource group. The portfolio_website-affe resource group is the one that contains the existing Azure Function App for the blog. We can add another to it

## 8. Next Steps in Implementation

1.  Define placeholder structures for the new Azure Functions (`ExecuteTwoSumSolutionProxy`, `GetHackAssistantResponseProxy`).
2.  Update the frontend JavaScript in the blog post to make `fetch` calls to these (initially placeholder) Azure Function URLs.
3.  Develop the `ExecuteTwoSumSolutionProxy` Azure Function:
    *   Logic to call VM management functions.
    *   Logic to proxy requests to CodeGrind's `/api/run-code`.
4.  Develop the `GetHackAssistantResponseProxy` Azure Function:
    *   Key Vault integration for OpenAI key.
    *   Prompt engineering logic.
    *   Logic to call Azure OpenAI.
5.  Test and refine the end-to-end functionality.
6.  Implement security measures (CORS, rate limiting). 


### ## FINAL AND MOST IMPORTANT POINT
THIS WILL HAVE TO BE DONE IN A NEW REPOSITORY.
FOR OBVIOUS REASONS. WE DO NOT WANT TO COMPROMISE THE SECURITY OF THE CODEGRIND REPO.
WE DON'T WANT TO EXPOSE BACKEND ENDPOINTS, THESE FUNCTION APPS FOR THE INTERACTIVE BLOG ELEMENTS ARE TOO CLOSE TO THE CODEGRIND BACKEND.
WE WILL HAVE TO CREATE A NEW REPO FOR THE BLOG'S INTERACTIVE ELEMENTS.
THE REPO WILL BE CALLED `blog-interactive-elements`.
THE REPO WILL BE HOSTED ON GITHUB.
THE REPO WILL BE PRIVATE.
THE REPO WILL BE PRIVATE.