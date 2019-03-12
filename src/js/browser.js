function getWindowSize() {
  const w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    width = w.innerWidth || e.clientWidth || g.clientWidth,
    height = w.innerHeight|| e.clientHeight|| g.clientHeight
  return { width, height }
}

function navigateTo(path, params) {
    window.location.href = params ? `${path}?${encodeToQueryString(params)}` : path
}

const getQueryParameter = param => (
    (new URLSearchParams(window.location.search)).get(param)
)

function encodeToQueryString(obj) {
    return Object.keys(obj).map(key => `${key}=${obj[key]}`).join('&')
}

module.exports = {
    getWindowSize,
    navigateTo,
    getQueryParameter
}
