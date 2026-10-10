import express from 'express';
import cookieParser from 'cookie-parser';
import { RESPONSE_MESSAGE } from '@/shared/constants/response-message.enum.js';
import { errorHandler } from '@/middleware/error-handler.js';
import { notFoundHandler } from '@/middleware/not-found.js';
import { successResponse } from '@/shared/types/api-response.js';
import authRoutes from '@/routes/auth.routes.js';
import organizationRoutes from '@/routes/organization.routes.js';
import morgan  from 'morgan';

export const app = express();

app.disable('x-powered-by');
app.use(express.json());
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_request, response) => {
  response.json(successResponse(RESPONSE_MESSAGE.HEALTH_CHECK_SUCCESS, { status: 'ok' }));
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/organization', organizationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
