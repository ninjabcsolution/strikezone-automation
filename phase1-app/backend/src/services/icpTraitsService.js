const { pool } = require('../config/database');
const auditLogService = require('./auditLogService');

// Phase 2B: ICP trait extraction (lift analysis Top 20% vs Others)
// MVP traits implemented:
// - industry
// - state
// - naics
// - product_category (from order_lines)
//
// Output stored in icp_traits.
class ICPTraitsService {
  async calculateTraits(actor, userId = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // If user_id provided, only delete traits for that user
      if (userId) {
        await client.query('DELETE FROM icp_traits WHERE user_id = $1', [userId]);
      } else {
        await client.query('TRUNCATE TABLE icp_traits');
      }

      // Build user filter for customer_metrics
      const userWhere = userId ? 'WHERE user_id = $1' : '';
      const userParams = userId ? [userId] : [];

      const total = await client.query(
        `SELECT
          COUNT(*) FILTER (WHERE is_top_20 = true)::numeric AS top20,
          COUNT(*) FILTER (WHERE is_top_20 = false)::numeric AS others
        FROM customer_metrics ${userWhere}`,
        userParams
      );

      const top20Count = parseFloat(total.rows[0]?.top20 || 0);
      const othersCount = parseFloat(total.rows[0]?.others || 0);

      if (top20Count === 0 || othersCount === 0) {
        await client.query('COMMIT');
        return { inserted: 0, message: 'Not enough data. Run /api/analytics/calculate first.' };
      }

      // helper to insert traits from a query that returns: trait_value, top20_count, others_count
      const insertFrom = async ({ category, name, sql }) => {
        const res = await client.query(sql, userParams);
        if (res.rows.length === 0) return 0;

        const values = [];
        const params = [];
        let p = 1;

        for (const r of res.rows) {
          const traitValue = r.trait_value;
          const tCount = parseFloat(r.top20_count || 0);
          const oCount = parseFloat(r.others_count || 0);

          // Store frequencies as percentages (0-100) so they are readable and
          // fit the existing NUMERIC(5,2) schema.
          const topFreq = (tCount / top20Count) * 100;
          const otherFreq = (oCount / othersCount) * 100;

          let lift = null;
          if (otherFreq > 0) {
            lift = topFreq / otherFreq;
            // Safety clamp to avoid numeric overflow
            lift = Math.min(lift, 99_999_999.99);
          }

          // importance_score is a simple 0-100 score for ranking.
          // Clamp to avoid numeric overflow (schema is NUMERIC(5,2)).
          const importance = lift ? Math.min(100, Math.max(0, (lift - 1) * topFreq)) : 0;

          values.push(`($${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++})`);
          params.push(userId, category, name, traitValue, topFreq, otherFreq, lift, importance);
        }

        await client.query(
          `INSERT INTO icp_traits (
             user_id, trait_category, trait_name, trait_value,
             top20_frequency, others_frequency, lift, importance_score
           ) VALUES ${values.join(', ')}`,
          params
        );

        return res.rows.length;
      };

      // Build user filter for JOINs
      const cmUserJoin = userId ? 'AND cm.user_id = $1' : '';
      const cUserJoin = userId ? 'AND c.user_id = cm.user_id' : '';
      const oUserJoin = userId ? 'AND o.user_id = cm.user_id' : '';
      const olUserJoin = userId ? 'AND ol.user_id = cm.user_id' : '';

      const insertedIndustry = await insertFrom({
        category: 'firmographic',
        name: 'industry',
        sql: `
          WITH base AS (
            SELECT cm.is_top_20, c.industry AS trait_value
            FROM customer_metrics cm
            JOIN customers c ON c.customer_id = cm.customer_id ${cUserJoin}
            WHERE c.industry IS NOT NULL AND c.industry <> '' ${cmUserJoin}
          )
          SELECT trait_value,
                 COUNT(*) FILTER (WHERE is_top_20 = true)  AS top20_count,
                 COUNT(*) FILTER (WHERE is_top_20 = false) AS others_count
          FROM base
          GROUP BY trait_value
          ORDER BY top20_count DESC
          LIMIT 50
        `,
      });

      const insertedState = await insertFrom({
        category: 'geo',
        name: 'state',
        sql: `
          WITH base AS (
            SELECT cm.is_top_20, c.state AS trait_value
            FROM customer_metrics cm
            JOIN customers c ON c.customer_id = cm.customer_id ${cUserJoin}
            WHERE c.state IS NOT NULL AND c.state <> '' ${cmUserJoin}
          )
          SELECT trait_value,
                 COUNT(*) FILTER (WHERE is_top_20 = true)  AS top20_count,
                 COUNT(*) FILTER (WHERE is_top_20 = false) AS others_count
          FROM base
          GROUP BY trait_value
          ORDER BY top20_count DESC
          LIMIT 50
        `,
      });

      const insertedNaics = await insertFrom({
        category: 'firmographic',
        name: 'naics',
        sql: `
          WITH base AS (
            SELECT cm.is_top_20, c.naics AS trait_value
            FROM customer_metrics cm
            JOIN customers c ON c.customer_id = cm.customer_id ${cUserJoin}
            WHERE c.naics IS NOT NULL AND c.naics <> '' ${cmUserJoin}
          )
          SELECT trait_value,
                 COUNT(*) FILTER (WHERE is_top_20 = true)  AS top20_count,
                 COUNT(*) FILTER (WHERE is_top_20 = false) AS others_count
          FROM base
          GROUP BY trait_value
          ORDER BY top20_count DESC
          LIMIT 50
        `,
      });

      const insertedProductCategory = await insertFrom({
        category: 'behavior',
        name: 'product_category',
        sql: `
          -- IMPORTANT: count distinct customers per category (not order lines)
          -- so frequencies stay within 0-100% of customers.
          WITH base AS (
            SELECT DISTINCT
              cm.is_top_20,
              cm.customer_id,
              ol.product_category AS trait_value
            FROM customer_metrics cm
            JOIN orders o ON o.customer_id = cm.customer_id ${oUserJoin}
            JOIN order_lines ol ON ol.order_id = o.order_id ${olUserJoin}
            WHERE ol.product_category IS NOT NULL AND ol.product_category <> '' ${cmUserJoin}
          )
          SELECT trait_value,
                 COUNT(*) FILTER (WHERE is_top_20 = true)  AS top20_count,
                 COUNT(*) FILTER (WHERE is_top_20 = false) AS others_count
          FROM base
          GROUP BY trait_value
          ORDER BY top20_count DESC
          LIMIT 50
        `,
      });

      await client.query('COMMIT');

      const inserted = insertedIndustry + insertedState + insertedNaics + insertedProductCategory;

      await auditLogService.log({
        actor,
        action: 'icp_traits.calculated',
        entityType: 'icp_traits',
        details: { inserted, userId },
      });

      return {
        inserted,
        breakdown: {
          industry: insertedIndustry,
          state: insertedState,
          naics: insertedNaics,
          product_category: insertedProductCategory,
        },
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async listTraits({ category, name, limit = 50, userId = null }) {
    // If no userId, return empty - require login for data access
    if (!userId) {
      return [];
    }
    
    const params = [];
    const where = ['user_id = $1'];
    params.push(userId);
    
    if (category) {
      params.push(category);
      where.push(`trait_category = $${params.length}`);
    }
    if (name) {
      params.push(name);
      where.push(`trait_name = $${params.length}`);
    }
    params.push(limit);
    const whereSql = `WHERE ${where.join(' AND ')}`;

    const res = await pool.query(
      `SELECT * FROM icp_traits
       ${whereSql}
       ORDER BY importance_score DESC NULLS LAST, lift DESC NULLS LAST
       LIMIT $${params.length}`,
      params
    );
    return res.rows;
  }

  async summary(userId = null) {
    // If no userId, return empty summary - require login for data access
    if (!userId) {
      return {
        industries: [],
        states: [],
        naics: [],
        productCategories: [],
      };
    }
    
    // Build a compact 1-page summary payload for UI/export.
    const topIndustry = await this.listTraits({ name: 'industry', limit: 10, userId });
    const topStates = await this.listTraits({ name: 'state', limit: 10, userId });
    const topNaics = await this.listTraits({ name: 'naics', limit: 10, userId });
    const topProduct = await this.listTraits({ name: 'product_category', limit: 10, userId });

    return {
      industries: topIndustry,
      states: topStates,
      naics: topNaics,
      productCategories: topProduct,
    };
  }
}

module.exports = new ICPTraitsService();
