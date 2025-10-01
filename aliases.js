const path = require('path');

module.exports = {
  '@src/*': path.resolve(__dirname, 'src'),
  '@api/*': path.resolve(__dirname, 'src/api'),
  '@app/*': path.resolve(__dirname, 'src/app'),
  '@assets/*': path.resolve(__dirname, 'src/assets'),
  '@config/*': path.resolve(__dirname, 'src/config'),
  '@constants/*': path.resolve(__dirname, 'src/constants'),
  "@features": path.resolve(__dirname, "./src/features"),
  "@fonts": path.resolve(__dirname, "./src/fonts"),
  "@models": path.resolve(__dirname, "./src/models"),
  "@pages": path.resolve(__dirname, "./src/pages"),
  "@routes": path.resolve(__dirname, "./src/routes"),
  '@shared/*': path.resolve(__dirname, 'src/shared'),
  '@store/*': path.resolve(__dirname, 'src/store'),
  '@utils/*': path.resolve(__dirname, 'src/utils'),
  "@widgets": path.resolve(__dirname, "./src/widgets"),
};
