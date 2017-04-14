'use strict';

import path from 'path';
import chalk from 'chalk';
import React from 'react';
import fs from 'fs-extra';
import Handlebars from 'handlebars';
import merge from 'lodash.merge';
import cloneDeep from 'lodash.clonedeep';
import {removePrivateProps} from './utils';

export const updateFlag = chalk.cyan(`Updated:    `);
export const publishFlag = chalk.green(`Published:  `);

const inline = [];
const templates = {};
const templateDir = path.join(process.cwd(), 'src/templates');
const partialDir = path.join(templateDir, 'partials');

/**
 * Read Handlebars template sources.
 */
fs.readdirSync(templateDir).forEach(fileName => {
  const filePath = path.join(templateDir, fileName);
  if (!fs.statSync(filePath).isFile()) {
    return;
  }
  templates[fileName.split('.')[0]] = Handlebars.compile(
    fs.readFileSync(filePath).toString()
  );
});

/**
 * Register Handlebars partials.
 */
fs.readdirSync(partialDir).forEach(fileName => {
  const filePath = path.join(partialDir, fileName);
  if (!fs.statSync(filePath).isFile()) {
    return;
  }
  Handlebars.registerPartial(
    fileName.split('.')[0],
    fs.readFileSync(filePath).toString()
  );
});

/**
 * Output inline assets from build dest.
 */
Handlebars.registerHelper('inlineAsset', href => {
  if (typeof inline[href] !== 'string') {
    try {
      inline[href] = fs.readFileSync(
        path.join(global.DBUSHELL.__dest, href),
        'utf8'
      );
      inline[href] = inline[href].replace(
        /{{[\s]*siteVer[\s]*}}/g,
        global.DBUSHELL.siteVer
      );
    } catch (err) {
      inline[href] = '';
    }
  }
  return new Handlebars.SafeString(inline[href]);
});

/**
 * Get full URL with domain and protocol.
 */
Handlebars.registerHelper('siteURL', (url, context) => {
  const {siteRoot, siteProtocol} = context.data.root;
  if (typeof url !== 'string') {
    return `${siteProtocol}//${siteRoot}/`;
  }
  if (url.length > 0 && url.lastIndexOf('.') === -1) {
    url += '/';
  }
  return `${siteProtocol}//${path.join(siteRoot, url)}`;
});

/**
 * Render Handlebars template with context data.
 */
function renderHandlebars(context) {
  context = merge(cloneDeep(global.DBUSHELL), context || {});
  removePrivateProps(context);
  const template = templates[context.pageTemplate];
  const html = template(context);
  return html;
}

/**
 * Filter props passed to the page container before publishing.
 */
function filterPageProps(props) {
  removePrivateProps(props);
  props.pageTitle = props.pageHeading;
  if (props.pagePath !== '/') {
    props.pageTitle = `${props.pageHeading} – ${global.DBUSHELL.siteName}`;
  }
}

/**
 * Write Handlebars template with React elements in body.
 */
export function publish(type, props) {
  filterPageProps(props);
  return new Promise((resolve, reject) => {
    try {
      if (/^(Article|Archive)/.test(type.displayName) === false) {
        process.stdout.write(`${publishFlag}${props.pagePath}\n`);
      }
      const body = type.renderBody(React.createElement(type, props));
      const html = renderHandlebars({...props, body});
      const filePath = path.join(
        global.DBUSHELL.__dest,
        props.pagePath,
        'index.html'
      );
      const apiPath = path.join(
        global.DBUSHELL.__dest,
        '/api/',
        props.pagePath,
        '/props.json'
      );
      fs.outputFileSync(filePath, html);
      fs.outputFileSync(apiPath, JSON.stringify(props, null, 2));
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
