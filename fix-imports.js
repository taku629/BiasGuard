const fs = require('fs');
const files = [
  'src/app/_layout.tsx',
  'src/app/(auth)/login.tsx',
  'src/app/(auth)/signup.tsx',
  'src/app/(app)/_layout.tsx',
  'src/app/(app)/index.tsx',
  'src/app/(app)/portfolio/new.tsx',
  'src/app/(app)/portfolio/[portfolioId].tsx',
  'src/app/(app)/portfolio/[portfolioId]/holding/new.tsx',
  'src/app/(app)/portfolio/[portfolioId]/holding/[holdingId].tsx'
];
files.forEach(file => {
  const path = '/home/tk250127/BiasGuard/' + file;
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/from '\.\.\/\.\.\/\.\.\/\.\.\/\.\.\//g, "from '@/");
  content = content.replace(/from '\.\.\/\.\.\/\.\.\/\.\.\//g, "from '@/");
  content = content.replace(/from '\.\.\/\.\.\/\.\.\//g, "from '@/");
  content = content.replace(/from '\.\.\/\.\.\//g, "from '@/");
  content = content.replace(/from '\.\.\//g, "from '@/");
  fs.writeFileSync(path, content);
});
