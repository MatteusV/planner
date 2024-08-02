export function createInitials(fullName: string): string {
  const ignoredWords = ['da', 'de', 'do', 'das', 'dos', 'and']

  const words = fullName
    .split(' ')
    .filter((word) => !ignoredWords.includes(word.toLowerCase()))

  const firstInitial = words[0].charAt(0).toUpperCase()
  const secondInitial = words[1].charAt(0).toUpperCase()

  return firstInitial + secondInitial
}
