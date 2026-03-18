import mongoose from 'mongoose';
import User from '../models/user.js';
import { MONGODB_URI } from '../config.js';

(async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for timestamp backfill');

        const users = await User.find(
            {
                $or: [
                    { updatedAt: { $exists: false } },
                    { createdAt: { $exists: false } },
                ],
            },
            { _id: 1, createdAt: 1, updatedAt: 1 }
        ).lean();
        console.log(`Found ${users.length} users needing timestamps`);

        const now = new Date();
        const operations = [];

        for (const u of users) {
            const nextUpdatedAt = u.updatedAt || u.createdAt || now;
            const nextCreatedAt = u.createdAt || u.updatedAt || now;

            operations.push({
                updateOne: {
                    filter: { _id: u._id },
                    update: {
                        $set: {
                            updatedAt: nextUpdatedAt,
                            createdAt: nextCreatedAt,
                        },
                    },
                },
            });
        }

        if (operations.length > 0) {
            await User.bulkWrite(operations);
        }

        console.log('Backfill complete');
    } catch (err) {
        console.error('Backfill error', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
})();
