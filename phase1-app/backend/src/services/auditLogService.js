const { pool } = require('../config/database');

class AuditLogService {
  async log({ actor, action, entityType, entityId = null, details = null }) {
    try {
      await pool.query(
        `INSERT INTO audit_log (actor, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [actor || null, action, entityType, entityId, details]
      );
    } catch (err) {
      // Audit logging should never break the request flow
      console.error('Audit log write failed:', err.message);
    }
  }
}

module.exports = new AuditLogService();
