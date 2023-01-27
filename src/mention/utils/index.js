function getMentionCharIndex(text, mentionDenotationChars) {
  return mentionDenotationChars.reduce(
    (prev, mentionChar) => {
      const mentionCharIndex = text.lastIndexOf(mentionChar)

      if (mentionCharIndex > prev.mentionCharIndex) {
        return {
          mentionChar,
          mentionCharIndex
        }
      }
      return {
        mentionChar: prev.mentionChar,
        mentionCharIndex: prev.mentionCharIndex
      }
    },
    { mentionChar: null, mentionCharIndex: -1 }
  )
}

function hasValidChars(text, allowedChars) {
  return allowedChars.test(text)
}

function hasValidMentionCharIndex(mentionCharIndex, text) {
  if (mentionCharIndex > -1) {
    if (
      !(mentionCharIndex === 0 || !!text[mentionCharIndex - 1].match(/\s/g))
    ) {
      return false
    }
    return true
  }
  return false
}

export {
  getMentionCharIndex,
  hasValidChars,
  hasValidMentionCharIndex
}
