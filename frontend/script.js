const API_URL = "http://localhost:3000/matches"

const endpointText = document.querySelector('[data-ui="endpoint"]')
const statusBox = document.querySelector('[data-ui="status"]')
const statusTitle = statusBox.querySelector(".status__title")
const statusText = statusBox.querySelector(".status__text")
const matchList = document.querySelector('[data-ui="collection"]')
const reloadButton = document.querySelector('[data-action="reload"]')

function setListState(state, title, text) {
  statusBox.className = `status status--${state}`
  statusTitle.textContent = title
  statusText.textContent = text

  matchList.hidden = state !== "success"
}

function createMatchCard(match) {
  const card = document.createElement("article")
  card.className = "card"

  const hero = document.createElement("h3")
  hero.className = "card__title"
  hero.textContent = match.hero

  const result = document.createElement("p")
  if (match.isWin) {
    result.className = "card__result card__result--win"
    result.textContent = "Победа"
  }
  else {
    result.className = "card__result card__result--lose"
    result.textContent = "Поражение"
  }

  const meta = document.createElement("div")
  meta.className = "card__meta"

  const kda = document.createElement("span")
  kda.textContent = `KDA: ${match.kills} / ${match.deaths} / ${match.assists}`

  const duration = document.createElement("span")
  duration.textContent = `Длительность: ${match.durationMinutes} мин`

  meta.append(kda, duration)
  card.append(hero, result, meta)

  return card
}

function renderMatches(matches) {
  matchList.replaceChildren()

  if (matches.length === 0) {
    setListState("empty", "Матчей пока нет", "Добавьте первый матч через форму")
    return
  }

  for (const match of matches) {
    matchList.append(createMatchCard(match))
  }

  setListState("success", "Матчи загружены", `Всего матчей: ${matches.length}`)
}

async function fetchMatches() {
  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error(`GET ${API_URL} вернул ${response.status}`)
  }

  const matches = await response.json()
  return matches
}

async function loadMatches() {
  setListState("loading", "Загрузка", "Получаем матчи из API...")
  reloadButton.disabled = true

  try {
    const matches = await fetchMatches()
    renderMatches(matches)
  } catch (error) {
    console.error("Не удалось загрузить матчи", error)
    setListState("error", "Не удалось загрузить матчи", "Проверьте, что API запущен, и нажмите Обновить")
  } finally {
    reloadButton.disabled = false
  }
}

reloadButton.addEventListener("click", loadMatches)

endpointText.textContent = API_URL
loadMatches()
