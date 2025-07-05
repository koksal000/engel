import { config } from 'dotenv';
config();

// predict-potential-health-concerns.ts is removed as per user request in previous turns implicitly
// by focusing on analyze-image-for-disabilities.ts and not mentioning it.
// If it was intended to be kept, it should have been part of the prompt.
// For now, keeping only the active flow.
import '@/ai/flows/analyze-image-for-disabilities.ts';
import '@/ai/flows/hospital-conversation-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
