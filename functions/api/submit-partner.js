import { runNetlifyHandler } from '../_netlify-adapter.js';
import { handler } from '../../netlify/functions/submit-partner.js';

export function onRequest(context) {
  return runNetlifyHandler(context.request, handler);
}
