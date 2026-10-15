import { runNetlifyHandler } from '../_netlify-adapter.js';
import { handler } from '../../netlify/functions/get-data.js';

export function onRequest(context) {
  return runNetlifyHandler(context.request, handler);
}
