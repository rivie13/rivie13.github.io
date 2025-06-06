---
layout: post
title: "The Costly Reality of Always-On VMs in CodeGrind: From $50 to $8.65 Monthly Bills"
date: 2025-06-05 10:00:00 -0500
categories: [CodeGrind, Azure, Cloud Optimization, DevOps]
tags: [Azure VM, Judge0, Cost Optimization, Cloud Architecture, Azure Functions, Queue System, Serverless, Cost Management]
image: /assets/images/codegrind/azure-cost-optimization-banner.png
excerpt: "How I slashed CodeGrind's Azure costs by 85% - from a projected $50+ monthly bill to under $10 - by rethinking our always-on VM architecture. A real-world journey with actual cost data and lessons learned."
---

<style>
/* Custom styling for cost comparison elements */
.cost-comparison {
  background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  color: white;
  text-align: center;
}

.cost-savings {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  color: white;
  text-align: center;
}

.cost-timeline {
  background: #f8fafc;
  border-left: 4px solid #3b82f6;
  border-radius: 6px;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

html.dark .cost-timeline {
  background: #1e293b;
  border-left-color: #60a5fa;
}

html.dark .cost-comparison {
  background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
}

html.dark .cost-savings {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
}

.highlight {
  border-radius: 6px;
  margin: 1.5rem 0;
  padding: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

.highlight pre {
  padding: 1.25rem;
  margin: 0;
  overflow-x: auto;
  line-height: 1.5;
}

.highlight code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
}

html.dark .highlight {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
}

/* Different background colors for different language blocks */
.language-yaml .highlight { background-color: #f8fafc; border-left: 4px solid #4f46e5; }
.language-ruby .highlight { background-color: #fef2f2; border-left: 4px solid #dc2626; }
.language-html .highlight { background-color: #f0f9ff; border-left: 4px solid #0ea5e9; }
.language-css .highlight { background-color: #f5f3ff; border-left: 4px solid #a855f7; }
.language-bash .highlight { background-color: #f0fdf4; border-left: 4px solid #16a34a; }
.language-javascript .highlight { background-color: #fffbeb; border-left: 4px solid #f59e0b; }

/* Dark mode versions */
html.dark .language-yaml .highlight { background-color: #1e293b; border-left: 4px solid #4f46e5; }
html.dark .language-ruby .highlight { background-color: #350c0c; border-left: 4px solid #dc2626; }
html.dark .language-html .highlight { background-color: #082f49; border-left: 4px solid #0ea5e9; }
html.dark .language-css .highlight { background-color: #2e1065; border-left: 4px solid #a855f7; }
html.dark .language-bash .highlight { background-color: #052e16; border-left: 4px solid #16a34a; }
html.dark .language-javascript .highlight { background-color: #451a03; border-left: 4px solid #f59e0b; }

/* FIX READABILITY - DARK TEXT FOR LIGHT CONTAINERS IN DARK MODE */
html.dark .bg-yellow-50 .text-yellow-800 {
  color: #1f2937 !important;
}

html.dark .bg-blue-50 .text-blue-800 {
  color: #1f2937 !important;
}

html.dark .bg-red-50 .text-red-800,
html.dark .bg-red-50 .text-red-700 {
  color: #1f2937 !important;
}

html.dark .bg-green-50 .text-green-800,
html.dark .bg-green-50 .text-green-700 {
  color: #1f2937 !important;
}
</style>

<div class="opacity-0" data-animate="fade-in">
  <div class="cost-comparison">
    <h3 class="text-2xl font-bold mb-2">The Shocking Reality</h3>
    <p class="text-lg">What if I told you that a single VM was costing me roughly <strong>$50 per month</strong> just to run code execution?</p>
    <p class="mt-2">That's <strong>$600+ annually</strong> for something that gets used sporadically throughout the day.</p>
  </div>
  
  <p class="text-lg text-gray-700 dark:text-gray-300 mb-6">
    Three weeks ago, I was staring at my Azure billing dashboard in disbelief. CodeGrind, my coding practice platform, was hemorrhaging money through a single always-on virtual machine. Today, I'm excited to share how I transformed that $50+ monthly expense into a lean $8.65 projected bill for ALL PARTS OF THE CODEGRIND PLATFORM – and how you can do the same.
  </p>
  
  {% include blog-ad.html %}
</div>

<div class="opacity-0" data-scroll="fade-up">
  <h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">The Problem: When "Always Available" Becomes "Always Expensive"</h2>
  
  <p class="mb-4">
    CodeGrind relies on Judge0, a powerful code execution engine, to run user-submitted code in real-time. When I first architected the system, I made what seemed like a logical decision: keep the VM running 24/7 to ensure instant availability for users.
  </p>
  
  <p class="mb-4">
    The reasoning was sound:
  </p>
  <ul class="list-disc ml-8 mb-6">
    <li>Users expect instant code execution</li>
    <li>VM startup time could create poor user experience</li>
    <li>What if someone visits the site at 3 AM?</li>
    <li>Better safe than sorry, right?</li>
  </ul>
  
  <p class="mb-4">
    Wrong. Spectacularly wrong.
  </p>
</div>

<div class="opacity-0" data-scroll="fade-up">
  <h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">The Wake-Up Call: Real Numbers Don't Lie</h2>
  
  <div class="cost-timeline">
    <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">The Cost Timeline</h3>
    <ul class="space-y-2">
      <li><strong>Mid-May (Before Fix):</strong> $50+ projected monthly cost</li>
      <li><strong>Mid-May (After Implementation):</strong> $31 projected cost</li>
      <li><strong>End of May (Actual):</strong> $40 (higher due to failed container experiment)</li>
      <li><strong>June (Current Projection):</strong> $8.65</li>
      <li><strong>June (Expected Actual):</strong> $10-15</li>
    </ul>
  </div>
  
  <p class="mb-4">
    Let me break down where that money was going:
  </p>
  
  <ul class="list-disc ml-8 mb-6">
    <li><strong>Virtual Machine:</strong> ~$35-40/month (the biggest culprit)</li>
    <li><strong>Storage:</strong> ~$5-8/month</li>
    <li><strong>Networking:</strong> ~$3-5/month</li>
    <li><strong>Other Azure services:</strong> ~$7-10/month</li>
  </ul>
  
  <p class="mb-4">
    The VM alone was eating 70-80% of my Azure budget, running 24/7 even when no one was using CodeGrind. During off-peak hours (which, let's be honest, is most of the time for a growing platform), that VM was essentially burning money while idle.
  </p>
</div>

<div class="opacity-0" data-scroll="fade-up">
  <h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">Understanding CodeGrind's Real Usage Patterns</h2>
  
  <p class="mb-4">
    Before diving into solutions, I needed to understand how CodeGrind is actually used:
  </p>
  
  <ul class="list-disc ml-8 mb-6">
    <li><strong>Peak hours:</strong> Evenings and weekends (when people practice coding)</li>
    <li><strong>Off-peak hours:</strong> Overnight and early morning (essentially zero usage)</li>
    <li><strong>Code execution frequency:</strong> Sporadic bursts rather than constant usage</li>
    <li><strong>User sessions:</strong> Typically 30-90 minutes with code submissions every few minutes</li>
  </ul>
  
  <p class="mb-4">
    The harsh reality? My always-on VM was idle roughly 18-20 hours per day, yet I was paying for full-time availability. It's like renting a Ferrari to drive to the grocery store once a week – massive overkill.
  </p>
</div>

<div class="opacity-0" data-scroll="fade-up">
  <h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">The "Availability Anxiety" Trap</h2>
  
  <p class="mb-4">
    I fell into what I call "availability anxiety" – the fear that your service won't be there when users need it. This led to over-provisioning and over-engineering for scenarios that rarely occurred.
  </p>
  
  <div class="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 dark:border-yellow-400 p-4 my-6">
    <div class="flex">
      <div class="ml-3">
        <p class="text-sm text-yellow-800 dark:text-yellow-100">
          <strong>Lesson Learned:</strong> Perfect availability isn't always worth the cost. Users are surprisingly tolerant of brief startup delays when they understand they're getting a quality service.
        </p>
      </div>
    </div>
  </div>
  
  <p class="mb-4">
    Questions I should have asked myself:
  </p>
  <ul class="list-disc ml-8 mb-6">
    <li>How many users actually visit during off-peak hours?</li>
    <li>Is a 30-60 second startup delay really that bad?</li>
    <li>Could I communicate the startup process to users?</li>
    <li>What's the actual cost of unavailability vs. the cost of constant availability?</li>
  </ul>
</div>

<div class="opacity-0" data-scroll="fade-up">
  <h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">The Solution: Smart On-Demand Architecture</h2>
  
  <p class="mb-4">
    The breakthrough came when I realized I didn't need to choose between "always on" and "always off." Instead, I could build an intelligent system that starts the VM only when needed and stops it when idle.
  </p>
  
  <h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">The Architecture</h3>
  <p class="mb-4">Here's what I built using Azure Functions:</p>
  
  <ul class="list-disc ml-8 mb-6">
    <li><strong>StartVmHttpTrigger:</strong> Starts the VM when a code execution request comes in</li>
    <li><strong>StopVmQueueTrigger:</strong> Automatically stops the VM after a period of inactivity</li>
    <li><strong>GetVmStatusHttpTrigger:</strong> Checks VM status for smart routing</li>
    <li><strong>Queue-based system:</strong> Prevents VM from stopping during active use</li>
  </ul>
  
  <div class="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 dark:border-blue-400 p-4 my-6">
    <div class="flex">
      <div class="ml-3">
        <p class="text-sm text-blue-800 dark:text-blue-100">
          <strong>Key Insight:</strong> By using Azure Functions (serverless), the control system itself costs nothing or eventually pennies to run while saving dollars on the VM.
        </p>
      </div>
    </div>
  </div>
  
  <p class="mb-4">
    The beauty of this approach is that it combines the best of both worlds: near-instant availability when needed, and zero costs when idle. The Azure Functions themselves cost virtually nothing to run and actually nothing to run if you are not hitting the usage limits, making the entire control system extremely cost-effective.
  </p>
</div>

<div class="opacity-0" data-scroll="fade-up">
  <h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">The Real-World Test: Traffic Spike Validation</h2>
  
  <p class="mb-4">
    The ultimate test came in early June when CodeGrind experienced a traffic spike – roughly 200 visitors in the first week. This was exactly the scenario I was worried about: unexpected traffic that could overwhelm the system.
  </p>
  
  <div class="cost-savings">
    <h3 class="text-2xl font-bold mb-2">The Results</h3>
    <p class="text-lg">Despite 200+ visitors, June's projected cost: <strong>$8.65</strong></p>
    <p class="mt-2">The system handled the traffic beautifully while keeping costs minimal.</p>
  </div>
  
  <p class="mb-4">
    This validated the entire approach. The system could:
  </p>
  <ul class="list-disc ml-8 mb-6">
    <li>Handle unexpected traffic spikes</li>
    <li>Start the VM quickly when needed</li>
    <li>Maintain low costs during high usage</li>
    <li>Automatically scale down during quiet periods</li>
  </ul>
</div>

<div class="opacity-0" data-scroll="fade-up">
  <h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">Lessons from Failed Experiments</h2>
  
  <p class="mb-4">
    Why was May's actual cost still around $40 despite the optimization? I made some expensive mistakes:
  </p>
  
  <h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">The Container Apps Experiment</h3>
  <p class="mb-4">
    I attempted to move Judge0 to Azure Container Apps, thinking it would be even more cost-effective. This failed spectacularly due to:
  </p>
  <ul class="list-disc ml-8 mb-6">
    <li>Complex PostgreSQL configuration issues</li>
    <li>File share mounting problems</li>
    <li>Container stability issues</li>
    <li>Deployment complexity</li>
  </ul>
  
  <p class="mb-4">
    The experimentation cost me extra, but I learned valuable lessons about when containerization makes sense and when it doesn't.
  </p>
  
  <h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">VM Usage for Other Projects</h3>
  <p class="mb-4">
    I also used the VM for testing other projects, which inflated the costs. This taught me the importance of:
  </p>
  <ul class="list-disc ml-8 mb-6">
    <li>Dedicated environments for different projects</li>
    <li>Clear cost attribution</li>
    <li>Proper resource tagging</li>
  </ul>
</div>

<div class="opacity-0" data-scroll="fade-up">
  <h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">The Financial Impact: Real Numbers</h2>
  
  <div class="grid md:grid-cols-2 gap-6 my-8">
    <div class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-500 rounded-lg p-6">
      <h3 class="text-lg font-bold text-red-800 dark:text-red-100 mb-3">Before Optimization</h3>
      <ul class="text-sm text-red-700 dark:text-red-200">
        <li>Monthly cost: <strong>$50+</strong></li>
        <li>Annual projection: <strong>$600+</strong></li>
        <li>VM utilization: <strong>~20%</strong></li>
        <li>Cost per code execution: <strong>High</strong></li>
      </ul>
    </div>
    
    <div class="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-500 rounded-lg p-6">
      <h3 class="text-lg font-bold text-green-800 dark:text-green-100 mb-3">After Optimization</h3>
      <ul class="text-sm text-green-700 dark:text-green-200">
        <li>Monthly cost: <strong>$10-15</strong></li>
        <li>Annual projection: <strong>$120-180</strong></li>
        <li>VM utilization: <strong>~80%</strong></li>
        <li>Cost per code execution: <strong>Minimal</strong></li>
      </ul>
    </div>
  </div>
  
  <div class="cost-savings">
    <h3 class="text-2xl font-bold mb-2">Total Savings</h3>
    <p class="text-xl">85% cost reduction</p>
    <p class="text-lg mt-2">Saving $40+ per month = $480+ annually</p>
    <p class="mt-2">ROI achieved in the first month</p>
  </div>
</div>

<div class="opacity-0" data-scroll="fade-up">
  <h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">What This Means for CodeGrind's Future</h2>
  
  <p class="mb-4">
    This optimization unlocks several opportunities:
  </p>
  
  <ul class="list-disc ml-8 mb-6">
    <li><strong>Reinvestment:</strong> $40+ monthly savings can fund other improvements</li>
    <li><strong>Scalability:</strong> The system can handle growth without proportional cost increases</li>
    <li><strong>Sustainability:</strong> CodeGrind can operate profitably at lower user volumes</li>
    <li><strong>Innovation:</strong> More resources available for feature development</li>
  </ul>
</div>

<div class="opacity-0" data-scroll="fade-up">
  <h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">Key Takeaways for Your Projects</h2>
  
  <div class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-lg p-6 my-6">
    <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Before You Build Always-On Infrastructure:</h3>
    <ol class="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-200">
      <li>Analyze your actual usage patterns</li>
      <li>Calculate the true cost of 24/7 availability</li>
      <li>Consider user tolerance for brief delays</li>
      <li>Explore on-demand alternatives</li>
      <li>Build intelligent scaling systems</li>
      <li>Monitor and iterate based on real data</li>
    </ol>
  </div>
  
  <p class="mb-4">
    The cloud's promise isn't just scalability – it's efficiency. Use it wisely.
  </p>
</div>

<div class="opacity-0" data-scroll="fade-up">
  <h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">What's Next in This Series</h2>
  
  <p class="mb-4">
    This is just the beginning of CodeGrind's optimization journey. In upcoming posts, I'll dive deep into:
  </p>
  
  <ol class="list-decimal ml-8 mb-6">
    <li><strong>Securing CodeGrind's Secrets:</strong> Our journey with Azure Key Vault</li>
    <li><strong>The ACI Experiment:</strong> When containerization didn't work and why</li>
    <li><strong>Serverless to the Rescue:</strong> Building smart VM control with Azure Functions</li>
    <li><strong>The Results:</strong> Complete cost analysis and performance impact</li>
  </ol>
  
  <p class="mb-4">
    Each post will include real code, actual costs, and lessons learned from both successes and failures.
  </p>
</div>

<div class="opacity-0" data-scroll="fade-up">
  <h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">Try CodeGrind Today</h2>
  
  <div class="flex flex-col md:flex-row gap-4 mb-8">
    <a href="https://codegrind.online/" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors text-center">Visit CodeGrind</a>
    <a href="https://codegrind.online/games/tower-defense/demo/two-sum" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors text-center">Try the Tower Defense Demo</a>
  </div>
  
  <p class="mb-4">
    Want to experience the platform that sparked this optimization journey? Visit <a href="https://codegrind.online" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">CodeGrind</a> and see how efficient architecture enables better user experiences at lower costs.
  </p>
  
  <p class="mb-4">
    And the best part? Thanks to these optimizations, CodeGrind can continue growing and improving while maintaining sustainable costs.
  </p>
</div>

<div class="opacity-0" data-scroll="fade-up">
  <div class="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 dark:border-blue-400 p-6 my-8">
    <p class="text-blue-800 dark:text-blue-100">
      <strong>Coming Up Next:</strong> "Securing CodeGrind's Secrets: Our Journey with Azure Key Vault" – where I'll share how we moved from environment variables to proper secret management, and why it was crucial for the Function Apps architecture to work securely.
    </p>
  </div>
  
  <p class="text-center text-gray-600 dark:text-gray-400 mt-8">
    Have questions about cloud cost optimization or want to share your own stories? Let's connect and learn from each other's experiences.
  </p>
</div>

<div class="opacity-0" data-scroll="fade-up">
  <p class="text-gray-700 dark:text-gray-300 mt-8">*Want to experience these cost optimizations in action? Try CodeGrind at <a href="https://codegrind.online" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">codegrind.online</a> and see how efficient infrastructure translates to better user experiences.*</p>
</div> 