/**
 * OpenAI/ChatGPT Service for AI-Powered Message Generation
 * 
 * Used for Phase 4B: Personalized outreach message generation
 * - Email personalization
 * - LinkedIn message crafting
 * - Call script generation
 */

const auditLogService = require('./auditLogService');

class OpenAIService {
  constructor() {
    this.baseUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1';
    this.defaultModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  getApiKey() {
    return process.env.OPENAI_API_KEY;
  }

  isConfigured() {
    return !!this.getApiKey();
  }

  /**
   * Generate a personalized message using ChatGPT
   */
  async generateMessage({
    template,
    contact,
    company,
    tone = 'professional',
    messageType = 'email',
    customInstructions = '',
  }, actor) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const systemPrompt = this.buildSystemPrompt(messageType, tone);
    const userPrompt = this.buildUserPrompt(template, contact, company, customInstructions);

    const resp = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      await auditLogService.log({
        actor,
        action: 'openai.generate.failed',
        entityType: 'openai',
        details: { status: resp.status, error: data.error?.message },
      });
      throw new Error(data.error?.message || `OpenAI API error (${resp.status})`);
    }

    const generatedText = data.choices?.[0]?.message?.content?.trim() || '';

    await auditLogService.log({
      actor,
      action: 'openai.generate.success',
      entityType: 'openai',
      details: { model: this.defaultModel, messageType, contactId: contact?.id },
    });

    // Parse subject and body for emails
    let subject = null;
    let body = generatedText;

    if (messageType === 'email') {
      const parsed = this.parseEmailResponse(generatedText);
      subject = parsed.subject;
      body = parsed.body;
    }

    return {
      subject,
      body,
      model: this.defaultModel,
      promptUsed: userPrompt,
      rawResponse: generatedText,
    };
  }

  /**
   * Generate multiple messages in batch
   */
  async generateBatch(contacts, template, options, actor) {
    const results = [];
    
    for (const contact of contacts) {
      try {
        const result = await this.generateMessage({
          template,
          contact,
          company: {
            name: contact.company_name,
            domain: contact.company_domain,
            industry: contact.industry,
          },
          ...options,
        }, actor);
        
        results.push({
          contactId: contact.id,
          success: true,
          ...result,
        });
      } catch (err) {
        results.push({
          contactId: contact.id,
          success: false,
          error: err.message,
        });
      }

      // Rate limiting: small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return results;
  }

  /**
   * Build system prompt based on message type and tone
   */
  buildSystemPrompt(messageType, tone) {
    const toneDescriptions = {
      professional: 'professional yet warm',
      friendly: 'friendly and approachable',
      formal: 'formal and business-like',
      casual: 'casual and conversational',
    };

    const toneDesc = toneDescriptions[tone] || toneDescriptions.professional;

    const typeInstructions = {
      email: `You are an expert B2B sales copywriter. Generate personalized sales emails that are ${toneDesc}.
        
Rules:
- Keep emails concise (under 150 words for the body)
- Use the contact's first name for personalization
- Reference their company and role specifically
- Include a clear call-to-action
- Avoid generic phrases like "I hope this finds you well"
- Format: Start with "Subject: [subject line]" followed by a blank line and the email body
- Do not include signature lines (those will be added separately)`,

      linkedin: `You are an expert at crafting LinkedIn messages. Generate personalized connection requests or InMails that are ${toneDesc}.

Rules:
- Keep messages under 300 characters for connection requests, under 500 for InMails
- Be genuine and specific about why you want to connect
- Reference something specific about their profile or company
- Avoid salesy language
- Do not include subject lines`,

      call_script: `You are an expert at creating sales call scripts. Generate a personalized cold call script that is ${toneDesc}.

Rules:
- Include an opening, value proposition, and ask
- Add objection handling tips
- Keep it conversational, not robotic
- Include pause points for listening
- Reference specific details about the contact and company`,
    };

    return typeInstructions[messageType] || typeInstructions.email;
  }

  /**
   * Build user prompt with contact/company data
   */
  buildUserPrompt(template, contact, company, customInstructions = '') {
    const contactInfo = `
Contact Information:
- First Name: ${contact.first_name || 'there'}
- Last Name: ${contact.last_name || ''}
- Full Name: ${contact.full_name || contact.first_name || 'Contact'}
- Title: ${contact.title || 'Professional'}
- Seniority: ${contact.seniority || 'Unknown'}
- Email: ${contact.email || 'N/A'}
- LinkedIn: ${contact.linkedin_url || 'N/A'}

Company Information:
- Company Name: ${company?.name || contact.company_name || 'the company'}
- Industry: ${company?.industry || 'their industry'}
- Domain: ${company?.domain || contact.company_domain || 'N/A'}
`;

    let prompt = `Generate a personalized message for the following contact:\n${contactInfo}`;

    if (template?.body_template) {
      prompt += `\n\nUse this template as inspiration (but personalize it significantly):\n${template.body_template}`;
    }

    if (template?.subject_template) {
      prompt += `\n\nSubject line template (personalize this too): ${template.subject_template}`;
    }

    if (customInstructions) {
      prompt += `\n\nAdditional instructions: ${customInstructions}`;
    }

    return prompt;
  }

  /**
   * Parse email response to extract subject and body
   */
  parseEmailResponse(text) {
    let subject = '';
    let body = text;

    // Try to extract subject line
    const subjectMatch = text.match(/^Subject:\s*(.+?)(?:\n|$)/im);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      body = text.replace(subjectMatch[0], '').trim();
    }

    return { subject, body };
  }

  /**
   * Improve/edit an existing message
   */
  async improveMessage({ originalMessage, feedback, messageType = 'email', tone = 'professional' }, actor) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert editor improving B2B sales messages. 
Maintain the core message but incorporate the feedback provided.
Keep the same format and approximate length.`;

    const userPrompt = `Original message:
${originalMessage}

Feedback to incorporate:
${feedback}

Please rewrite the message incorporating this feedback while maintaining a ${tone} tone.`;

    const resp = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      throw new Error(data.error?.message || `OpenAI API error (${resp.status})`);
    }

    const improvedText = data.choices?.[0]?.message?.content?.trim() || '';

    if (messageType === 'email') {
      return this.parseEmailResponse(improvedText);
    }

    return { body: improvedText };
  }
}

module.exports = new OpenAIService();
