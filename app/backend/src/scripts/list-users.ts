import { db, schema } from '../db';
import 'dotenv/config';

async function listUsers() {
  try {
    console.log('Fetching all users from the database...');
    
    // Query all users
    const users = await db.query.users.findMany({
      columns: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: (users, { asc }) => [asc(users.id)],
    });
    
    console.log('\n===== USERS IN DATABASE =====');
    console.log('Total users:', users.length);
    console.log('----------------------------');
    
    // Display each user
    users.forEach((user, index) => {
      console.log(`User #${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Display Name: ${user.displayName || 'N/A'}`);
      console.log(`  Bio: ${user.bio || 'N/A'}`);
      console.log(`  Created: ${user.createdAt.toLocaleString()}`);
      console.log(`  Last Login: ${user.lastLogin ? user.lastLogin.toLocaleString() : 'Never'}`);
      console.log('----------------------------');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error fetching users:', error);
    process.exit(1);
  }
}

// Run the function
listUsers();
