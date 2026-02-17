import { sequelize } from '../src/config/database';

async function fixEnum() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        // We need to add the new values to the enum type
        // In Postgres, you can't easily remove values from an enum, but you can add them.
        // The type name is likely 'enum_services_status'

        const [results] = await sequelize.query("SELECT n.nspname as schema, t.typname as type FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid JOIN pg_namespace n ON n.oid = t.typnamespace GROUP BY n.nspname, t.typname;");
        console.log('Available enums:', results);

        // Try adding the new values if they don't exist
        await sequelize.query("ALTER TYPE \"enum_services_status\" ADD VALUE IF NOT EXISTS 'completed'");
        await sequelize.query("ALTER TYPE \"enum_services_status\" ADD VALUE IF NOT EXISTS 'ongoing'");

        // Update existing records
        await sequelize.query("UPDATE services SET status = 'ongoing' WHERE status = 'draft'");
        await sequelize.query("UPDATE services SET status = 'completed' WHERE status = 'published'");

        console.log('Enum and data fixed successfully');
    } catch (error) {
        console.error('Error fixing enum:', error);
    } finally {
        await sequelize.close();
    }
}

fixEnum();
