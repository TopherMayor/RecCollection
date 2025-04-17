import { db, schema } from '../db';
import { hashPassword } from '../utils/auth';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function updateAdminUser() {
  try {
    console.log('Updating admin user information...');
    
    // Hash the new password
    const passwordHash = await hashPassword('Dec202011');
    
    // Update the admin user (ID 1)
    const result = await db.update(schema.users)
      .set({
        username: 'TopherMayor',
        email: 'toph.homelab@gmail.com',
        passwordHash,
        displayName: 'Christopher Mayor',
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, 1))
      .returning();
    
    if (result.length === 0) {
      console.error('Error: Admin user not found');
      process.exit(1);
    }
    
    console.log('\n✅ Admin user updated successfully!');
    console.log('----------------------------');
    console.log('Updated user details:');
    console.log(`  ID: ${result[0].id}`);
    console.log(`  Username: ${result[0].username}`);
    console.log(`  Email: ${result[0].email}`);
    console.log(`  Display Name: ${result[0].displayName}`);
    console.log('----------------------------');
    console.log('You can now log in with:');
    console.log('  Email: toph.homelab@gmail.com');
    console.log('  Password: Dec202011');
    console.log('----------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin user:', error);
    process.exit(1);
  }
}

// Run the function
updateAdminUser();
