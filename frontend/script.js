const API_URL = "http://localhost:3000/matches"

const endpointText = document.querySelector('[data-ui="endpoint"]')
const statusBox = document.querySelector('[data-ui="status"]')
const statusTitle = statusBox.querySelector(".status__title")
const statusText = statusBox.querySelector(".status__text")
const matchList = document.querySelector('[data-ui="collection"]')
const reloadButton = document.querySelector('[data-action="reload"]')

const matchForm = document.querySelector('[data-form="entry"]')
const submitButton = matchForm.querySelector('[data-action="submit"]')
const formStatus = matchForm.querySelector('[data-ui="form-status"]')

function setListState(state, title, text) {
  statusBox.className = `status status--${state}`
  statusTitle.textContent = title
  statusText.textContent = text

  matchList.hidden = state !== "success"
}

function setFormStatus(message, isError) {
  formStatus.textContent = message
  formStatus.classList.toggle("entry-form__status--error", isError)
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

  const deleteButton = document.createElement("button")
  deleteButton.className = "button button--danger card__delete"
  deleteButton.type = "button"
  deleteButton.textContent = "Удалить"

  const deleteError = document.createElement("p")
  deleteError.className = "card__error"
  deleteError.hidden = true

  deleteButton.addEventListener("click", () => handleDeleteClick(match, deleteButton, deleteError))

  meta.append(kda, duration)
  card.append(hero, result, meta, deleteButton, deleteError)

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

function readMatchFromForm() {
  const formData = new FormData(matchForm)

  return {
    hero: formData.get("hero").trim(),
    isWin: formData.get("isWin") === "true",
    kills: Number(formData.get("kills")),
    deaths: Number(formData.get("deaths")),
    assists: Number(formData.get("assists")),
    durationMinutes: Number(formData.get("durationMinutes")),
  }
}

async function createMatch(match) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(match),
  })

  if (!response.ok) {
    throw new Error(`POST ${API_URL} вернул ${response.status}`)
  }

  const createdMatch = await response.json()
  return createdMatch
}

async function deleteMatch(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" })

  if (!response.ok) {
    throw new Error(`DELETE ${API_URL}/${id} вернул ${response.status}`)
  }
}

async function handleMatchSubmit(event) {
  event.preventDefault()

  const match = readMatchFromForm()
  submitButton.disabled = true
  setFormStatus("Отправляем матч...", false)

  try {
    const createdMatch = await createMatch(match)
    console.log("Матч сохранен", createdMatch)
    matchForm.reset()
    setFormStatus("Матч добавлен", false)
    await loadMatches()
  } catch (error) {
    console.error("Не удалось отправить матч", error)
    setFormStatus("Не удалось сохранить матч. Проверьте, что API запущен, и отправьте еще раз", true)
  } finally {
    submitButton.disabled = false
  }
}

async function handleDeleteClick(match, button, errorText) {
  const isConfirmed = confirm(`Удалить матч на ${match.hero}?`)
  if (!isConfirmed) {
    return
  }

  button.disabled = true
  errorText.hidden = true

  try {
    await deleteMatch(match.id)
    await loadMatches()
  } catch (error) {
    console.error("Не удалось удалить матч", error)
    errorText.textContent = "Не удалось удалить матч. Проверьте, что API запущен, и попробуйте еще раз"
    errorText.hidden = false
    button.disabled = false
  }
}

reloadButton.addEventListener("click", loadMatches)
matchForm.addEventListener("submit", handleMatchSubmit)

endpointText.textContent = API_URL
loadMatches()
