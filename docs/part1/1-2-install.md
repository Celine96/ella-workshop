## 1.2 설치 및 첫 실행

### [실습] 클로드 코드 설치하기

**Step 1.** 터미널을 열어주세요.
- Windows: 시작 메뉴에서 "PowerShell"을 검색하여 실행해 주세요.
- Mac: Spotlight(Cmd+Space)에서 "터미널"을 검색하여 실행해 주세요.

**Step 2.** 아래 설치 명령어를 복사해서 터미널에 붙여넣고 Enter를 눌러주세요.

Windows PowerShell:
```
irm https://claude.ai/install.ps1 | iex
```

Mac/Linux:
```
curl -fsSL https://claude.ai/install.sh | bash
```

Mac (Homebrew 사용자):
```
brew install --cask claude-code
```

**Step 3.** 설치가 완료되면 **터미널을 닫았다가 다시 열어주세요.** (이 단계가 중요해요!)

**Step 4.** 설치 확인 — 아래 명령어를 입력해 주세요:

```
claude --version
```

> 버전 번호가 표시되면 설치 완료예요. "command not found"가 나오면 터미널을 다시 닫고 열어주세요.

### [실습] 첫 실행 & 로그인

**Step 1.** 작업할 폴더를 만들고 이동해 주세요.

Windows PowerShell:
```
mkdir C:\Users\나나\Desktop\워크숍
cd C:\Users\나나\Desktop\워크숍
```
> "나나" 부분은 본인의 Windows 사용자명으로 바꿔주세요.

Mac/Linux 터미널:
```
mkdir ~/Desktop/워크숍
cd ~/Desktop/워크숍
```

**Step 2.** 클로드 코드를 실행해 주세요:

```
claude
```

**Step 3.** 로그인
- **"Claude account with subscription"**을 선택해 주세요. (Anthropic Console이 아닌, 구독 계정 옵션을 선택하세요.)
- 브라우저가 열리면 Claude 계정으로 로그인해 주세요.
- 로그인 완료 후 터미널로 돌아와 주세요.
- 텍스트 스타일을 선택하라는 안내가 나오면, 원하는 스타일을 선택해 주세요.

**Step 4.** 아래 화면이 나오면 성공이에요:

```
╭──────────────────────────────────────╮
│ Welcome to Claude Code!              │
│                                      │
│ /help for available commands         │
╰──────────────────────────────────────╯

You:
```

### [체크포인트]
- [ ] 클로드 코드 설치 및 `claude --version` 확인 완료
- [ ] "Claude account with subscription"으로 로그인 완료
- [ ] 대화창이 정상 표시됨

---

