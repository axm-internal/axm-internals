#!/usr/bin/env node
const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');
const fs = require('node:fs');
const { readFile, rm, writeFile } = require('node:fs/promises');
const path = require('node:path');

(async () => {
    const cwd = process.cwd();
    const dirName = path.basename(cwd);
    const defaultName = `@axm/${dirName}`;

    let packageName = (process.env.AXM_PACKAGE_NAME || '').trim();
    let description = (process.env.AXM_PACKAGE_DESC || '').trim();

    let shouldPrompt = Boolean(input.isTTY && output.isTTY);
    let promptInput = input;
    let promptOutput = output;

    if (!shouldPrompt) {
        try {
            if (fs.existsSync('/dev/tty')) {
                promptInput = fs.createReadStream('/dev/tty');
                promptOutput = fs.createWriteStream('/dev/tty');
                shouldPrompt = true;
            }
        } catch {
            shouldPrompt = false;
        }
    }
  if (shouldPrompt && (!packageName || !description)) {
        const rl = readline.createInterface({ input: promptInput, output: promptOutput });

        const nameAnswer = shouldPrompt ? (await rl.question(`Package name (${defaultName}): `)).trim() : '';
        packageName = nameAnswer.length > 0 ? nameAnswer : packageName || defaultName;

        const descAnswer = shouldPrompt ? (await rl.question('Description (optional): ')).trim() : '';
        description = descAnswer.length > 0 ? descAnswer : description || 'Internal axm package.';

        await rl.close();
    }

    packageName ||= defaultName;
    description ||= 'Internal axm package.';

    const packageJsonPath = path.join(cwd, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    packageJson.name = packageName;
    packageJson.description = description;

    const hasTemplateMarker = Boolean(packageJson['bun-create']);
    if (hasTemplateMarker) {
        // Remove bun-create metadata before writing final package.json.
        delete packageJson['bun-create'];
    }

    await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

    const replaceTokens = async (filePath) => {
        const contents = await readFile(filePath, 'utf8');
        const next = contents.replaceAll('__PACKAGE_NAME__', packageName).replaceAll('__PACKAGE_DESC__', description);
        await writeFile(filePath, next);
    };

    await replaceTokens(path.join(cwd, 'README.md'));
    await replaceTokens(path.join(cwd, 'llms.txt'));
    await replaceTokens(path.join(cwd, 'docs', 'README.md'));

    const cleanupTargets = [
        { label: 'scripts', target: path.join(cwd, 'scripts') },
        { label: '.git', target: path.join(cwd, '.git') },
    ];

    for (const { label, target } of cleanupTargets) {
        try {
            await rm(target, { recursive: true, force: true });
        } catch (error) {
            console.warn(
                `Cleanup warning: failed to remove ${label}:`,
                error instanceof Error ? error.message : error,
            );
        }
    }
})().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
