// backend/src/services/staleTaskService.js
import pool from '../config/db.js';

/**
 * Check and update stale status for all tasks
 * Stale logic:
 * - IGNORE: 3+ days since last update
 * - STALE: 6+ days since last update
 * - ABANDONED: 9+ days since last update
 */
export const updateStaleTaskStatuses = async () => {
  try {
    console.log('[Stale Task Checker] Running stale task check...');
    
    const now = new Date();
    
    // Query to update stale statuses based on last_updated timestamp
    const updateQuery = `
      UPDATE tasks
      SET stale_status = CASE
        WHEN last_updated < NOW() - INTERVAL '9 days' 
          AND status NOT IN ('4. Done (Approved)', 'Not Applicable')
          THEN 'ABANDONED'
        WHEN last_updated < NOW() - INTERVAL '6 days' 
          AND status NOT IN ('4. Done (Approved)', 'Not Applicable')
          THEN 'STALE'
        WHEN last_updated < NOW() - INTERVAL '3 days' 
          AND status NOT IN ('4. Done (Approved)', 'Not Applicable')
          THEN 'IGNORE'
        ELSE NULL
      END,
      updated_at = CURRENT_TIMESTAMP
      WHERE is_active = true
        AND status NOT IN ('4. Done (Approved)', 'Not Applicable')
    `;
    
    const result = await pool.query(updateQuery);
    
    // Get counts for logging
    const countsQuery = `
      SELECT 
        stale_status,
        COUNT(*) as count
      FROM tasks
      WHERE is_active = true 
        AND stale_status IS NOT NULL
      GROUP BY stale_status
    `;
    
    const countsResult = await pool.query(countsQuery);
    
    console.log('[Stale Task Checker] Update complete:');
    console.log(`  - Rows affected: ${result.rowCount}`);
    countsResult.rows.forEach(row => {
      console.log(`  - ${row.stale_status}: ${row.count} tasks`);
    });
    
    return {
      success: true,
      rowsAffected: result.rowCount,
      counts: countsResult.rows
    };
  } catch (err) {
    console.error('[Stale Task Checker] Error updating stale statuses:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

/**
 * Get stale task statistics
 */
export const getStaleTaskStats = async () => {
  try {
    const query = `
      SELECT 
        stale_status,
        COUNT(*) as count,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'task_id', task_id,
            'task_name', task_name,
            'last_updated', last_updated,
            'project_id', project_id
          )
        ) as tasks
      FROM tasks
      WHERE is_active = true 
        AND stale_status IS NOT NULL
      GROUP BY stale_status
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error('[Stale Task Checker] Error getting stats:', err);
    return [];
  }
};