import Dexie from 'dexie';
/**
 * Initialize the database connection and setup the tables
 */
const db = new Dexie('CourseMngr');
db.version(1).stores({ course: '++id' });
db.version(1).stores({ weights: '++id' });

export default db;
