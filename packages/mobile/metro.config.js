const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Let Metro know where to resolve packages from (including pnpm's .pnpm folder)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Enable symlinks for pnpm
config.resolver.unstable_enableSymlinks = true;

// Handle ESM-only packages (like @pinepomo/core)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
