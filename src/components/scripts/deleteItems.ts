// Script to delete items with status 'not_claimed' and updated_at older than 30 days
import { createClient } from '../../supabase/clients/client';

async function deleteOldNotClaimedItems() {
    const supabase = createClient();
    // Calculate ISO string for 30 days ago in UTC+8 (Philippines time)
    const now = new Date();
    // Get UTC+8 offset in ms
    const phOffsetMs = 8 * 60 * 60 * 1000;
    // Convert now to PH time
    const nowPH = new Date(now.getTime() + phOffsetMs);
    // Subtract 30 days in ms
    const thirtyDaysAgoPH = new Date(nowPH.getTime() - 30 * 24 * 60 * 60 * 1000);
    // Convert back to UTC for DB comparison
    const thirtyDaysAgoUTC = new Date(thirtyDaysAgoPH.getTime() - phOffsetMs).toISOString();

    // Delete items with status 'not_claimed' and updated_at older than 30 days (PH time)
    const { data, error } = await supabase
        .from('items')
        .delete()
        .match({ status: 'not_claimed' })
        .lt('updated_at', thirtyDaysAgoUTC);

    if (error) {
        console.error('Error deleting old not_claimed items:', error);
    } else {
        console.log('Deleted items:', data);
    }
}

// Run the script if called directly
if (require.main === module) {
    deleteOldNotClaimedItems().then(() => process.exit());
}
