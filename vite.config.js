/* eslint-env node */
import { presetWarp } from '@warp-ds/uno'
import uno from 'unocss/vite'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html';
import path from 'path';
import glob from 'glob';
import { classes } from '@warp-ds/css/component-classes/classes';
import { MinifyWarpLib } from './.minifier-plugin.js'

let reset;
async function getReset() {
  if (reset) return reset;
  else {
    reset = (await fetch('https://assets.finn.no/pkg/@warp-ds/css/1.0.0-alpha.37/resets.css')).text();
    return reset;
  }
}

export default ({ mode }) => {
  let input = {};

  const dirname = path.dirname(new URL(import.meta.url).pathname);

  const isProduction = mode === 'production';

  // For production we need to specify all our entry points
  // See https://vitejs.dev/guide/build.html#multi-page-app
  if (isProduction) {
    input.main = path.resolve(dirname, 'index.html');

    const componentPages = glob.sync('pages/components/**/*.html', {
      absolute: true,
    });
    const pages = glob.sync('pages/*.html', {
      absolute: true,
    });

    for (const page of pages.concat(componentPages)) {
      const fileName = path.parse(page).name;

      input[fileName] = page;
    }
  }

  const injectOptions = {
    ejsOptions: {
      views: ['pages/includes'],
    },
  };

  function getLibOpts(fileName) {
    return {
      sourcemap: true,
      lib: {
        formats: ['es'],
        entry: './index.js',
        fileName
      },
    }
  }
  
  function getBuildOpts(mode) {
    if (mode === 'production') return defineConfig({
      build: { target: 'esnext', emptyOutDir: false,}
    })
    if (mode === 'lib') return defineConfig({
      build: {
        emptyOutDir: false,
        lib: {
          formats: ['es'],
          entry: './index.js',
          fileName: 'index'
        },
        rollupOptions: { external: ['elements'] }
      }
    })
  }
  
  return {
    // base: isProduction ? '/elements/' : '',
    plugins: [
      uno({
        presets: [presetWarp({ skipResets: true })],
        preflights: [{
          layer: 'preflights',
          getCSS: getReset,
        }],
        mode: 'shadow-dom',
        safelist: classes,
      }),
      uno({
        presets: [presetWarp({ skipResets: true })],
        preflights: [{
          layer: 'preflights',
          getCSS: getReset,
        }],
      }),
      // litElementTailwindPlugin({ mode }),
      mode !== 'lib' && createHtmlPlugin({
        minify: false,
        pages: [
          {
            filename: 'button.html',
            template: 'pages/components/button.html',
            injectOptions,
          },
          {
            filename: 'alert.html',
            template: 'pages/components/alert.html',
            injectOptions,
          },
          {
            filename: 'select.html',
            template: 'pages/components/select.html',
            injectOptions,
          },
          {
            filename: 'attention.html',
            template: 'pages/components/attention.html',
            injectOptions,
          },
          {
            filename: 'box.html',
            template: 'pages/components/box.html',
            injectOptions,
          },
          {
            filename: 'breadcrumbs.html',
            template: 'pages/components/breadcrumbs.html',
            injectOptions,
          },
          {
            filename: 'broadcast.html',
            template: 'pages/components/broadcast.html',
            injectOptions,
          },
          {
            filename: 'card.html',
            template: 'pages/components/card.html',
            injectOptions,
          },
          {
            filename: 'toast.html',
            template: 'pages/components/toast.html',
            injectOptions,
          },
          {
            filename: 'textfield.html',
            template: 'pages/components/textfield.html',
            injectOptions,
          },
          {
            filename: 'expandable.html',
            template: 'pages/components/expandable.html',
            injectOptions,
          },
          {
            filename: 'index.html',
            template: 'index.html',
            injectOptions,
          },
        ],
      }),
      isProduction && basePathFix(),
      MinifyWarpLib(),
    ],
    ...getBuildOpts(mode),
  };
};

// Tiny plugin to to use Tailwind classes with lit-element
// See postcss.config.js
// function litElementTailwindPlugin({ mode }) {
//     // FIXME: This is to simple a check... if we start adding utility files etc that we import in our web components we'll process them as well
//     function shouldProcess(id) {
//         // try to match all JS files that follows this pattern ./packages/*/src/*.js
//         return id.match(/(.*)\/packages\/(.*)\/src\/(.*).js$/);
//         // return !id.includes('node_modules') && id.endsWith('.js');
//     }

//     return {
//         name: 'lit-element-tailwind-plugin',
//         async transform(code, id) {
//             if (shouldProcess(id)) {
//                 // postcss context
//                 const context = {
//                     env: mode,
//                     file: {
//                         extname: path.extname(id),
//                         dirname: path.dirname(id),
//                         basename: path.basename(id),
//                     },
//                 };

//                 const result = await postcss(
//                     require('./postcss.config')(context).plugins,
//                 ).process(code, {
//                     from: undefined,
//                     syntax: cssInJS,
//                 });

//                 return {
//                     code: result.css,
//                 };
//             }
//         },
//     };
// }
function basePathFix() {
  return {
    name: 'base-path-fix',
    transformIndexHtml(html) {
      // Replace pages/components with '' for production build.
      return html.replace(/pages\/components\//g, '');
    },
  };
}
