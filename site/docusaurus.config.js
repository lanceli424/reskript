module.exports = {
    title: 'reSKRipt',
    tagline: '基于React与Ant Design的应用开发命令行工具套件',
    baseUrl: process.env.CI ? '/reskript/' : '/',
    favicon: 'favicon.ico',
    url: 'https://ecomfe.github.io',
    trailingSlash: false,
    themeConfig: {
        colorMode: {
            defaultMode: 'light',
            disableSwitch: true,
        },
        navbar: {
            logo: {
                alt: '',
                src: 'images/logo.svg',
            },
            items: [
                {
                    to: 'docs/getting-started',
                    activeBasePath: 'docs',
                    label: '文档',
                    position: 'left',
                },
                {
                    to: 'blog',
                    label: 'Blog',
                    position: 'left'
                },
                {
                    to: 'https://github.com/ecomfe/reskript',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
        },
        algolia: {
            apiKey: 'a5cdc28c7cd73f7dc170c8deb130303d',
            indexName: 'reskript',
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                },
            },
        ],
    ],
};
