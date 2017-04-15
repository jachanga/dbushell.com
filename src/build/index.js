'use strict';

import path from 'path';
import chalk from 'chalk';
import {argv} from 'yargs';
import packageJson from '../../package';
import blogJson from '../data/pages';
import portfolioJson from '../data/portfolio';
import buildBlog from './tasks/blog';
import buildFeeds from './tasks/feeds';
import buildPortfolio from './tasks/portfolio';
import buildPages, {
  buildHome,
  buildPatterns,
  buildContact
} from './tasks/pages';

const absPath = str => path.join(process.cwd(), str);

// Gefault context for Handlebars templates and Page component props
global.DBUSHELL = {
  __dest: absPath('/dbushell.github.io'),
  __blogData: absPath('/src/data/blog'),
  __pageData: absPath('/src/data/pages'),
  __portfolioData: absPath('/src/data/portfolio'),
  __blogDefaults: absPath('/src/components/blog/defaults.json'),
  __pageJson: blogJson,
  __portfolioJson: portfolioJson,
  siteVer: packageJson.version,
  siteProtocol: 'https:',
  siteRoot: 'dbushell.com',
  siteName: 'David Bushell – Web Design (UK)',
  siteDesc: 'David Bushell make websites. I help small businesses, start-ups, individuals, and fellow web agencies make the most of their web presence.',
  pageCSS: '/assets/css/main.post.css',
  pagePath: '/',
  pageHeading: '',
  pageTemplate: 'index'
};

global.DBUSHELL.__pageJson.pages.forEach(props => {
  props.__src = path.join(
    global.DBUSHELL.__pageData,
    props.pagePath.replace(/\/$/, '.md')
  );
});

global.DBUSHELL.__portfolioJson.pages.forEach(props => {
  const match = props.pagePath.match(/[\w-]+\/([\w-]+)\/$/);
  props.__src = path.join(global.DBUSHELL.__portfolioData, `${match[1]}.md`);
});

// Bit of console flair
export const logo = `
      _ _               _          _ _
   __| | |__  _   _ ___| |__   ___| | |
  / _\` | '_ \\| | | / __| '_ \\ / _ \\ | |
 | (_| | |_) | |_| \\__ \\ | | |  __/ | |
  \\__,_|_.__/ \\__,_|___/_| |_|\\___|_|_|
`;

/**
 * Build process.
 */
export async function build() {
  process.stdout.write(chalk.yellow(logo) + '\n');
  const flags = [
    'all',
    'blog',
    'contact',
    'feeds',
    'home',
    'pages',
    'portfolio',
    'patterns'
  ];
  if (!flags.reduce((a, b) => a || (argv[b] ? b : 0), 0)) {
    process.stdout.write(chalk.bold('$ npm run build -- [--flag]\n'));
    process.stdout.write(`Available flags: ${flags.join(', ')}\n`);
    return;
  }
  // Write blog pages
  if (argv.blog || argv.all) {
    await buildBlog().catch(err => {
      process.stderr.write(chalk.red(err) + '\n');
    });
  }
  // Write portfolio pages
  if (argv.portfolio || argv.all) {
    await buildPortfolio();
  }
  // Write pages
  if (argv.pages || argv.all) {
    await buildPages();
  }
  // Write contact page
  if (argv.contact || argv.all) {
    await buildContact();
  }
  // Write pattern library
  if (argv.patterns || argv.all) {
    await buildPatterns();
  }
  // Write home page
  if (argv.home || argv.all) {
    await buildHome();
  }
  // Write RSS and Sitemap XML
  if (argv.feeds || argv.all) {
    await buildFeeds();
  }
  // Complete!
  process.stdout.write(chalk.bold.yellow('Build complete 👌') + '\n');
}
