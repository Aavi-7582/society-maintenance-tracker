import dotenv from 'dotenv';
dotenv.config();

export const OVERDUE_DAYS = parseInt(process.env.OVERDUE_DAYS) || 5;