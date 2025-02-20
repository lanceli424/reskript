import {sync as resolve} from 'resolve';
import {getBabelConfig, BabelConfigOptions} from '@reskript/config-babel';
import {BuildEntry, warnAndExitOnInvalidFinalizeReturn} from '@reskript/settings';
import {LoaderFactory} from '../interface';

const factory: LoaderFactory = (entry: BuildEntry) => {
    const {usage, mode, cwd, srcDirectory, projectSettings: {build, devServer}} = entry;
    const {uses, script: {polyfill, displayName}} = build;
    const {hot} = devServer;
    const babelConfigOptions: BabelConfigOptions = {
        cwd,
        srcDirectory,
        mode,
        polyfill,
        uses,
        displayName,
        // 对于需要构建产物用的场合，默认不给热更新
        hot: usage === 'devServer' ? hot : false,
        hostType: 'application',
    };
    const internalCreatedBabelConfig = getBabelConfig(babelConfigOptions);
    const finalizedBabelConfig = build.script.finalize(internalCreatedBabelConfig, entry);
    warnAndExitOnInvalidFinalizeReturn(finalizedBabelConfig, 'build.script');

    return {
        loader: resolve('babel-loader'),
        // webpack的缓存够强了，所有其它的缓存都可以不开
        options: finalizedBabelConfig,
    };
};

export default factory;
