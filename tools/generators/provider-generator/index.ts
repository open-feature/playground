import {
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  joinPathFragments,
  logger,
  names,
  readJson,
  readProjectConfiguration,
  Tree,
  updateJson,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/node';
import { join } from 'path';

interface NewProviderSchemaOptions {
  name: string;
}

export default async function (tree: Tree, schema: NewProviderSchemaOptions) {
  const { className, fileName } = names(schema.name);
  const libClassName = `${className}Provider`;
  const targetName = `${fileName}-demo`;
  const libName = `js-${fileName}-provider`;
  const { libsDir } = getWorkspaceLayout(tree);
  const projectRoot = joinPathFragments(libsDir, libName);
  const projectLibDir = joinPathFragments(projectRoot, 'src', 'lib');

  /**
   * Use the OOTB NX TypeScript library generator
   */
  await libraryGenerator(tree, {
    name: libName,
    compiler: 'tsc',
    buildable: true,
    js: false,
    strict: true,
  });

  /**
   * Change the build mode to webpack
   */
  const currentConfig = readProjectConfiguration(tree, libName);
  if (currentConfig.targets) {
    currentConfig.targets.build = {
      executor: '@nrwl/node:webpack',
      outputs: ['{options.outputPath}'],
      options: {
        outputPath: `dist/packages/${libName}`,
        main: `packages/${libName}/src/index.ts`,
        tsConfig: `packages/${libName}/tsconfig.lib.json`,
      },
      configurations: {
        production: {
          optimization: true,
          extractLicenses: true,
          inspect: false,
        },
      },
    };
  }
  updateProjectConfiguration(tree, libName, currentConfig);

  /**
   * Refactors the files
   */
  ['spec.ts', 'ts'].forEach((suffix) => {
    tree.rename(
      joinPathFragments(projectLibDir, `${libName}.${suffix}`),
      joinPathFragments(projectLibDir, `${fileName}.${suffix}`)
    );
  });

  /**
   * Adding provider code
   */
  generateFiles(tree, join(__dirname, 'files', 'provider'), projectRoot, {
    name: schema.name,
    fileName,
    libClassName,
    tmpl: '',
  });

  /**
   * Adding demo script
   */
  generateFiles(tree, join(__dirname, 'files', 'script'), 'scripts', {
    name: schema.name,
    fileName,
    libClassName,
    libName,
    tmpl: '',
  });

  /**
   * Update the API project
   */
  const apiProjectConfig = readProjectConfiguration(tree, 'api');
  apiProjectConfig.targets![targetName] = {
    executor: '@nrwl/node:node',
    dependsOn: [
      {
        target: 'build',
        projects: 'dependencies',
      },
    ],
    options: {
      buildTarget: 'api:build',
      runtimeArgs: [
        '-r',
        './scripts/tracing.js',
        '-r',
        `./scripts/${targetName}.js`,
      ],
    },
  };
  apiProjectConfig.implicitDependencies?.push(libName);
  updateProjectConfiguration(tree, 'api', apiProjectConfig);

  /**
   * Update the package.json
   */
  const packageJson = readJson<{ scripts: Record<string, string> }>(
    tree,
    'package.json'
  );
  packageJson.scripts[targetName] = `nx run api:${targetName}`;
  updateJson(tree, 'package.json', () => packageJson);

  // Run prettier on all the files we modified
  await formatFiles(tree);

  return () => {
    logger.info('');
    logger.info('🎉 Success 🎉');
    logger.info('');
    logger.info('Next steps:');
    logger.info(
      ` * Update the provider class: ${joinPathFragments(
        projectLibDir,
        fileName
      )}.ts`
    );
    logger.info(` * Start the app: npm run ${targetName}`);
  };
}
