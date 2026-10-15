import { createStore } from 'vuex'
import app from './modules/app'
import handle from './modules/handle'
import permission from './modules/permission'
import settings from './modules/settings'
import tabsView from './modules/tabsView'
import user from './modules/user'
import template from './modules/template'
import upload from './modules/upload'
import systemConfig from './modules/systemConfig'
import getters from './getters'

const store = createStore({
  modules: {
    app,
    handle,
    permission,
    settings,
    tabsView,
    user,
    template,
    upload,
    systemConfig
  },
  getters,
})

export default store
