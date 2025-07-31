export const jwtConstants = {
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || '',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || '',
  accessTokenExpiresIn: '1h', // Short-lived access token
  refreshTokenExpiresIn: '7d', // Longer-lived refresh token
};
