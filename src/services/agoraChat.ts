export const appKey = '411147604#1333335';

let connection: any = null;

if (typeof window !== 'undefined') {
  // Dynamic import in browser only
  import('./agoraChat.browser').then((module) => {
    connection = module.connection;
  });
}

export { connection };