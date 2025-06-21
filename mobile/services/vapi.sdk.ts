// Make sure the file './vapi.ts' exists in the same directory, or update the path below if it's located elsewhere.
// Update the path below if 'vapi.ts' is located elsewhere, or create 'vapi.ts' in the same directory.

const vapi = new Vapi(process.env.VAPI_PUBLIC_KEY || '');

export default vapi;