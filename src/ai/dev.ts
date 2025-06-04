import { config } from 'dotenv';
config();

import '@/ai/flows/predict-potential-health-concerns.ts';
import '@/ai/flows/analyze-image-for-disabilities.ts';