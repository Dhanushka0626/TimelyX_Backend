import express from "express";
import { requireHOD, requireLecturerOrHOD } from "../middlewares/roleMiddleware.js";
import * as hodController from "../controllers/hodController.js";

const hodRouter = express.Router();

hodRouter.get('/dashboard', requireHOD, hodController.getDashboard);
hodRouter.get('/pending', requireHOD, hodController.getPending);
// list requests by status (pending/approved/rejected/all) scoped to lecturers (and department)
hodRouter.get('/requests', requireHOD, hodController.getRequests);
hodRouter.put('/request/:id', requireHOD, hodController.updateRequest);
hodRouter.get('/history', requireHOD, hodController.getHistory);
// HOD notices: list and create
hodRouter.get('/notices', requireHOD, hodController.getNotices);
hodRouter.post('/notices', requireHOD, hodController.createNotice);
hodRouter.put('/notices/:id', requireHOD, hodController.updateNotice);
hodRouter.delete('/notices/:id', requireHOD, hodController.deleteNotice);
// allow both HOD and Lecturer to create range bookings via this endpoint
hodRouter.post('/book-hall', requireLecturerOrHOD, hodController.bookHall);
hodRouter.post('/decision-notification', requireHOD, hodController.decisionNotification);

export default hodRouter;
