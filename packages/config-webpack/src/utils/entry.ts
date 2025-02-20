import path from 'path';
import {existsSync} from 'fs';
import fs from 'fs/promises';
import {EntryObject} from 'webpack';
import {logger} from '@reskript/core';
import {AppEntry, EntryConfig} from '../interface';

const isErrorWithCode = (error: any): error is NodeJS.ErrnoException => {
    return 'message' in error && 'code' in error;
};

const ALLOWED_ENTRY_KEYS = new Set(['entry', 'html']);

const validateEntryConfig = (config: EntryConfig, file: string) => {
    const keys = Object.keys(config);

    if (keys.some(v => !ALLOWED_ENTRY_KEYS.has(v))) {
        logger.error(`Entry configuration ${file} has invalid keys, only "entry" and "html" are allowed.`);
        process.exit(21);
    }
};

const readEntryConfig = async (file: string): Promise<EntryConfig> => {
    try {
        const {default: config}: {default: EntryConfig} = await import(path.join(file));
        validateEntryConfig(config, file);
        return config;
    }
    catch (ex) {
        if (isErrorWithCode(ex) && ex.code === 'MODULE_NOT_FOUND') {
            return {};
        }

        logger.error(`Unable to read entry configuration from ${file}: ${ex instanceof Error ? ex.message : ex}`);
        process.exit(22);
    }
};

const DEFAULT_HTML_TEMPLATE = path.resolve(__dirname, '..', 'assets', 'default-html.ejs');

const resolveEntryTemplate = (file: string): string => {
    return existsSync(file) ? file : DEFAULT_HTML_TEMPLATE;
};

const POSSIBLE_ENTRY_EXTENSION_REGEX = /\.[jt]sx?$/;

const ALLOWED_ENTRY_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

const resolveDirectoryEntry = async (dir: string, shouldInclude: (name: string) => boolean) => {
    const name = path.basename(dir);

    if (!shouldInclude(name)) {
        return null;
    }

    const possibleEntryFiles = ALLOWED_ENTRY_EXTENSIONS.map(e => path.join(dir, 'index' + e));
    const entry = possibleEntryFiles.find(existsSync);
    if (entry) {
        const config = await readEntryConfig(path.join(dir, 'index.config.js'));
        const appEntry: AppEntry = {
            name,
            config,
            file: entry,
            template: resolveEntryTemplate(path.join(dir, 'index.ejs')),
        };
        return appEntry;
    }

    return null;
};

const resolveFileEntry = async (file: string, shouldInclude: (name: string) => boolean) => {
    const extension = path.extname(file);

    if (!ALLOWED_ENTRY_EXTENSIONS.includes(extension) || file.includes('.config.')) {
        return null;
    }

    const name = path.basename(file, extension);

    if (!shouldInclude(name)) {
        return null;
    }

    const base = file.replace(POSSIBLE_ENTRY_EXTENSION_REGEX, '');
    const config = await readEntryConfig(`${base}.config.js`);
    const appEntry: AppEntry = {
        file,
        config,
        name: path.basename(file, extension),
        template: resolveEntryTemplate(`${base}.ejs`),
    };
    return appEntry;
};

// `targetBase`可以是`src/entries/index.js`这样的具体文件，也可以是`src/entries/index`这样的目录
export const resolveEntry = async (targetBase: string, shouldInclude: (name: string) => boolean) => {
    const stat = await fs.stat(targetBase);

    return stat.isDirectory()
        ? resolveDirectoryEntry(targetBase, shouldInclude)
        : resolveFileEntry(targetBase, shouldInclude);
};

export const convertToWebpackEntry = ({file, config}: AppEntry): EntryObject[string] => {
    if (config.entry) {
        return {
            import: file,
            ...config.entry,
        };
    }

    return file;
};
