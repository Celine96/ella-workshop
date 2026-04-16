# 1.2 설치 및 첫 실행

---

### [실습] 클로드 코드 설치하기

Step 1. 터미널을 열어주세요.
- Windows: 시작 메뉴에서 "Windows PowerShell"을 검색하여 실행해 주세요. (명령 프롬프트(cmd)가 아닌 PowerShell을 선택해 주세요.)
- Mac: Spotlight(Cmd+Space)에서 "터미널"을 검색하여 실행해 주세요.

Step 2. 아래 설치 명령어를 복사해서 터미널에 붙여넣고 Enter를 눌러주세요.

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

Step 3. 설치가 완료되면 터미널을 닫았다가 다시 열어주세요. (이 단계가 중요해요!)

### [실습] 첫 실행 & 로그인

Step 1. `claude --version`을 입력해서 설치가 정상적으로 되었는지 확인해볼게요.

```
claude --version
```

> 버전 번호가 표시되면 설치 완료예요. "command not found"가 나오면 터미널을 다시 닫고 열어주세요.

Step 2. 사전에 공유받은 zip 파일(`나나님.zip`)을 바탕화면에 압축 해제해 주세요. 압축을 풀면 `나나님` 폴더가 생성되고, 안에 실습에 필요한 파일들이 이미 들어있어요.

Step 3. 터미널에서 해당 폴더로 이동해 주세요.

Windows PowerShell:
```
cd C:\Users\나나\Desktop\나나님
```
> "나나" 부분은 본인의 Windows 사용자명으로 바꿔주세요. 사용자명을 모르겠다면 파일 탐색기에서 `C:\Users` 폴더를 열어 본인 폴더명을 확인할 수 있어요.

Mac/Linux 터미널:
```
cd ~/Desktop/나나님
```

Step 4. 클로드 코드를 실행해 주세요:

```
claude
```

Step 5. 로그인해 주세요.
- "Claude account with subscription"을 선택해 주세요. (Anthropic Console이 아닌, 구독 계정 옵션을 선택하세요.)
- 브라우저가 열리면 Claude 계정으로 로그인해 주세요.
- 로그인 완료 후 터미널로 돌아와 주세요.
- 텍스트 스타일을 선택하라는 안내가 나오면, 원하는 스타일을 선택해 주세요.

Step 6. 아래 화면이 나오면 성공이에요:

```
╭──────────────────────────────────────╮
│ Welcome to Claude Code!              │
│                                      │
│ /help for available commands         │
╰──────────────────────────────────────╯

You:
```

### [체크포인트]
- [ ] `claude --version`으로 설치 확인 완료
- [ ] "Claude account with subscription"으로 로그인 완료
- [ ] 대화창이 정상 표시됨

---
