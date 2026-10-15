const componentArr = []
const iframeName = []
function installIframe(app) {
  componentArr.forEach((item) => {
    app.component(item.name, item)
    iframeName.push(item.name)
  })
}
export { installIframe, iframeName }
