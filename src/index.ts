import 'services/configure-dotenv';

import { setupAutohookServer } from './server';

console.clear();

await setupAutohookServer();
