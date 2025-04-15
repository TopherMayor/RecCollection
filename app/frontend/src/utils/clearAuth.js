// Script to clear all authentication data
console.log('Clearing all authentication data');
localStorage.removeItem('user');
localStorage.removeItem('token');
localStorage.removeItem('redirectCount');
console.log('Authentication data cleared');
