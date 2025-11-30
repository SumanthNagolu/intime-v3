source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

if type brew &>/dev/null; then
  FPATH="$(brew --prefix)/share/zsh-completions:$FPATH"
  autoload -Uz compinit
  compinit
fi
source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

export ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=#5C6773'   # tweak to be lighter/darker

typeset -gA ZSH_HIGHLIGHT_STYLES
ZSH_HIGHLIGHT_STYLES[comment]='fg=#6A9955'            # green
ZSH_HIGHLIGHT_STYLES[command]='fg=#61AFEF'            # blue
ZSH_HIGHLIGHT_STYLES[builtin]='fg=#E5C07B'            # sand
ZSH_HIGHLIGHT_STYLES[reserved-word]='fg=#C678DD'      # purple (e.g., if, for)
ZSH_HIGHLIGHT_STYLES[alias]='fg=#56B6C2'              # teal
ZSH_HIGHLIGHT_STYLES[path]='fg=#98C379'               # green
ZSH_HIGHLIGHT_STYLES[globbing]='fg=#E06C75'           # red
ZSH_HIGHLIGHT_STYLES[commandseparator]='fg=#ABB2BF'   # gray (; | &&)
ZSH_HIGHLIGHT_STYLES[single-hyphen-option]='fg=#D19A66'
ZSH_HIGHLIGHT_STYLES[double-hyphen-option]='fg=#D19A66'
ZSH_HIGHLIGHT_STYLES[unknown-token]='fg=#FF5370'      # bright red for mistakes
# --- end TRIKALA ZSH THEME ---
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && . "/opt/homebrew/opt/nvm/nvm.sh"
export PATH="/opt/homebrew/opt/python@3.11/bin:$PATH"
export PATH="/usr/local/opt/python@3.11/bin:$PATH"

# Added by Antigravity
export PATH="/Users/sumanthrajkumarnagolu/.antigravity/antigravity/bin:$PATH"

pss() {
  local file="${1:-/tmp/clipboard.png}"
  pngpaste "$file" && echo "$file"
}
