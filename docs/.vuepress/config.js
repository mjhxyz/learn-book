module.exports = {
    title: '学习笔记',
    description: '我自己的学习笔记, 自用',

    themeConfig: {
        sidebarDepth: 3,
        sidebar: {
            '/go/': [
                '',
                'part0',
                'part1',
                'part2',
                'part3',
                'part4',
            ]
        },
        lastUpdated: '更新时间',
        nav: [
            { text: 'Home', link: '/' },
            {
                text: 'Go学习笔记',
                link: '/go/',
                // ariaLabel: 'GoLearn',
                // items: [
                //     { text: 'Go 基础', link: '/gobasic/' },
                //     { text: 'Go 编程思想(一)', link: '/go/part1/' },
                //     { text: 'Go 编程思想(二)', link: '/go/part2/' },
                //     { text: 'Go 编程思想(三)', link: '/go/part3/' }
                // ]
            },
            { text: 'External', link: 'https://google.com' },
            // { text: 'test', link: 'test', target: '_self', rel: '' }
        ]
    },
    plugins: ['vuepress-plugin-smooth-scroll'],
}