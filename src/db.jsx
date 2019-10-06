import Dexie from 'dexie';

const db = new Dexie('CourseMngr');
db.version(1).stores({ course: '++id' });

export default db;
