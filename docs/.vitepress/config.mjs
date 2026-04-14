import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "ELLA'S 1DAY WORKSHOP",
  description: '클로드 코드로 콘텐츠 제작 자동화하기',
  base: '/ella-workshop/',
  themeConfig: {
    nav: [
      { text: '홈', link: '/' },
      { text: '1부', link: '/part1/1-1-intro' },
      { text: '2부', link: '/part2/2-1-agents' },
    ],
    sidebar: [
      {
        text: '워크북 소개',
        items: [
          { text: '시작하기', link: '/' },
        ]
      },
      {
        text: '1부: 클로드 코드 세팅',
        items: [
          { text: '1.1 클로드 코드란?', link: '/part1/1-1-intro' },
          { text: '1.2 설치 및 첫 실행', link: '/part1/1-2-install' },
          { text: '1.3 명령어 & 네비게이션', link: '/part1/1-3-commands' },
          { text: '1.4 자동화 맛보기: 카드뉴스 만들기', link: '/part1/1-4-cardnews' },
        ]
      },
      {
        text: '2부: 에이전트 구축',
        items: [
          { text: '2.1 에이전트 개념', link: '/part2/2-1-agents' },
          { text: '2.2 PRD (제품 요구사항 문서)', link: '/part2/2-2-prd' },
          { text: '2.3 하네스 엔지니어링', link: '/part2/2-3-harness' },
          { text: '2.4 나만의 에이전트 만들기', link: '/part2/2-4-build' },
        ]
      },
      {
        text: '부록',
        items: [
          { text: '실무 팁', link: '/tips' },
          { text: '참고 자료 & 다음 단계', link: '/appendix' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Celine96/ella-workshop' }
    ],
    outline: {
      level: [2, 3],
      label: '목차'
    },
    search: {
      provider: 'local'
    }
  }
})
