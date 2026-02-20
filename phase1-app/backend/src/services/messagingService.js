/**
 * Messaging Service for Phase 4B
 * 
 * Handles:
 * - Message template management
 * - AI message generation orchestration
 * - Message approval workflow
 * - Batch message generation runs
 */

const { pool } = require('../config/database');
const openaiService = require('./openaiService');
const auditLogService = require('./auditLogService');

class MessagingService {
  // ========================================
  // Template Management
  // ========================================

  async getTemplates({ type, isActive = true } = {}) {
    let query = 'SELECT * FROM message_templates WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    if (isActive !== null) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(isActive);
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getTemplateById(id) {
    const result = await pool.query('SELECT * FROM message_templates WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async createTemplate({ name, type, subjectTemplate, bodyTemplate, tone = 'professional' }) {
    const result = await pool.query(
      `INSERT INTO message_templates (name, type, subject_template, body_template, tone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, type, subjectTemplate, bodyTemplate, tone]
    );
    return result.rows[0];
  }

  async updateTemplate(id, updates) {
    const { name, type, subjectTemplate, bodyTemplate, tone, isActive } = updates;
    const result = await pool.query(
      `UPDATE message_templates 
       SET name = COALESCE($1, name),
           type = COALESCE($2, type),
           subject_template = COALESCE($3, subject_template),
           body_template = COALESCE($4, body_template),
           tone = COALESCE($5, tone),
           is_active = COALESCE($6, is_active),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, type, subjectTemplate, bodyTemplate, tone, isActive, id]
    );
    return result.rows[0];
  }

  // ========================================
  // Message Generation
  // ========================================

  /**
   * Generate a single message for a contact
   */
  async generateMessage({ contactId, templateId, messageType, tone, customInstructions }, actor) {
    // Get contact details
    const contactResult = await pool.query(
      'SELECT * FROM enriched_contacts WHERE id = $1',
      [contactId]
    );
    const contact = contactResult.rows[0];
    if (!contact) {
      throw new Error(`Contact not found: ${contactId}`);
    }

    // Get template if specified
    let template = null;
    if (templateId) {
      template = await this.getTemplateById(templateId);
    }

    // Generate message using OpenAI
    const aiResult = await openaiService.generateMessage({
      template,
      contact,
      company: {
        name: contact.company_name,
        domain: contact.company_domain,
        industry: contact.industry,
      },
      tone: tone || template?.tone || 'professional',
      messageType: messageType || template?.type || 'email',
      customInstructions,
    }, actor);

    // Save generated message to database
    const insertResult = await pool.query(
      `INSERT INTO generated_messages (
        contact_id, template_id, message_type, subject, body,
        personalization_data, ai_model, ai_prompt_used, approval_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING *`,
      [
        contactId,
        templateId,
        messageType || template?.type || 'email',
        aiResult.subject,
        aiResult.body,
        JSON.stringify({ contact, template }),
        aiResult.model,
        aiResult.promptUsed,
      ]
    );

    await auditLogService.log({
      actor,
      action: 'message.generated',
      entityType: 'generated_messages',
      entityId: insertResult.rows[0].id,
      details: { contactId, templateId, messageType },
    });

    return insertResult.rows[0];
  }

  /**
   * Batch generate messages for multiple contacts
   */
  async generateBatch({ contactIds, templateId, messageType, tone, customInstructions }, actor) {
    // Create generation run record
    const runResult = await pool.query(
      `INSERT INTO message_generation_runs (
        status, template_id, message_type, total_contacts, ai_model, started_at
      ) VALUES ('running', $1, $2, $3, $4, NOW())
      RETURNING id`,
      [templateId, messageType, contactIds.length, openaiService.defaultModel]
    );
    const runId = runResult.rows[0].id;

    let generatedCount = 0;
    let failedCount = 0;
    const results = [];

    // Get template
    const template = templateId ? await this.getTemplateById(templateId) : null;

    // Get contacts
    const contactsResult = await pool.query(
      'SELECT * FROM enriched_contacts WHERE id = ANY($1)',
      [contactIds]
    );
    const contacts = contactsResult.rows;

    // Generate messages for each contact
    for (const contact of contacts) {
      try {
        const aiResult = await openaiService.generateMessage({
          template,
          contact,
          company: {
            name: contact.company_name,
            domain: contact.company_domain,
            industry: contact.industry,
          },
          tone: tone || template?.tone || 'professional',
          messageType: messageType || template?.type || 'email',
          customInstructions,
        }, actor);

        // Save to database
        const insertResult = await pool.query(
          `INSERT INTO generated_messages (
            contact_id, template_id, message_type, subject, body,
            personalization_data, ai_model, ai_prompt_used, approval_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
          RETURNING id`,
          [
            contact.id,
            templateId,
            messageType || template?.type || 'email',
            aiResult.subject,
            aiResult.body,
            JSON.stringify({ contact }),
            aiResult.model,
            aiResult.promptUsed,
          ]
        );

        generatedCount++;
        results.push({ contactId: contact.id, messageId: insertResult.rows[0].id, success: true });
      } catch (err) {
        failedCount++;
        results.push({ contactId: contact.id, success: false, error: err.message });
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Update run status
    await pool.query(
      `UPDATE message_generation_runs 
       SET status = 'completed', generated_count = $1, failed_count = $2, completed_at = NOW()
       WHERE id = $3`,
      [generatedCount, failedCount, runId]
    );

    await auditLogService.log({
      actor,
      action: 'message.batch_generated',
      entityType: 'message_generation_runs',
      entityId: runId,
      details: { totalContacts: contactIds.length, generatedCount, failedCount },
    });

    return { runId, generatedCount, failedCount, results };
  }

  // ========================================
  // Message Retrieval
  // ========================================

  async getMessages({ status, messageType, contactId, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT gm.*, 
             ec.first_name, ec.last_name, ec.full_name as contact_name, 
             ec.email as contact_email, ec.company_name,
             mt.name as template_name
      FROM generated_messages gm
      LEFT JOIN enriched_contacts ec ON gm.contact_id = ec.id
      LEFT JOIN message_templates mt ON gm.template_id = mt.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND gm.approval_status = $${paramIndex++}`;
      params.push(status);
    }
    if (messageType) {
      query += ` AND gm.message_type = $${paramIndex++}`;
      params.push(messageType);
    }
    if (contactId) {
      query += ` AND gm.contact_id = $${paramIndex++}`;
      params.push(contactId);
    }

    query += ` ORDER BY gm.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getMessageById(id) {
    const result = await pool.query(
      `SELECT gm.*, 
              ec.first_name, ec.last_name, ec.full_name as contact_name,
              ec.email as contact_email, ec.title, ec.company_name, ec.linkedin_url,
              mt.name as template_name, mt.type as template_type
       FROM generated_messages gm
       LEFT JOIN enriched_contacts ec ON gm.contact_id = ec.id
       LEFT JOIN message_templates mt ON gm.template_id = mt.id
       WHERE gm.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async getMessageStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE approval_status = 'pending') as pending,
        COUNT(*) FILTER (WHERE approval_status = 'approved') as approved,
        COUNT(*) FILTER (WHERE approval_status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE approval_status = 'edited') as edited
      FROM generated_messages
    `);
    return result.rows[0];
  }

  // ========================================
  // Message Approval Workflow
  // ========================================

  async approveMessage(id, approvedBy, actor) {
    const result = await pool.query(
      `UPDATE generated_messages 
       SET approval_status = 'approved', approved_by = $1, approved_at = NOW(), updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [approvedBy, id]
    );

    if (result.rows[0]) {
      await auditLogService.log({
        actor,
        action: 'message.approved',
        entityType: 'generated_messages',
        entityId: id,
        details: { approvedBy },
      });
    }

    return result.rows[0];
  }

  async rejectMessage(id, rejectionReason, rejectedBy, actor) {
    const result = await pool.query(
      `UPDATE generated_messages 
       SET approval_status = 'rejected', rejection_reason = $1, approved_by = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [rejectionReason, rejectedBy, id]
    );

    if (result.rows[0]) {
      await auditLogService.log({
        actor,
        action: 'message.rejected',
        entityType: 'generated_messages',
        entityId: id,
        details: { rejectedBy, reason: rejectionReason },
      });
    }

    return result.rows[0];
  }

  async editAndApprove(id, editedBody, editedSubject, approvedBy, actor) {
    const result = await pool.query(
      `UPDATE generated_messages 
       SET approval_status = 'edited', 
           edited_body = $1,
           subject = COALESCE($2, subject),
           approved_by = $3, 
           approved_at = NOW(), 
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [editedBody, editedSubject, approvedBy, id]
    );

    if (result.rows[0]) {
      await auditLogService.log({
        actor,
        action: 'message.edited_approved',
        entityType: 'generated_messages',
        entityId: id,
        details: { approvedBy },
      });
    }

    return result.rows[0];
  }

  async bulkApprove(ids, approvedBy, actor) {
    const result = await pool.query(
      `UPDATE generated_messages 
       SET approval_status = 'approved', approved_by = $1, approved_at = NOW(), updated_at = NOW()
       WHERE id = ANY($2)
       RETURNING id`,
      [approvedBy, ids]
    );

    await auditLogService.log({
      actor,
      action: 'message.bulk_approved',
      entityType: 'generated_messages',
      details: { count: result.rows.length, approvedBy },
    });

    return result.rows;
  }

  async bulkReject(ids, rejectionReason, rejectedBy, actor) {
    const result = await pool.query(
      `UPDATE generated_messages 
       SET approval_status = 'rejected', rejection_reason = $1, approved_by = $2, updated_at = NOW()
       WHERE id = ANY($3)
       RETURNING id`,
      [rejectionReason, rejectedBy, ids]
    );

    await auditLogService.log({
      actor,
      action: 'message.bulk_rejected',
      entityType: 'generated_messages',
      details: { count: result.rows.length, rejectedBy, reason: rejectionReason },
    });

    return result.rows;
  }

  // ========================================
  // Generation Runs
  // ========================================

  async getGenerationRuns({ limit = 20 } = {}) {
    const result = await pool.query(
      `SELECT mgr.*, mt.name as template_name
       FROM message_generation_runs mgr
       LEFT JOIN message_templates mt ON mgr.template_id = mt.id
       ORDER BY mgr.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  // ========================================
  // Export
  // ========================================

  async exportApprovedMessages({ messageType } = {}) {
    let query = `
      SELECT gm.*, 
             ec.email as contact_email, ec.full_name as contact_name,
             ec.company_name, ec.linkedin_url
      FROM generated_messages gm
      LEFT JOIN enriched_contacts ec ON gm.contact_id = ec.id
      WHERE gm.approval_status IN ('approved', 'edited')
    `;
    const params = [];

    if (messageType) {
      query += ' AND gm.message_type = $1';
      params.push(messageType);
    }
    query += ' ORDER BY gm.approved_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }
}

module.exports = new MessagingService();
