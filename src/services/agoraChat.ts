import AC from 'agora-chat';

export const appKey = '411147604#1333335';

export const connection = new AC.connection({
  appKey: appKey,
  isFixedDeviceId:false
});

export const loginUserAgora = async (username: string, token: string) => {
  try {
    await connection.open({
      user: username,
      accessToken: token,
    });
    console.log('Login successful');
  } catch (error) {
    console.error('Login failed', error);
  }
};

export default connection;
