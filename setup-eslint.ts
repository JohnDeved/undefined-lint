#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { execSync } from 'child_process'

const ESLINT_CONFIG_FILES = [
  '.eslintrc',
  '.eslintrc.json',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.yaml',
  '.eslintrc.yml',
  'eslint.config.js',
  'eslint.json',
]

// List of ESLint-related packages to check/uninstall
const ESLINT_PACKAGES = [
  'eslint',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'eslint-config-standard-with-typescript',
  'eslint-plugin-import',
  'eslint-plugin-node',
  'eslint-plugin-promise',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'eslint-plugin-tailwindcss',
  '@eslint/js',
  'eslint-plugin-react-refresh',
  'typescript-eslint',
]

function prompt (question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(`${question} (y/N): `, answer => {
      rl.close()
      resolve(/^y(es)?$/i.test(answer.trim()))
    })
  })
}

async function main () {
  // 1. Check for existing ESLint config files
  const foundConfigs = ESLINT_CONFIG_FILES.filter(f => fs.existsSync(path.resolve(process.cwd(), f)))
  if (foundConfigs.length) {
    console.log('Found existing ESLint config files:', foundConfigs.join(', '))
    const shouldRemove = await prompt('Remove them before continuing?')
    if (shouldRemove) {
      for (const f of foundConfigs) {
        fs.rmSync(path.resolve(process.cwd(), f))
        console.log('Removed', f)
      }
    } else {
      console.log('Aborting setup.')
      process.exit(1)
    }
  }

  // 2. Check for installed ESLint-related packages
  let installedPackages: string[] = []
  try {
    const pkgJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'))
    const allDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies }
    installedPackages = ESLINT_PACKAGES.filter(pkg => allDeps?.[pkg])
  } catch {}

  if (installedPackages.length) {
    console.log('Found installed ESLint-related packages:', installedPackages.join(', '))
    const shouldUninstall = await prompt('Uninstall them before continuing?')
    if (shouldUninstall) {
      try {
        execSync(`npm uninstall ${installedPackages.join(' ')}`, { stdio: 'inherit' })
        console.log('Uninstalled:', installedPackages.join(', '))
      } catch (e) {
        console.error('Failed to uninstall some packages. Please check manually.')
        process.exit(1)
      }
    } else {
      console.log('Aborting setup.')
      process.exit(1)
    }
  }

  // 3. Install undefined-lint
  console.log('Installing JohnDeved/undefined-lint...')
  execSync('npm i JohnDeved/undefined-lint', { stdio: 'inherit' })

  // 4. Create .eslintrc if not present, with smart parserOptions.project
  const eslintrcPath = path.resolve(process.cwd(), '.eslintrc')
  if (!fs.existsSync(eslintrcPath)) {
    // Try to find the best tsconfig for parserOptions.project
    const tsconfigPath = './tsconfig.json'
    let parserProject = tsconfigPath
    let tsconfig
    try {
      tsconfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), tsconfigPath), 'utf8'))
      // Check for references
      if (Array.isArray(tsconfig.references) && tsconfig.references.length > 0) {
        // Prefer a reference with 'app' or 'src' in the path, else first
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let bestRef = tsconfig.references.find((ref: any) => typeof ref.path === 'string' && (ref.path.includes('app') || ref.path.includes('src')))
        if (!bestRef) bestRef = tsconfig.references[0]
        const refPath = bestRef?.path
        if (typeof refPath === 'string' && fs.existsSync(path.resolve(process.cwd(), refPath))) {
          parserProject = refPath
        }
      }
      // Check for include with src or app (future: could use this info)
    } catch {}
    fs.writeFileSync(
      eslintrcPath,
      JSON.stringify({
        extends: ['./node_modules/@undefined/lint/.eslintrc'],
        parserOptions: {
          project: parserProject,
        },
      }, null, 2),
    )
    console.log('Created .eslintrc with parserOptions.project =', parserProject)
  } else {
    console.log('.eslintrc already exists, skipping creation.')
  }

  // 4b. Create .eslintignore if not present
  const eslintignorePath = path.resolve(process.cwd(), '.eslintignore')
  if (!fs.existsSync(eslintignorePath)) {
    fs.writeFileSync(eslintignorePath, 'dist/\nbuild/\nnode_modules/\n')
    console.log('Created .eslintignore')
  } else {
    console.log('.eslintignore already exists, skipping creation.')
  }

  // 5. Ask to add recommended VS Code settings
  const addVscodeSettings = await prompt('Add recommended VS Code settings (for auto-fix on save, etc)?')

  if (addVscodeSettings) {
    const vscodeDir = path.resolve(process.cwd(), '.vscode')
    if (!fs.existsSync(vscodeDir)) fs.mkdirSync(vscodeDir)

    // Update settings.json
    const settingsPath = path.join(vscodeDir, 'settings.json')
    let settings = {}
    if (fs.existsSync(settingsPath)) {
      try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')) } catch {}
    }
    settings = {
      ...settings,
      'eslint.runtime': 'node',
      'editor.tabSize': 2,
      'editor.codeActionsOnSave': {
        'source.fixAll.eslint': 'explicit',
      },
    }
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
    console.log('Updated .vscode/settings.json')

    // Update extensions.json
    const extensionsPath = path.join(vscodeDir, 'extensions.json')
    const extensions = { recommendations: [] as string[] }
    if (fs.existsSync(extensionsPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(extensionsPath, 'utf8'))
        if (Array.isArray(parsed.recommendations)) {
          extensions.recommendations = parsed.recommendations
        }
      } catch {}
    }
    if (!extensions.recommendations.includes('dbaeumer.vscode-eslint')) {
      extensions.recommendations.push('dbaeumer.vscode-eslint')
    }
    fs.writeFileSync(extensionsPath, JSON.stringify(extensions, null, 2))
    console.log('Updated .vscode/extensions.json')
  } else {
    console.log('Skipped adding VS Code settings.')
  }

  console.log('✅ ESLint setup complete!')
}

main()
