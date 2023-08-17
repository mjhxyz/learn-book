import { defaultTheme } from '@vuepress/theme-default'
import { hopeTheme } from "vuepress-theme-hope";

export default {
    title: '学习笔记',
    description: '我自己的学习笔记, 自用',

    head: [
        {
            'link': '/public/css/index.css'
        }
    ],

    theme: hopeTheme({
        sidebarDepth: 4,
        headerDepth: 4,
        sidebar: {
            '/go/': [
                '',
                'part0',
                'part1',
                'part2',
                'part3',
                'part4',
            ],
            '/interview/': [
                '',
                'os',
                'network',
                'db',
                'java',
            ]
        },
        lastUpdated: '更新时间',
        navbar: [
            { text: '首页', link: '/' },
            {
                text: '面试题笔记',
                link: '/interview/',
                items: [
                    { text: '操作系统', link: '/interview/os/' },
                    { text: '计算机网络', link: '/interview/network/' },
                    { text: '数据库', link: '/interview/db/' },
                    { text: 'Java面试题', link: '/interview/java/' },
                ]
            },
            {
                text: 'Go学习笔记',
                link: '/go/',
                // ariaLabel: 'GoLearn',
                items: [
                    { text: 'Go基础', link: '/go/part0' },
                    { text: 'Go数据结构&包管理', link: '/go/part1/' },
                    { text: 'Go面向接口&单元测试', link: '/go/part2/' },
                    { text: 'Go并发编程', link: '/go/part3/' },
                    { text: 'Go常用标准库', link: '/go/part4/' }
                ]
            },
            { text: 'External', link: 'https://google.com' },
            // { text: 'test', link: 'test', target: '_self', rel: '' }
        ]
    })
}