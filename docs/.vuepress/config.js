module.exports = {
    title: '学习笔记',
    description: '我自己的学习笔记, 自用',

    themeConfig: {
        sidebar: 'auto',
        lastUpdated: '更新时间',
        nav: [
            { text: 'Home', link: '/' },
            {
                text: 'Go学习笔记',
                ariaLabel: 'GoLearn',
                items: [
                    { text: 'Go 基础', link: '/gobasic/' },
                    { text: 'Go 编程思想', link: '/go/' }
                ]
            },
            { text: 'External', link: 'https://google.com' },
            // { text: 'test', link: 'test', target: '_self', rel: '' }
        ]
    }
}